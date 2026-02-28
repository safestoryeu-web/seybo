import { NextRequest, NextResponse } from "next/server";
import { TextToSpeechClient } from "@google-cloud/text-to-speech";

const GOOGLE_TTS_API_KEY =
  process.env.GOOGLE_TTS_API_KEY?.trim() ||
  process.env.GOOGLE_TTS?.trim() ||
  process.env.GOOGLE_TTS_KEY?.trim() ||
  "";
const GOOGLE_TTS_CLIENT_EMAIL = process.env.GOOGLE_TTS_CLIENT_EMAIL?.trim() || "";
const GOOGLE_TTS_PRIVATE_KEY = process.env.GOOGLE_TTS_PRIVATE_KEY?.trim() || "";
const GOOGLE_TTS_VOICE = process.env.GOOGLE_TTS_VOICE?.trim() || "sk-SK-Wavenet-A";
const TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

const useServiceAccount = Boolean(GOOGLE_TTS_CLIENT_EMAIL && GOOGLE_TTS_PRIVATE_KEY);

function getTTSClient() {
  if (!useServiceAccount) return null;
  const privateKey = GOOGLE_TTS_PRIVATE_KEY.replace(/\\n/g, "\n");
  return new TextToSpeechClient({
    credentials: {
      client_email: GOOGLE_TTS_CLIENT_EMAIL,
      private_key: privateKey,
    },
  });
}

export async function POST(request: NextRequest) {
  const hasCredentials = useServiceAccount || GOOGLE_TTS_API_KEY;
  if (!hasCredentials) {
    return NextResponse.json(
      {
        error:
          "Chýba TTS konfigurácia. Nastav GOOGLE_TTS_CLIENT_EMAIL + GOOGLE_TTS_PRIVATE_KEY (service account) alebo GOOGLE_TTS_API_KEY v .env.local.",
      },
      { status: 503 }
    );
  }

  try {
    const { text } = (await request.json()) as { text?: string };

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Chýba parameter 'text'." },
        { status: 400 }
      );
    }

    let audioContentBase64: string;

    if (useServiceAccount) {
      const client = getTTSClient()!;
      const [response] = await client.synthesizeSpeech({
        input: { text: text.trim() },
        voice: { languageCode: "sk-SK", name: GOOGLE_TTS_VOICE },
        audioConfig: {
          audioEncoding: "MP3" as const,
          speakingRate: 0.9,
          pitch: 0,
        },
      });
      if (!response.audioContent || !(response.audioContent instanceof Uint8Array)) {
        return NextResponse.json(
          { error: "Google TTS nevrátil audio." },
          { status: 502 }
        );
      }
      audioContentBase64 = Buffer.from(response.audioContent).toString("base64");
    } else {
      const res = await fetch(
        `${TTS_URL}?key=${encodeURIComponent(GOOGLE_TTS_API_KEY)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text: text.trim() },
            voice: { languageCode: "sk-SK", name: GOOGLE_TTS_VOICE },
            audioConfig: {
              audioEncoding: "MP3",
              speakingRate: 0.9,
              pitch: 0,
            },
          }),
        }
      );
      if (!res.ok) {
        const err = await res.text();
        console.error("Google TTS API error:", res.status, err);
        return NextResponse.json(
          { error: "Google TTS zlyhalo. Skontroluj kľúč a povolenie Text-to-Speech API." },
          { status: 502 }
        );
      }
      const data = (await res.json()) as { audioContent?: string };
      if (!data.audioContent) {
        return NextResponse.json(
          { error: "Google TTS nevrátil audio." },
          { status: 502 }
        );
      }
      audioContentBase64 = data.audioContent;
    }

    const audioBuffer = Buffer.from(audioContentBase64, "base64");
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audioBuffer.length),
      },
    });
  } catch (err) {
    console.error("tts error:", err);
    return NextResponse.json(
      { error: "TTS zlyhalo. Skontroluj GOOGLE_TTS_PRIVATE_KEY (celý kľúč vrátane -----END PRIVATE KEY-----)." },
      { status: 500 }
    );
  }
}

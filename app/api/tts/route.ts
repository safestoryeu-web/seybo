import { NextRequest, NextResponse } from "next/server";

/**
 * TTS route – vstup: text, výstup: audio stream (Edge TTS).
 * Použitie: edge-tts-node (Microsoft Neural hlasy).
 * Implementácia pre stream bude doplnená po inštalácii edge-tts-node.
 */
export async function POST(request: NextRequest) {
  try {
    const { text, voice } = (await request.json()) as {
      text?: string;
      voice?: string;
    };

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Chýba parameter 'text'." },
        { status: 400 }
      );
    }

    // Placeholder – po nainštalovaní edge-tts-node tu bude:
    // const TTS = (await import("edge-tts-node")).default;
    // syntéza a return stream (audio/webm alebo audio/mpeg)
    const selectedVoice = voice || "sk-SK-LukasNeural";

    return NextResponse.json({
      message: "TTS endpoint pripravený. Pre stream audio nainštalujte edge-tts-node a doplňte syntézu.",
      voice: selectedVoice,
      textLength: text.length,
    });
  } catch (err) {
    console.error("tts error:", err);
    return NextResponse.json(
      { error: "TTS zlyhalo." },
      { status: 500 }
    );
  }
}

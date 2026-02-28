import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import type { StoryStep } from "@/types/story";

const geminiKey = process.env.GOOGLE_GEMINI_API_KEY?.trim() ?? "";
const genAI = geminiKey ? new GoogleGenerativeAI(geminiKey) : null;

const STEP_JSON_SCHEMA = `{
  "title": "string - krátky nadpis kapitoly",
  "content": "string - text kapitoly (3-5 odsekov v slovenčine)",
  "options": ["string - prvá možnosť čo môže postava urobiť", "string - druhá možnosť"],
  "isFinal": false
}`;

function parseStepFromGemini(text: string): StoryStep {
  const trimmed = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "").trim();
  const parsed = JSON.parse(trimmed) as Record<string, unknown>;
  return {
    title: String(parsed.title ?? ""),
    content: String(parsed.content ?? ""),
    options: Array.isArray(parsed.options)
      ? (parsed.options as string[]).slice(0, 2)
      : ["Pokračovať", "Ísť ďalej"],
    isFinal: Boolean(parsed.isFinal),
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      childrenNames,
      theme,
      moral,
      storySoFar,
      selectedOption,
    } = body as {
      childrenNames: string[];
      theme: string;
      moral: string;
      storySoFar?: string;
      selectedOption?: string;
    };

    if (!childrenNames?.length || !theme) {
      return NextResponse.json(
        { error: "Chýbajú mená detí alebo téma." },
        { status: 400 }
      );
    }

    const namesList = childrenNames.filter(Boolean).join(", ");
    const isContinuation = Boolean(storySoFar && selectedOption);

    if (!genAI) {
      return NextResponse.json(
        { error: "Chýba GOOGLE_GEMINI_API_KEY. Pridaj API kľúč do .env.local." },
        { status: 500 }
      );
    }

    const systemPrompt = `Si skúsený rozprávkar pre deti. Odpovedaj VŽDY len platným JSON bez úvodného textu. Formát: ${STEP_JSON_SCHEMA}
Pravidlá: options má presne 2 rôznorodé možnosti (konkrétne činy, nie všeobecné "pokračovať"). isFinal len pri skutočnom závere. DÔLEŽITÉ: Píš živý, konkrétny dej – konkrétne udalosti, postavy, miesta. Žiadne vágne frázy ako "všetko šlo podľa plánu" alebo "prežili dobrodružstvo". Každá kapitola musí priniesť NOVÝ dej podľa výberu.`;

    let userPrompt: string;
    if (isContinuation) {
      userPrompt = `Rozprávka pre deti (mená: ${namesList}), téma: ${theme}.${moral ? ` Ponaučenie: ${moral}.` : ""}

Doterajší text rozprávky:
---
${storySoFar}
---

Dieťa si vybralo: "${selectedOption}"

Napíš JEDNU ďalšiu kapitolu: čo KONKRÉTNE sa stalo po tomto rozhodnutí. Vymysli nové udalosti, postavy alebo prekvapenia podľa výberu. Nepoužívaj rovnaké formulácie ako v predchádzajúcom texte. Vráť JSON: title (výstižný nadpis kapitoly), content (3-5 odsekov, živý dej), options (2 konkrétne možnosti čo môžu urobiť ďalej), isFinal (true len ak rozprávka skutočne končí).`;
    } else {
      userPrompt = `Prvá kapitola rozprávky pre deti v slovenčine.
Mená postáv: ${namesList}.
Téma: ${theme}.${moral ? ` Ponaučenie: ${moral}.` : ""}

Napíš úvodnú kapitolu s konkrétnym dejom – čo sa deje, kde sú, čo objavia. Žiadne vágne úvody. Vráť JSON: title, content (3-5 odsekov), options (2 konkrétne možnosti), isFinal: false.`;
    }

    const fullPrompt = systemPrompt + "\n\n" + userPrompt;
    let step: StoryStep;

    try {
      const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    const model = genAI!.getGenerativeModel({ model: modelId });
      const result = await model.generateContent(fullPrompt);
      const response = result.response;

      if (!response.candidates?.length) {
        const blockReason =
          response.promptFeedback?.blockReason ||
          "Žiadna odpoveď od modelu (bezpečnostné filtre alebo chyba).";
        console.error("Gemini no candidates:", response.promptFeedback);
        throw new Error(blockReason);
      }

      let rawText: string;
      try {
        rawText = response.text();
      } catch (textErr) {
        console.error("Gemini response.text() error:", textErr);
        throw new Error("AI vrátila prázdnu alebo blokovanú odpoveď.");
      }

      if (!rawText?.trim()) {
        throw new Error("AI nevrátila žiadny text.");
      }

      step = parseStepFromGemini(rawText);
    } catch (geminiErr) {
      console.error("Gemini error:", geminiErr);
      throw geminiErr;
    }

    let savedStory = null;
    if (!isContinuation && supabase) {
      const childNamesFiltered = childrenNames.filter(Boolean);
      const fullText = [step.title, step.content].join("\n\n");

      const { data: inserted, error: insertError } = await supabase
        .from("stories")
        .insert({
          child_names: childNamesFiltered,
          topic: theme,
          lesson: moral ?? "",
          full_text: fullText,
        })
        .select("id, child_names, topic, lesson, full_text, created_at")
        .single();

      if (!insertError && inserted) {
        savedStory = {
          id: inserted.id,
          childNames: inserted.child_names,
          topic: inserted.topic,
          lesson: inserted.lesson,
          fullText: inserted.full_text,
          createdAt: inserted.created_at,
        };
      }
    }

    return NextResponse.json({
      step,
      savedStory,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("generate-story error:", err);

    if (message.includes("404") || message.includes("Not Found")) {
      return NextResponse.json(
        {
          error:
            "Gemini model nie je dostupný (404). Skontroluj API kľúč a názov modelu v Google AI Studio.",
        },
        { status: 500 }
      );
    }
    if (message.includes("403") || message.includes("Permission")) {
      return NextResponse.json(
        {
          error:
            "Prístup k Gemini API zamietnutý. Povol API v Google Cloud / AI Studio a skontroluj kľúč.",
        },
        { status: 500 }
      );
    }
    if (message.includes("API key") || message.includes("invalid")) {
      return NextResponse.json(
        {
          error:
            "Neplatný alebo chýbajúci Gemini API kľúč. Skontroluj GOOGLE_GEMINI_API_KEY v .env.local.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Nepodarilo sa vygenerovať rozprávku. " + message },
      { status: 500 }
    );
  }
}

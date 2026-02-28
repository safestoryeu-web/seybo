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

    if (!genAI) {
      return NextResponse.json(
        { error: "Chýba GOOGLE_GEMINI_API_KEY v .env. Pridaj API kľúč z Google AI Studio." },
        { status: 500 }
      );
    }

    const modelName =
      process.env.GEMINI_MODEL?.trim() || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });
    const namesList = childrenNames.filter(Boolean).join(", ");
    const isContinuation = Boolean(storySoFar && selectedOption);

    const systemPrompt = `Si rozprávkar. Odpovedaj VŽDY len platným JSON bez úvodného textu. Formát: ${STEP_JSON_SCHEMA}
Pravidlá: options má presne 2 krátke možnosti (čo môže postava urobiť). isFinal je true len pri úplnom závere príbehu.`;

    let userPrompt: string;
    if (isContinuation) {
      userPrompt = `Rozprávka pre deti (mená: ${namesList}), téma: ${theme}.${moral ? ` Ponaučenie: ${moral}.` : ""}

Doterajší text rozprávky:
---
${storySoFar}
---

Dieťa si vybralo túto možnosť: "${selectedOption}"

Napíš ďalšiu kapitolu: čo sa stalo po tomto rozhodnutí. Vráť JSON s title, content (3-5 odsekov), options (2 ďalšie možnosti), isFinal (true len ak je to koniec príbehu).`;
    } else {
      userPrompt = `Prvá kapitola rozprávky pre deti v slovenčine.
Mená postáv: ${namesList}.
Téma: ${theme}.${moral ? ` Ponaučenie: ${moral}.` : ""}

Vygeneruj prvú kapitolu. Vráť len jeden JSON objekt: title, content (3-5 odsekov), options (presne 2 možnosti pre dieťa), isFinal: false.`;
    }

    const result = await model.generateContent(systemPrompt + "\n\n" + userPrompt);
    const response = result.response;

    if (!response.candidates?.length) {
      const blockReason =
        response.promptFeedback?.blockReason ||
        "Žiadna odpoveď od modelu (bezpečnostné filtre alebo chyba).";
      console.error("Gemini no candidates:", response.promptFeedback);
      return NextResponse.json(
        { error: `AI neodpovedala: ${blockReason}` },
        { status: 500 }
      );
    }

    let rawText: string;
    try {
      rawText = response.text();
    } catch (textErr) {
      console.error("Gemini response.text() error:", textErr);
      return NextResponse.json(
        {
          error:
            "AI vrátila prázdnu alebo blokovanú odpoveď. Skúste inú tému alebo formuláciu.",
        },
        { status: 500 }
      );
    }

    if (!rawText?.trim()) {
      return NextResponse.json(
        { error: "AI nevrátila žiadny text. Skúste to znova." },
        { status: 500 }
      );
    }

    let step: StoryStep;
    try {
      step = parseStepFromGemini(rawText);
    } catch (parseErr) {
      console.error("Gemini JSON parse error:", parseErr);
      return NextResponse.json(
        { error: "AI vrátilo neplatnú odpoveď. Skúste to znova." },
        { status: 500 }
      );
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

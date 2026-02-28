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

/** Predvolený krok rozprávky bez volania Gemini (pre testovanie alebo keď API zlyhá) */
function getDefaultStep(
  namesList: string,
  theme: string,
  moral: string,
  isContinuation: boolean,
  selectedOption?: string
): StoryStep {
  if (isContinuation) {
    return {
      title: "Ďalšia kapitola",
      content: `Na základe toho, že si ${namesList || "hrdina"} vybral${namesList ? "" : "a"} možnosť "${selectedOption || "pokračovať"}", príbeh pokračuje.\n\nV kúzelnom svete sa stalo všetko podľa plánu. Postavy sa stretli s novými priateľmi a prežili malé dobrodružstvo.\n\nTéma príbehu "${theme}" sa ešte len rozvinie v ďalších kapitolách.${moral ? `\n\nPonaučenie: ${moral}` : ""}`,
      options: ["Pokračovať ďalej", "Preskúmať miesto"],
      isFinal: false,
    };
  }
  return {
    title: `Začiatok rozprávky: ${theme || "dobrodružstvo"}`,
    content: `Bolo raz, nebolo raz. V jednom krásnom kraji žili deti menom ${namesList || "hrdinovia"}.\n\nJedného dňa sa rozhodli, že zažijú veľké dobrodružstvo. Téma ich cesty bola: ${theme || "priateľstvo a odvaha"}.\n\nVyšli do sveta plného čarov a možností. Čo ich čaká ďalej? To zistíte v ďalších kapitolách.${moral ? `\n\nTáto rozprávka má ponaučenie: ${moral}` : ""}`,
    options: ["Ísť do lesa", "Navštíviť hrad"],
    isFinal: false,
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
    const useDefaultStory =
      process.env.USE_DEFAULT_STORY === "true" || process.env.USE_DEFAULT_STORY === "1" || !genAI;

    if (useDefaultStory) {
      const step = getDefaultStep(namesList, theme, moral, isContinuation, selectedOption);
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
      return NextResponse.json({ step, savedStory });
    }

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

    const fullPrompt = systemPrompt + "\n\n" + userPrompt;
    let step: StoryStep;

    try {
      const model = genAI!.getGenerativeModel({ model: "gemini-flash" });
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
      const msg = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
      const is404 = msg.includes("404") || msg.includes("Not Found");
      if (is404) {
        console.warn("Gemini model 404, vracia sa default rozprávka.");
      } else {
        console.error("Gemini error:", geminiErr);
      }
      step = getDefaultStep(namesList, theme, moral, isContinuation, selectedOption);
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

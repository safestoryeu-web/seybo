import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/lib/supabase";
import type { StoryStep } from "@/types/story";

function getGenAI() {
  const key =
    process.env.GOOGLE_GEMINI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GEMINI_KEY?.trim() ||
    "";
  return key ? new GoogleGenerativeAI(key) : null;
}

const STEP_JSON_SCHEMA = `{
  "title": "string - krátky nadpis kapitoly",
  "content": "string - text kapitoly (3-5 odsekov v slovenčine)",
  "options": ["string - prvá možnosť čo môže postava urobiť", "string - druhá možnosť"],
  "isFinal": false
}`;

function extractJsonBlock(raw: string): string {
  let s = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/g, "").trim();
  const start = s.indexOf("{");
  if (start === -1) return s;
  let depth = 0;
  let inString = false;
  let escape = false;
  let quote = "";
  let end = -1;
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (c === "\\" && inString) {
      escape = true;
      continue;
    }
    if (!inString) {
      if (c === "{") depth++;
      else if (c === "}") {
        depth--;
        if (depth === 0) {
          end = i;
          break;
        }
      } else if (c === '"' || c === "'") {
        inString = true;
        quote = c;
      }
      continue;
    }
    if (c === quote) inString = false;
  }
  if (end !== -1) return s.slice(start, end + 1);
  return s;
}

/** Skúsi opraviť bežné chyby v options poli (chýbajúca čiarka medzi prvkami) */
function repairOptionsArray(jsonStr: string): string {
  const optionsMatch = jsonStr.match(/"options"\s*:\s*\[/);
  if (!optionsMatch || optionsMatch.index === undefined) return jsonStr;
  const start = optionsMatch.index + optionsMatch[0].length;
  let depth = 1;
  let i = start;
  while (i < jsonStr.length && depth > 0) {
    const c = jsonStr[i];
    if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") depth--;
    i++;
  }
  const end = i;
  const inside = jsonStr.slice(start, end - 1);
  const repaired = inside.replace(/"\s+"/g, '", "');
  return jsonStr.slice(0, start) + repaired + jsonStr.slice(end - 1);
}

function parseStepFromGemini(text: string): StoryStep {
  let trimmed = extractJsonBlock(text);
  trimmed = trimmed.replace(/,\s*([}\]])/g, "$1");
  trimmed = repairOptionsArray(trimmed);
  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const fallback = trimmed.replace(/\n/g, " ").replace(/\r/g, "");
    try {
      parsed = JSON.parse(fallback) as Record<string, unknown>;
    } catch {
      try {
        parsed = JSON.parse(repairOptionsArray(fallback)) as Record<string, unknown>;
      } catch (e) {
        console.error("Gemini JSON parse error. Raw (first 500 chars):", trimmed.slice(0, 500));
        throw e;
      }
    }
  }
  return {
    title: String(parsed.title ?? ""),
    content: String(parsed.content ?? "").replace(/\\n/g, "\n"),
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
      forceFinal,
    } = body as {
      childrenNames: string[];
      theme: string;
      moral: string;
      storySoFar?: string;
      selectedOption?: string;
      forceFinal?: boolean;
    };

    if (!childrenNames?.length || !theme) {
      return NextResponse.json(
        { error: "Chýbajú mená detí alebo téma." },
        { status: 400 }
      );
    }

    const namesList = childrenNames.filter(Boolean).join(", ");
    const isContinuation = Boolean(storySoFar && selectedOption);

    const genAI = getGenAI();
    if (!genAI) {
      return NextResponse.json(
        {
          error:
            "Chýba API kľúč pre Gemini. Do .env.local pridaj riadok: GOOGLE_GEMINI_API_KEY=tvoj_kluc (z Google AI Studio). Po úprave .env.local reštartuj dev server (Ctrl+C, potom npm run dev).",
        },
        { status: 500 }
      );
    }

    const systemPrompt = `Si skúsený rozprávkar pre 5-ročné deti. Rozprávka musí byť prístupná päťročnému: jednoduché vety, zrozumiteľné slová, krátke odseky, jemný dej bez strašidelných prvkov. Odpovedaj VŽDY len platným JSON bez úvodného textu. Formát: ${STEP_JSON_SCHEMA}
Pravidlá: options má presne 2 rôznorodé možnosti (konkrétne činy). isFinal len pri skutočnom závere. Píš živý, konkrétny dej. DÔLEŽITÉ pre JSON: vo vnútri reťazcov (title, content, options) escapuj úvodzovky ako \\", použij \\n pre zalomenie riadku. Odpoveď musí byť platný JSON bez trailing čiarok.`;

    let userPrompt: string;
    if (isContinuation) {
      const finalInstruction = forceFinal
        ? "\n\nDÔLEŽITÉ: Toto je POSLEDNÁ kapitola rozprávky. Napíš pekný záver a ukončenie príbehu. Vráť isFinal: true a options: [\"Späť na formulár\"]."
        : "";
      userPrompt = `Rozprávka pre 5-ročné dieťa (mená: ${namesList}), téma: ${theme}.${moral ? ` Ponaučenie: ${moral}.` : ""} Jazyk jednoduchý, vety krátke, vhodné pre päťročných.

Doterajší text rozprávky:
---
${storySoFar}
---

Dieťa si vybralo: "${selectedOption}"

Napíš JEDNU ďalšiu kapitolu: čo KONKRÉTNE sa stalo po tomto rozhodnutí. Vymysli nové udalosti, postavy alebo prekvapenia podľa výberu. Nepoužívaj rovnaké formulácie ako v predchádzajúcom texte. Vráť JSON: title (výstižný nadpis kapitoly), content (3-5 odsekov, živý dej), options (2 konkrétne možnosti čo môžu urobiť ďalej), isFinal (true len ak rozprávka skutočne končí).${finalInstruction}`;
    } else {
      userPrompt = `Prvá kapitola rozprávky pre 5-ročné dieťa v slovenčine.
Mená postáv: ${namesList}.
Téma: ${theme}.${moral ? ` Ponaučenie: ${moral}.` : ""}

Napíš úvodnú kapitolu pre 5-ročné dieťa: jednoduché vety, zrozumiteľné slová, konkrétny dej – čo sa deje, kde sú, čo objavia. Vráť JSON: title, content (3-5 krátkych odsekov), options (2 konkrétne možnosti), isFinal: false.`;
    }

    const fullPrompt = systemPrompt + "\n\n" + userPrompt;
    let step: StoryStep;

    try {
      const modelId = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelId });
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
      if (forceFinal) {
        step = { ...step, isFinal: true, options: ["Späť na formulár"] };
      }
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

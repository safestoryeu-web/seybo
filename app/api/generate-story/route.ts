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

/** Predvolené kroky rozprávky – zaujímavejšie a rôznorodé podľa výberu (keď API nie je alebo zlyhá) */
function getDefaultStep(
  namesList: string,
  theme: string,
  moral: string,
  isContinuation: boolean,
  selectedOption?: string
): StoryStep {
  const names = namesList || "hrdinovia";
  const moralLine = moral ? `\n\nTáto rozprávka má ponaučenie: ${moral}` : "";

  if (isContinuation) {
    const opt = (selectedOption || "").toLowerCase();
    let title: string;
    let content: string;
    let options: [string, string];

    if (opt.includes("les") || opt.includes("forest")) {
      title = "V kúzelnom lese";
      content = `Keď ${names} zišli do lesa, medzi stromami zavívala tajomná melódia. Na jednej starodávnej dubine visel zlatý zvonček. Jedno z detí ho opatrne zazvonilo a z koreňov stromu vystúpil malý lesný škriatok.\n\n„Hľadáte niečo?“ spýtal sa. „V lese žijú zvieratká, ktoré rozprávajú sny. Ak budete hodní, jedného uvidíte.“ ${names} sa rozbehli ďalej po chodníčku, kde svetlušky kreslili do tmy obrázky.${moralLine}`;
      options = ["Ísť za svetluškami", "Vrátiť sa k škriatkovi"];
    } else if (opt.includes("hrad") || opt.includes("castle")) {
      title = "Pred bránou hradu";
      content = `Cesta viedla ${names} až k veľkému hradu. Na veži vlál fialový prapor a v bráne stál strážnik v lesklom brnení. „Vítam vás v hrade snov,“ povedal. „Vnútri je záhrada, kde kvety spievajú. Ale pozor – na západnom krídle býva starý kráľ, ktorý rád rozpráva príbehy.“\n\n${names} prešli cez most a vo dvorane ich privítala záhradníčka so košíkom plným jahôd. „Kto chce, nech ochutná. Potom si vyberte: záhrada alebo kráľ?“${moralLine}`;
      options = ["Ísť do záhrady", "Navštíviť kráľa"];
    } else if (opt.includes("preskúmať") || opt.includes("miesto")) {
      title = "Tajomstvo miesta";
      content = `${names} sa rozhliadli po okolí. Pod kameňom Sofia našla starú mapu; Olivia objavila stopu, ktorá viedla k jaskyni. „Čo povedia, pôjdeme spolu?“\n\nV jaskyni svietilo jemné svetlo. Stredom pretekal potôčik a na jeho brehu stál malý domček z perníka. Za dverami sa ozvalo: „Kto tam? Ak máte odvahu, vstúpte.“${moralLine}`;
      options = ["Vstúpiť do domčeka", "Nasledovať potôčik"];
    } else {
      title = "Ďalšie dobrodružstvo";
      content = `Cesta viedla ${names} ďalej. Zrazu sa pred nimi zjavil most cez rieku, na druhej strane záhrada plná kvetov. Nad riekou lietal drak – malý a priateľský – a mával na ne krídlami.\n\n„Vitajte!“ zavolal. „Hľadám kamaráta na prechádzku. Môžem vás previesť na druhý breh, alebo vás zoberiem nad oblaky. Čo si vyberiete?“ ${names} sa na seba pozreli a usmiali.${moralLine}`;
      options = ["Prejsť mostom", "Letieť s drakom"];
    }

    return { title, content, options, isFinal: false };
  }

  return {
    title: `Začiatok rozprávky: ${theme || "dobrodružstvo"}`,
    content: `Bolo raz, nebolo raz. V jednom krásnom kraji žili deti menom ${names}.\n\nJedného dňa sa rozhodli, že zažijú veľké dobrodružstvo. Téma ich cesty bola: ${theme || "priateľstvo a odvaha"}.\n\nVyšli do sveta plného čarov a možností. Čo ich čaká ďalej? To zistíte v ďalších kapitolách.${moralLine}`,
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

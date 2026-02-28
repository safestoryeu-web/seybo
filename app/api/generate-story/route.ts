import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY ?? "");

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { childrenNames, theme, moral } = body as {
      childrenNames: string[];
      theme: string;
      moral: string;
    };

    if (!childrenNames?.length || !theme) {
      return NextResponse.json(
        { error: "Chýbajú mená detí alebo téma." },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const namesList = childrenNames.filter(Boolean).join(", ");
    const prompt = `Napíš krátku rozprávku pre deti v slovenčine.
Hlavné postavy majú mať tieto mená: ${namesList}.
Téma rozprávky: ${theme}.
${moral ? `Rozprávka má obsahovať toto ponaučenie: ${moral}.` : ""}
Rozprávka nech má 3–5 odsekov, príjemný štýl a jasný záver.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ story: text });
  } catch (err) {
    console.error("generate-story error:", err);
    return NextResponse.json(
      { error: "Nepodarilo sa vygenerovať rozprávku." },
      { status: 500 }
    );
  }
}

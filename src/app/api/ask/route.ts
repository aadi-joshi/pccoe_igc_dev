import { NextResponse } from "next/server";
import { answerQuestion } from "@/lib/ask";
import type { BriefingFacts, Language } from "@/lib/briefing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      facts?: BriefingFacts;
      lang?: Language;
      question?: string;
    };

    const lang: Language =
      body.lang === "mr" || body.lang === "hi" || body.lang === "en" ? body.lang : "mr";

    if (!body.facts || typeof body.question !== "string") {
      return NextResponse.json({ error: "Missing question" }, { status: 400 });
    }

    return NextResponse.json({
      answer: answerQuestion(body.question, body.facts, lang),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

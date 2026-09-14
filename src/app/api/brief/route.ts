import { NextResponse } from "next/server";
import { briefingPrompt, renderBriefing, type BriefingFacts, type Language } from "@/lib/briefing";
import { nugenComplete } from "@/lib/nugen";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SYSTEM = [
  "You are the briefing voice of KAVACH, an occupational heat safety system used by",
  "site supervisors in Maharashtra, India.",
  "You translate an already-decided work schedule into spoken instructions.",
  "You must never invent, alter, or omit a time, temperature, volume or zone.",
  "If a fact is not in the user message, do not mention it.",
  "Write plainly, as if speaking aloud to someone who may not read well.",
].join(" ");

/**
 * Render a supervisor briefing through the Nugen aligned model.
 *
 * On any failure this returns the deterministic briefing with source
 * "template" rather than an error, because a supervisor who does not receive
 * a briefing is worse off than one who receives a plainly-worded one.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      facts?: BriefingFacts;
      lang?: Language;
    };

    const lang: Language =
      body.lang === "mr" || body.lang === "hi" || body.lang === "en" ? body.lang : "mr";

    if (!body.facts) {
      return NextResponse.json({ error: "Missing briefing facts" }, { status: 400 });
    }

    const fallback = renderBriefing(body.facts, lang);
    const { text, error } = await nugenComplete(briefingPrompt(body.facts, lang), SYSTEM);

    if (!text) {
      return NextResponse.json({ text: fallback, source: "template", error });
    }
    return NextResponse.json({ text, source: "nugen", error: null });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import "server-only";

/**
 * Nugen Intelligence aligned-model inference.
 *
 * Nugen is the competition's mandated inference provider. The integration is
 * kept deliberately thin and entirely outside the safety decision path: it
 * receives a set of already-computed facts and returns phrasing. It cannot
 * change a work window, a temperature, or a water volume.
 *
 * Configuration (all via environment, none committed):
 *   NUGEN_API_KEY    required to enable the aligned path
 *   NUGEN_BASE_URL   defaults to the documented inference host
 *   NUGEN_MODEL      the aligned model deployed for this project
 *
 * The request shape below follows the OpenAI-compatible chat-completions
 * convention that Nugen's inference API exposes. Verify the exact path and
 * model id against docs.nugen.in for your account before the demo — if it
 * differs, only the two constants below need to change, and the product keeps
 * working from the deterministic renderer in the meantime.
 */

const DEFAULT_BASE_URL = "https://api.nugen.in/inference";
const CHAT_PATH = "/chat/completions";

export interface NugenResult {
  text: string | null;
  error: string | null;
}

export function nugenConfigured(): boolean {
  return Boolean(process.env.NUGEN_API_KEY);
}

export async function nugenComplete(
  prompt: string,
  system: string,
): Promise<NugenResult> {
  const apiKey = process.env.NUGEN_API_KEY;
  if (!apiKey) {
    return {
      text: null,
      error:
        "No NUGEN_API_KEY configured — showing the deterministic briefing. The schedule is identical either way.",
    };
  }

  const baseUrl = (process.env.NUGEN_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/$/, "");
  const model = process.env.NUGEN_MODEL ?? "nugen-flash-instruct";

  try {
    const res = await fetch(`${baseUrl}${CHAT_PATH}`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 400,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return {
        text: null,
        error: `Nugen responded ${res.status}. ${detail.slice(0, 160)}`.trim(),
      };
    }

    const json = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = json.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return { text: null, error: "Nugen returned an empty completion." };
    }
    return { text, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return { text: null, error: `Nugen request failed: ${message}` };
  }
}

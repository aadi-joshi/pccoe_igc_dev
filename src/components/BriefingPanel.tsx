"use client";

import { useEffect, useMemo, useState } from "react";
import type { Plan } from "@/lib/types";
import {
  LANGUAGES,
  briefingFacts,
  renderBriefing,
  type Language,
} from "@/lib/briefing";
import { Callout, Explain, Panel, Pill, Segmented } from "./ui";

type Source = "template" | "nugen";

/**
 * Supervisor briefing.
 *
 * Two things this panel is built to demonstrate, beyond producing text:
 *
 * 1. Voice. The briefing is spoken aloud through the Web Speech API — no
 *    telephony dependency to fail on a conference network. Exotel/IVR is the
 *    production path and is labelled as such rather than claimed.
 * 2. That the model is outside the safety decision path. The source toggle
 *    switches between the deterministic renderer and the Nugen aligned model,
 *    and the schedule above does not move. That is the point.
 */
export function BriefingPanel({ plan }: { plan: Plan }) {
  const [lang, setLang] = useState<Language>("mr");
  const [source, setSource] = useState<Source>("template");
  const [nugenText, setNugenText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [nugenError, setNugenError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const facts = useMemo(() => briefingFacts(plan), [plan]);
  const fallbackText = useMemo(() => renderBriefing(facts, lang), [facts, lang]);
  const text = source === "nugen" && nugenText ? nugenText : fallbackText;

  // The panel is remounted by its parent when the plan identity changes, so
  // stale model output cannot survive a recompute without an effect here.

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const generate = async () => {
    setLoading(true);
    setNugenError(null);
    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ facts, lang }),
      });
      const json = (await res.json()) as {
        text?: string;
        source?: Source;
        error?: string;
      };
      if (json.text && json.source === "nugen") {
        setNugenText(json.text);
        setSource("nugen");
      } else {
        setNugenError(json.error ?? "Nugen unavailable — showing the deterministic briefing.");
        setSource("template");
      }
    } catch {
      setNugenError("Could not reach the briefing service.");
      setSource("template");
    } finally {
      setLoading(false);
    }
  };

  const speak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = LANGUAGES.find((l) => l.code === lang)?.bcp47 ?? "en-IN";
    u.rate = 0.92;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  };

  return (
    <Panel
      step={5}
      title="What do we actually tell the supervisor?"
      subtitle={
        <>
          The plan, spoken in the language they use. Press play — this is what arrives on
          their phone at 6 AM.
        </>
      }
      aside={
        <span className="text-[11.5px] text-[var(--color-ink-muted)]">
          to {plan.site.supervisor}
        </span>
      }
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-[var(--color-rule)] px-3.5 py-3">
        <Segmented
          label="Language"
          value={lang}
          onChange={setLang}
          options={LANGUAGES.map((l) => ({
            value: l.code,
            label: l.native,
            title: l.label,
          }))}
        />
        <Segmented
          label={<Explain term="nugen">Who wrote these words?</Explain>}
          value={source}
          onChange={(s) => {
            if (s === "nugen" && !nugenText) {
              void generate();
            } else {
              setSource(s);
            }
          }}
          disabled={loading}
          hint={
            source === "nugen"
              ? "Written by the AI model — the schedule is unchanged"
              : "Written directly by the calculation, no AI involved"
          }
          options={[
            { value: "template" as Source, label: "The calculation", title: "Rendered directly from the engine output, no AI" },
            { value: "nugen" as Source, label: "The AI model", title: "Phrased by the Nugen aligned model" },
          ]}
        />
        {loading && (
          <span className="tnum text-[11px] text-[var(--color-ink-faint)]">
            generating…
          </span>
        )}
      </div>

      <div className="px-3.5 py-3.5">
        <blockquote
          lang={LANGUAGES.find((l) => l.code === lang)?.bcp47}
          className="m-0 whitespace-pre-line border-l-2 border-[var(--color-ink)] bg-[var(--color-paper-sunk)] px-4 py-3.5 text-[13.5px] leading-[1.75]"
        >
          {text}
        </blockquote>

        {nugenError && (
          <p className="mt-2.5 text-[11px] text-[var(--color-accent)]">{nugenError}</p>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={speak}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink)] bg-[var(--color-ink)] px-4 py-2 text-[12.5px] font-medium text-[var(--color-paper)] transition-opacity hover:opacity-85"
          >
            {speaking ? "Stop" : "Play this out loud"}
          </button>

          <button
            type="button"
            onClick={() => setAcknowledged((a) => !a)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors ${
              acknowledged
                ? "border-[var(--color-safe)] text-[var(--color-safe)]"
                : "border-[var(--color-rule-strong)] text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-sunk)]"
            }`}
          >
            {acknowledged ? "Supervisor confirmed" : "Mark as confirmed"}
          </button>

          <Pill>Sent by SMS or phone call in real use</Pill>
        </div>

        <div className="mt-3.5">
          <Callout tone="safe" title="Try the toggle above — and watch the schedule">
            The AI only chooses the words. Every time, temperature and quantity was
            calculated before it was involved, so switching between the two sources changes
            the phrasing and nothing else. That is deliberate: if the model ever goes wrong,
            it still cannot produce an unsafe shift.
          </Callout>
        </div>
      </div>
    </Panel>
  );
}

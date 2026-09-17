"use client";

import { useEffect, useMemo, useState } from "react";
import type { Plan } from "@/lib/types";
import {
  LANGUAGES,
  briefingFacts,
  renderBriefing,
  type Language,
} from "@/lib/briefing";
import { SUGGESTED_QUESTIONS, answerQuestion } from "@/lib/ask";
import { rowId, upsertRow, type DispatchStatus } from "@/lib/compliance";
import { Callout, Explain, Panel, Pill, Segmented } from "./ui";

export function BriefingPanel({ plan }: { plan: Plan }) {
  const [lang, setLang] = useState<Language>("mr");
  const [speaking, setSpeaking] = useState(false);
  const [dispatch, setDispatch] = useState<DispatchStatus | "idle">("idle");
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<{ q: string; a: string }[]>([]);
  const [thinking, setThinking] = useState(false);

  const facts = useMemo(() => briefingFacts(plan), [plan]);
  const text = useMemo(() => renderBriefing(facts, lang), [facts, lang]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

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

  const send = () => {
    if (dispatch === "queued") return;
    setDispatch("queued");
    window.setTimeout(() => {
      upsertRow({
        id: rowId(plan.site.id, plan.date),
        siteId: plan.site.id,
        siteName: plan.site.name,
        locality: plan.site.locality,
        supervisor: plan.site.supervisor,
        phone: plan.site.phone,
        date: plan.date,
        windows: facts.blocks.map((b) => `${b.start}–${b.end}`).join(", ") || "stand down",
        zone: facts.zone,
        status: "delivered",
        sentAt: new Date().toISOString(),
        confirmedAt: null,
        lang,
      });
      setDispatch("delivered");
    }, 900);
  };

  const confirm = () => {
    upsertRow({
      id: rowId(plan.site.id, plan.date),
      siteId: plan.site.id,
      siteName: plan.site.name,
      locality: plan.site.locality,
      supervisor: plan.site.supervisor,
      phone: plan.site.phone,
      date: plan.date,
      windows: facts.blocks.map((b) => `${b.start}–${b.end}`).join(", ") || "stand down",
      zone: facts.zone,
      status: "confirmed",
      sentAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
      lang,
    });
    setDispatch("confirmed");
  };

  const ask = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || thinking) return;
    setQuestion("");
    setThinking(true);
    await new Promise((r) => window.setTimeout(r, 280));
    const a = answerQuestion(trimmed, facts, lang);
    setChat((prev) => [...prev, { q: trimmed, a }]);
    setThinking(false);
  };

  return (
    <Panel
      step={5}
      title="What do we actually tell the supervisor?"
      subtitle={
        <>
          The plan, spoken in the language they use. Play it, send it to{" "}
          <Explain term="briefing">{plan.site.supervisor}</Explain>, then confirm receipt.
        </>
      }
      aside={
        <span className="tnum text-[11.5px] text-[var(--color-ink-muted)]">
          {plan.site.phone}
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
        {dispatch !== "idle" && (
          <Pill tone={dispatch === "confirmed" ? "ok" : dispatch === "delivered" ? "neutral" : "warn"}>
            {dispatch === "queued"
              ? `Calling ${plan.site.phone}…`
              : dispatch === "delivered"
                ? "Delivered · waiting for confirmation"
                : "Supervisor confirmed"}
          </Pill>
        )}
      </div>

      <div className="px-3.5 py-3.5">
        <blockquote
          lang={LANGUAGES.find((l) => l.code === lang)?.bcp47}
          className="m-0 whitespace-pre-line border-l-2 border-[var(--color-ink)] bg-[var(--color-paper-sunk)] px-4 py-3.5 text-[13.5px] leading-[1.75]"
        >
          {text}
        </blockquote>

        <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={speak}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--color-ink)] bg-[var(--color-ink)] px-4 py-2 text-[12.5px] font-medium text-[var(--color-paper)] transition-opacity hover:opacity-85"
          >
            {speaking ? "Stop" : "Play this out loud"}
          </button>

          {dispatch === "idle" || dispatch === "queued" ? (
            <button
              type="button"
              onClick={send}
              disabled={dispatch === "queued"}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-rule-strong)] px-4 py-2 text-[12.5px] font-medium text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-sunk)] disabled:opacity-50"
            >
              {dispatch === "queued" ? "Sending…" : "Send briefing"}
            </button>
          ) : dispatch === "delivered" ? (
            <button
              type="button"
              onClick={confirm}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-safe)] px-4 py-2 text-[12.5px] font-medium text-[var(--color-safe)] transition-colors hover:bg-[var(--color-safe-tint)]"
            >
              Mark as confirmed
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setDispatch("idle")}
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-safe)] px-4 py-2 text-[12.5px] font-medium text-[var(--color-safe)]"
            >
              Confirmed · {plan.site.supervisor}
            </button>
          )}
        </div>

        <div className="mt-5 border-t border-[var(--color-rule)] pt-4">
          <div className="label mb-1.5">Ask about this plan</div>
          <p className="mb-2.5 text-[12px] leading-relaxed text-[var(--color-ink-muted)]">
            Answers use this site&rsquo;s times, water volumes and zone — nothing else.
          </p>

          {chat.length > 0 && (
            <ul className="mb-3 space-y-2.5">
              {chat.map((turn, i) => (
                <li key={i} className="text-[13px] leading-relaxed">
                  <div className="text-[11.5px] text-[var(--color-ink-faint)]">{turn.q}</div>
                  <div className="mt-0.5">{turn.a}</div>
                </li>
              ))}
            </ul>
          )}

          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void ask(question);
            }}
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={
                lang === "mr"
                  ? "उदा. दुपारी काम करू का?"
                  : lang === "hi"
                    ? "जैसे: दोपहर में काम करें?"
                    : "e.g. Can we work after lunch?"
              }
              className="min-w-[220px] flex-1 rounded-full border border-[var(--color-rule-strong)] bg-[var(--color-paper)] px-3.5 py-2 text-[13px] outline-none focus:border-[var(--color-ink)]"
            />
            <button
              type="submit"
              disabled={thinking}
              className="rounded-full border border-[var(--color-ink)] px-4 py-2 text-[12.5px] font-medium disabled:opacity-50"
            >
              {thinking ? "…" : "Ask"}
            </button>
          </form>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS[lang].map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => void ask(q)}
                className="rounded-full border border-[var(--color-rule)] px-2.5 py-1 text-[11.5px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-sunk)]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <Callout tone="safe" title="The briefing cannot change the schedule">
            Times, temperatures and water volumes are calculated first. This panel only
            phrases them. Confirming a briefing writes it to the compliance ledger.
          </Callout>
        </div>
      </div>
    </Panel>
  );
}

"use client";

import { useSyncExternalStore } from "react";

/**
 * First-run explainer.
 *
 * The console is dense by necessity — it is showing the working, not just the
 * answer. That is fine for a supervisor who uses it daily and hostile to
 * someone seeing it for the first time, which at a competition is everybody.
 *
 * This strip gives a newcomer the shape of the page in about fifteen seconds,
 * then gets out of the way permanently once dismissed.
 */

const STORAGE_KEY = "kavach.intro.dismissed";

const STEPS = [
  {
    n: 1,
    title: "Pick a work site",
    body: "Three real Pune sites are registered. Each one has its own location, crew size and type of work.",
  },
  {
    n: 2,
    title: "We estimate its heat",
    body: "Weather stations are kilometres away. We work out how hot this specific site will get, hour by hour.",
  },
  {
    n: 3,
    title: "We simulate a worker",
    body: "An international standard predicts how far a worker's body temperature rises through the day.",
  },
  {
    n: 4,
    title: "We build the shift",
    body: "The safest productive schedule, written out as a spoken briefing the supervisor can act on.",
  },
];

const EVENT = "kavach:intro-dismissed";

function subscribe(onChange: () => void): () => void {
  window.addEventListener(EVENT, onChange);
  // Keep other tabs in step if the reader dismisses it in one of them.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function readDismissed(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    // Private browsing or blocked storage: show it, it is only an explainer.
    return false;
  }
}

// During server rendering we treat the strip as dismissed, so it is never
// baked into the HTML and cannot flash for a returning reader. React swaps in
// the real client value immediately after hydration.
const readDismissedOnServer = () => true;

export function Intro() {
  // localStorage is an external store, so it is read through the hook built
  // for external stores rather than assigned into state from an effect.
  const dismissed = useSyncExternalStore(
    subscribe,
    readDismissed,
    readDismissedOnServer,
  );

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Nothing to persist — it will simply show again next visit.
    }
    window.dispatchEvent(new Event(EVENT));
  };

  if (dismissed) return null;

  return (
    <section className="mb-5 rounded-[14px] border border-[var(--color-rule)] bg-[var(--color-note-tint)] px-5 py-4 sm:px-6">
      <div className="mb-3.5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-[17px] leading-tight">
            New here? This page answers one question.
          </h2>
          <p className="mt-1 max-w-2xl text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
            <strong className="font-semibold text-[var(--color-ink)]">
              Can this crew work outdoors today, and when?
            </strong>{" "}
            Everything below is the reasoning behind that answer. Any underlined term can be
            hovered or tapped for a plain-English explanation.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-full border border-[var(--color-rule-strong)] px-3 py-1 text-[11.5px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-raised)]"
        >
          Got it
        </button>
      </div>

      <ol className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
        {STEPS.map((s) => (
          <li key={s.n} className="flex gap-2.5">
            <span
              aria-hidden
              className="tnum mt-[1px] flex h-[21px] w-[21px] shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-[11px] text-[var(--color-paper)]"
            >
              {s.n}
            </span>
            <div className="min-w-0">
              <div className="text-[12.5px] font-semibold leading-tight">{s.title}</div>
              <p className="mt-1 text-[11.5px] leading-relaxed text-[var(--color-ink-muted)]">
                {s.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

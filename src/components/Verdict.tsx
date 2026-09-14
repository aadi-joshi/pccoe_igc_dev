"use client";

import type { Plan } from "@/lib/types";
import { ZONES } from "@/lib/zones";
import { Explain, formatClock } from "./ui";

/**
 * The answer, before the evidence.
 *
 * A supervisor opening this at 6 AM has exactly one question: can my crew
 * work today, and when? Everything below this banner is the reasoning that
 * justifies the answer — but the answer itself has to be readable in two
 * seconds, in words, without understanding a single chart on the page.
 *
 * This is also what makes the console legible to a first-time viewer: the
 * page now opens with a sentence rather than a physiological simulation.
 */
export function Verdict({ plan }: { plan: Plan }) {
  const blocks = plan.blocks;
  const zoneMeta = ZONES[plan.peakZone];
  const water = Math.max(1, Math.round(plan.optimised.strain.totalWaterLossL * 10) / 10);

  const none = blocks.length === 0;
  const headline = none
    ? "No — not at this work intensity"
    : blocks.length === 1
      ? "Yes — but one window only"
      : "Yes — but only in two windows";

  const totalHours = blocks.reduce((a, b) => a + (b.endMin - b.startMin) / 60, 0);

  return (
    <section
      className={`mb-5 rounded-[14px] border px-5 py-5 sm:px-6 ${
        none
          ? "border-[var(--color-danger)]/35 bg-[var(--color-danger-tint)]"
          : "border-[var(--color-rule-strong)] bg-[var(--color-paper-raised)]"
      }`}
    >
      <p className="label mb-2.5">The question this page answers</p>
      <h2 className="font-[family-name:var(--font-display)] text-[19px] leading-snug text-[var(--color-ink-muted)]">
        Can the crew work today?
      </h2>

      <p
        className={`mt-1 font-[family-name:var(--font-display)] text-[30px] leading-tight sm:text-[34px] ${
          none ? "text-[var(--color-danger)]" : "text-[var(--color-ink)]"
        }`}
      >
        {headline}
      </p>

      {none ? (
        <p className="mt-3 max-w-2xl text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
          There is no schedule today that keeps a worker&rsquo;s{" "}
          <Explain term="coreTemp">body temperature</Explain> inside the safe limit at this
          workload. Move the crew into shade, drop the{" "}
          <Explain term="met">work intensity</Explain> using the control below, or stand the
          site down.
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-stretch gap-2.5">
            {blocks.map((b, i) => (
              <div
                key={i}
                className="rounded-[10px] border border-[var(--color-rule)] bg-[var(--color-paper-sunk)] px-4 py-2.5"
              >
                <div className="label mb-1.5">Work window {i + 1}</div>
                <div className="tnum text-[21px] font-medium leading-none">
                  {formatClock(b.startMin)} – {formatClock(b.endMin)}
                </div>
                <div className="tnum mt-1.5 text-[11.5px] text-[var(--color-ink-muted)]">
                  {((b.endMin - b.startMin) / 60).toFixed(1)} hours
                </div>
              </div>
            ))}

            {plan.restWindow && (
              <div className="rounded-[10px] border border-dashed border-[var(--color-rule-strong)] px-4 py-2.5">
                <div className="label mb-1.5">
                  <Explain term="standDown">Stand down</Explain>
                </div>
                <div className="tnum text-[21px] font-medium leading-none text-[var(--color-ink-muted)]">
                  {formatClock(plan.restWindow.startMin)} –{" "}
                  {formatClock(plan.restWindow.endMin)}
                </div>
                <div className="mt-1.5 text-[11.5px] text-[var(--color-ink-muted)]">
                  shade and water, no work
                </div>
              </div>
            )}
          </div>

          <p className="mt-4 max-w-2xl text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
            That is <span className="tnum">{totalHours.toFixed(1)}</span> hours on site,
            chosen so nobody&rsquo;s{" "}
            <Explain term="coreTemp">body temperature</Explain> crosses the safe limit. The
            hours in between are skipped because the heat makes them nearly unproductive
            anyway.
          </p>
        </>
      )}

      {/* The three things a supervisor has to physically do. */}
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-[var(--color-rule)] pt-3.5">
        <Action label="Drinking water" value={`${water} L per worker`} term="sweatLoss" />
        <Action
          label="Rest pattern"
          value={zoneMeta.cadence}
          term="cadence"
        />
        <Action
          label="Heat danger today"
          value={`Zone ${plan.peakZone} — ${zoneMeta.label.toLowerCase()}`}
          term="zone"
        />
      </ul>
    </section>
  );
}

function Action({
  label,
  value,
  term,
}: {
  label: string;
  value: string;
  term: "sweatLoss" | "cadence" | "zone";
}) {
  return (
    <li className="min-w-0">
      <div className="label mb-1">
        <Explain term={term}>{label}</Explain>
      </div>
      <div className="text-[13px] font-medium">{value}</div>
    </li>
  );
}

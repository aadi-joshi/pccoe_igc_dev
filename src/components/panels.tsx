"use client";

import type { Plan } from "@/lib/types";
import { ledgerDelta } from "@/lib/plan";
import { CORE_TEMP_LIMIT } from "@/lib/phs";
import { Callout, Explain, Panel, Pill, Stat, formatClock, formatInr } from "./ui";

/**
 * Downscaling transparency panel.
 *
 * Shows the arithmetic rather than the answer. A judge asking "where does
 * 34.3 °C come from when the station says 24.3 °C?" should be able to read
 * the response off the screen, including the term we are least certain of.
 */
export function DownscalePanel({ plan }: { plan: Plan }) {
  const d = plan.downscale;
  const rows = d.contributions.slice(1);
  const maxMag = Math.max(0.5, ...rows.map((r) => Math.abs(r.valueC)));

  return (
    <Panel
      step={2}
      title="How hot will this site actually get?"
      subtitle={
        <>
          The nearest weather station is kilometres away. This is how we{" "}
          <Explain term="downscaling">estimate conditions at the site itself</Explain>.
        </>
      }
      aside={
        <span className="tnum text-[11px] text-[var(--color-ink-muted)]">
          {d.anchorComparable
            ? `anchor ${d.stationName} · ${d.stationDistanceKm.toFixed(1)} km`
            : "archive day · no live anchor"}
        </span>
      }
    >
      <div className="grid grid-cols-3 gap-4 border-b border-[var(--color-rule)] px-3.5 py-3.5">
        <Stat
          label="Nearest station"
          term="shram"
          value={d.anchorComparable ? d.stationTempC.toFixed(1) : "—"}
          unit={d.anchorComparable ? "°C" : undefined}
          note={
            d.anchorComparable
              ? "what the real weather station measures"
              : "not from the same day as this forecast"
          }
        />
        <Stat
          label="This site"
          value={d.siteTempC.toFixed(1)}
          unit="°C"
          note="our estimate for 15:00"
        />
        {/* The station-versus-site divergence is only meaningful when both
            describe the same moment. On the historical scenario day it would
            be a difference in date, so we show the land-cover effect instead. */}
        {d.anchorComparable ? (
          <Stat
            label="The gap"
            term="uhi"
            value={`${d.deltaVsStationC >= 0 ? "+" : "−"}${Math.abs(d.deltaVsStationC).toFixed(1)}`}
            unit="°C"
            tone={d.deltaVsStationC >= 1.5 ? "danger" : "default"}
            note="hotter than the station suggests"
          />
        ) : (
          <Stat
            label="Effect of the ground"
            term="uhi"
            value={`${d.uhiDeltaC >= 0 ? "+" : "−"}${Math.abs(d.uhiDeltaC).toFixed(1)}`}
            unit="°C"
            tone={d.uhiDeltaC >= 1.5 ? "danger" : "default"}
            note="compared with open, green land"
          />
        )}
      </div>

      <div className="px-3.5 py-3">
        <div className="label mb-1">Where that number comes from</div>
        <p className="mb-2.5 text-[11.5px] leading-relaxed text-[var(--color-ink-muted)]">
          A forecast for this spot, then a{" "}
          <Explain term="biasCorrection">live accuracy check</Explain>, then what the
          ground itself does. Bars to the right make the site hotter; left, cooler.
        </p>
        <ul className="space-y-[7px]">
          <li className="flex items-baseline justify-between gap-3">
            <span className="text-[12px]">Gridded forecast at site</span>
            <span className="tnum shrink-0 text-[12px] font-medium">
              {d.gridForecastC.toFixed(1)}°C
            </span>
          </li>

          {rows.map((r) => {
            const pct = (Math.abs(r.valueC) / maxMag) * 50;
            const positive = r.valueC >= 0;
            return (
              <li key={r.label} className="grid grid-cols-[1fr_84px_58px] items-center gap-2">
                <div className="min-w-0">
                  <div className="truncate text-[12px]">{r.label}</div>
                  <div className="truncate text-[10.5px] text-[var(--color-ink-faint)]">
                    {r.note}
                  </div>
                </div>
                {/* Diverging bar: warming right of centre, cooling left. */}
                <div className="relative h-[5px] bg-[var(--color-paper-sunk)]">
                  <span className="absolute inset-y-[-2px] left-1/2 w-px bg-[var(--color-rule-strong)]" />
                  <span
                    className="absolute top-0 h-full"
                    style={{
                      left: positive ? "50%" : `${50 - pct}%`,
                      width: `${pct}%`,
                      background: positive
                        ? "var(--color-zone-5)"
                        : "var(--color-zone-1)",
                    }}
                  />
                </div>
                <span
                  className={`tnum text-right text-[12px] ${
                    positive
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-safe)]"
                  }`}
                >
                  {positive ? "+" : "−"}
                  {Math.abs(r.valueC).toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>

        <div className="mt-3.5">
          <Callout title="What we are less sure about">
            The first two rows are live data and a standard correction. The ground-cover
            rows use published figures from Indian{" "}
            <Explain term="uhi">urban heat island</Explain> studies rather than a model
            trained on real site measurements — because no such measurements exist yet. We
            would rather say that than show you an accuracy score we made up.
          </Callout>
        </div>
      </div>
    </Panel>
  );
}

/**
 * Productivity ledger.
 *
 * The argument that actually gets this adopted. It is stated honestly in both
 * directions: when the safe schedule yields more effective labour we say so,
 * and when it costs output we say that too rather than hiding it.
 */
export function LedgerPanel({ plan }: { plan: Plan }) {
  const delta = ledgerDelta(plan);
  const base = plan.baseline;
  const opt = plan.optimised;
  const gain = delta.deltaHours >= 0;

  return (
    <Panel
      step={4}
      title="Is the safer plan actually worse for business?"
      subtitle={
        <>
          Usually not. Hours worked in dangerous heat produce very little, so{" "}
          <Explain term="effectiveHours">real work delivered</Explain> often goes up, not
          down.
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2">
        <Column
          heading="A normal day"
          sub="09:00–17:00, worked straight through"
          hours={base.ledger.effectiveLabourHours}
          scheduled={base.ledger.scheduledHours}
          peak={base.strain.peakCoreTempC}
          breach={base.strain.breachAtClock}
          sop={base.ledger.sopCompliant}
          value={base.ledger.effectiveWageValueInr}
        />
        <Column
          heading="With KAVACH"
          sub={
            plan.blocks.length
              ? plan.blocks
                  .map((b) => `${formatClock(b.startMin)}–${formatClock(b.endMin)}`)
                  .join(" + ")
              : "no safe schedule"
          }
          hours={opt.ledger.effectiveLabourHours}
          scheduled={opt.ledger.scheduledHours}
          peak={opt.strain.peakCoreTempC}
          breach={opt.strain.breachAtClock}
          sop={opt.ledger.sopCompliant}
          value={opt.ledger.effectiveWageValueInr}
          bordered
        />
      </div>

      <div className="border-t border-[var(--color-rule)] px-3.5 py-3">
        <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
          <span
            className={`tnum text-[22px] font-medium leading-none ${
              gain ? "text-[var(--color-safe)]" : "text-[var(--color-accent)]"
            }`}
          >
            {gain ? "+" : "−"}
            {Math.abs(delta.deltaHours).toFixed(0)} h
          </span>
          <span className="text-[13px] text-[var(--color-ink-muted)]">
            {gain ? "more" : "less"} real work —{" "}
            <span className="tnum">{Math.abs(delta.deltaPct).toFixed(0)}%</span>
          </span>
          <span className="tnum text-[13px] text-[var(--color-ink-muted)]">
            {formatInr(delta.deltaWageInr)} /day
          </span>
          <span className="ml-auto">
            <Pill tone={base.ledger.breaches > opt.ledger.breaches ? "ok" : "neutral"}>
              {base.ledger.breaches - opt.ledger.breaches} fewer safety limits crossed
            </Pill>
          </span>
        </div>

        <p className="mt-2.5 text-[11.5px] leading-relaxed text-[var(--color-ink-muted)]">
          {gain ? (
            <>
              The safe schedule is also the more productive one. Hours worked in Zone 5
              return only a quarter of their labour, so moving them to cooler hours buys
              back more than the stand-down costs.
            </>
          ) : (
            <>
              This is a genuine trade-off, not a win: at this work intensity the day cannot
              safely deliver the target hours, so the optimised schedule returns less
              effective labour. It also returns nobody to hospital. Lower the work
              intensity or move the crew into shade to recover the hours.
            </>
          )}
        </p>
      </div>
    </Panel>
  );
}

function Column({
  heading,
  sub,
  hours,
  scheduled,
  peak,
  breach,
  sop,
  value,
  bordered,
}: {
  heading: string;
  sub: string;
  hours: number;
  scheduled: number;
  peak: number;
  breach: number | null;
  sop: boolean;
  value: number;
  bordered?: boolean;
}) {
  return (
    <div
      className={`px-3.5 py-3.5 ${
        bordered ? "border-t border-[var(--color-rule)] sm:border-l sm:border-t-0" : ""
      }`}
    >
      <div className="mb-3">
        <div className="text-[13px] font-semibold">{heading}</div>
        <div className="tnum text-[11px] text-[var(--color-ink-muted)]">{sub}</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Stat
          label="Real work done"
          term="effectiveHours"
          value={hours.toFixed(0)}
          unit="h"
          size="lg"
          note={`from ${scheduled.toFixed(1)} h on site`}
        />
        <Stat
          label="Hottest body temp"
          term="coreTemp"
          value={peak.toFixed(2)}
          unit="°C"
          size="lg"
          tone={peak >= CORE_TEMP_LIMIT ? "danger" : "safe"}
          note={
            breach !== null
              ? `crosses the limit at ${formatClock(breach)}`
              : "stays under the safe limit"
          }
        />
      </div>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        <Pill tone={sop ? "ok" : "warn"}>
          {sop ? "Follows the legal rule" : "Outside the legal rule"}
        </Pill>
        <Pill>{formatInr(value)} of labour</Pill>
      </div>
    </div>
  );
}

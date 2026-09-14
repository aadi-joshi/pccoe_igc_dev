"use client";

import { useId } from "react";
import type { StrainResult } from "@/lib/types";
import { CORE_TEMP_LIMIT } from "@/lib/phs";
import { formatClock } from "./ui";

/**
 * Predicted core body temperature across the day.
 *
 * Hand-drawn SVG rather than a chart library: the defaults of Recharts or
 * Chart.js are recognisable on sight, and this is the one view the whole
 * pitch rests on. Drawing it directly also lets the curve say something a
 * library cannot — the portion beyond ISO 7933's validity is dashed, because
 * past a limit breach the worker would have been withdrawn and the model is
 * extrapolating.
 */

const VIEW_W = 760;
const VIEW_H = 300;
const PAD = { top: 18, right: 18, bottom: 30, left: 48 };

const DAY_START = 5 * 60;
const DAY_END = 20 * 60;

const Y_MIN = 36.6;
const Y_MAX = 40.6;

function xOf(clockMin: number): number {
  const t = (clockMin - DAY_START) / (DAY_END - DAY_START);
  return PAD.left + t * (VIEW_W - PAD.left - PAD.right);
}

function yOf(tempC: number): number {
  const t = (tempC - Y_MIN) / (Y_MAX - Y_MIN);
  return VIEW_H - PAD.bottom - t * (VIEW_H - PAD.top - PAD.bottom);
}

/** Build an SVG path, optionally only across a clock-minute window. */
function pathFor(
  result: StrainResult,
  from: number = -Infinity,
  to: number = Infinity,
): string {
  const pts = result.points.filter((p) => p.clock >= from && p.clock <= to);
  if (pts.length === 0) return "";
  return pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(p.clock).toFixed(2)},${yOf(p.coreTempC).toFixed(2)}`)
    .join(" ");
}

export interface StrainChartProps {
  baseline: StrainResult;
  optimised: StrainResult;
  /** Shift blocks, drawn as a faint working-hours backdrop. */
  blocks: { startMin: number; endMin: number }[];
}

export function StrainChart({ baseline, optimised, blocks }: StrainChartProps) {
  const uid = useId().replace(/:/g, "");
  const limitY = yOf(CORE_TEMP_LIMIT);

  const gridTemps = [37, 38, 39, 40];
  const hourTicks = [5, 7, 9, 11, 13, 15, 17, 19, 20];

  const breach = baseline.breachAtClock;

  // The baseline curve past its breach is extrapolation, so it is drawn
  // dashed and visually separated from the part that is inside the model.
  const baseValid = pathFor(baseline, -Infinity, baseline.validUntilClock);
  const baseBeyond = pathFor(baseline, baseline.validUntilClock);

  return (
    <figure className="m-0">
      {/* On a phone a 760-wide plot scaled to fit would render its 10px
          labels at ~5px. Scroll it instead of shrinking it. */}
      <div className="-mx-1 overflow-x-auto px-1">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block h-auto w-full min-w-[640px]"
        role="img"
        aria-label={`Predicted core body temperature. Unmanaged shift peaks at ${baseline.peakCoreTempC.toFixed(
          1,
        )} degrees Celsius${
          breach !== null ? `, breaching the limit at ${formatClock(breach)}` : ""
        }. Optimised schedule peaks at ${optimised.peakCoreTempC.toFixed(1)} degrees.`}
      >
        <defs>
          {/* Clip used to shade only the part of the baseline above the limit. */}
          <clipPath id={`over-${uid}`}>
            <rect x={0} y={0} width={VIEW_W} height={limitY} />
          </clipPath>
        </defs>

        {/* Working-hours backdrop */}
        {blocks.map((b, i) => (
          <rect
            key={i}
            x={xOf(b.startMin)}
            y={PAD.top}
            width={Math.max(0, xOf(b.endMin) - xOf(b.startMin))}
            height={VIEW_H - PAD.top - PAD.bottom}
            fill="var(--color-zone-1)"
            opacity={0.05}
          />
        ))}

        {/* Horizontal grid */}
        {gridTemps.map((t) => (
          <g key={t}>
            <line
              x1={PAD.left}
              x2={VIEW_W - PAD.right}
              y1={yOf(t)}
              y2={yOf(t)}
              stroke="var(--color-rule)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={yOf(t) + 3.5}
              textAnchor="end"
              className="tnum"
              fontSize={10}
              fill="var(--color-ink-faint)"
            >
              {t.toFixed(1)}
            </text>
          </g>
        ))}

        {/* Hour ticks */}
        {hourTicks.map((h) => (
          <text
            key={h}
            x={xOf(h * 60)}
            y={VIEW_H - PAD.bottom + 16}
            textAnchor="middle"
            className="tnum"
            fontSize={10}
            fill="var(--color-ink-faint)"
          >
            {String(h).padStart(2, "0")}
          </text>
        ))}

        {/* Danger shading: baseline curve above the ISO limit */}
        {baseValid && (
          <path
            d={`${baseValid} L${xOf(baseline.validUntilClock)},${limitY} L${xOf(
              baseline.points[0]?.clock ?? DAY_START,
            )},${limitY} Z`}
            fill="var(--color-danger)"
            opacity={0.1}
            clipPath={`url(#over-${uid})`}
          />
        )}

        {/* The ISO limit */}
        <line
          x1={PAD.left}
          x2={VIEW_W - PAD.right}
          y1={limitY}
          y2={limitY}
          stroke="var(--color-danger)"
          strokeWidth={1.25}
          strokeDasharray="5 4"
        />
        <text
          x={VIEW_W - PAD.right}
          y={limitY - 7}
          textAnchor="end"
          className="tnum"
          fontSize={9.5}
          letterSpacing="0.1em"
          fill="var(--color-danger)"
        >
          38.5°C ISO 7933 LIMIT
        </text>

        {/* Unmanaged baseline */}
        <path
          d={baseValid}
          fill="none"
          stroke="var(--color-danger)"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {baseBeyond && (
          <path
            d={baseBeyond}
            fill="none"
            stroke="var(--color-danger)"
            strokeWidth={1.4}
            strokeDasharray="3 4"
            opacity={0.45}
            strokeLinecap="round"
          />
        )}

        {/* Optimised schedule */}
        <path
          d={pathFor(optimised)}
          fill="none"
          stroke="var(--color-safe)"
          strokeWidth={1.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Breach marker */}
        {breach !== null && (
          <g>
            <line
              x1={xOf(breach)}
              x2={xOf(breach)}
              y1={limitY}
              y2={VIEW_H - PAD.bottom}
              stroke="var(--color-danger)"
              strokeWidth={1}
              strokeDasharray="2 3"
              opacity={0.55}
            />
            <circle
              cx={xOf(breach)}
              cy={limitY}
              r={3.5}
              fill="var(--color-paper-raised)"
              stroke="var(--color-danger)"
              strokeWidth={1.75}
            />
            <text
              x={xOf(breach) + 7}
              y={limitY + 15}
              className="tnum"
              fontSize={10.5}
              fontWeight={600}
              fill="var(--color-danger)"
            >
              breach {formatClock(breach)}
            </text>
          </g>
        )}

        {/* Axis spines */}
        <line
          x1={PAD.left}
          x2={PAD.left}
          y1={PAD.top}
          y2={VIEW_H - PAD.bottom}
          stroke="var(--color-rule-strong)"
        />
        <line
          x1={PAD.left}
          x2={VIEW_W - PAD.right}
          y1={VIEW_H - PAD.bottom}
          y2={VIEW_H - PAD.bottom}
          stroke="var(--color-rule-strong)"
        />
        <text
          x={PAD.left - 8}
          y={PAD.top + 4}
          textAnchor="end"
          fontSize={9}
          letterSpacing="0.1em"
          fill="var(--color-ink-faint)"
          className="tnum"
        >
          °C
        </text>
      </svg>
      </div>

      <figcaption className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
        <LegendItem color="var(--color-danger)" label="Unmanaged 09:00–17:00" />
        <LegendItem color="var(--color-safe)" label="KAVACH schedule" />
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-faint)]">
          <svg width="20" height="6" aria-hidden>
            <line
              x1="0"
              y1="3"
              x2="20"
              y2="3"
              stroke="var(--color-danger)"
              strokeWidth="1.4"
              strokeDasharray="3 4"
              opacity={0.45}
            />
          </svg>
          beyond ISO 7933 validity
        </span>
      </figcaption>
    </figure>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-muted)]">
      <svg width="20" height="6" aria-hidden>
        <line x1="0" y1="3" x2="20" y2="3" stroke={color} strokeWidth="2" />
      </svg>
      {label}
    </span>
  );
}

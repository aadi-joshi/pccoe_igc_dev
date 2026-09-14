"use client";

import type { ShiftBlock, SiteHour } from "@/lib/types";
import { ZONES } from "@/lib/zones";
import { formatClock } from "./ui";

/**
 * The day as a strip: heat-stress zone per hour, with the scheduled work
 * blocks laid over it.
 *
 * Geometry deliberately matches StrainChart so the two read as one figure —
 * a breach on the curve sits directly above the hour that caused it.
 */

const VIEW_W = 760;
const VIEW_H = 76;
const PAD = { left: 48, right: 18 };

const DAY_START = 5 * 60;
const DAY_END = 20 * 60;

function xOf(clockMin: number): number {
  const t = (clockMin - DAY_START) / (DAY_END - DAY_START);
  return PAD.left + t * (VIEW_W - PAD.left - PAD.right);
}

export function ZoneTimeline({
  hours,
  blocks,
  restWindow,
}: {
  hours: SiteHour[];
  blocks: ShiftBlock[];
  restWindow: { startMin: number; endMin: number } | null;
}) {
  const visible = hours.filter((h) => h.hour >= 5 && h.hour < 20);
  const stripY = 16;
  const stripH = 20;
  const blockY = 44;
  const blockH = 14;

  return (
    <figure className="m-0">
      {/* Same min-width as StrainChart: the two share an x-axis and must
          stay aligned at every viewport size. */}
      <div className="-mx-1 overflow-x-auto px-1">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="block h-auto w-full min-w-[640px]"
        role="img"
        aria-label="Heat stress zone by hour, with scheduled work blocks"
      >
        <text
          x={PAD.left - 8}
          y={stripY + stripH / 2 + 3.5}
          textAnchor="end"
          className="label"
          fontSize={9}
          fill="var(--color-ink-faint)"
        >
          DANGER
        </text>

        {visible.map((h) => {
          const x = xOf(h.hour * 60);
          const w = Math.max(0, xOf((h.hour + 1) * 60) - x);
          return (
            <g key={h.hour}>
              <rect
                x={x}
                y={stripY}
                width={w}
                height={stripH}
                fill={ZONES[h.zone].colorVar}
                opacity={0.9}
              >
                <title>
                  {`${String(h.hour).padStart(2, "0")}:00 — Zone ${h.zone}, ${
                    ZONES[h.zone].label
                  }. ${h.tempC.toFixed(1)}°C, ${h.rhPct.toFixed(0)}% RH. ${
                    ZONES[h.zone].cadence
                  }`}
                </title>
              </rect>
              <text
                x={x + w / 2}
                y={stripY + stripH / 2 + 3.5}
                textAnchor="middle"
                className="tnum"
                fontSize={9.5}
                fontWeight={600}
                // Zones 3 and 4 are light enough that white type on them
                // fails contrast; everything else takes white.
                fill={h.zone === 3 || h.zone === 4 ? "var(--color-ink)" : "#ffffff"}
                opacity={0.95}
                pointerEvents="none"
              >
                {h.zone}
              </text>
            </g>
          );
        })}

        <text
          x={PAD.left - 8}
          y={blockY + blockH / 2 + 3.5}
          textAnchor="end"
          className="label"
          fontSize={9}
          fill="var(--color-ink-faint)"
        >
          PLAN
        </text>

        {/* Baseline rail so the scheduled blocks read against the full day */}
        <rect
          x={PAD.left}
          y={blockY + blockH / 2 - 0.5}
          width={VIEW_W - PAD.left - PAD.right}
          height={1}
          fill="var(--color-rule)"
        />

        {restWindow && (
          <g>
            <rect
              x={xOf(restWindow.startMin)}
              y={blockY}
              width={Math.max(0, xOf(restWindow.endMin) - xOf(restWindow.startMin))}
              height={blockH}
              fill="var(--color-paper-sunk)"
              stroke="var(--color-rule-strong)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <text
              x={(xOf(restWindow.startMin) + xOf(restWindow.endMin)) / 2}
              y={blockY + blockH / 2 + 3.5}
              textAnchor="middle"
              className="tnum"
              fontSize={9}
              letterSpacing="0.08em"
              fill="var(--color-ink-muted)"
            >
              STAND DOWN
            </text>
          </g>
        )}

        {blocks.map((b, i) => (
          <g key={i}>
            <rect
              x={xOf(b.startMin)}
              y={blockY}
              width={Math.max(2, xOf(b.endMin) - xOf(b.startMin))}
              height={blockH}
              fill="var(--color-ink)"
              rx={1}
            >
              <title>
                {`Work ${formatClock(b.startMin)}–${formatClock(b.endMin)}, ${
                  b.workers
                } workers, mean work capacity ${Math.round(b.workFraction * 100)}%`}
              </title>
            </rect>
            <text
              x={xOf(b.startMin) + 5}
              y={blockY + blockH / 2 + 3.5}
              className="tnum"
              fontSize={9}
              fill="var(--color-paper)"
              pointerEvents="none"
            >
              {formatClock(b.startMin)}
            </text>
          </g>
        ))}

        {blocks.length === 0 && (
          <text
            x={PAD.left + 6}
            y={blockY + blockH / 2 + 3.5}
            className="tnum"
            fontSize={10}
            fill="var(--color-danger)"
          >
            no safe hours today at this workload
          </text>
        )}
      </svg>
      </div>
    </figure>
  );
}

import type { ReactNode } from "react";
import { ZONES } from "@/lib/zones";
import type { Zone } from "@/lib/types";

/**
 * Interface primitives.
 *
 * Structure comes from hairline rules rather than shadows or floating cards,
 * and colour is reserved for heat data. These components exist so that rule
 * is enforced in one place instead of re-decided in every panel.
 */

export function Panel({
  title,
  aside,
  children,
  className = "",
}: {
  title?: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <header className="panel-head">
          <h2 className="label">{title}</h2>
          {aside}
        </header>
      )}
      {children}
    </section>
  );
}

/** A labelled figure. Values are always mono + tabular so columns hold still. */
export function Stat({
  label,
  value,
  unit,
  note,
  tone = "default",
  size = "md",
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  note?: ReactNode;
  tone?: "default" | "danger" | "safe";
  size?: "md" | "lg";
}) {
  const color =
    tone === "danger"
      ? "text-[var(--color-danger)]"
      : tone === "safe"
        ? "text-[var(--color-safe)]"
        : "text-[var(--color-ink)]";

  return (
    <div className="min-w-0">
      <div className="label mb-1.5">{label}</div>
      <div
        className={`tnum ${color} ${
          size === "lg" ? "text-[26px] leading-none" : "text-[17px] leading-none"
        } font-medium`}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[11px] font-normal text-[var(--color-ink-faint)]">
            {unit}
          </span>
        )}
      </div>
      {note && (
        <div className="mt-1.5 text-[11px] leading-snug text-[var(--color-ink-muted)]">
          {note}
        </div>
      )}
    </div>
  );
}

/** Small square colour chip carrying a heat-stress zone. */
export function ZoneChip({ zone, showLabel = true }: { zone: Zone; showLabel?: boolean }) {
  const meta = ZONES[zone];
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <span
        aria-hidden
        className="inline-block h-2.5 w-2.5 rounded-[1px]"
        style={{ background: meta.colorVar }}
      />
      <span className="tnum text-[11px] font-medium">Zone {zone}</span>
      {showLabel && (
        <span className="text-[11px] text-[var(--color-ink-muted)]">{meta.label}</span>
      )}
    </span>
  );
}

/** Understated status pill — outline only, never a filled "badge". */
export function Pill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "ok" | "warn";
}) {
  const border =
    tone === "ok"
      ? "border-[var(--color-safe)] text-[var(--color-safe)]"
      : tone === "warn"
        ? "border-[var(--color-danger)] text-[var(--color-danger)]"
        : "border-[var(--color-rule-strong)] text-[var(--color-ink-muted)]";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[2px] border px-1.5 py-[3px] font-mono text-[10px] uppercase tracking-[0.1em] ${border}`}
    >
      {children}
    </span>
  );
}

/** Segmented control. Used for scenario and what-if switches. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
  disabled,
}: {
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {label && <span className="label">{label}</span>}
      <div
        role="group"
        className="inline-flex overflow-hidden rounded-[2px] border border-[var(--color-rule-strong)]"
      >
        {options.map((opt, i) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              title={opt.title}
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              className={`px-2.5 py-1 font-mono text-[11px] transition-colors disabled:opacity-40 ${
                i > 0 ? "border-l border-[var(--color-rule-strong)]" : ""
              } ${
                active
                  ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                  : "bg-transparent text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-sunk)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Horizontal hairline with an optional inline caption. */
export function Rule({ children }: { children?: ReactNode }) {
  if (!children) return <hr className="border-0 border-t border-[var(--color-rule)]" />;
  return (
    <div className="flex items-center gap-3">
      <span className="label shrink-0">{children}</span>
      <span className="h-px flex-1 bg-[var(--color-rule)]" />
    </div>
  );
}

export function formatClock(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatInr(value: number): string {
  const rounded = Math.round(Math.abs(value));
  const sign = value < 0 ? "−" : "";
  return `${sign}₹${rounded.toLocaleString("en-IN")}`;
}

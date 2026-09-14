"use client";

import type { ReactNode } from "react";
import { ZONES } from "@/lib/zones";
import type { Zone } from "@/lib/types";
import { GLOSSARY } from "@/lib/glossary";

/**
 * Interface primitives.
 *
 * Two rules live here so they are decided once rather than in every panel:
 * colour is reserved for heat data, and no jargon term appears without an
 * explanation within reach.
 */

/**
 * An inline glossary term.
 *
 * Renders as a dotted underline that reveals a plain-English definition on
 * hover, keyboard focus, or tap. It is a button rather than a span so that
 * tapping it on a phone focuses it and opens the panel — hover-only tooltips
 * are invisible on touch devices, which is where a supervisor would actually
 * be reading this.
 */
export function Explain({
  term,
  children,
}: {
  term: keyof typeof GLOSSARY;
  children: ReactNode;
}) {
  const entry = GLOSSARY[term];
  if (!entry) return <>{children}</>;

  return (
    <span className="group relative inline-block">
      <button
        type="button"
        className="explain bg-transparent p-0 text-left font-[inherit] text-[inherit] leading-[inherit] text-[color:inherit]"
        aria-label={`What does this mean? ${entry.body}`}
      >
        {children}
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-[min(300px,78vw)] -translate-x-1/2 rounded-[10px] border border-[var(--color-rule-strong)] bg-[var(--color-paper-raised)] p-3 text-left shadow-[0_6px_24px_-8px_rgba(33,30,25,0.35)] group-hover:block group-focus-within:block"
      >
        <span className="block text-[12.5px] font-normal leading-relaxed text-[var(--color-ink)]">
          {entry.body}
        </span>
        {entry.example && (
          <span className="mt-2 block border-t border-[var(--color-rule)] pt-2 text-[11.5px] font-normal leading-relaxed text-[var(--color-ink-muted)]">
            {entry.example}
          </span>
        )}
      </span>
    </span>
  );
}

export function Panel({
  title,
  step,
  subtitle,
  aside,
  children,
  className = "",
}: {
  title?: ReactNode;
  /** Optional step number, so the page reads as a sequence rather than a grid. */
  step?: number;
  /** One plain sentence saying what this panel answers. */
  subtitle?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title && (
        <header className="panel-head">
          <div className="flex min-w-0 items-start gap-3">
            {step !== undefined && (
              <span
                aria-hidden
                className="tnum mt-[1px] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border border-[var(--color-rule-strong)] text-[11px] text-[var(--color-ink-muted)]"
              >
                {step}
              </span>
            )}
            <div className="min-w-0">
              <h2 className="section-title">{title}</h2>
              {subtitle && (
                <p className="mt-1 text-[12.5px] leading-snug text-[var(--color-ink-muted)]">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {aside && <div className="shrink-0">{aside}</div>}
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
  term,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  note?: ReactNode;
  tone?: "default" | "danger" | "safe";
  size?: "md" | "lg";
  term?: keyof typeof GLOSSARY;
}) {
  const color =
    tone === "danger"
      ? "text-[var(--color-danger)]"
      : tone === "safe"
        ? "text-[var(--color-safe)]"
        : "text-[var(--color-ink)]";

  return (
    <div className="min-w-0">
      <div className="label mb-1.5">
        {term ? <Explain term={term}>{label}</Explain> : label}
      </div>
      <div
        className={`tnum ${color} ${
          size === "lg" ? "text-[26px] leading-none" : "text-[18px] leading-none"
        } font-medium`}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[11.5px] font-normal text-[var(--color-ink-faint)]">
            {unit}
          </span>
        )}
      </div>
      {note && (
        <div className="mt-1.5 text-[11.5px] leading-snug text-[var(--color-ink-muted)]">
          {note}
        </div>
      )}
    </div>
  );
}

/**
 * A soft, friendly information block.
 *
 * Used for the plain-language explanations that sit alongside the technical
 * panels. Tinted rather than outlined so it reads as help, not as an alert.
 */
export function Callout({
  tone = "note",
  title,
  children,
}: {
  tone?: "note" | "safe" | "danger";
  title?: ReactNode;
  children: ReactNode;
}) {
  const bg =
    tone === "safe"
      ? "bg-[var(--color-safe-tint)]"
      : tone === "danger"
        ? "bg-[var(--color-danger-tint)]"
        : "bg-[var(--color-note-tint)]";

  return (
    <div className={`rounded-[10px] ${bg} px-4 py-3`}>
      {title && <div className="mb-1 text-[12.5px] font-semibold">{title}</div>}
      <div className="text-[12.5px] leading-relaxed text-[var(--color-ink-muted)]">
        {children}
      </div>
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
        className="inline-block h-2.5 w-2.5 rounded-[2px]"
        style={{ background: meta.colorVar }}
      />
      <span className="tnum text-[11.5px] font-medium">Zone {zone}</span>
      {showLabel && (
        <span className="text-[11.5px] text-[var(--color-ink-muted)]">{meta.label}</span>
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[11px] ${border}`}
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
  hint,
}: {
  options: { value: T; label: string; title?: string }[];
  value: T;
  onChange: (value: T) => void;
  label?: ReactNode;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="label">{label}</span>}
      <div
        role="group"
        className="inline-flex w-fit overflow-hidden rounded-full border border-[var(--color-rule-strong)] bg-[var(--color-paper-raised)] p-[3px]"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              title={opt.title}
              disabled={disabled}
              aria-pressed={active}
              onClick={() => onChange(opt.value)}
              className={`rounded-full px-3 py-1 text-[12px] transition-colors disabled:opacity-40 ${
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
      {hint && (
        <span className="text-[11px] leading-snug text-[var(--color-ink-faint)]">{hint}</span>
      )}
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

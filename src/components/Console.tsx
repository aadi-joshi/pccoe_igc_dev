"use client";

import { useCallback, useState, useTransition } from "react";
import type { ConsoleData } from "@/lib/server";
import type { MetLevel, SunExposure } from "@/lib/types";
import { SITES, SITE_KIND_LABEL } from "@/lib/sites";
import { MET_LABEL, ZONES } from "@/lib/zones";
import { StrainChart } from "./StrainChart";
import { ZoneTimeline } from "./ZoneTimeline";
import { StationMap } from "./StationMap";
import { DownscalePanel, LedgerPanel } from "./panels";
import { BriefingPanel } from "./BriefingPanel";
import { Panel, Pill, Segmented, Stat, ZoneChip } from "./ui";

export function Console({ initial }: { initial: ConsoleData }) {
  const [data, setData] = useState(initial);
  const [siteId, setSiteId] = useState(initial.plan.site.id);
  const [scenario, setScenario] = useState(initial.meta.scenario);
  const [metLevel, setMetLevel] = useState<MetLevel>(initial.plan.site.metLevel);
  const [exposure, setExposure] = useState<SunExposure>(initial.plan.site.exposure);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const recompute = useCallback(
    async (next: {
      siteId: string;
      scenario: string;
      metLevel: MetLevel;
      exposure: SunExposure;
    }) => {
      try {
        const res = await fetch("/api/plan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(next),
        });
        if (!res.ok) throw new Error(`Recompute failed (${res.status})`);
        const json = (await res.json()) as ConsoleData;
        startTransition(() => {
          setData(json);
          setError(null);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Recompute failed");
      }
    },
    [],
  );

  // Recomputation is driven from the event handlers rather than an effect.
  // The plan is a function of the controls, so the fetch belongs where the
  // control changes - an effect here would only add a cascading render.

  // Selecting a different site adopts that site's registered work profile,
  // rather than carrying the previous site's what-if settings across.
  const selectSite = (id: string) => {
    const site = SITES.find((s) => s.id === id);
    if (!site || id === siteId) return;
    setSiteId(id);
    setMetLevel(site.metLevel);
    setExposure(site.exposure);
    void recompute({ siteId: id, scenario, metLevel: site.metLevel, exposure: site.exposure });
  };

  const selectScenario = (next: "live" | "heatwave") => {
    if (next === scenario) return;
    setScenario(next);
    void recompute({ siteId, scenario: next, metLevel, exposure });
  };

  const selectMet = (next: MetLevel) => {
    if (next === metLevel) return;
    setMetLevel(next);
    void recompute({ siteId, scenario, metLevel: next, exposure });
  };

  const selectExposure = (next: SunExposure) => {
    if (next === exposure) return;
    setExposure(next);
    void recompute({ siteId, scenario, metLevel, exposure: next });
  };

  const { plan, localStations, meta } = data;
  const site = plan.site;
  const peakMeta = ZONES[plan.peakZone];

  return (
    <div className="min-h-screen">
      <Header meta={meta} scenario={scenario} onScenario={selectScenario} />

      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-px bg-[var(--color-rule)] lg:grid-cols-[300px_1fr]">
        {/* ---------------- Left rail ---------------- */}
        <aside className="bg-[var(--color-paper)] px-4 py-5 lg:px-5">
          <div className="label mb-3">Registered sites</div>
          <ul className="mb-6 space-y-px">
            {SITES.map((s) => {
              const active = s.id === siteId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => selectSite(s.id)}
                    className={`w-full border-l-2 px-3 py-2.5 text-left transition-colors ${
                      active
                        ? "border-l-[var(--color-ink)] bg-[var(--color-paper-raised)]"
                        : "border-l-transparent hover:bg-[var(--color-paper-raised)]"
                    }`}
                  >
                    <div className="text-[13px] font-medium leading-tight">{s.name}</div>
                    <div className="mt-0.5 text-[11px] text-[var(--color-ink-muted)]">
                      {SITE_KIND_LABEL[s.kind]} · {s.locality}
                    </div>
                    <div className="tnum mt-1 text-[10.5px] text-[var(--color-ink-faint)]">
                      {s.workers} workers · MET {s.metLevel}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="label mb-2.5">District view</div>
          <div className="mb-5 border border-[var(--color-rule)]">
            <StationMap
              stations={localStations}
              sites={SITES}
              activeSiteId={siteId}
              metLevel={metLevel}
              exposure={exposure}
              onSelectSite={selectSite}
            />
          </div>

          <ZoneLegend />
        </aside>

        {/* ---------------- Main column ---------------- */}
        <main className="bg-[var(--color-paper)] px-4 py-5 lg:px-7">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-[family-name:var(--font-display)] text-[27px] leading-tight">
                {site.name}
              </h1>
              <p className="mt-1 text-[12.5px] text-[var(--color-ink-muted)]">
                {SITE_KIND_LABEL[site.kind]} · {site.locality} · supervisor {site.supervisor}
              </p>
            </div>
            <div className="flex flex-col items-start gap-2 sm:items-end">
              <div className="tnum text-[11px] text-[var(--color-ink-faint)]">
                plan for {plan.date}
              </div>
              <ZoneChip zone={plan.peakZone} />
              <div className="tnum text-[11px] text-[var(--color-ink-muted)]">
                peak {String(plan.peakZoneHour).padStart(2, "0")}:00 · {peakMeta.cadence}
              </div>
            </div>
          </div>

          <Controls
            metLevel={metLevel}
            exposure={exposure}
            onMet={selectMet}
            onExposure={selectExposure}
            pending={pending}
          />

          {error && (
            <p className="mb-4 border border-[var(--color-danger)] px-3 py-2 text-[12px] text-[var(--color-danger)]">
              {error}
            </p>
          )}

          <div className={pending ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <Panel
              title="Predicted heat strain · ISO 7933"
              className="mb-4"
              aside={
                <span className="tnum text-[11px] text-[var(--color-ink-muted)]">
                  {MET_LABEL[metLevel]} · {exposure === "sun" ? "direct sun" : "shade"}
                </span>
              }
            >
              <div className="px-3 pb-3 pt-4">
                <StrainChart
                  baseline={plan.baseline.strain}
                  optimised={plan.optimised.strain}
                  blocks={plan.blocks}
                />
              </div>
              <div className="border-t border-[var(--color-rule)] px-3 pb-2 pt-3">
                <ZoneTimeline
                  hours={plan.hours}
                  blocks={plan.blocks}
                  restWindow={plan.restWindow}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[var(--color-rule)] px-3.5 py-3.5 sm:grid-cols-4">
                <Stat
                  label="Time to limit"
                  value={
                    plan.baseline.strain.dLimCoreMin !== null
                      ? `${plan.baseline.strain.dLimCoreMin}`
                      : "—"
                  }
                  unit={plan.baseline.strain.dLimCoreMin !== null ? "min" : undefined}
                  tone={plan.baseline.strain.dLimCoreMin !== null ? "danger" : "safe"}
                  note="unmanaged shift"
                />
                <Stat
                  label="Peak core temp"
                  value={plan.optimised.strain.peakCoreTempC.toFixed(2)}
                  unit="°C"
                  tone={plan.optimised.strain.safe ? "safe" : "danger"}
                  note="KAVACH schedule"
                />
                <Stat
                  label="Sweat loss"
                  value={plan.optimised.strain.totalWaterLossL.toFixed(2)}
                  unit="L"
                  note="water to provide per worker"
                />
                <Stat
                  label="Rest cadence"
                  value={peakMeta.workFraction * 100}
                  unit="% work"
                  note={peakMeta.cadence}
                />
              </div>
            </Panel>

            {plan.notes.length > 0 && (
              <ul className="mb-4 space-y-1.5">
                {plan.notes.map((n, i) => (
                  <li
                    key={i}
                    className="flex gap-2.5 border-l-2 border-[var(--color-rule-strong)] bg-[var(--color-paper-raised)] px-3 py-2 text-[12px] leading-relaxed"
                  >
                    <span className="label mt-[3px] shrink-0">note</span>
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
              <DownscalePanel plan={plan} />
              <LedgerPanel plan={plan} />
            </div>

            <BriefingPanel
              key={`${plan.site.id}:${plan.date}:${metLevel}:${exposure}`}
              plan={plan}
            />
          </div>

          <Footer meta={meta} />
        </main>
      </div>
    </div>
  );
}

function Header({
  meta,
  scenario,
  onScenario,
}: {
  meta: ConsoleData["meta"];
  scenario: string;
  onScenario: (s: "live" | "heatwave") => void;
}) {
  return (
    <header className="border-b border-[var(--color-rule)] bg-[var(--color-paper-raised)]">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-3.5 lg:px-5">
        <div className="flex items-baseline gap-3.5">
          <span className="font-[family-name:var(--font-display)] text-[21px] font-semibold tracking-[0.06em]">
            KAVACH
          </span>
          <span className="hidden text-[12px] text-[var(--color-ink-muted)] sm:inline">
            Occupational Heat Decision Engine
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Segmented
            label="Conditions"
            value={scenario as "live" | "heatwave"}
            onChange={onScenario}
            options={[
              { value: "live", label: "Live", title: "Live SHRAM feed + 72h forecast" },
              {
                value: "heatwave",
                label: "May heatwave",
                title: "Recorded peak-summer day (archive data, not synthetic)",
              },
            ]}
          />
          <Pill tone={meta.stale ? "warn" : "ok"}>
            <span
              aria-hidden
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{
                background: meta.stale
                  ? "var(--color-danger)"
                  : "var(--color-safe)",
              }}
            />
            {meta.stale ? "cached feed" : "live feed"} · {meta.totalStations} stations
          </Pill>
        </div>
      </div>
    </header>
  );
}

function Controls({
  metLevel,
  exposure,
  onMet,
  onExposure,
  pending,
}: {
  metLevel: MetLevel;
  exposure: SunExposure;
  onMet: (m: MetLevel) => void;
  onExposure: (e: SunExposure) => void;
  pending: boolean;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-[var(--color-rule)] py-3">
      <Segmented
        label="Work intensity"
        value={metLevel}
        onChange={onMet}
        disabled={pending}
        options={([3, 4, 5, 6] as MetLevel[]).map((m) => ({
          value: m,
          label: `MET ${m}`,
          title: MET_LABEL[m],
        }))}
      />
      <Segmented
        label="Exposure"
        value={exposure}
        onChange={onExposure}
        disabled={pending}
        options={[
          { value: "sun" as SunExposure, label: "Sun" },
          { value: "shade" as SunExposure, label: "Shade" },
        ]}
      />
      <span className="tnum text-[11px] text-[var(--color-ink-faint)]">
        {pending ? "recomputing…" : "changes re-run the ISO 7933 model"}
      </span>
    </div>
  );
}

function ZoneLegend() {
  return (
    <div>
      <div className="label mb-2.5">Heat stress zones</div>
      <ul className="space-y-[3px]">
        {([1, 2, 3, 4, 5, 6] as const).map((z) => (
          <li key={z} className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-block h-2.5 w-2.5 shrink-0 rounded-[1px]"
              style={{ background: ZONES[z].colorVar }}
            />
            <span className="tnum w-3 text-[10.5px] text-[var(--color-ink-muted)]">{z}</span>
            <span className="truncate text-[11px] text-[var(--color-ink-muted)]">
              {ZONES[z].cadence}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Footer({ meta }: { meta: ConsoleData["meta"] }) {
  const fetched = new Date(meta.fetchedAt);
  return (
    <footer className="mt-6 border-t border-[var(--color-rule)] pt-4">
      <dl className="flex flex-wrap gap-x-7 gap-y-2 text-[10.5px] text-[var(--color-ink-faint)]">
        <Meta k="Heat data" v={`SHRAM · ${meta.totalStations} stations`} />
        <Meta k="Forecast" v="Open-Meteo gridded" />
        <Meta
          k="EHI surface"
          v={`${meta.surfaceSamples} stations · RMSE ${meta.surfaceRmse.toFixed(2)}`}
        />
        <Meta k="Physiology" v="ISO 7933 PHS" />
        <Meta k="Retrieved" v={fetched.toLocaleTimeString("en-IN", { hour12: false })} />
      </dl>
      <p className="mt-3 max-w-3xl text-[10.5px] leading-relaxed text-[var(--color-ink-faint)]">
        KAVACH consumes SHRAM (India Energy &amp; Climate Centre, UC Berkeley) as its anchor
        observation source and builds the decision layer on top of it. Heat-stress zones and
        EHI-N* are SHRAM&rsquo;s; the downscaling, physiological simulation, scheduling and
        productivity model are ours.
      </p>
    </footer>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <dt className="label">{k}</dt>
      <dd className="tnum">{v}</dd>
    </div>
  );
}

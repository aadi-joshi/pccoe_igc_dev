import type { Plan, Site, Station } from "./types";
import { fitEhiSurface, solarIncrement, type EhiSurface } from "./ehi";
import { computeBias, downscale, nearestStation } from "./downscale";
import { fetchGrid, nowIndex, sliceDay, type Scenario } from "./openmeteo";
import { baselinePlan, optimise, peakZone } from "./optimizer";
import { ZONES } from "./zones";
import { DEFAULT_SUBJECT, type PhsSubject } from "./phs";

/**
 * Plan builder — the full pipeline for one site on one day.
 *
 *   SHRAM stations ─┐
 *                   ├─▶ EHI surface fit
 *   Open-Meteo grid ┘        │
 *                            ▼
 *                       downscale  ─▶  ISO 7933  ─▶  optimise  ─▶  ledger
 *
 * Deliberately returns a plain serialisable object so the whole result can
 * be cached, snapshotted, or replayed offline.
 */

export interface BuildPlanArgs {
  site: Site;
  stations: Station[];
  scenario?: Scenario;
  subject?: PhsSubject;
  /** Override the site's registered work intensity, for the what-if control. */
  metLevel?: Site["metLevel"];
  exposure?: Site["exposure"];
  workers?: number;
}

export interface PlanBuildResult {
  plan: Plan;
  surface: EhiSurface;
}

export async function buildPlan(args: BuildPlanArgs): Promise<PlanBuildResult> {
  const scenario = args.scenario ?? "live";
  const subject = args.subject ?? DEFAULT_SUBJECT;

  const site: Site = {
    ...args.site,
    metLevel: args.metLevel ?? args.site.metLevel,
    exposure: args.exposure ?? args.site.exposure,
    workers: args.workers ?? args.site.workers,
  };

  // Fit the SHADE surface: it is genuinely a function of temperature and
  // humidity. Solar load is added back separately, scaled by the hour's
  // forecast radiation, so the model does not report full sun at 05:00.
  const surface = fitEhiSurface(args.stations, site.metLevel, "shade");
  if (!surface) {
    throw new Error("Could not fit an EHI response surface from the station feed");
  }
  const increment = solarIncrement(args.stations, site.metLevel);

  const anchor = nearestStation(site.lat, site.lon, args.stations);
  if (!anchor) throw new Error("No anchor station available");

  const [siteGridFull, stationGridFull] = await Promise.all([
    fetchGrid(site.lat, site.lon, scenario),
    fetchGrid(anchor.station.lat, anchor.station.lon, scenario),
  ]);

  // The MOS bias correction is only valid against a *contemporaneous* pair:
  // the station's live reading versus the grid value for that same hour. For
  // the historical heatwave day there is no such pair, so the term is dropped
  // rather than anchored against an observation from a different season.
  let biasC = 0;
  if (scenario === "live") {
    const idx = nowIndex(stationGridFull);
    biasC = computeBias(anchor.station.tempC, stationGridFull[idx]?.tempC);
  }

  // For the live scenario, plan tomorrow: the briefing goes out the evening
  // before, which is the only moment a supervisor can still change anything.
  const startIdx =
    scenario === "heatwave" ? 0 : Math.min(24, Math.max(0, siteGridFull.length - 24));
  const siteGrid = sliceDay(siteGridFull, startIdx);

  const { hours, breakdown } = downscale({
    site,
    siteGrid,
    station: anchor.station,
    stationDistanceKm: anchor.distanceKm,
    surface,
    solarIncrement: increment,
    biasC,
    // Mid-afternoon is the meaningful reference hour for the breakdown panel:
    // it is when the site/station divergence matters operationally.
    referenceIndex: 14,
  });

  const optimised = optimise(site, hours, subject);
  const baseline = baselinePlan(site, hours, subject);
  const peak = peakZone(hours);

  const notes = [...optimised.notes];
  if (baseline.strain.breachAtClock !== null && optimised.strain.safe) {
    notes.unshift(
      "The unmanaged schedule breaches the core-temperature limit. The optimised schedule does not.",
    );
  }

  const plan: Plan = {
    site,
    date: siteGrid[0]?.time?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
    hours,
    downscale: breakdown,
    blocks: optimised.blocks,
    restWindow: optimised.restWindow,
    optimised: { strain: optimised.strain, ledger: optimised.ledger },
    baseline: { strain: baseline.strain, ledger: baseline.ledger },
    restCadence: ZONES[peak.zone].cadence,
    peakZone: peak.zone,
    peakZoneHour: peak.hour,
    notes,
  };

  return { plan, surface };
}

/** Headline productivity comparison, used by the ledger panel and the briefing. */
export function ledgerDelta(plan: Plan): {
  deltaHours: number;
  deltaPct: number;
  deltaWageInr: number;
  better: boolean;
} {
  const a = plan.optimised.ledger.effectiveLabourHours;
  const b = plan.baseline.ledger.effectiveLabourHours;
  const deltaHours = a - b;
  return {
    deltaHours,
    deltaPct: b > 0 ? (deltaHours / b) * 100 : 0,
    deltaWageInr:
      plan.optimised.ledger.effectiveWageValueInr -
      plan.baseline.ledger.effectiveWageValueInr,
    better: deltaHours >= 0,
  };
}

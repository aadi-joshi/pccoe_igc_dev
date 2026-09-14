import type {
  ProductivityLedger,
  ShiftBlock,
  Site,
  SiteHour,
  StrainResult,
  Zone,
} from "./types";
import { DEFAULT_SUBJECT, simulateStrain, type PhsSubject, type ShiftSegment } from "./phs";
import { ZONES } from "./zones";

/**
 * Shift optimiser.
 *
 * Enumerates candidate schedules, simulates each one through the ISO 7933
 * engine, discards any that breach a physiological limit, and keeps the one
 * that yields the most *effective* labour — hours on site weighted by the
 * work capacity actually available at that hour's heat-stress zone.
 *
 * The search space is small enough (a few thousand candidates at half-hour
 * resolution) that exhaustive enumeration beats a solver dependency, and it
 * runs in a few milliseconds in the browser or on the server.
 */

/**
 * Maharashtra SOP work windows for outdoor informal work during heat alerts:
 * 06:00–11:00 and 16:00–20:00.
 */
export const SOP_WINDOWS: { startMin: number; endMin: number }[] = [
  { startMin: 6 * 60, endMin: 11 * 60 },
  { startMin: 16 * 60, endMin: 20 * 60 },
];

/** A schedule is SOP-compliant if every scheduled minute falls inside a window. */
export function isSopCompliant(blocks: ShiftBlock[]): boolean {
  return blocks.every((b) =>
    SOP_WINDOWS.some((w) => b.startMin >= w.startMin && b.endMin <= w.endMin),
  );
}

function zoneAt(hours: SiteHour[], clockMin: number): Zone {
  const i = Math.max(0, Math.min(hours.length - 1, Math.floor(clockMin / 60)));
  return hours[i].zone;
}

/**
 * Effective labour available in a schedule.
 *
 * Hours on site are not hours of work. At Zone 5 a crew gets 15 productive
 * minutes per hour, because the remaining 45 must be spent resting if anyone
 * is to survive the shift. This is the number a contractor actually cares
 * about, and it is why the safe schedule usually wins on output too.
 */
export function buildLedger(
  blocks: ShiftBlock[],
  hours: SiteHour[],
  site: Site,
  strain: StrainResult,
): ProductivityLedger {
  let scheduledMin = 0;
  let effectiveMin = 0;

  for (const b of blocks) {
    for (let m = b.startMin; m < b.endMin; m++) {
      scheduledMin++;
      effectiveMin += ZONES[zoneAt(hours, m)].workFraction;
    }
  }

  const scheduledHours = scheduledMin / 60;
  const effectiveLabourHours = (effectiveMin / 60) * site.workers;
  const hourlyWage = site.dailyWageInr / 8;

  let breaches = 0;
  if (strain.breachAtClock !== null) breaches++;
  if (strain.dLimWaterMin !== null) breaches++;

  return {
    scheduledHours,
    effectiveLabourHours,
    effectiveWageValueInr: effectiveLabourHours * hourlyWage,
    breaches,
    sopCompliant: isSopCompliant(blocks),
  };
}

function toSegments(blocks: ShiftBlock[], site: Site): ShiftSegment[] {
  return blocks.map((b) => ({
    startMin: b.startMin,
    endMin: b.endMin,
    metLevel: b.metLevel,
    exposure: site.exposure,
  }));
}

function makeBlocks(
  ranges: { startMin: number; endMin: number }[],
  site: Site,
  hours: SiteHour[],
): ShiftBlock[] {
  return ranges.map((r) => {
    let sum = 0;
    for (let m = r.startMin; m < r.endMin; m++) sum += ZONES[zoneAt(hours, m)].workFraction;
    const span = Math.max(1, r.endMin - r.startMin);
    return {
      startMin: r.startMin,
      endMin: r.endMin,
      metLevel: site.metLevel,
      workers: site.workers,
      workFraction: sum / span,
    };
  });
}

export interface OptimisationResult {
  blocks: ShiftBlock[];
  restWindow: { startMin: number; endMin: number } | null;
  strain: StrainResult;
  ledger: ProductivityLedger;
  notes: string[];
}

/**
 * The unmanaged baseline: a straight 09:00–17:00 day worked through the heat
 * with no enforced rest cadence. This is not a strawman — Prayas Pune's 2026
 * fieldwork found that a large share of outdoor workers never rest in shade
 * during a shift. It is what the schedule looks like today.
 */
export function baselinePlan(
  site: Site,
  hours: SiteHour[],
  subject: PhsSubject = DEFAULT_SUBJECT,
): OptimisationResult {
  const ranges = [{ startMin: 9 * 60, endMin: 17 * 60 }];
  const blocks = makeBlocks(ranges, site, hours);
  const strain = simulateStrain(
    toSegments(blocks, site),
    hours,
    site.profile.skyViewFactor,
    subject,
    { applyRestCadence: false },
  );
  return {
    blocks,
    restWindow: null,
    strain,
    ledger: buildLedger(blocks, hours, site, strain),
    notes: ["Unmanaged 09:00–17:00 shift, no enforced rest cadence."],
  };
}

const STEP = 30; // half-hour resolution

interface Candidate {
  ranges: { startMin: number; endMin: number }[];
  blocks: ShiftBlock[];
  strain: StrainResult;
  ledger: ProductivityLedger;
}

export function optimise(
  site: Site,
  hours: SiteHour[],
  subject: PhsSubject = DEFAULT_SUBJECT,
): OptimisationResult {
  // Assigned inside the `consider` closure below, so these need explicit
  // annotations: control-flow analysis cannot see through the callback and
  // would otherwise narrow both to `never` after the null check.
  let best: Candidate | null = null;
  let bestRelaxed: Candidate | null = null;

  // The optimiser must not "win" the productivity comparison simply by
  // rostering a longer day than the baseline. A contractor wants a target
  // number of hours worked, not an extra four hours on site. Capping the
  // scheduled span keeps the comparison like-for-like: same time on site,
  // better hours chosen.
  const maxScheduledMin = Math.round((site.minDailyHours + 1) * 60);
  const minScheduledMin = 60;

  const consider = (ranges: { startMin: number; endMin: number }[]) => {
    const total = ranges.reduce((a, r) => a + (r.endMin - r.startMin), 0);
    if (total < minScheduledMin || total > maxScheduledMin) return;

    const blocks = makeBlocks(ranges, site, hours);
    const strain = simulateStrain(
      toSegments(blocks, site),
      hours,
      site.profile.skyViewFactor,
      subject,
      { applyRestCadence: true },
    );
    const ledger = buildLedger(blocks, hours, site, strain);
    const cand: Candidate = { ranges, blocks, strain, ledger };

    // Effective labour is the objective; SOP compliance is weighted heavily
    // enough to act as a strong preference rather than a tiebreak, because a
    // schedule the labour inspector rejects is worth nothing to the contractor.
    const score = (c: Candidate) =>
      c.ledger.effectiveLabourHours * (c.ledger.sopCompliant ? 1.25 : 1) -
      c.ranges.length * 0.1;

    if (strain.safe) {
      if (
        ledger.scheduledHours >= site.minDailyHours &&
        (!best || score(cand) > score(best))
      ) {
        best = cand;
      }
      // Kept separately so a site that simply cannot reach its hour target
      // on a dangerous day still receives the safest productive schedule
      // rather than nothing at all.
      if (!bestRelaxed || score(cand) > score(bestRelaxed)) {
        bestRelaxed = cand;
      }
    }
  };

  // Split shift: a morning block and an evening block either side of the peak.
  for (let aStart = 5 * 60; aStart <= 9 * 60; aStart += STEP) {
    for (let aEnd = aStart + 90; aEnd <= 12 * 60; aEnd += STEP) {
      consider([{ startMin: aStart, endMin: aEnd }]);
      for (let bStart = Math.max(aEnd + 60, 15 * 60); bStart <= 18 * 60; bStart += STEP) {
        for (let bEnd = bStart + 60; bEnd <= 20 * 60; bEnd += STEP) {
          consider([
            { startMin: aStart, endMin: aEnd },
            { startMin: bStart, endMin: bEnd },
          ]);
        }
      }
    }
  }

  // Evening-only, for sites where the morning is already unsafe.
  for (let bStart = 15 * 60; bStart <= 18 * 60; bStart += STEP) {
    for (let bEnd = bStart + 90; bEnd <= 20 * 60; bEnd += STEP) {
      consider([{ startMin: bStart, endMin: bEnd }]);
    }
  }

  const chosen = (best ?? bestRelaxed) as Candidate | null;
  const notes: string[] = [];

  if (!chosen) {
    // Nothing survived the physiological constraints.
    const strain = simulateStrain([], hours, site.profile.skyViewFactor, subject);
    return {
      blocks: [],
      restWindow: null,
      strain,
      ledger: buildLedger([], hours, site, strain),
      notes: [
        "No schedule satisfies the core-temperature limit today at this work intensity.",
        "Reduce work intensity, move the crew into shade, or stand down outdoor work.",
      ],
    };
  }

  if (!best) {
    notes.push(
      `Cannot reach the ${site.minDailyHours} h daily target safely today. Returning the safest productive schedule instead.`,
    );
  }
  if (!chosen.ledger.sopCompliant) {
    notes.push("Outside Maharashtra SOP work windows — review before issuing.");
  }

  const restWindow =
    chosen.ranges.length === 2
      ? { startMin: chosen.ranges[0].endMin, endMin: chosen.ranges[1].startMin }
      : null;

  if (restWindow) {
    notes.push(
      `Mandatory stand-down ${fmt(restWindow.startMin)}–${fmt(restWindow.endMin)}. Shade and drinking water required on site.`,
    );
  }

  return {
    blocks: chosen.blocks,
    restWindow,
    strain: chosen.strain,
    ledger: chosen.ledger,
    notes,
  };
}

export function fmt(min: number): string {
  const h = Math.floor(min / 60) % 24;
  const m = Math.round(min % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/**
 * Peak zone across the daylight working window, for the summary line.
 *
 * Restricted to 05:00-20:00: the small hours are irrelevant to an outdoor
 * work schedule, and reporting a 02:00 peak would be noise.
 */
export function peakZone(hours: SiteHour[]): { zone: Zone; hour: number } {
  let zone: Zone = 1;
  let hour = 12;
  for (const h of hours.slice(0, 24)) {
    if (h.hour < 5 || h.hour > 20) continue;
    if (h.zone > zone) {
      zone = h.zone;
      hour = h.hour;
    }
  }
  return { zone, hour };
}

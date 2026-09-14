import type { MetLevel, SunExposure, Zone } from "./types";

/**
 * Heat-stress zone semantics.
 *
 * Zones follow SHRAM's EHI-N* banding. The work/rest cadence and resulting
 * work fraction follow the ISO 7243 approach of allocating rest within the
 * hour as heat stress rises — this is what turns "it is hot" into "you will
 * only get 25% of an hour's labour out of this hour".
 */
export interface ZoneMeta {
  zone: Zone;
  label: string;
  /** Fraction of an hour that is productive work at this zone. */
  workFraction: number;
  /** Human-readable work/rest cadence. */
  cadence: string;
  /** Short operational instruction. */
  action: string;
  colorVar: string;
}

export const ZONES: Record<Zone, ZoneMeta> = {
  1: {
    zone: 1,
    label: "No significant stress",
    workFraction: 1.0,
    cadence: "Continuous work",
    action: "Normal operations. Drinking water available.",
    colorVar: "var(--color-zone-1)",
  },
  2: {
    zone: 2,
    label: "Low stress",
    workFraction: 1.0,
    cadence: "Continuous work",
    action: "Normal operations. Encourage hourly hydration.",
    colorVar: "var(--color-zone-2)",
  },
  3: {
    zone: 3,
    label: "Moderate stress",
    workFraction: 0.75,
    cadence: "45 min work / 15 min rest",
    action: "Shaded rest area required. Hydration every 20 minutes.",
    colorVar: "var(--color-zone-3)",
  },
  4: {
    zone: 4,
    label: "High stress",
    workFraction: 0.5,
    cadence: "30 min work / 30 min rest",
    action: "Mandatory shaded rest. ORS available. Buddy monitoring.",
    colorVar: "var(--color-zone-4)",
  },
  5: {
    zone: 5,
    label: "Very high stress",
    workFraction: 0.25,
    cadence: "15 min work / 45 min rest",
    action: "Heavy labour should not be scheduled. Reschedule to cooler hours.",
    colorVar: "var(--color-zone-5)",
  },
  6: {
    zone: 6,
    label: "Physiological failure risk",
    workFraction: 0,
    cadence: "Stop work",
    action: "Outdoor work must stop. Move workers to shade and cool them.",
    colorVar: "var(--color-zone-6)",
  },
};

export const MET_LABEL: Record<MetLevel, string> = {
  3: "Light work",
  4: "Moderate work",
  5: "Heavy work",
  6: "Very heavy labour",
};

/** ISO 8996 metabolic rate in W/m² for each MET class. 1 MET = 58.2 W/m². */
export const MET_WATTS: Record<MetLevel, number> = {
  3: 3 * 58.2,
  4: 4 * 58.2,
  5: 5 * 58.2,
  6: 6 * 58.2,
};

export function zoneKey(met: MetLevel, exposure: SunExposure): string {
  return `met${met}_${exposure}`;
}

export function zoneColor(zone: Zone): string {
  return ZONES[zone].colorVar;
}

export function workFraction(zone: Zone): number {
  return ZONES[zone].workFraction;
}

/**
 * Map an EHI value to a zone.
 *
 * SHRAM publishes the zone alongside the EHI for every station, so for
 * stations we always use their classification directly. This banding is only
 * used for *downscaled* site values, where we have shifted the EHI away from
 * the published station value and therefore have to re-band it ourselves.
 * Thresholds are fitted to the published station EHI/zone pairs in the live
 * feed so that site and station classifications stay on the same scale.
 */
export function zoneFromEhi(ehi: number, thresholds: number[]): Zone {
  for (let i = 0; i < thresholds.length; i++) {
    if (ehi < thresholds[i]) return (i + 1) as Zone;
  }
  return 6;
}

/** Fallback banding used before any station pairs have been observed. */
export const DEFAULT_EHI_THRESHOLDS = [30, 36, 42, 48, 66];

/** Shared domain types. Kept free of any framework or I/O concern. */

/** SHRAM heat-stress zone, 1 (safe) through 6 (physiological failure). */
export type Zone = 1 | 2 | 3 | 4 | 5 | 6;

/** ISO 8996 work-intensity class used by SHRAM's EHI-N* family. */
export type MetLevel = 3 | 4 | 5 | 6;

export type SunExposure = "sun" | "shade";

/** A SHRAM weather station as published in the live alerts feed. */
export interface Station {
  id: string;
  name: string;
  district: string;
  state: string;
  lat: number;
  lon: number;
  tempC: number;
  rhPct: number;
  loggedAt: string;
  /** EHI value keyed "met{3..6}_{sun|shade}" */
  ehi: Record<string, number>;
  /** Zone keyed "met{3..6}_{sun|shade}" */
  zones: Record<string, Zone>;
}

/**
 * Land-cover profile of a work site. These drive the urban-heat-island term
 * of the downscaling model. Values are 0..1 fractions unless noted.
 */
export interface SiteProfile {
  /** Impervious / built-up surface fraction within ~500 m. */
  builtUpFraction: number;
  /** Vegetation / canopy fraction within ~500 m. */
  greenFraction: number;
  /**
   * Sky view factor: 1.0 = fully open sky (worst daytime solar load,
   * best night-time cooling), 0.2 = deep street canyon.
   */
  skyViewFactor: number;
  /** Broad surface albedo class of the working surface. */
  surfaceAlbedo: "dark" | "medium" | "light";
  /** Distance to the nearest significant water body, metres. */
  distanceToWaterM: number;
}

export interface Site {
  id: string;
  name: string;
  locality: string;
  kind: "construction" | "nrega" | "vendor";
  lat: number;
  lon: number;
  workers: number;
  metLevel: MetLevel;
  exposure: SunExposure;
  supervisor: string;
  phone: string;
  /** Contractor's minimum acceptable scheduled hours per day. */
  minDailyHours: number;
  /** Daily wage per worker, rupees. Used by the productivity ledger. */
  dailyWageInr: number;
  profile: SiteProfile;
}

/** One hour of downscaled, site-level conditions. */
export interface SiteHour {
  /** Local hour, 0..23. */
  hour: number;
  /** ISO local timestamp. */
  time: string;
  tempC: number;
  rhPct: number;
  windMs: number;
  /** Direct solar radiation, W/m². */
  solarWm2: number;
  /** Estimated mean radiant temperature, °C. */
  meanRadiantC: number;
  /** Site-level EHI estimate at the site's MET level and exposure. */
  ehi: number;
  zone: Zone;
}

/** Breakdown of the three downscaling terms, for the transparency panel. */
export interface DownscaleBreakdown {
  stationName: string;
  stationDistanceKm: number;
  stationTempC: number;
  /** Term 1: gridded model forecast at the site, before correction. */
  gridForecastC: number;
  /** Term 2: live MOS bias correction from the anchor station. */
  biasCorrectionC: number;
  /** Term 3: urban heat island delta from land-cover. */
  uhiDeltaC: number;
  /** Final site estimate at the reference hour. */
  siteTempC: number;
  /** How much hotter the site runs than the raw station reading. */
  deltaVsStationC: number;
  /**
   * Whether the station observation and the site estimate describe the same
   * moment. False for the historical heatwave scenario, where the station is
   * reporting today and the forecast grid is replaying a day in May - a
   * difference between them is a difference in date, not in microclimate,
   * and must not be presented as one.
   */
  anchorComparable: boolean;
  contributions: { label: string; valueC: number; note: string }[];
}

/** Output of the ISO 7933 predicted-heat-strain simulation. */
export interface StrainPoint {
  /** Minutes since shift start. */
  minute: number;
  /** Clock time in minutes from midnight. */
  clock: number;
  coreTempC: number;
  skinTempC: number;
  /** Cumulative sweat loss, litres. */
  waterLossL: number;
  /** Skin wettedness 0..1 — how close the body is to its evaporative ceiling. */
  wettedness: number;
  /** Net heat storage rate, W/m². */
  storageWm2: number;
  /** True while the worker is resting rather than working. */
  resting: boolean;
}

export interface StrainResult {
  points: StrainPoint[];
  peakCoreTempC: number;
  /** Clock minute at which core temp first crosses the 38.5 °C limit, or null. */
  breachAtClock: number | null;
  totalWaterLossL: number;
  /** Minutes of exposure before the core-temperature limit is reached. */
  dLimCoreMin: number | null;
  /** Minutes of exposure before the dehydration limit is reached. */
  dLimWaterMin: number | null;
  /**
   * Clock minute up to which the simulation is inside ISO 7933's validity.
   * Past a limit breach the worker would have been withdrawn, so anything
   * beyond this point is extrapolation and is drawn as such.
   */
  validUntilClock: number;
  safe: boolean;
}

export interface ShiftBlock {
  startMin: number;
  endMin: number;
  metLevel: MetLevel;
  workers: number;
  /** Mean work fraction across the block, from the zone work/rest cadence. */
  workFraction: number;
}

export interface ProductivityLedger {
  scheduledHours: number;
  /** Hours on site × work capacity × workers. */
  effectiveLabourHours: number;
  /** Rupee value of effective labour at the site's wage rate. */
  effectiveWageValueInr: number;
  breaches: number;
  sopCompliant: boolean;
}

export interface Plan {
  site: Site;
  date: string;
  hours: SiteHour[];
  downscale: DownscaleBreakdown;
  blocks: ShiftBlock[];
  restWindow: { startMin: number; endMin: number } | null;
  optimised: { strain: StrainResult; ledger: ProductivityLedger };
  baseline: { strain: StrainResult; ledger: ProductivityLedger };
  /** Rest cadence mandated for the hottest scheduled hour. */
  restCadence: string;
  peakZone: Zone;
  peakZoneHour: number;
  notes: string[];
}

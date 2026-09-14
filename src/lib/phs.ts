import type { MetLevel, StrainPoint, StrainResult, SunExposure, SiteHour } from "./types";
import { MET_WATTS, ZONES } from "./zones";

/**
 * ISO 7933 — Predicted Heat Strain (PHS).
 *
 * Steps a whole-body heat balance minute by minute across a shift and
 * integrates the resulting heat storage into a predicted core body
 * temperature. This is the engine behind the headline claim: not "it is
 * hot" but "this worker's core temperature crosses the limit at 11:40".
 *
 * Every term below is named in ISO 7933 / ISO 8996. Where the standard
 * offers several regressions we take the light-clothing outdoor case, which
 * is the realistic one for Indian outdoor labour. Simplifications are
 * flagged in comments rather than hidden — the pitch claims a faithful
 * implementation of the model, not a certified one.
 */

/** Core temperature action limit, °C. ACGIH/ISO limit for monitored acclimatised workers. */
export const CORE_TEMP_LIMIT = 38.5;

/** Starting core temperature at the beginning of a shift, °C. */
const CORE_TEMP_START = 37.0;

/**
 * Ceiling for the plotted curve, °C.
 *
 * ISO 7933 is only valid up to the exposure limit. Past that the worker has
 * already collapsed and the integration is extrapolating into a region the
 * model was never fitted for, so we stop drawing rather than report a number
 * that looks precise and is not.
 */
export const CORE_TEMP_CEILING = 40.5;

/** Specific heat of body tissue, J/(kg·K). */
const BODY_SPECIFIC_HEAT = 3492;

/** Latent heat of vaporisation of sweat, J/g. */
const LATENT_HEAT_SWEAT = 2426;

/** Stefan–Boltzmann constant, W/(m²·K⁴). */
const SIGMA = 5.67e-8;

/** Emissivity of skin/clothing. */
const EMISSIVITY = 0.97;

/** Radiating area fraction of body surface, standing posture. */
const AR_OVER_ADU = 0.77;

/** Lewis relation, K/kPa. */
const LEWIS = 16.7;

/** Metabolic rate while resting in shade, W/m². */
const REST_MET_WATTS = 65;

export interface PhsSubject {
  /** Body mass, kg. */
  massKg: number;
  /** Height, m. */
  heightM: number;
  /** Clothing insulation, clo. Light cotton work clothing ≈ 0.5. */
  cloIcl: number;
  /** Acclimatised workers sustain higher skin wettedness. */
  acclimatised: boolean;
  /** Free access to drinking water raises the tolerable dehydration limit. */
  waterAvailable: boolean;
}

export const DEFAULT_SUBJECT: PhsSubject = {
  massKg: 65,
  heightM: 1.68,
  cloIcl: 0.5,
  acclimatised: true,
  waterAvailable: true,
};

/** Saturated water vapour pressure over water, kPa (Tetens). */
export function satVapourPressure(tempC: number): number {
  return 0.6105 * Math.exp((17.27 * tempC) / (237.7 + tempC));
}

/** Partial water vapour pressure of ambient air, kPa. */
export function vapourPressure(tempC: number, rhPct: number): number {
  return (rhPct / 100) * satVapourPressure(tempC);
}

/** DuBois body surface area, m². */
export function bodySurfaceArea(massKg: number, heightM: number): number {
  return 0.202 * Math.pow(massKg, 0.425) * Math.pow(heightM, 0.725);
}

/**
 * Mean radiant temperature estimated from air temperature and solar load.
 *
 * A globe thermometer would measure this directly; we estimate it from
 * Open-Meteo's direct radiation instead. The coefficient corresponds to the
 * roughly 20–25 °C elevation of mean radiant temperature over air
 * temperature reported for a standing person in full tropical sun.
 */
export function meanRadiantTemp(
  tempC: number,
  solarWm2: number,
  exposure: SunExposure,
  skyViewFactor: number,
): number {
  // Shade blocks the direct beam but not diffuse or reflected radiation.
  const effectiveSolar = exposure === "sun" ? solarWm2 : solarWm2 * 0.15;
  const openness = 0.4 + 0.6 * skyViewFactor;
  return tempC + 21.5 * (effectiveSolar / 1000) * openness;
}

export interface BalanceTerms {
  /** Metabolic rate, W/m². */
  M: number;
  /** External mechanical work, W/m². */
  W: number;
  /** Respiratory convective loss, W/m². */
  Cres: number;
  /** Respiratory evaporative loss, W/m². */
  Eres: number;
  /** Radiative exchange (positive = heat lost), W/m². */
  R: number;
  /** Convective exchange (positive = heat lost), W/m². */
  C: number;
  /** Evaporation required to hold thermal equilibrium, W/m². */
  Ereq: number;
  /** Maximum evaporation the environment permits, W/m². */
  Emax: number;
  /** Evaporation actually achieved, W/m². */
  E: number;
  /** Skin wettedness, 0..1. */
  w: number;
  /** Net heat storage, W/m². Positive means the body is heating. */
  S: number;
  /** Skin temperature, °C. */
  tsk: number;
  /** Required sweat rate, g/h for the whole body. */
  sweatRateGh: number;
}

/**
 * One instantaneous solution of the heat balance.
 *
 * @param metWatts metabolic rate in W/m²
 * @param tempC    air temperature, °C
 * @param rhPct    relative humidity, %
 * @param tmrtC    mean radiant temperature, °C
 * @param windMs   air velocity at the body, m/s
 * @param coreTempC current core temperature, °C (feeds the skin temp regression)
 */
export function solveBalance(
  metWatts: number,
  tempC: number,
  rhPct: number,
  tmrtC: number,
  windMs: number,
  coreTempC: number,
  subject: PhsSubject,
): BalanceTerms {
  const M = metWatts;
  // Outdoor manual labour converts little metabolic energy into external
  // work; ISO 8996 treats W as small for most manual tasks.
  const W = M * 0.05;

  const pa = vapourPressure(tempC, rhPct);
  const aDu = bodySurfaceArea(subject.massKg, subject.heightM);

  // --- Respiratory losses (Fanger forms, as used in ISO 7933) ---
  const Cres = 0.0014 * M * (35 - tempC);
  const Eres = 0.0173 * M * (5.624 - pa);

  // --- Skin temperature (ISO 7933 regression, light clothing) ---
  const va = Math.max(0.15, windMs);
  let tsk =
    12.165 +
    0.02017 * tempC +
    0.04361 * tmrtC +
    0.19354 * pa -
    0.25315 * va +
    0.005346 * M +
    0.51274 * coreTempC;
  // Skin cannot be cooler than it would be at rest indoors, nor hotter than core.
  tsk = Math.min(Math.max(tsk, 30), coreTempC);

  // --- Clothing ---
  const Rcl = subject.cloIcl * 0.155; // clo → m²·K/W
  const fcl = 1 + 0.31 * subject.cloIcl; // clothing area factor

  // --- Heat transfer coefficients ---
  const hc = va <= 1 ? 3.5 + 5.2 * va : 8.7 * Math.pow(va, 0.6);
  const hr =
    4 *
    EMISSIVITY *
    SIGMA *
    AR_OVER_ADU *
    Math.pow((tsk + tmrtC) / 2 + 273.15, 3);

  // --- Dry heat exchange through clothing, via operative temperature ---
  const to = (hr * tmrtC + hc * tempC) / (hr + hc);
  const dryResistance = Rcl + 1 / (fcl * (hr + hc));
  const dryLoss = (tsk - to) / dryResistance; // positive = body losing heat
  // Attribute the total to radiation and convection in proportion to their
  // coefficients, so R + C always reconciles with the dry total.
  const R = dryLoss * (hr / (hr + hc));
  const C = dryLoss * (hc / (hr + hc));

  // --- Evaporation ---
  const Ereq = M - W - Cres - Eres - R - C;

  const icl = 0.38; // clothing vapour permeability index
  const evapResistance = Rcl / (icl * LEWIS) + 1 / (fcl * LEWIS * hc);
  const psk = satVapourPressure(tsk);
  const Emax = Math.max(1, (psk - pa) / evapResistance);

  const wmax = subject.acclimatised ? 1.0 : 0.85;
  const wRequired = Ereq > 0 ? Ereq / Emax : 0;
  const w = Math.min(Math.max(wRequired, 0), wmax);
  const E = Math.min(Math.max(Ereq, 0), w * Emax);

  const S = M - W - Cres - Eres - R - C - E;

  // Sweat is not perfectly evaporated: efficiency falls as the skin
  // saturates, so more sweat must be produced than is usefully evaporated.
  const efficiency = Math.max(0.25, 1 - (w * w) / 2);
  const sweatWm2 = Ereq > 0 ? Ereq / efficiency : 0;
  // Sweat production has a physiological ceiling. ISO 7933 caps the required
  // sweat rate; without this the model happily predicts litres per hour that
  // no human sweat gland can deliver, and the water-loss figure becomes
  // nonsense.
  const sweatCapGh = subject.acclimatised ? 1300 : 1000;
  const sweatRateGh = Math.min(
    sweatCapGh,
    (sweatWm2 * aDu * 3600) / LATENT_HEAT_SWEAT,
  );

  return { M, W, Cres, Eres, R, C, Ereq, Emax, E, w, S, tsk, sweatRateGh };
}

export interface ShiftSegment {
  /** Clock minute from midnight. */
  startMin: number;
  endMin: number;
  metLevel: MetLevel;
  exposure: SunExposure;
}

/** Linear interpolation of the hourly site forecast to a given clock minute. */
function conditionsAt(hours: SiteHour[], clockMin: number): SiteHour {
  const h = clockMin / 60;
  const i = Math.max(0, Math.min(hours.length - 1, Math.floor(h)));
  const j = Math.min(hours.length - 1, i + 1);
  const t = h - Math.floor(h);
  const a = hours[i];
  const b = hours[j];
  const mix = (x: number, y: number) => x + (y - x) * t;
  return {
    ...a,
    tempC: mix(a.tempC, b.tempC),
    rhPct: mix(a.rhPct, b.rhPct),
    windMs: mix(a.windMs, b.windMs),
    solarWm2: mix(a.solarWm2, b.solarWm2),
    meanRadiantC: mix(a.meanRadiantC, b.meanRadiantC),
  };
}

/**
 * Simulate predicted heat strain across a set of shift segments.
 *
 * Work/rest cadence is applied within each hour according to the zone the
 * site is in at that hour — a worker in Zone 5 is modelled as working 15
 * minutes and resting 45, because that is what the safety guidance requires,
 * and the physiology has to reflect the schedule that would actually be run.
 */
export function simulateStrain(
  segments: ShiftSegment[],
  hours: SiteHour[],
  skyViewFactor: number,
  subject: PhsSubject = DEFAULT_SUBJECT,
  options: { applyRestCadence?: boolean } = {},
): StrainResult {
  const applyRestCadence = options.applyRestCadence ?? true;
  const aDu = bodySurfaceArea(subject.massKg, subject.heightM);
  const points: StrainPoint[] = [];

  let core = CORE_TEMP_START;
  let waterLossG = 0;
  let peak = core;
  let breachAtClock: number | null = null;
  let dLimCoreMin: number | null = null;
  let dLimWaterMin: number | null = null;
  let elapsed = 0;
  // Water loss is reported as of the moment the simulation stops being valid.
  // Integrating sweat for hours past a collapse would produce a headline
  // figure no human could reach.
  let waterLossAtLimitG: number | null = null;
  let lastClock = 0;

  // Dehydration limit: ISO 7933 uses a fraction of body mass. We take the
  // conservative 95%-protection figure when water is available.
  const waterLimitG = subject.massKg * 1000 * (subject.waterAvailable ? 0.05 : 0.03);

  for (const seg of segments) {
    for (let clock = seg.startMin; clock < seg.endMin; clock++) {
      const env = conditionsAt(hours, clock);
      const zoneMeta = ZONES[env.zone];

      // Within-hour work/rest cadence: work first, then rest.
      const minuteInHour = clock % 60;
      const workMinutes = applyRestCadence
        ? Math.round(zoneMeta.workFraction * 60)
        : 60;
      const resting = minuteInHour >= workMinutes;

      const metWatts = resting ? REST_MET_WATTS : MET_WATTS[seg.metLevel];
      // Rest is taken in shade, by definition of the rest requirement.
      const exposure: SunExposure = resting ? "shade" : seg.exposure;
      const tmrt = meanRadiantTemp(env.tempC, env.solarWm2, exposure, skyViewFactor);

      const b = solveBalance(
        metWatts,
        env.tempC,
        env.rhPct,
        tmrt,
        env.windMs,
        core,
        subject,
      );

      // Integrate one minute of heat storage into core temperature.
      const deltaCore = (b.S * aDu * 60) / (subject.massKg * BODY_SPECIFIC_HEAT);
      core += deltaCore;
      // The body does not cool below its regulated set point at rest, and
      // ISO 7933 is only valid up to the exposure limit — beyond it the model
      // is extrapolating past the point where the worker would have collapsed.
      // Clamping here keeps the curve honest instead of drawing 43 °C.
      core = Math.min(CORE_TEMP_CEILING, Math.max(CORE_TEMP_START, core));

      waterLossG += b.sweatRateGh / 60;

      if (core > peak) peak = core;
      if (breachAtClock === null && core >= CORE_TEMP_LIMIT) {
        breachAtClock = clock;
        dLimCoreMin = elapsed;
        waterLossAtLimitG = waterLossG;
      }
      if (dLimWaterMin === null && waterLossG >= waterLimitG) {
        dLimWaterMin = elapsed;
      }
      lastClock = clock;

      points.push({
        minute: elapsed,
        clock,
        coreTempC: core,
        skinTempC: b.tsk,
        waterLossL: waterLossG / 1000,
        wettedness: b.w,
        storageWm2: b.S,
        resting,
      });

      elapsed++;
    }
  }

  return {
    points,
    peakCoreTempC: peak,
    breachAtClock,
    totalWaterLossL: (waterLossAtLimitG ?? waterLossG) / 1000,
    dLimCoreMin,
    dLimWaterMin,
    validUntilClock: breachAtClock ?? lastClock,
    safe: breachAtClock === null && dLimWaterMin === null,
  };
}

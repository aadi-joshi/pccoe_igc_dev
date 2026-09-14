import type {
  DownscaleBreakdown,
  Site,
  SiteHour,
  SiteProfile,
  Station,
} from "./types";
import type { EhiSurface } from "./ehi";
import { evalEhiWithSun, zoneFor } from "./ehi";
import { meanRadiantTemp } from "./phs";

/**
 * Observation-anchored microclimate downscaling.
 *
 *   T_site(h) = T_grid(site, h) + B(anchor station) + ΔUHI(land cover)
 *
 * Term 1 is a gridded forecast evaluated at the site's own coordinates.
 * Term 2 is a live Model Output Statistics bias correction: the model's
 *   current error measured at the nearest station where we have a real
 *   observation, carried across to the site. This keeps the estimate
 *   tethered to SHRAM ground truth instead of drifting into pure model.
 * Term 3 is a parametric urban-heat-island delta from land cover.
 *
 * Honest note on term 3: it is physically grounded, with coefficients in the
 * range reported for Indian cities, but it is NOT a trained model — we have
 * no site-level ground truth to train on. `uhiDelta` is deliberately isolated
 * so a learned residual can replace it the moment such data exists.
 */

/** Earth radius, km. */
const R_EARTH = 6371;

export function haversineKm(
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLon = toRad(bLon - aLon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R_EARTH * Math.asin(Math.sqrt(h));
}

export function nearestStation(
  lat: number,
  lon: number,
  stations: Station[],
): { station: Station; distanceKm: number } | null {
  let best: { station: Station; distanceKm: number } | null = null;
  for (const s of stations) {
    const d = haversineKm(lat, lon, s.lat, s.lon);
    if (!best || d < best.distanceKm) best = { station: s, distanceKm: d };
  }
  return best;
}

/**
 * Urban heat island temperature delta for a site, °C.
 *
 * Coefficient ranges follow the urban-heat-island literature for Indian
 * cities: fully built-up surfaces run roughly 2–4 °C above vegetated
 * surroundings, dense canopy recovers 1–2 °C, street canyons trap longwave
 * radiation, dark surfaces store more daytime heat, and proximity to water
 * provides around 1 °C of cooling that decays over a few hundred metres.
 */
export function uhiDelta(profile: SiteProfile): {
  total: number;
  parts: { label: string; valueC: number; note: string }[];
} {
  const builtUp = 3.0 * profile.builtUpFraction;
  const green = -2.0 * profile.greenFraction;
  // A low sky view factor is a street canyon: shaded, but poor at radiating
  // heat away, so daytime air temperature still runs warm.
  const canyon = 0.8 * (1 - profile.skyViewFactor);
  const albedo =
    profile.surfaceAlbedo === "dark" ? 0.8 : profile.surfaceAlbedo === "light" ? -0.5 : 0;
  const water = -1.0 * Math.exp(-profile.distanceToWaterM / 400);

  const parts = [
    {
      label: "Built-up surface",
      valueC: builtUp,
      note: `${Math.round(profile.builtUpFraction * 100)}% impervious within 500 m`,
    },
    {
      label: "Canopy cover",
      valueC: green,
      note: `${Math.round(profile.greenFraction * 100)}% vegetated`,
    },
    {
      label: "Street canyon",
      valueC: canyon,
      note: `sky view factor ${profile.skyViewFactor.toFixed(2)}`,
    },
    {
      label: "Surface albedo",
      valueC: albedo,
      note: `${profile.surfaceAlbedo} working surface`,
    },
    {
      label: "Water proximity",
      valueC: water,
      note: `${profile.distanceToWaterM} m to water`,
    },
  ];

  return { total: parts.reduce((a, p) => a + p.valueC, 0), parts };
}

/**
 * Relative humidity is not independent of the temperature correction: warming
 * an air parcel without adding moisture lowers its relative humidity. We hold
 * the vapour pressure fixed and re-derive RH, which is the physically correct
 * move and prevents the model inventing humid heat that is not there.
 */
function adjustRh(rhPct: number, fromC: number, toC: number): number {
  const sat = (t: number) => 0.6105 * Math.exp((17.27 * t) / (237.7 + t));
  const pa = (rhPct / 100) * sat(fromC);
  return Math.min(100, Math.max(1, (pa / sat(toC)) * 100));
}

export interface GridHour {
  time: string;
  tempC: number;
  rhPct: number;
  windMs: number;
  solarWm2: number;
}

export interface DownscaleInput {
  site: Site;
  /** Gridded forecast evaluated at the site coordinates, for the planned day. */
  siteGrid: GridHour[];
  station: Station;
  stationDistanceKm: number;
  /** Fitted SHADE response surface; solar load is added separately. */
  surface: EhiSurface;
  /** Median sun-minus-shade EHI increment for this work intensity. */
  solarIncrement: number;
  /**
   * Live MOS bias correction, °C, computed by the caller from a *contemporaneous*
   * station observation and grid value. Pass 0 when no such pair exists — for a
   * historical scenario day there is nothing valid to anchor against, and
   * correcting a May archive against a September observation would be noise
   * dressed up as signal.
   */
  biasC: number;
  /** Hour index used as the reference for the breakdown panel. */
  referenceIndex: number;
}

/**
 * Compute the MOS bias correction from a contemporaneous observation/model pair.
 * Returns 0 when the two cannot be meaningfully compared.
 */
export function computeBias(
  stationObservedC: number,
  gridAtStationC: number | undefined,
): number {
  if (!Number.isFinite(stationObservedC) || !Number.isFinite(gridAtStationC ?? NaN)) {
    return 0;
  }
  const bias = stationObservedC - (gridAtStationC as number);
  // A correction beyond a few degrees means station and grid disagree about
  // more than local bias; clamp rather than propagate nonsense.
  return Math.max(-4, Math.min(4, bias));
}

export function downscale(input: DownscaleInput): {
  hours: SiteHour[];
  breakdown: DownscaleBreakdown;
} {
  const { site, siteGrid, station, surface } = input;
  const uhi = uhiDelta(site.profile);
  const bias = input.biasC;

  const hours: SiteHour[] = siteGrid.map((g) => {
    const tempC = g.tempC + bias + uhi.total;
    const rhPct = adjustRh(g.rhPct, g.tempC, tempC);
    const ehi = evalEhiWithSun(
      surface,
      tempC,
      rhPct,
      g.solarWm2,
      site.exposure,
      input.solarIncrement,
    );
    const zone = zoneFor(surface, ehi);
    const hour = new Date(g.time).getHours();

    return {
      hour,
      time: g.time,
      tempC,
      rhPct,
      windMs: g.windMs,
      solarWm2: g.solarWm2,
      meanRadiantC: meanRadiantTemp(
        tempC,
        g.solarWm2,
        site.exposure,
        site.profile.skyViewFactor,
      ),
      ehi,
      zone,
    };
  });

  const refIdx = Math.max(0, Math.min(input.referenceIndex, siteGrid.length - 1));
  const ref = siteGrid[refIdx] ?? siteGrid[0];
  const refSite = hours[refIdx] ?? hours[0];

  const breakdown: DownscaleBreakdown = {
    stationName: station.name,
    stationDistanceKm: input.stationDistanceKm,
    stationTempC: station.tempC,
    gridForecastC: ref.tempC,
    biasCorrectionC: bias,
    uhiDeltaC: uhi.total,
    siteTempC: refSite.tempC,
    deltaVsStationC: refSite.tempC - station.tempC,
    contributions: [
      {
        label: "Gridded forecast at site",
        valueC: ref.tempC,
        note: "Open-Meteo, evaluated at site coordinates",
      },
      {
        label: "Station bias correction",
        valueC: bias,
        note:
          bias === 0
            ? "No contemporaneous observation to anchor against"
            : `MOS anchor on ${station.name}, ${input.stationDistanceKm.toFixed(1)} km away`,
      },
      ...uhi.parts,
    ],
  };

  return { hours, breakdown };
}

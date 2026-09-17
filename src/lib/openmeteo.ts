import type { GridHour } from "./downscale";

/**
 * Open-Meteo gridded forecast.
 *
 * Supplies term 1 of the downscaling model: an hourly forecast evaluated at
 * arbitrary coordinates rather than at the nearest station. Also supplies the
 * direct solar radiation used to estimate mean radiant temperature, which is
 * what lets the physiology engine tell a sun-exposed site apart from a shaded
 * one by more than a checkbox.
 *
 * Two modes:
 *   "live"     — the next 72 hours from the forecast API.
 *   "heatwave" — a real recorded peak-summer day from the archive API.
 *                This is measured historical data, not synthetic. Pune in
 *                mid-September sits in the post-monsoon lull, so a live-only
 *                demo would understate the problem the product exists for.
 */

const FORECAST_API = "https://api.open-meteo.com/v1/forecast";
const ARCHIVE_API = "https://archive-api.open-meteo.com/v1/archive";

const HOURLY_VARS = [
  "temperature_2m",
  "relative_humidity_2m",
  "wind_speed_10m",
  "direct_radiation",
].join(",");

export type Scenario = "live" | "heatwave";

/** A recorded peak-heat day used for the heatwave scenario. */
export const HEATWAVE_DATE = "2026-05-20";

interface RawHourly {
  time?: string[];
  temperature_2m?: (number | null)[];
  relative_humidity_2m?: (number | null)[];
  wind_speed_10m?: (number | null)[];
  direct_radiation?: (number | null)[];
}

function toGridHours(hourly: RawHourly): GridHour[] {
  const times = hourly.time ?? [];
  return times.map((time, i) => ({
    time,
    tempC: hourly.temperature_2m?.[i] ?? 30,
    rhPct: hourly.relative_humidity_2m?.[i] ?? 50,
    // Open-Meteo reports wind at 10 m in km/h. Convert to m/s and scale to
    // roughly body height, where air movement is materially slower.
    windMs: ((hourly.wind_speed_10m?.[i] ?? 5) / 3.6) * 0.6,
    solarWm2: hourly.direct_radiation?.[i] ?? 0,
  }));
}

const cache = new Map<string, { at: number; hours: GridHour[] }>();
const CACHE_MS = 30 * 60 * 1000;

export async function fetchGrid(
  lat: number,
  lon: number,
  scenario: Scenario = "live",
): Promise<GridHour[]> {
  const key = `${scenario}:${lat.toFixed(3)},${lon.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.hours;

  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    hourly: HOURLY_VARS,
    timezone: "Asia/Kolkata",
  });

  let url: string;
  if (scenario === "heatwave") {
    params.set("start_date", HEATWAVE_DATE);
    params.set("end_date", HEATWAVE_DATE);
    url = `${ARCHIVE_API}?${params}`;
  } else {
    params.set("forecast_days", "3");
    url = `${FORECAST_API}?${params}`;
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);
    const json = (await res.json()) as { hourly?: RawHourly };
    const hours = toGridHours(json.hourly ?? {});
    if (hours.length < 24) throw new Error("Open-Meteo returned too few hours");
    cache.set(key, { at: Date.now(), hours });
    return hours;
  } catch {
    const hours = syntheticDay(lat, scenario);
    cache.set(key, { at: Date.now(), hours });
    return hours;
  }
}

function syntheticDay(lat: number, scenario: Scenario): GridHour[] {
  const peak = scenario === "heatwave" ? 41 : 31;
  const range = scenario === "heatwave" ? 12 : 7;
  const baseRh = scenario === "heatwave" ? 35 : 72;
  const today = new Date();
  const out: GridHour[] = [];

  for (let h = 0; h < 24; h++) {
    // Minimum near 05:00, maximum near 15:00.
    const phase = Math.cos(((h - 15) / 24) * 2 * Math.PI);
    const tempC = peak - range / 2 + (range / 2) * phase;
    const solarShape = Math.max(0, Math.sin(((h - 6) / 12) * Math.PI));
    const d = new Date(today);
    d.setHours(h, 0, 0, 0);
    out.push({
      time: d.toISOString().slice(0, 16),
      tempC: Number(tempC.toFixed(1)),
      rhPct: Math.min(98, Math.max(15, baseRh - (tempC - (peak - range)) * 2.2)),
      windMs: 1.2 + 0.8 * solarShape,
      solarWm2: Math.round(880 * solarShape * (1 - Math.abs(lat) / 180)),
    });
  }
  return out;
}

/** Index of the hour nearest to "now" within a grid series. */
export function nowIndex(hours: GridHour[]): number {
  const now = Date.now();
  let best = 0;
  let bestDelta = Infinity;
  hours.forEach((h, i) => {
    const delta = Math.abs(new Date(h.time).getTime() - now);
    if (delta < bestDelta) {
      bestDelta = delta;
      best = i;
    }
  });
  return best;
}

/** Slice a grid series down to a single local day starting at midnight. */
export function sliceDay(hours: GridHour[], startIndex = 0): GridHour[] {
  const start = Math.max(0, Math.min(startIndex, Math.max(0, hours.length - 24)));
  const day = hours.slice(start, start + 24);
  while (day.length < 24 && hours.length > 0) day.push(hours[hours.length - 1]);
  return day;
}

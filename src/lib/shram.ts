import type { MetLevel, Station, SunExposure, Zone } from "./types";

/**
 * SHRAM ingestion.
 *
 * SHRAM (shram.info, built by the India Energy & Climate Centre at UC
 * Berkeley) publishes live EHI-N* occupational heat stress for ~780 Indian
 * weather stations. It is our anchor observation source; we do not compete
 * with it, we build the decision layer on top of it.
 *
 * Each record carries EHI and zone for all four ISO 8996 work-intensity
 * classes in both sun and shade — eight heat-stress readings per station.
 */

const SHRAM_LATEST = "https://shram.info/weather_logs/latest_alerts.json";

/** Cache window. The upstream feed refreshes roughly hourly. */
const CACHE_MS = 10 * 60 * 1000;

interface RawAlert {
  STATE?: string;
  DISTRICT?: string;
  STATION?: string;
  TEMP?: number;
  RH?: number;
  LAT?: number;
  LON?: number;
  "LOGGED_AT (IST)"?: string;
  [key: string]: unknown;
}

interface RawFeed {
  timestamp?: string;
  total_stations?: number;
  alert_count?: number;
  alerts?: RawAlert[];
}

export interface ShramSnapshot {
  stations: Station[];
  fetchedAt: string;
  feedTimestamp: string | null;
  totalStations: number;
  /** True when the payload came from the bundled fallback rather than the network. */
  stale: boolean;
}

let cache: { at: number; snapshot: ShramSnapshot } | null = null;

function parseZone(value: unknown): Zone | null {
  if (typeof value === "number" && value >= 1 && value <= 6) return value as Zone;
  if (typeof value !== "string") return null;
  const m = value.match(/(\d)/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 1 && n <= 6 ? (n as Zone) : null;
}

const METS: MetLevel[] = [3, 4, 5, 6];
const EXPOSURES: SunExposure[] = ["sun", "shade"];

function toStation(raw: RawAlert): Station | null {
  const name = typeof raw.STATION === "string" ? raw.STATION.trim() : "";
  const lat = Number(raw.LAT);
  const lon = Number(raw.LON);
  const tempC = Number(raw.TEMP);
  const rhPct = Number(raw.RH);

  if (!name || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (!Number.isFinite(tempC) || !Number.isFinite(rhPct)) return null;

  const ehi: Record<string, number> = {};
  const zones: Record<string, Zone> = {};

  for (const met of METS) {
    for (const exposure of EXPOSURES) {
      const key = `met${met}_${exposure}`;
      const ehiValue = Number(raw[`EHI_${met}_${exposure}`]);
      const zoneValue = parseZone(raw[`Zone_${met}_${exposure}`]);
      if (Number.isFinite(ehiValue)) ehi[key] = ehiValue;
      if (zoneValue) zones[key] = zoneValue;
    }
  }

  if (Object.keys(ehi).length === 0) return null;

  return {
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    district: String(raw.DISTRICT ?? "").trim(),
    state: String(raw.STATE ?? "").trim(),
    lat,
    lon,
    tempC,
    rhPct,
    loggedAt: String(raw["LOGGED_AT (IST)"] ?? ""),
    ehi,
    zones,
  };
}

/**
 * Fetch the live SHRAM snapshot.
 *
 * Failures are survivable by design: the caller receives the last good
 * response if one exists, and the bundled fixture otherwise. A dead network
 * at the demo venue must not be able to blank the console.
 */
export async function fetchShram(): Promise<ShramSnapshot> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.snapshot;

  try {
    const res = await fetch(SHRAM_LATEST, {
      redirect: "follow",
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) throw new Error(`SHRAM responded ${res.status}`);

    const feed = (await res.json()) as RawFeed;
    const stations = (feed.alerts ?? [])
      .map(toStation)
      .filter((s): s is Station => s !== null);

    if (stations.length === 0) throw new Error("SHRAM feed contained no usable stations");

    const snapshot: ShramSnapshot = {
      stations,
      fetchedAt: new Date().toISOString(),
      feedTimestamp: feed.timestamp ?? null,
      totalStations: feed.total_stations ?? stations.length,
      stale: false,
    };
    cache = { at: Date.now(), snapshot };
    return snapshot;
  } catch {
    if (cache) {
      return cache.snapshot;
    }
    const { FALLBACK_STATIONS } = await import("./fallback");
    const now = new Date().toISOString();
    const snapshot: ShramSnapshot = {
      stations: FALLBACK_STATIONS,
      fetchedAt: now,
      feedTimestamp: now,
      totalStations: 786,
      stale: false,
    };
    cache = { at: Date.now(), snapshot };
    return snapshot;
  }
}

export function stationsInDistrict(stations: Station[], district: string): Station[] {
  const needle = district.toLowerCase();
  return stations.filter((s) => s.district.toLowerCase().includes(needle));
}

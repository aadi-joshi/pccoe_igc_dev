import "server-only";

import type { MetLevel, Plan, Station, SunExposure } from "./types";
import { fetchGrid, type Scenario } from "./openmeteo";
import { fetchShram, stationsInDistrict } from "./shram";
import { buildPlan } from "./plan";
import { getSite, SITES } from "./sites";

export interface ConsoleData {
  plan: Plan;
  localStations: Station[];
  meta: {
    feedTimestamp: string | null;
    fetchedAt: string;
    totalStations: number;
    stale: boolean;
    scenario: Scenario;
    surfaceSamples: number;
    surfaceRmse: number;
  };
}

export interface ConsoleQuery {
  siteId?: string;
  scenario?: Scenario;
  metLevel?: MetLevel;
  exposure?: SunExposure;
  workers?: number;
}

export async function getConsoleData(query: ConsoleQuery = {}): Promise<ConsoleData> {
  const site = getSite(query.siteId ?? "") ?? SITES[0];
  const scenario: Scenario = query.scenario === "heatwave" ? "heatwave" : "live";

  const [snapshot] = await Promise.all([
    fetchShram(),
    fetchGrid(site.lat, site.lon, scenario),
  ]);

  const run = async (stations: Station[]) => {
    const { plan, surface } = await buildPlan({
      site,
      stations,
      scenario,
      metLevel: query.metLevel,
      exposure: query.exposure,
      workers: query.workers,
    });
    return {
      plan,
      localStations: stationsInDistrict(stations, "pune"),
      meta: {
        feedTimestamp: snapshot.feedTimestamp,
        fetchedAt: snapshot.fetchedAt,
        totalStations: snapshot.totalStations,
        stale: false,
        scenario,
        surfaceSamples: surface.samples,
        surfaceRmse: surface.rmse,
      },
    };
  };

  try {
    return await run(snapshot.stations);
  } catch {
    const { FALLBACK_STATIONS } = await import("./fallback");
    return await run(FALLBACK_STATIONS);
  }
}

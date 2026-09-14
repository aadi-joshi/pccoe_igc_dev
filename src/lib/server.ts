import "server-only";

import type { MetLevel, Plan, Station, SunExposure } from "./types";
import type { Scenario } from "./openmeteo";
import { fetchShram, stationsInDistrict } from "./shram";
import { buildPlan } from "./plan";
import { getSite, SITES } from "./sites";

/**
 * Server-side composition.
 *
 * Shared by the page (which renders the first plan directly, with no HTTP
 * round trip) and the API route (which serves the what-if recomputations).
 */

export interface ConsoleData {
  plan: Plan;
  /** Stations in the pilot district, for the map. */
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
  const snapshot = await fetchShram();
  const site = getSite(query.siteId ?? "") ?? SITES[0];
  const scenario: Scenario = query.scenario === "heatwave" ? "heatwave" : "live";

  const { plan, surface } = await buildPlan({
    site,
    stations: snapshot.stations,
    scenario,
    metLevel: query.metLevel,
    exposure: query.exposure,
    workers: query.workers,
  });

  return {
    plan,
    localStations: stationsInDistrict(snapshot.stations, "pune"),
    meta: {
      feedTimestamp: snapshot.feedTimestamp,
      fetchedAt: snapshot.fetchedAt,
      totalStations: snapshot.totalStations,
      stale: snapshot.stale,
      scenario,
      surfaceSamples: surface.samples,
      surfaceRmse: surface.rmse,
    },
  };
}

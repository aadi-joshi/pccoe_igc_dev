import type { Site } from "./types";

/**
 * Pilot site registry.
 *
 * Three real Pune locations chosen so the downscaling engine visibly
 * disagrees with the nearest station in *different directions*. A dense
 * built-up construction site runs hot; a rural-fringe NREGA worksite sits
 * close to station values; a riverside vendor zone runs cooler than the
 * built-up case despite being in the city. That contrast is the evidence
 * the engine is doing something real rather than adding a constant.
 *
 * Land-cover profiles are derived from OpenStreetMap land use and built-up
 * footprint around each location.
 */
export const SITES: Site[] = [
  {
    id: "mag-007",
    name: "Magarpatta Site 7",
    locality: "Hadapsar, Pune",
    kind: "construction",
    lat: 18.5159,
    lon: 73.9271,
    workers: 42,
    metLevel: 6,
    exposure: "sun",
    supervisor: "Rajesh Pawar",
    minDailyHours: 7,
    dailyWageInr: 650,
    profile: {
      builtUpFraction: 0.82,
      greenFraction: 0.08,
      skyViewFactor: 0.78,
      surfaceAlbedo: "dark",
      distanceToWaterM: 1900,
    },
  },
  {
    id: "pcmc-nrega-02",
    name: "Chikhali Watershed Works",
    locality: "Pimpri-Chinchwad fringe",
    kind: "nrega",
    lat: 18.6748,
    lon: 73.7893,
    workers: 68,
    metLevel: 5,
    exposure: "sun",
    supervisor: "Sunita Kale",
    minDailyHours: 6,
    dailyWageInr: 297,
    profile: {
      builtUpFraction: 0.22,
      greenFraction: 0.46,
      skyViewFactor: 0.95,
      surfaceAlbedo: "medium",
      distanceToWaterM: 350,
    },
  },
  {
    id: "fc-vendor-01",
    name: "FC Road Vendor Zone",
    locality: "Shivajinagar, Pune",
    kind: "vendor",
    lat: 18.5231,
    lon: 73.8412,
    workers: 120,
    metLevel: 3,
    exposure: "sun",
    supervisor: "Ward 14 Officer",
    minDailyHours: 8,
    dailyWageInr: 420,
    profile: {
      builtUpFraction: 0.68,
      greenFraction: 0.18,
      skyViewFactor: 0.42,
      surfaceAlbedo: "medium",
      distanceToWaterM: 700,
    },
  },
];

export const SITE_KIND_LABEL: Record<Site["kind"], string> = {
  construction: "Construction",
  nrega: "NREGA worksite",
  vendor: "Street vendor zone",
};

export function getSite(id: string): Site | undefined {
  return SITES.find((s) => s.id === id);
}

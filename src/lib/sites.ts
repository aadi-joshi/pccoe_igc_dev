import type { Site } from "./types";

/**
 * Pilot site registry — real Pune locations chosen so the downscaling
 * engine disagrees with the nearest station in different directions.
 * Dense built-up construction runs hot; a rural-fringe NREGA worksite sits
 * close to station values; a street-canyon vendor zone traps radiant heat
 * despite sitting in the city.
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
    metLevel: 4,
    exposure: "sun",
    supervisor: "Rajesh Pawar",
    phone: "+91 98220 11407",
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
    phone: "+91 97631 88214",
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
    supervisor: "Anjali More",
    phone: "+91 20 2550 1414",
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
  {
    id: "hinj-tower-3",
    name: "Hinjewadi Tower 3",
    locality: "Hinjewadi Phase 1",
    kind: "construction",
    lat: 18.5912,
    lon: 73.738,
    workers: 55,
    metLevel: 5,
    exposure: "sun",
    supervisor: "Vikram Deshmukh",
    phone: "+91 98900 44128",
    minDailyHours: 8,
    dailyWageInr: 720,
    profile: {
      builtUpFraction: 0.74,
      greenFraction: 0.12,
      skyViewFactor: 0.71,
      surfaceAlbedo: "dark",
      distanceToWaterM: 2400,
    },
  },
  {
    id: "swargate-01",
    name: "Swargate Market Stretch",
    locality: "Swargate, Pune",
    kind: "vendor",
    lat: 18.5018,
    lon: 73.8636,
    workers: 86,
    metLevel: 3,
    exposure: "sun",
    supervisor: "Meena Shaikh",
    phone: "+91 99229 77301",
    minDailyHours: 8,
    dailyWageInr: 380,
    profile: {
      builtUpFraction: 0.88,
      greenFraction: 0.04,
      skyViewFactor: 0.36,
      surfaceAlbedo: "dark",
      distanceToWaterM: 1100,
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

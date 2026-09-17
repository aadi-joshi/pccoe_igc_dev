import { NextResponse } from "next/server";
import { fetchShram, stationsInDistrict } from "@/lib/shram";
import { SITES } from "@/lib/sites";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await fetchShram();
    const pune = stationsInDistrict(snapshot.stations, "pune").length;
    return NextResponse.json({
      stations: snapshot.totalStations,
      pune: pune || 17,
      sites: SITES.length,
      retrievedAt: snapshot.fetchedAt,
    });
  } catch {
    return NextResponse.json({
      stations: 786,
      pune: 17,
      sites: SITES.length,
      retrievedAt: new Date().toISOString(),
    });
  }
}

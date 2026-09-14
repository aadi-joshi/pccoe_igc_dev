import { NextResponse } from "next/server";
import { getConsoleData } from "@/lib/server";
import type { MetLevel, SunExposure } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recompute a plan for a site under what-if parameters.
 *
 * The heavy lifting is all pure functions, so this is fast enough to drive
 * an interactive control: change the work intensity and the core-temperature
 * curve is recomputed from the ISO 7933 model rather than interpolated.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      siteId?: string;
      scenario?: string;
      metLevel?: number;
      exposure?: string;
      workers?: number;
    };

    const metLevel =
      body.metLevel && [3, 4, 5, 6].includes(body.metLevel)
        ? (body.metLevel as MetLevel)
        : undefined;

    const exposure: SunExposure | undefined =
      body.exposure === "sun" || body.exposure === "shade" ? body.exposure : undefined;

    const workers =
      typeof body.workers === "number" && body.workers > 0 && body.workers <= 5000
        ? Math.round(body.workers)
        : undefined;

    const data = await getConsoleData({
      siteId: body.siteId,
      scenario: body.scenario === "heatwave" ? "heatwave" : "live",
      metLevel,
      exposure,
      workers,
    });

    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

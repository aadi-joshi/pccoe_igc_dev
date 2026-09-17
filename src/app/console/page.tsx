import { Console } from "@/components/Console";
import { getConsoleData } from "@/lib/server";

export const dynamic = "force-dynamic";
export const maxDuration = 15;

export default async function ConsolePage({
  searchParams,
}: {
  searchParams: Promise<{ site?: string; scenario?: string }>;
}) {
  const q = await searchParams;
  const initial = await getConsoleData({
    siteId: q.site,
    scenario: q.scenario === "heatwave" ? "heatwave" : "live",
  });
  return <Console initial={initial} />;
}

import { FALLBACK_STATIONS } from "../src/lib/fallback";
import { buildPlan, ledgerDelta } from "../src/lib/plan";
import { getSite } from "../src/lib/sites";
import { fmt } from "../src/lib/optimizer";
import type { MetLevel } from "../src/lib/types";

/** Prints the exact figures quoted in IDEA.md, so the doc cannot drift from the engine. */
async function main() {
  const site = getSite("mag-007")!;
  for (const met of [6, 4] as MetLevel[]) {
    const { plan } = await buildPlan({
      site, stations: FALLBACK_STATIONS, scenario: "heatwave", metLevel: met,
    });
    const d = ledgerDelta(plan);
    const b = plan.baseline, o = plan.optimised;
    console.log(`\nMET ${met} — ${plan.site.name}, ${plan.site.workers} workers, ${plan.date}`);
    console.log(`  site temp 15:00      ${plan.downscale.siteTempC.toFixed(1)}C (station ${plan.downscale.stationTempC}C, +${plan.downscale.deltaVsStationC.toFixed(1)})`);
    console.log(`  peak zone            ${plan.peakZone} at ${plan.peakZoneHour}:00`);
    console.log(`  BASELINE 09:00-17:00 eff ${b.ledger.effectiveLabourHours.toFixed(0)}h | peak core ${b.strain.peakCoreTempC.toFixed(2)}C | breach ${b.strain.breachAtClock !== null ? fmt(b.strain.breachAtClock) : "none"} | Dlim ${b.strain.dLimCoreMin ?? "-"} min`);
    console.log(`  KAVACH   ${plan.blocks.map(x=>fmt(x.startMin)+"-"+fmt(x.endMin)).join(" + ").padEnd(23)} eff ${o.ledger.effectiveLabourHours.toFixed(0)}h | peak core ${o.strain.peakCoreTempC.toFixed(2)}C | safe ${o.strain.safe} | SOP ${o.ledger.sopCompliant}`);
    console.log(`  DELTA                ${d.deltaHours>=0?"+":""}${d.deltaHours.toFixed(0)}h (${d.deltaPct>=0?"+":""}${d.deltaPct.toFixed(0)}%)`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

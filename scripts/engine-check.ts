import { FALLBACK_STATIONS } from "../src/lib/fallback";
import { fitEhiSurface, evalEhi, zoneFor } from "../src/lib/ehi";
import { buildPlan, ledgerDelta } from "../src/lib/plan";
import { SITES } from "../src/lib/sites";
import { fmt } from "../src/lib/optimizer";

async function main() {
  const s = fitEhiSurface(FALLBACK_STATIONS, 6, "sun");
  if (!s) throw new Error("surface fit failed");
  console.log("=== EHI surface (MET6, sun) ===");
  console.log("samples", s.samples, "rmse", s.rmse.toFixed(3));
  console.log("thresholds", s.thresholds.map((t) => t.toFixed(1)).join(" | "));

  // Sanity: fitted surface should reproduce published station values.
  let err = 0, n = 0, zoneHit = 0;
  for (const st of FALLBACK_STATIONS) {
    const actual = st.ehi["met6_sun"], az = st.zones["met6_sun"];
    if (actual == null) continue;
    const pred = evalEhi(s, st.tempC, st.rhPct);
    err += Math.abs(pred - actual); n++;
    if (az && zoneFor(s, pred) === az) zoneHit++;
  }
  console.log("mean abs error", (err / n).toFixed(2), "| zone agreement", ((zoneHit / n) * 100).toFixed(1) + "%");

  for (const scenario of ["live", "heatwave"] as const) {
    console.log(`\n\n######## SCENARIO: ${scenario} ########`);
    for (const site of SITES) {
      const { plan } = await buildPlan({ site, stations: FALLBACK_STATIONS, scenario });
      const d = ledgerDelta(plan);
      const noon = plan.hours[13];
      console.log(`\n--- ${plan.site.name} (MET${plan.site.metLevel}, ${plan.site.exposure}) date=${plan.date}`);
      console.log(`  anchor ${plan.downscale.stationName} @ ${plan.downscale.stationDistanceKm.toFixed(1)}km  stationT=${plan.downscale.stationTempC}C`);
      console.log(`  grid=${plan.downscale.gridForecastC.toFixed(1)} bias=${plan.downscale.biasCorrectionC.toFixed(2)} uhi=${plan.downscale.uhiDeltaC.toFixed(2)} -> site=${plan.downscale.siteTempC.toFixed(1)}C (delta vs station ${plan.downscale.deltaVsStationC.toFixed(2)})`);
      console.log(`  13:00 site: ${noon.tempC.toFixed(1)}C ${noon.rhPct.toFixed(0)}%RH mrt=${noon.meanRadiantC.toFixed(1)} ehi=${noon.ehi.toFixed(1)} zone=${noon.zone}`);
      console.log(`  peak zone ${plan.peakZone} at ${plan.peakZoneHour}:00  cadence: ${plan.restCadence}`);
      console.log(`  BASELINE 09:00-17:00  peak core ${plan.baseline.strain.peakCoreTempC.toFixed(2)}C  breach ${plan.baseline.strain.breachAtClock !== null ? fmt(plan.baseline.strain.breachAtClock) : "none"}  water ${plan.baseline.strain.totalWaterLossL.toFixed(2)}L  eff ${plan.baseline.ledger.effectiveLabourHours.toFixed(0)}h`);
      console.log(`  KAVACH   ${plan.blocks.map((b) => fmt(b.startMin) + "-" + fmt(b.endMin)).join(" + ") || "(none)"}  peak core ${plan.optimised.strain.peakCoreTempC.toFixed(2)}C  safe=${plan.optimised.strain.safe}  water ${plan.optimised.strain.totalWaterLossL.toFixed(2)}L  eff ${plan.optimised.ledger.effectiveLabourHours.toFixed(0)}h  sop=${plan.optimised.ledger.sopCompliant}`);
      console.log(`  DELTA ${d.deltaHours >= 0 ? "+" : ""}${d.deltaHours.toFixed(0)}h (${d.deltaPct >= 0 ? "+" : ""}${d.deltaPct.toFixed(0)}%)  Rs${d.deltaWageInr.toFixed(0)}`);
      if (plan.notes.length) console.log("  notes:", plan.notes.join(" / "));
    }
  }
}
main().catch((e) => { console.error(e); process.exit(1); });

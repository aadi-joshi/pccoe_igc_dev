import type { Plan, Zone } from "./types";
import { CADENCE_L10N, ZONES } from "./zones";
import { fmt } from "./optimizer";
import { ledgerDelta } from "./plan";

export type Language = "en" | "mr" | "hi";

export const LANGUAGES: { code: Language; label: string; native: string; bcp47: string }[] = [
  { code: "mr", label: "Marathi", native: "मराठी", bcp47: "mr-IN" },
  { code: "hi", label: "Hindi", native: "हिन्दी", bcp47: "hi-IN" },
  { code: "en", label: "English", native: "English", bcp47: "en-IN" },
];

/** The structured facts a briefing is allowed to talk about. */
export interface BriefingFacts {
  siteName: string;
  supervisor: string;
  phone: string;
  date: string;
  zone: Zone;
  zoneLabel: string;
  cadence: string;
  blocks: { start: string; end: string }[];
  rest: { start: string; end: string } | null;
  waterLitres: number;
  workers: number;
  peakCoreTempC: number;
  breachAt: string | null;
  effectiveHoursDelta: number;
  sopCompliant: boolean;
}

export function briefingFacts(plan: Plan): BriefingFacts {
  const delta = ledgerDelta(plan);
  return {
    siteName: plan.site.name,
    supervisor: plan.site.supervisor,
    phone: plan.site.phone,
    date: plan.date,
    zone: plan.peakZone,
    zoneLabel: ZONES[plan.peakZone].label,
    cadence: ZONES[plan.peakZone].cadence,
    blocks: plan.blocks.map((b) => ({ start: fmt(b.startMin), end: fmt(b.endMin) })),
    rest: plan.restWindow
      ? { start: fmt(plan.restWindow.startMin), end: fmt(plan.restWindow.endMin) }
      : null,
    waterLitres: Math.max(
      1,
      Math.round(plan.optimised.strain.totalWaterLossL * 10) / 10,
    ),
    workers: plan.site.workers,
    peakCoreTempC: plan.optimised.strain.peakCoreTempC,
    breachAt:
      plan.baseline.strain.breachAtClock !== null
        ? fmt(plan.baseline.strain.breachAtClock)
        : null,
    effectiveHoursDelta: Math.round(delta.deltaHours),
    sopCompliant: plan.optimised.ledger.sopCompliant,
  };
}

function windows(f: BriefingFacts): string {
  return f.blocks.map((b) => `${b.start}–${b.end}`).join(", ");
}

/** Spoken briefing generated from the finished plan. */
export function renderBriefing(f: BriefingFacts, lang: Language): string {
  const cadence = CADENCE_L10N[f.zone]?.[lang] ?? f.cadence;
  const spans = windows(f);

  if (lang === "mr") {
    const work = f.blocks.length
      ? `फक्त ${spans} या वेळेत काम करा.`
      : "आजच्या उष्णतेत या तीव्रतेचे बाहेरचे काम करू नका.";
    const rest = f.rest
      ? `${f.rest.start} ते ${f.rest.end} सर्व बाहेरचे काम बंद ठेवा. सर्व कामगारांना सावलीत आणि पिण्याच्या पाण्याजवळ ठेवा.`
      : "";
    const breach = f.breachAt
      ? `नेहमीप्रमाणे ०९:०० ते १७:०० काम केल्यास ${f.breachAt} पर्यंत शरीराचे तापमान धोक्याच्या पातळीवर जाईल. हा आराखडा तसे होऊ देत नाही.`
      : "";
    return [
      `${f.supervisor}, ${f.siteName} साठी ${f.date} चा कामाचा आराखडा.`,
      `उष्णतेचा धोका झोन ${f.zone} पर्यंत जाईल. ${work} ${rest}`.trim(),
      `${f.workers} कामगारांसाठी प्रत्येकी किमान ${f.waterLitres} लिटर पिण्याचे पाणी ठेवा. ${cadence}.`,
      breach,
      "क्रूला सांगितल्यावर 'होय' असे उत्तर द्या.",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (lang === "hi") {
    const work = f.blocks.length
      ? `केवल ${spans} के बीच काम करें।`
      : "आज इस तीव्रता का बाहरी काम न करें।";
    const rest = f.rest
      ? `${f.rest.start} से ${f.rest.end} तक सारा बाहरी काम बंद रखें। सभी मज़दूरों को छाया में और पीने का पानी पास रखें।`
      : "";
    const breach = f.breachAt
      ? `सामान्य 09:00–17:00 की पाली में ${f.breachAt} तक शरीर का तापमान ख़तरे की सीमा पार कर जाएगा। यह योजना वैसा नहीं होने देती।`
      : "";
    return [
      `${f.supervisor}, ${f.siteName} की ${f.date} की कार्य योजना।`,
      `गर्मी का ख़तरा ज़ोन ${f.zone} तक जाएगा। ${work} ${rest}`.trim(),
      `${f.workers} मज़दूरों के लिए प्रति व्यक्ति कम से कम ${f.waterLitres} लीटर पीने का पानी रखें। ${cadence}।`,
      breach,
      "क्रू को बता देने के बाद 'हाँ' उत्तर दें।",
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  const work = f.blocks.length
    ? `Work only ${spans}.`
    : "Outdoor work must not be scheduled today at this work intensity.";
  const rest = f.rest
    ? `Stop all outdoor work ${f.rest.start}–${f.rest.end}. Keep every worker in shade with drinking water.`
    : "";
  const breach = f.breachAt
    ? `A normal 09:00–17:00 shift would push body temperature past the safe limit by ${f.breachAt}. This plan does not.`
    : "";

  return [
    `${f.supervisor}, this is the plan for ${f.siteName} on ${f.date}.`,
    `Heat stress reaches Zone ${f.zone}, ${f.zoneLabel.toLowerCase()}. ${work} ${rest}`.trim(),
    `Put at least ${f.waterLitres} litres of drinking water on site for each of the ${f.workers} workers. Rest pattern: ${cadence.toLowerCase()}.`,
    breach,
    "Reply YES once the crew has been briefed.",
  ]
    .filter(Boolean)
    .join("\n\n");
}

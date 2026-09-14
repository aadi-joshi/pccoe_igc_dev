import type { Plan, Zone } from "./types";
import { CADENCE_L10N, ZONES } from "./zones";
import { fmt } from "./optimizer";
import { ledgerDelta } from "./plan";

/**
 * Supervisor briefing.
 *
 * The deterministic renderer below is the safety floor: it is what gets sent
 * if the Nugen aligned model is unavailable. Critically, it is also proof of
 * the architectural claim the pitch makes — the language model never decides
 * anything. Every time, threshold and volume in a briefing comes from the
 * engines. Turn the API key off and the *schedule* is byte-identical; only
 * the phrasing changes.
 */

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

function workLine(f: BriefingFacts, lang: Language): string {
  if (f.blocks.length === 0) {
    return {
      en: "Outdoor work must not be scheduled today at this work intensity.",
      mr: "आजच्या उष्णतेत या तीव्रतेचे बाहेरचे काम करू नका.",
      hi: "आज इस तीव्रता का बाहरी काम न करें।",
    }[lang];
  }
  const spans = f.blocks.map((b) => `${b.start}–${b.end}`).join(", ");
  return {
    en: `Work only ${spans}.`,
    mr: `फक्त ${spans} या वेळेत काम करा.`,
    hi: `केवल ${spans} के बीच काम करें।`,
  }[lang];
}

function restLine(f: BriefingFacts, lang: Language): string | null {
  if (!f.rest) return null;
  return {
    en: `Stop all outdoor work ${f.rest.start}–${f.rest.end}. Keep every worker in shade with drinking water.`,
    mr: `${f.rest.start} ते ${f.rest.end} सर्व बाहेरचे काम बंद ठेवा. सर्व कामगारांना सावलीत आणि पिण्याच्या पाण्याजवळ ठेवा.`,
    hi: `${f.rest.start} से ${f.rest.end} तक सारा बाहरी काम बंद रखें। सभी मज़दूरों को छाया में और पीने का पानी पास रखें।`,
  }[lang];
}

/** Render the briefing deterministically from the engine output. */
export function renderBriefing(f: BriefingFacts, lang: Language): string {
  const lines: string[] = [];

  const header = {
    en: `${f.siteName} — plan for ${f.date}.`,
    mr: `${f.siteName} — ${f.date} चा कामाचा आराखडा.`,
    hi: `${f.siteName} — ${f.date} की कार्य योजना।`,
  }[lang];
  lines.push(header);

  lines.push(
    {
      en: `Heat stress is Zone ${f.zone}, ${f.zoneLabel.toLowerCase()}.`,
      mr: `उष्णतेचा धोका झोन ${f.zone} आहे.`,
      hi: `गर्मी का ख़तरा ज़ोन ${f.zone} है।`,
    }[lang],
  );

  lines.push(workLine(f, lang));
  const rest = restLine(f, lang);
  if (rest) lines.push(rest);

  // Use the localised cadence, not the English one carried in the facts.
  const cadence = CADENCE_L10N[f.zone]?.[lang] ?? f.cadence;
  lines.push(
    {
      en: `Rest cadence: ${cadence.toLowerCase()}.`,
      mr: `${cadence}.`,
      hi: `${cadence}।`,
    }[lang],
  );

  lines.push(
    {
      en: `Provide at least ${f.waterLitres} litres of drinking water per worker for ${f.workers} workers.`,
      mr: `${f.workers} कामगारांसाठी प्रत्येकी किमान ${f.waterLitres} लिटर पिण्याचे पाणी ठेवा.`,
      hi: `${f.workers} मज़दूरों के लिए प्रति व्यक्ति कम से कम ${f.waterLitres} लीटर पीने का पानी रखें।`,
    }[lang],
  );

  if (f.breachAt) {
    lines.push(
      {
        en: `A normal 09:00–17:00 shift would push body temperature past the safe limit by ${f.breachAt}.`,
        mr: `नेहमीप्रमाणे 09:00 ते 17:00 काम केल्यास ${f.breachAt} पर्यंत शरीराचे तापमान धोक्याच्या पातळीवर जाईल.`,
        hi: `सामान्य 09:00–17:00 की पाली में ${f.breachAt} तक शरीर का तापमान ख़तरे की सीमा पार कर जाएगा।`,
      }[lang],
    );
  }

  lines.push(
    {
      en: "Reply YES to confirm you have received this.",
      mr: "हा संदेश मिळाल्याची खात्री करण्यासाठी 'होय' असे उत्तर द्या.",
      hi: "यह संदेश मिलने की पुष्टि के लिए 'हाँ' उत्तर दें।",
    }[lang],
  );

  return lines.join("\n");
}

/** Compact prompt for the Nugen aligned model. Facts only — no free interpretation. */
export function briefingPrompt(f: BriefingFacts, lang: Language): string {
  const langName = { en: "English", mr: "Marathi", hi: "Hindi" }[lang];
  return [
    `You are briefing ${f.supervisor}, a site supervisor, by voice in ${langName}.`,
    "Use ONLY the facts below. Do not add advice, numbers, or times that are not listed.",
    "Write 6 short spoken sentences a person with limited literacy can follow. No preamble.",
    "",
    `Site: ${f.siteName}`,
    `Date: ${f.date}`,
    `Heat stress zone: ${f.zone} (${f.zoneLabel})`,
    `Work windows: ${
      f.blocks.length ? f.blocks.map((b) => `${b.start}-${b.end}`).join(", ") : "none — do not work"
    }`,
    f.rest ? `Mandatory stand-down: ${f.rest.start}-${f.rest.end}` : "",
    `Rest cadence: ${f.cadence}`,
    `Drinking water per worker: ${f.waterLitres} litres`,
    `Workers: ${f.workers}`,
    f.breachAt ? `An unmanaged 09:00-17:00 shift breaches the safe body-temperature limit at ${f.breachAt}` : "",
    `Maharashtra SOP compliant: ${f.sopCompliant ? "yes" : "no"}`,
    "End by asking the supervisor to reply YES to acknowledge.",
  ]
    .filter(Boolean)
    .join("\n");
}

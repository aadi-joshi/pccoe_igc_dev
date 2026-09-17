import type { BriefingFacts, Language } from "./briefing";
import { CADENCE_L10N } from "./zones";

function windows(f: BriefingFacts): string {
  return f.blocks.length
    ? f.blocks.map((b) => `${b.start}–${b.end}`).join(" and ")
    : "";
}

function includesAny(q: string, needles: string[]): boolean {
  return needles.some((n) => q.includes(n));
}

/** Answer a supervisor question using only this site's plan. */
export function answerQuestion(question: string, f: BriefingFacts, lang: Language): string {
  const q = question.trim().toLowerCase();
  if (!q) {
    return {
      en: "Ask about work windows, water, heat zone, or whether the afternoon is safe.",
      mr: "कामाची वेळ, पाणी, उष्णतेचा झोन किंवा दुपारचे काम सुरक्षित आहे का ते विचारा.",
      hi: "काम के समय, पानी, गर्मी के ज़ोन या दोपहर का काम सुरक्षित है या नहीं, पूछें।",
    }[lang];
  }

  const cadence = CADENCE_L10N[f.zone]?.[lang] ?? f.cadence;
  const spans = windows(f);

  const aboutAfternoon = includesAny(q, [
    "afternoon",
    "lunch",
    "noon",
    "12",
    "2pm",
    "2 pm",
    "dophar",
    "dupar",
    "दुपार",
    "दोपहर",
    "मध्यान्ह",
  ]);
  const aboutWater = includesAny(q, ["water", "drink", "litre", "liter", "पाणी", "पानी", "hydration", "ors"]);
  const aboutZone = includesAny(q, ["zone", "danger", "risk", "झोन", "ज़ोन", "जोन", "stress"]);
  const aboutLegal = includesAny(q, [
    "legal",
    "sop",
    "inspector",
    "maharashtra",
    "law",
    "rule",
    "कायद",
    "नियम",
    "कानून",
    "निरीक्षक",
  ]);
  const aboutTemp = includesAny(q, [
    "temp",
    "core",
    "body",
    "38",
    "heat stroke",
    "तापमान",
    "शरीर",
  ]);
  const aboutWhen = includesAny(q, [
    "when",
    "hour",
    "shift",
    "window",
    "work",
    "today",
    "morning",
    "evening",
    "कधी",
    "वेळ",
    "काम",
    "कब",
    "समय",
    "पाली",
  ]);
  const aboutShade = includesAny(q, ["shade", "sun", "सावली", "छाया", "धूप"]);
  const aboutCrew = includesAny(q, ["worker", "crew", "how many", "कामगार", "मज़दूर", "मजदूर"]);

  if (aboutWater) {
    return {
      en: `Keep at least ${f.waterLitres} litres of drinking water per person on site for ${f.workers} workers — that is ${Math.round(f.waterLitres * f.workers)} litres in total.`,
      mr: `${f.workers} कामगारांसाठी प्रत्येकी किमान ${f.waterLitres} लिटर पाणी ठेवा. एकूण सुमारे ${Math.round(f.waterLitres * f.workers)} लिटर.`,
      hi: `${f.workers} मज़दूरों के लिए प्रति व्यक्ति कम से कम ${f.waterLitres} लीटर पानी रखें। कुल लगभग ${Math.round(f.waterLitres * f.workers)} लीटर।`,
    }[lang];
  }

  if (aboutAfternoon) {
    if (f.rest) {
      return {
        en: `No. All outdoor work stops ${f.rest.start}–${f.rest.end}. Send the crew to shade with water. Work resumes ${f.blocks[1] ? `at ${f.blocks[1].start}` : "in the evening window"}.`,
        mr: `नाही. ${f.rest.start} ते ${f.rest.end} सर्व बाहेरचे काम बंद. सावलीत पाण्याजवळ ठेवा. ${f.blocks[1] ? `${f.blocks[1].start} वाजता काम पुन्हा सुरू.` : ""}`.trim(),
        hi: `नहीं। ${f.rest.start} से ${f.rest.end} तक बाहरी काम बंद रखें। छाया में पानी के साथ भेजें। ${f.blocks[1] ? `${f.blocks[1].start} पर काम फिर शुरू होगा।` : ""}`.trim(),
      }[lang];
    }
    if (!f.blocks.length) {
      return {
        en: "No outdoor work should be scheduled today at this intensity.",
        mr: "आज या तीव्रतेचे बाहेरचे काम करू नका.",
        hi: "आज इस तीव्रता का बाहरी काम न करें।",
      }[lang];
    }
    return {
      en: `The allowed windows today are ${spans}. Stay inside those hours.`,
      mr: `आजच्या परवानगीच्या वेळा ${spans} आहेत. त्यातच रहा.`,
      hi: `आज की अनुमति वाली पाली ${spans} है। इन्हीं घंटों में काम करें।`,
    }[lang];
  }

  if (aboutLegal) {
    return {
      en: f.sopCompliant
        ? "Yes. This schedule stays inside Maharashtra's outdoor-work rule: early morning and late afternoon, nothing through the midday heat."
        : "This schedule steps outside Maharashtra's outdoor-work windows. Prefer 06:00–11:00 and 16:00–20:00 if an inspector is expected.",
      mr: f.sopCompliant
        ? "होय. हा आराखडा महाराष्ट्राच्या उष्णतेच्या नियमात बसतो — सकाळी लवकर आणि संध्याकाळी, मध्यान्ही काम नाही."
        : "हा आराखडा महाराष्ट्राच्या बाह्य-काम वेळेबाहेर जातो. निरीक्षक अपेक्षित असल्यास ०६:००–११:०० आणि १६:००–२०:०० ठेवा.",
      hi: f.sopCompliant
        ? "हाँ। यह पाली महाराष्ट्र के बाहरी-काम नियम में रहती है — सुबह जल्दी और शाम, दोपहर की गर्मी में काम नहीं।"
        : "यह पाली महाराष्ट्र की निर्धारित खिड़कियों से बाहर जाती है। निरीक्षक आने वाले हों तो 06:00–11:00 और 16:00–20:00 रखें।",
    }[lang];
  }

  if (aboutTemp) {
    const extra = f.breachAt
      ? {
          en: ` A straight 09:00–17:00 day would cross the 38.5 °C limit by ${f.breachAt}.`,
          mr: ` नेहमीची ०९:००–१७:०० पाली ${f.breachAt} पर्यंत ३८.५ °C ओलांडेल.`,
          hi: ` सामान्य 09:00–17:00 की पाली ${f.breachAt} तक 38.5 °C पार कर देगी.`,
        }[lang]
      : "";
    return {
      en: `On this plan, predicted peak core temperature is ${f.peakCoreTempC.toFixed(1)} °C, under the 38.5 °C limit.${extra}`,
      mr: `या आराखड्यावर अपेक्षित सर्वोच्च शरीराचे तापमान ${f.peakCoreTempC.toFixed(1)} °C आहे — ३८.५ च्या मर्यादेच्या आत.${extra}`,
      hi: `इस योजना पर अनुमानित अधिकतम शरीर तापमान ${f.peakCoreTempC.toFixed(1)} °C है, 38.5 °C की सीमा के अंदर.${extra}`,
    }[lang];
  }

  if (aboutZone) {
    return {
      en: `Peak heat stress is Zone ${f.zone} — ${f.zoneLabel.toLowerCase()}. Rest pattern: ${cadence.toLowerCase()}.`,
      mr: `उष्णतेचा सर्वोच्च धोका झोन ${f.zone} आहे. ${cadence}.`,
      hi: `गर्मी का अधिकतम ख़तरा ज़ोन ${f.zone} है। ${cadence}।`,
    }[lang];
  }

  if (aboutShade) {
    return {
      en: f.rest
        ? `During ${f.rest.start}–${f.rest.end} every worker stays in shade. Work windows themselves are planned for the cooler hours.`
        : "Keep a shaded rest area and water at the gate through the whole shift.",
      mr: f.rest
        ? `${f.rest.start} ते ${f.rest.end} प्रत्येक कामगार सावलीत राहील. कामाच्या खिडक्या थंड वेळेसाठी ठेवल्या आहेत.`
        : "पूर्ण पालित सावलीची विश्रांती जागा आणि पाणी गेटवर ठेवा.",
      hi: f.rest
        ? `${f.rest.start} से ${f.rest.end} तक हर मज़दूर छाया में रहे। काम की खिड़कियाँ ठंडे घंटों के लिए बनाई गई हैं।`
        : "पूरी पाली छाया वाली आराम जगह और पानी गेट पर रखें।",
    }[lang];
  }

  if (aboutCrew) {
    return {
      en: `${f.workers} workers are rostered at ${f.siteName} today, under ${f.supervisor}.`,
      mr: `आज ${f.siteName} वर ${f.workers} कामगार आहेत. पर्यवेक्षक ${f.supervisor}.`,
      hi: `आज ${f.siteName} पर ${f.workers} मज़दूर हैं। पर्यवेक्षक ${f.supervisor}।`,
    }[lang];
  }

  if (aboutWhen || q.length < 48) {
    if (!f.blocks.length) {
      return {
        en: "Do not schedule outdoor work today at this intensity. Drop the workload or move the crew into shade.",
        mr: "आज या तीव्रतेचे बाहेरचे काम करू नका. काम हलके करा किंवा सावलीत हलवा.",
        hi: "आज इस तीव्रता का बाहरी काम न करें। काम हल्का करें या छाया में ले जाएँ।",
      }[lang];
    }
    const rest = f.rest
      ? {
          en: ` Stand down ${f.rest.start}–${f.rest.end}.`,
          mr: ` ${f.rest.start} ते ${f.rest.end} काम बंद.`,
          hi: ` ${f.rest.start} से ${f.rest.end} काम बंद।`,
        }[lang]
      : "";
    return {
      en: `Yes — work ${spans}.${rest} Zone ${f.zone}. ${cadence}.`,
      mr: `होय — ${spans} काम करा.${rest} झोन ${f.zone}. ${cadence}.`,
      hi: `हाँ — ${spans} काम करें।${rest} ज़ोन ${f.zone}। ${cadence}।`,
    }[lang];
  }

  return {
    en: `Plan for ${f.siteName}: work ${spans || "is not scheduled"}, Zone ${f.zone}, ${f.waterLitres} L water per worker.`,
    mr: `${f.siteName} चा आराखडा: ${spans || "काम नाही"}, झोन ${f.zone}, प्रत्येकी ${f.waterLitres} लिटर पाणी.`,
    hi: `${f.siteName} की योजना: ${spans || "काम नहीं"}, ज़ोन ${f.zone}, प्रति व्यक्ति ${f.waterLitres} लीटर पानी।`,
  }[lang];
}

export const SUGGESTED_QUESTIONS: Record<Language, string[]> = {
  en: [
    "Can we work after lunch?",
    "How much water do I need?",
    "Is this legal?",
  ],
  mr: ["दुपारी काम करू का?", "किती पाणी ठेवायचे?", "हे कायदेशीर आहे का?"],
  hi: ["दोपहर के बाद काम करें?", "कितना पानी रखना है?", "क्या यह नियम के अंदर है?"],
};

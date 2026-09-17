import Link from "next/link";
import type { Metadata } from "next";
import { GLOSSARY } from "@/lib/glossary";
import { ZONES } from "@/lib/zones";
import { Chrome } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "A plain-English explanation of how KAVACH turns heat forecasts into a work schedule.",
};

/**
 * The long-form explainer.
 *
 * The console shows the working; this page explains why the working looks
 * like that, for someone who has never met an occupational heat index. It is
 * written for a curious newcomer, not for a domain expert — no equations, and
 * every technical term is unpacked the first time it appears.
 */

const STAGES = [
  {
    n: 1,
    title: "Start with real measurements",
    lede: "Roughly 780 weather stations across India already report how dangerous the heat is for people doing physical work.",
    body: [
      "A service called SHRAM, built by UC Berkeley's India Energy & Climate Centre, publishes this for free and updates it through the day. It does not just report temperature — it reports a danger rating that accounts for humidity, sun, and how hard the job is.",
      "KAVACH reads that feed. We do not try to replace it, and we do not pretend we measured the weather ourselves. It is the ground truth everything else is anchored to.",
    ],
  },
  {
    n: 2,
    title: "Work out what it is like at the actual site",
    lede: "A weather station four kilometres away does not describe a concrete building site with no shade.",
    body: [
      "Built-up ground, dark surfaces and missing tree cover can add several degrees. That gap matters enormously, because the sites that run hottest tend to be exactly the ones where people are doing the heaviest work.",
      "So we combine three things: a weather forecast for the site's own coordinates, a live accuracy check against the nearest real station, and an adjustment for what the ground around the site is made of.",
      "We are open about which part is weakest. The first two are live data and a standard correction used in weather forecasting. The third uses published research figures rather than measurements taken at these sites, because those measurements do not exist yet.",
    ],
  },
  {
    n: 3,
    title: "Simulate what the day does to a person",
    lede: "This is the part no heat dashboard does, and it is the heart of the system.",
    body: [
      "There is an international standard — ISO 7933 — for calculating how much heat strain a job puts on a human body. It accounts for the heat a body generates by working, the heat it gains from sun and hot air, and the heat it can shed by sweating.",
      "We run that calculation once per minute across the whole shift, and track the one number that actually decides whether someone is safe: the temperature deep inside their body. It normally sits near 37 °C. Past 38.5 °C, the risk of heat exhaustion and heat stroke climbs steeply.",
      "The result is not a warning label. It is a specific prediction: this worker, doing this job, at this site, crosses the safe limit at 12:20.",
    ],
  },
  {
    n: 4,
    title: "Build the schedule around that limit",
    lede: "Then search for the working day that gets the most done without anyone crossing the line.",
    body: [
      "The system tries thousands of possible shift patterns, simulates each one, and throws away every schedule that breaches a physiological limit. Among the survivors it picks the one that delivers the most actual work.",
      "It also has to obey Maharashtra's rule for outdoor work during heat alerts — work early and late, avoid the middle of the day — because a schedule a labour inspector rejects is worth nothing to a contractor.",
    ],
  },
  {
    n: 5,
    title: "Say it in a language the supervisor uses",
    lede: "A plan written in English on a dashboard nobody opens is not a plan.",
    body: [
      "The finished schedule is turned into a short spoken briefing in Marathi, Hindi or English, and read aloud. It is sent to the supervisor's phone; they confirm, and the municipal ledger records it.",
      "The briefing only uses times, temperatures and water volumes the engines already calculated. It cannot invent a work window or change a safety limit.",
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <Chrome wide={false}>
      <main className="mx-auto max-w-[860px] px-5 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-[34px] leading-tight sm:text-[40px]">
          How KAVACH works
        </h1>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          India loses an estimated <strong className="text-[var(--color-ink)]">$78 billion a year</strong> in
          wages to heat, and around 380 million people work in it. The data describing that
          heat already exists and is very good. What has been missing is anything that turns
          it into a decision a site supervisor can act on before the crew arrives.
        </p>
        <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          KAVACH answers one question —{" "}
          <strong className="text-[var(--color-ink)]">
            can this crew work outdoors today, and when?
          </strong>{" "}
          Here is how it gets there, in five steps and no equations.
        </p>

        <ol className="mt-10 space-y-9">
          {STAGES.map((s) => (
            <li key={s.n}>
              <div className="flex items-baseline gap-3">
                <span
                  aria-hidden
                  className="tnum flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-[12px] text-[var(--color-paper)]"
                >
                  {s.n}
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-[21px] leading-snug">
                  {s.title}
                </h2>
              </div>
              <p className="ml-[38px] mt-2 max-w-[62ch] text-[14px] font-medium leading-relaxed">
                {s.lede}
              </p>
              {s.body.map((p, i) => (
                <p
                  key={i}
                  className="ml-[38px] mt-3 max-w-[62ch] text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]"
                >
                  {p}
                </p>
              ))}
            </li>
          ))}
        </ol>

        {/* ---- Zones ---- */}
        <section className="mt-12 border-t border-[var(--color-rule)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-[22px]">
            The danger scale
          </h2>
          <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
            Every colour on the console comes from this 1-to-6 scale. The important column
            is the last one: in severe heat, most of each hour has to be spent resting, so
            an hour on site stops being an hour of work.
          </p>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-rule-strong)]">
                  <th className="label pb-2 pr-4 font-normal">Zone</th>
                  <th className="label pb-2 pr-4 font-normal">Means</th>
                  <th className="label pb-2 pr-4 font-normal">Work pattern</th>
                  <th className="label pb-2 font-normal">Usable work</th>
                </tr>
              </thead>
              <tbody>
                {([1, 2, 3, 4, 5, 6] as const).map((z) => (
                  <tr key={z} className="border-b border-[var(--color-rule)]">
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span
                          aria-hidden
                          className="inline-block h-3 w-3 rounded-[3px]"
                          style={{ background: ZONES[z].colorVar }}
                        />
                        <span className="tnum text-[13px]">{z}</span>
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-[13px]">{ZONES[z].label}</td>
                    <td className="py-2.5 pr-4 text-[13px] text-[var(--color-ink-muted)]">
                      {ZONES[z].cadence}
                    </td>
                    <td className="tnum py-2.5 text-[13px]">
                      {Math.round(ZONES[z].workFraction * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ---- Glossary ---- */}
        <section className="mt-12 border-t border-[var(--color-rule)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-[22px]">
            Every term, in plain English
          </h2>
          <p className="mt-2 max-w-[62ch] text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
            These are the same definitions that appear when you hover an underlined word in
            the console.
          </p>
          <dl className="mt-5 space-y-5">
            {Object.entries(GLOSSARY).map(([key, entry]) => (
              <div key={key} className="border-l-2 border-[var(--color-rule)] pl-4">
                <dt className="text-[13.5px] font-semibold">{TERM_TITLES[key] ?? key}</dt>
                <dd className="mt-1 max-w-[62ch] text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
                  {entry.body}
                  {entry.example && (
                    <span className="mt-1.5 block text-[var(--color-ink-faint)]">
                      {entry.example}
                    </span>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className="mt-12 border-t border-[var(--color-rule)] pt-6">
          <Link
            href="/console"
            className="inline-flex items-center rounded-full bg-[var(--color-ink)] px-4 py-2 text-[13px] font-medium text-[var(--color-paper)] transition-opacity hover:opacity-85"
          >
            Open the console
          </Link>
          <p className="mt-5 max-w-[62ch] text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
            Heat readings come from SHRAM (India Energy &amp; Climate Centre, UC Berkeley)
            and forecasts from Open-Meteo. The physiological simulation follows ISO 7933.
            The site estimation, scheduling and productivity model are ours.
          </p>
        </footer>
      </main>
    </Chrome>
  );
}

/** Human-readable headings for the glossary keys. */
const TERM_TITLES: Record<string, string> = {
  met: "Work intensity (MET)",
  zone: "Heat stress zone",
  ehi: "Heat index for workers",
  coreTemp: "Core body temperature",
  iso7933: "ISO 7933",
  effectiveHours: "Real work delivered",
  downscaling: "Site-level estimation",
  biasCorrection: "Live accuracy check",
  uhi: "Urban heat island",
  skyView: "Sky view factor",
  sop: "Maharashtra work rule",
  cadence: "Work and rest pattern",
  sweatLoss: "Sweat and water needed",
  standDown: "Stand-down",
  shram: "SHRAM",
  unmanaged: "A normal day",
  briefing: "The briefing",
  meanRadiant: "Radiant heat",
};

import Link from "next/link";
import { Chrome } from "@/components/Chrome";
import { LiveStats } from "@/components/LiveStats";
import { SITES, SITE_KIND_LABEL } from "@/lib/sites";

export default function HomePage() {
  return (
    <Chrome>
      <main>
        <section className="border-b border-[var(--color-rule)]">
          <div className="mx-auto max-w-[860px] px-5 py-14 sm:py-20">
            <p className="label">Occupational heat · Pune pilot</p>
            <h1 className="mt-3 font-[family-name:var(--font-display)] text-[40px] leading-[1.1] sm:text-[52px]">
              Can this crew work outdoors today?
            </h1>
            <p className="mt-5 max-w-[58ch] text-[16px] leading-relaxed text-[var(--color-ink-muted)]">
              KAVACH turns a heat forecast into a shift plan for a specific work
              site — by simulating what the day will do to a worker&rsquo;s body,
              then scheduling around it. No sensors. No hardware. A supervisor
              gets the answer before the crew arrives.
            </p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link
                href="/console"
                className="inline-flex items-center rounded-full bg-[var(--color-ink)] px-5 py-2.5 text-[13.5px] font-medium text-[var(--color-paper)] transition-opacity hover:opacity-85"
              >
                Open supervisor console
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center rounded-full border border-[var(--color-rule-strong)] px-5 py-2.5 text-[13.5px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-sunk)]"
              >
                How it works
              </Link>
            </div>
            <LiveStats />
          </div>
        </section>

        <section className="border-b border-[var(--color-rule)]">
          <div className="mx-auto max-w-[860px] px-5 py-12">
            <h2 className="font-[family-name:var(--font-display)] text-[24px]">
              What arrives at 5:30 AM
            </h2>
            <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
              Not a red map. A decision: work windows, a stand-down, drinking water
              per person, and a spoken briefing in Marathi or Hindi.
            </p>
            <ol className="mt-8 space-y-6">
              {[
                {
                  n: "1",
                  t: "Estimate the site",
                  d: "A station four kilometres away does not describe a concrete site with no shade. KAVACH downscales the forecast to the gate.",
                },
                {
                  n: "2",
                  t: "Simulate a worker",
                  d: "ISO 7933 steps a whole-body heat balance every minute and predicts when core temperature would cross 38.5 °C.",
                },
                {
                  n: "3",
                  t: "Build the shift",
                  d: "Search thousands of schedules, discard any that breach a physiological limit, keep the one that delivers the most real work.",
                },
                {
                  n: "4",
                  t: "Speak it",
                  d: "The plan is read to the supervisor. They confirm. The municipal ledger records who was briefed.",
                },
              ].map((s) => (
                <li key={s.n} className="flex gap-4">
                  <span
                    aria-hidden
                    className="tnum mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-[var(--color-ink)] text-[12px] text-[var(--color-paper)]"
                  >
                    {s.n}
                  </span>
                  <div>
                    <div className="text-[15px] font-semibold">{s.t}</div>
                    <p className="mt-1 max-w-[58ch] text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
                      {s.d}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-[860px] px-5 py-12">
            <h2 className="font-[family-name:var(--font-display)] text-[24px]">
              Pune sites on the desk
            </h2>
            <p className="mt-2 max-w-[62ch] text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
              Construction, NREGA and street-vendor stretches. Open any of them
              and the plan recomputes for that crew.
            </p>
            <ul className="mt-6 divide-y divide-[var(--color-rule)] border-y border-[var(--color-rule)]">
              {SITES.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                  <div>
                    <div className="text-[14px] font-medium">{s.name}</div>
                    <div className="mt-0.5 text-[12px] text-[var(--color-ink-muted)]">
                      {SITE_KIND_LABEL[s.kind]} · {s.locality} · {s.workers} workers
                    </div>
                  </div>
                  <Link
                    href={`/console?site=${s.id}`}
                    className="rounded-full border border-[var(--color-rule-strong)] px-3.5 py-1.5 text-[12px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-sunk)]"
                  >
                    Today&rsquo;s plan
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-10 max-w-[62ch] text-[12px] leading-relaxed text-[var(--color-ink-faint)]">
              Heat readings from SHRAM (India Energy &amp; Climate Centre, UC Berkeley).
              Forecasts from Open-Meteo. Physiology follows ISO 7933. Site estimation,
              scheduling and the productivity ledger are KAVACH.
            </p>
          </div>
        </section>
      </main>
    </Chrome>
  );
}

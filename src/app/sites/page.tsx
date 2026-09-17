import Link from "next/link";
import type { Metadata } from "next";
import { Chrome } from "@/components/Chrome";
import { SITES, SITE_KIND_LABEL } from "@/lib/sites";
import { MET_LABEL } from "@/lib/zones";

export const metadata: Metadata = {
  title: "Sites",
  description: "Registered Pune work sites on the KAVACH desk.",
};

export default function SitesPage() {
  return (
    <Chrome>
      <main className="mx-auto max-w-[860px] px-5 py-10">
        <h1 className="font-[family-name:var(--font-display)] text-[34px] leading-tight">
          Registered sites
        </h1>
        <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
          Five Pune locations. Each has a land-cover profile, a crew, a supervisor
          and a phone number the morning briefing is sent to.
        </p>

        <ul className="mt-8 space-y-3">
          {SITES.map((s) => (
            <li
              key={s.id}
              className="rounded-[12px] border border-[var(--color-rule)] bg-[var(--color-paper-raised)] px-5 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-[16px] font-semibold">{s.name}</h2>
                  <p className="mt-0.5 text-[12.5px] text-[var(--color-ink-muted)]">
                    {SITE_KIND_LABEL[s.kind]} · {s.locality}
                  </p>
                </div>
                <Link
                  href={`/console?site=${s.id}`}
                  className="rounded-full bg-[var(--color-ink)] px-3.5 py-1.5 text-[12px] font-medium text-[var(--color-paper)]"
                >
                  Open plan
                </Link>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-[12.5px] sm:grid-cols-4">
                <Item k="Supervisor" v={s.supervisor} />
                <Item k="Phone" v={s.phone} />
                <Item k="Crew" v={`${s.workers} workers`} />
                <Item k="Work" v={MET_LABEL[s.metLevel]} />
              </dl>
              <p className="tnum mt-3 text-[11px] text-[var(--color-ink-faint)]">
                {s.lat.toFixed(4)} N · {s.lon.toFixed(4)} E · built-up{" "}
                {Math.round(s.profile.builtUpFraction * 100)}% · canopy{" "}
                {Math.round(s.profile.greenFraction * 100)}%
              </p>
            </li>
          ))}
        </ul>
      </main>
    </Chrome>
  );
}

function Item({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="label mb-1">{k}</dt>
      <dd>{v}</dd>
    </div>
  );
}

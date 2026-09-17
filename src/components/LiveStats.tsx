"use client";

import { useEffect, useState } from "react";

export function LiveStats() {
  const [stations, setStations] = useState(786);
  const [pune, setPune] = useState(17);
  const [sites, setSites] = useState(5);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/status")
      .then((r) => r.json())
      .then((d: { stations?: number; pune?: number; sites?: number }) => {
        if (cancelled) return;
        if (typeof d.stations === "number" && d.stations > 0) setStations(d.stations);
        if (typeof d.pune === "number" && d.pune > 0) setPune(d.pune);
        if (typeof d.sites === "number" && d.sites > 0) setSites(d.sites);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Stat k="Stations" v={String(stations)} n="live occupational heat feed" />
      <Stat k="In Pune" v={String(pune)} n="district weather stations" />
      <Stat k="Pilot sites" v={String(sites)} n="construction, NREGA, vendors" />
      <Stat k="Hardware" v="None" n="coordinates in, plan out" />
    </dl>
  );
}

function Stat({ k, v, n }: { k: string; v: string; n: string }) {
  return (
    <div className="border-t border-[var(--color-rule)] pt-3">
      <dt className="label">{k}</dt>
      <dd className="tnum mt-1.5 font-[family-name:var(--font-display)] text-[28px] leading-none">
        {v}
      </dd>
      <dd className="mt-1.5 text-[11.5px] text-[var(--color-ink-muted)]">{n}</dd>
    </div>
  );
}

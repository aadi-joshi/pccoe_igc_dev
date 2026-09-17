"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Chrome } from "@/components/Chrome";
import { Pill } from "@/components/ui";
import { readLedger, type ComplianceRow, type DispatchStatus } from "@/lib/compliance";

type Filter = "all" | DispatchStatus;

export default function LedgerPage() {
  const [rows, setRows] = useState<ComplianceRow[]>([]);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const load = () => setRows(readLedger());
    load();
    window.addEventListener("kavach:ledger", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("kavach:ledger", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const visible = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.status === filter)),
    [rows, filter],
  );

  const confirmed = rows.filter((r) => r.status === "confirmed").length;
  const pending = rows.filter((r) => r.status !== "confirmed").length;

  const exportCsv = () => {
    const header = "Date,Site,Locality,Supervisor,Phone,Windows,Zone,Status,Sent,Confirmed\n";
    const body = visible
      .map((r) =>
        [
          r.date,
          csv(r.siteName),
          csv(r.locality),
          csv(r.supervisor),
          csv(r.phone),
          csv(r.windows),
          r.zone,
          r.status,
          r.sentAt,
          r.confirmedAt ?? "",
        ].join(","),
      )
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kavach-compliance.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Chrome>
      <main className="mx-auto max-w-[1100px] px-5 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-[34px] leading-tight">
              Compliance ledger
            </h1>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-relaxed text-[var(--color-ink-muted)]">
              Which sites were briefed, which supervisors confirmed. Built for a
              municipal labour officer who currently has no way to see this.
            </p>
          </div>
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-full border border-[var(--color-rule-strong)] px-4 py-2 text-[12.5px] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-paper-sunk)]"
          >
            Export CSV
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Pill tone="ok">{confirmed} confirmed</Pill>
          <Pill tone={pending ? "warn" : "neutral"}>{pending} awaiting confirmation</Pill>
          <div className="ml-auto flex gap-1">
            {(["all", "confirmed", "delivered", "queued"] as Filter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-[12px] ${
                  filter === f
                    ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                    : "text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-sunk)]"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[var(--color-rule-strong)]">
                <th className="label pb-2 pr-3 font-normal">Date</th>
                <th className="label pb-2 pr-3 font-normal">Site</th>
                <th className="label pb-2 pr-3 font-normal">Supervisor</th>
                <th className="label pb-2 pr-3 font-normal">Windows</th>
                <th className="label pb-2 pr-3 font-normal">Zone</th>
                <th className="label pb-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id} className="border-b border-[var(--color-rule)]">
                  <td className="tnum py-2.5 pr-3 text-[13px]">{r.date}</td>
                  <td className="py-2.5 pr-3 text-[13px]">
                    <Link href={`/console?site=${r.siteId}`} className="hover:underline">
                      {r.siteName}
                    </Link>
                    <div className="text-[11px] text-[var(--color-ink-faint)]">{r.locality}</div>
                  </td>
                  <td className="py-2.5 pr-3 text-[13px]">
                    {r.supervisor}
                    <div className="tnum text-[11px] text-[var(--color-ink-faint)]">{r.phone}</div>
                  </td>
                  <td className="tnum py-2.5 pr-3 text-[12.5px] text-[var(--color-ink-muted)]">
                    {r.windows}
                  </td>
                  <td className="tnum py-2.5 pr-3 text-[13px]">{r.zone}</td>
                  <td className="py-2.5 text-[13px]">
                    <Pill tone={r.status === "confirmed" ? "ok" : r.status === "delivered" ? "neutral" : "warn"}>
                      {r.status}
                    </Pill>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </Chrome>
  );
}

function csv(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

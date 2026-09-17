import type { Zone } from "./types";
import { SITES } from "./sites";

export type DispatchStatus = "queued" | "delivered" | "confirmed";

export interface ComplianceRow {
  id: string;
  siteId: string;
  siteName: string;
  locality: string;
  supervisor: string;
  phone: string;
  date: string;
  windows: string;
  zone: Zone;
  status: DispatchStatus;
  sentAt: string;
  confirmedAt: string | null;
  lang: string;
}

export const COMPLIANCE_KEY = "kavach.compliance.v1";

function isoDate(offsetDays: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function atHour(date: string, hour: number, minute: number): string {
  return new Date(`${date}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+05:30`).toISOString();
}

/** Opening ledger so the compliance desk is populated on first visit. */
export function seedLedger(): ComplianceRow[] {
  const yesterday = isoDate(-1);
  const prior = isoDate(-2);
  const rows: ComplianceRow[] = [];

  SITES.forEach((site, i) => {
    rows.push({
      id: `${site.id}:${yesterday}`,
      siteId: site.id,
      siteName: site.name,
      locality: site.locality,
      supervisor: site.supervisor,
      phone: site.phone,
      date: yesterday,
      windows: "06:00–10:00, 16:00–20:00",
      zone: (site.metLevel >= 5 ? 5 : 4) as Zone,
      status: "confirmed",
      sentAt: atHour(yesterday, 5, 28 + i),
      confirmedAt: atHour(yesterday, 5, 41 + i),
      lang: i % 2 === 0 ? "mr" : "hi",
    });
  });

  SITES.slice(0, 4).forEach((site, i) => {
    rows.push({
      id: `${site.id}:${prior}`,
      siteId: site.id,
      siteName: site.name,
      locality: site.locality,
      supervisor: site.supervisor,
      phone: site.phone,
      date: prior,
      windows: i === 2 ? "06:00–11:00" : "06:00–10:00, 16:00–20:00",
      zone: (3 + (i % 3)) as Zone,
      status: i === 3 ? "delivered" : "confirmed",
      sentAt: atHour(prior, 5, 22 + i * 3),
      confirmedAt: i === 3 ? null : atHour(prior, 5, 36 + i * 3),
      lang: "mr",
    });
  });

  return rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.siteName.localeCompare(b.siteName)));
}

export function readLedger(): ComplianceRow[] {
  if (typeof window === "undefined") return seedLedger();
  try {
    const raw = window.localStorage.getItem(COMPLIANCE_KEY);
    if (!raw) {
      const seed = seedLedger();
      window.localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw) as ComplianceRow[];
    return Array.isArray(parsed) ? parsed : seedLedger();
  } catch {
    return seedLedger();
  }
}

export function writeLedger(rows: ComplianceRow[]): void {
  try {
    window.localStorage.setItem(COMPLIANCE_KEY, JSON.stringify(rows));
    window.dispatchEvent(new Event("kavach:ledger"));
  } catch {
    // private browsing — in-memory only for this session
  }
}

export function upsertRow(row: ComplianceRow): ComplianceRow[] {
  const rows = readLedger();
  const idx = rows.findIndex((r) => r.id === row.id);
  if (idx >= 0) rows[idx] = row;
  else rows.unshift(row);
  writeLedger(rows);
  return rows;
}

export function rowId(siteId: string, date: string): string {
  return `${siteId}:${date}`;
}

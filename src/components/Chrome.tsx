"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/console", label: "Console" },
  { href: "/sites", label: "Sites" },
  { href: "/ledger", label: "Compliance" },
  { href: "/how-it-works", label: "How it works" },
];

export function Chrome({
  children,
  actions,
  wide = true,
}: {
  children: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-rule)] bg-[var(--color-paper-raised)]">
        <div
          className={`mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-5 ${
            wide ? "max-w-[1400px]" : "max-w-[860px]"
          }`}
        >
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Link
              href="/"
              className="font-[family-name:var(--font-display)] text-[20px] font-semibold tracking-[0.06em]"
            >
              KAVACH
            </Link>
            <nav className="flex flex-wrap items-center gap-1">
              {LINKS.map((l) => {
                const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={`rounded-full px-3 py-1.5 text-[12.5px] transition-colors ${
                      active
                        ? "bg-[var(--color-ink)] text-[var(--color-paper)]"
                        : "text-[var(--color-ink-muted)] hover:bg-[var(--color-paper-sunk)]"
                    }`}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
      </header>
      {children}
    </div>
  );
}

import Link from "next/link";
import { Chrome } from "@/components/Chrome";

export default function NotFound() {
  return (
    <Chrome>
      <main className="mx-auto max-w-[640px] px-5 py-20">
        <p className="label">404</p>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-[34px] leading-tight">
          That page is not on the desk
        </h1>
        <p className="mt-3 text-[14.5px] text-[var(--color-ink-muted)]">
          The supervisor console, site registry and compliance ledger are still here.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link
            href="/console"
            className="rounded-full bg-[var(--color-ink)] px-4 py-2 text-[13px] font-medium text-[var(--color-paper)]"
          >
            Open console
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--color-rule-strong)] px-4 py-2 text-[13px] text-[var(--color-ink-muted)]"
          >
            Home
          </Link>
        </div>
      </main>
    </Chrome>
  );
}

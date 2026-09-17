export default function ConsoleLoading() {
  return (
    <div className="min-h-screen">
      <div className="border-b border-[var(--color-rule)] bg-[var(--color-paper-raised)] px-5 py-3.5">
        <div className="mx-auto max-w-[1400px] text-[13px] text-[var(--color-ink-muted)]">
          Building today&rsquo;s plan…
        </div>
      </div>
      <div className="mx-auto max-w-[1400px] px-5 py-10">
        <div className="h-8 w-64 bg-[var(--color-paper-sunk)]" />
        <div className="mt-4 h-24 bg-[var(--color-paper-sunk)]" />
        <div className="mt-4 h-64 bg-[var(--color-paper-sunk)]" />
      </div>
    </div>
  );
}

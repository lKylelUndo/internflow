const RECORD_ROWS = [0, 1, 2, 3]
const STATUS_ROWS = [0, 1, 2]
const NEXT_STEP_ROWS = [0, 1, 2, 3]

/**
 * Server-rendered Suspense fallback that holds the same two-column shape as
 * the live dashboard: account record on the left, workspace on the right.
 */
export function DashboardSkeleton() {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading your record">
      <div className="h-px w-16 bg-[var(--cpc-gold-line)]" />
      <div className="mt-5 h-3 w-24 rounded bg-[var(--muted)]" />
      <div className="mt-4 h-8 w-72 max-w-full rounded-md bg-[var(--muted)]" />
      <div className="mt-4 h-4 w-full max-w-xl rounded bg-[var(--muted)]" />

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-card lg:col-span-7">
          <div className="navy-surface flex items-center gap-4 px-6 py-6">
            <div className="h-16 w-16 shrink-0 rounded-full bg-[var(--cpc-on-navy)]/10" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-40 max-w-full rounded bg-[var(--cpc-on-navy)]/20" />
              <div className="mt-2 h-3 w-56 max-w-full rounded bg-[var(--cpc-on-navy)]/10" />
            </div>
          </div>
          <div className="border-b border-[var(--border)] sm:grid sm:grid-cols-2">
            {RECORD_ROWS.map((row) => (
              <div key={row} className="min-w-0 border-t border-[var(--border)] px-6 py-4 sm:even:border-l">
                <div className="h-3 w-20 rounded bg-[var(--muted)]" />
                <div className="mt-2 h-4 w-40 max-w-full rounded bg-[var(--muted)]" />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)] bg-card lg:col-span-5">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <div className="h-5 w-28 rounded bg-[var(--muted)]" />
          </div>
          <div className="px-6 py-2">
            {STATUS_ROWS.map((row) => (
              <div key={row} className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3 last:border-b-0">
                <div className="h-3 w-20 rounded bg-[var(--muted)]" />
                <div className="h-3 w-24 rounded bg-[var(--muted)]" />
              </div>
            ))}
          </div>
          <div className="border-t border-[var(--border)] px-6 pb-6 pt-5">
            <div className="h-3 w-36 rounded bg-[var(--muted)]" />
            <ul className="mt-4 space-y-4">
              {NEXT_STEP_ROWS.map((row) => (
                <li key={row} className="border-t border-[var(--cpc-gold-line)] pt-4">
                  <div className="h-4 w-40 max-w-full rounded bg-[var(--muted)]" />
                  <div className="mt-2 h-3 w-full rounded bg-[var(--muted)]" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

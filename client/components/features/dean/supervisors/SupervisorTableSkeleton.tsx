import { Skeleton } from "@/components/ui/skeleton"

const ROWS = [0, 1, 2, 3]

const COLUMNS = [
  { label: "Supervisor", width: "w-28" },
  { label: "Company", width: "w-24" },
  { label: "Contact", width: "w-20" },
  { label: "Added", width: "w-16" },
  { label: "Status", width: "w-20" },
  { label: "Actions", width: "w-24" },
] as const

/**
 * Server-safe Suspense fallback for the supervisor verification page. Mirrors
 * the page header, segmented filter, and the six-column account table.
 */
export function SupervisorTableSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading supervisor accounts">
      <div>
        <div className="h-px w-16 bg-[var(--cpc-gold-line)]" />
        <div className="mt-5 h-3 w-24 rounded bg-[var(--muted)]" />
        <div className="mt-4 h-8 w-72 max-w-full rounded-md bg-[var(--muted)]" />
        <div className="mt-4 h-4 w-full max-w-xl rounded bg-[var(--muted)]" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1 rounded-lg border border-[var(--border)] p-1">
          {COLUMNS.slice(0, 3).map((item) => (
            <Skeleton key={item.label} className="h-7 w-20" />
          ))}
        </div>
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
        <div className="min-w-[52rem]">
          <div className="grid grid-cols-6 gap-4 border-b border-[var(--border)] bg-[var(--cpc-parchment)] px-4 py-3">
            {COLUMNS.map((item) => (
              <div key={item.label} className={`h-3 ${item.width} rounded bg-[var(--muted)]`} />
            ))}
          </div>
          {ROWS.map((row) => (
            <div key={row} className="grid grid-cols-6 items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24 rounded-md" />
              <div className="flex gap-2">
                <Skeleton className="h-7 w-16 rounded-md" />
                <Skeleton className="h-7 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

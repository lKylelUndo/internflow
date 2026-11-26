import { Skeleton } from "@/components/ui/skeleton"

const ROWS = [0, 1, 2, 3]

const COLUMNS = [
  { key: "company", width: "w-28" },
  { key: "contact", width: "w-24" },
  { key: "placements", width: "w-24" },
  { key: "status", width: "w-16" },
  { key: "actions", width: "w-24" },
] as const

/**
 * Server-safe Suspense fallback for the company partners page. Mirrors the
 * page header, refresh/add actions, and the five-column company table.
 */
export function CompanyTableSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading company partners">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold-line)]" />
          <div className="mt-5 h-3 w-24 rounded bg-[var(--muted)]" />
          <div className="mt-4 h-8 w-72 max-w-full rounded-md bg-[var(--muted)]" />
          <div className="mt-4 h-4 w-full max-w-xl rounded bg-[var(--muted)]" />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
        <div className="min-w-[56rem]">
          <div className="grid grid-cols-5 gap-4 border-b border-[var(--border)] bg-[var(--cpc-parchment)] px-4 py-3">
            {COLUMNS.map((column) => (
              <div key={column.key} className={`h-3 ${column.width} rounded bg-[var(--muted)]`} />
            ))}
          </div>
          {ROWS.map((row) => (
            <div key={row} className="grid grid-cols-5 items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-3 w-36" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-7 w-14 rounded-md" />
                <Skeleton className="h-7 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

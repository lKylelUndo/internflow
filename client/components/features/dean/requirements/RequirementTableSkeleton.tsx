import { Skeleton } from "@/components/ui/skeleton"

const ROWS = [0, 1, 2, 3]

const COLUMNS = [
  { label: "Program", width: "w-32" },
  { label: "Required hours", width: "w-24" },
  { label: "Documents", width: "w-28" },
  { label: "Status", width: "w-20" },
  { label: "Updated", width: "w-24" },
  { label: "Actions", width: "w-32" },
] as const

/**
 * Server-safe Suspense fallback for the dean OJT requirements page. Mirrors
 * the page header, count line, and the six-column requirement table.
 */
export function RequirementTableSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading OJT requirements">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold)]" />
          <div className="mt-5 h-3 w-16 rounded bg-[var(--muted)]" />
          <div className="mt-4 h-8 w-80 max-w-full rounded-md bg-[var(--muted)]" />
          <div className="mt-4 h-4 w-full max-w-xl rounded bg-[var(--muted)]" />
        </div>
        <Skeleton className="h-8 w-36 self-start rounded-md" />
      </header>

      <Skeleton className="h-4 w-48" />

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
        <div className="min-w-[56rem]">
          <div className="grid grid-cols-6 gap-4 border-b border-[var(--border)] bg-[var(--cpc-parchment)] px-4 py-3">
            {COLUMNS.map((item) => (
              <div key={item.label} className={`h-3 ${item.width} rounded bg-[var(--muted)]`} />
            ))}
          </div>
          {ROWS.map((row) => (
            <div key={row} className="grid grid-cols-6 items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-20" />
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-4 w-24" />
              <div className="flex justify-end gap-2">
                <Skeleton className="h-7 w-12 rounded-md" />
                <Skeleton className="h-7 w-24 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

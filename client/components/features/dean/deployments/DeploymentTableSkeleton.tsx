import { Skeleton } from "@/components/ui/skeleton"

const ROWS = [0, 1, 2, 3]

const COLUMNS = [
  { key: "student", width: "w-28" },
  { key: "placement", width: "w-32" },
  { key: "supervisor", width: "w-28" },
  { key: "schedule", width: "w-28" },
  { key: "hours", width: "w-20" },
  { key: "status", width: "w-24" },
  { key: "actions", width: "w-20" },
] as const

/**
 * Server-safe Suspense fallback for the dean deployments page. Mirrors the
 * header actions, status filter, and the seven-column deployment table.
 */
export function DeploymentTableSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading deployments">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold)]" />
          <div className="mt-5 h-3 w-16 rounded bg-[var(--muted)]" />
          <div className="mt-4 h-8 w-72 max-w-full rounded-md bg-[var(--muted)]" />
          <div className="mt-4 h-4 w-full max-w-xl rounded bg-[var(--muted)]" />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4 self-start">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-32 rounded-md" />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Skeleton className="h-9 w-48 rounded-lg" />
        <Skeleton className="h-4 w-40" />
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
        <div className="min-w-[72rem]">
          <div className="grid grid-cols-7 gap-4 border-b border-[var(--border)] bg-[var(--cpc-parchment)] px-4 py-3">
            {COLUMNS.map((column) => (
              <div key={column.key} className={`h-3 ${column.width} rounded bg-[var(--muted)]`} />
            ))}
          </div>
          {ROWS.map((row) => (
            <div key={row} className="grid grid-cols-7 items-center gap-4 border-b border-[var(--border)] px-4 py-4 last:border-b-0">
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="min-w-0 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-28 rounded-md" />
              <div className="flex justify-end">
                <Skeleton className="h-7 w-16 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

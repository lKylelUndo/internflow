import { Suspense } from "react"
import { SupervisorDashboard } from "@/components/features/supervisor/dashboard/SupervisorDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Supervisor Dashboard",
  description: "Company supervisor workspace for InternFlow at Cordova Public College.",
}

function SupervisorDashboardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-card p-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-[var(--muted)]" />
    </div>
  )
}

export default function SupervisorDashboardPage() {
  return (
    <Suspense fallback={<SupervisorDashboardSkeleton />}>
      <SupervisorDashboard />
    </Suspense>
  )
}

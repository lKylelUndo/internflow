import { Suspense } from "react"
import { DeanDashboard } from "@/components/features/dean/dashboard/DeanDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dean Dashboard",
  description: "Dean workspace for InternFlow at Cordova Public College.",
}

function DeanDashboardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-card p-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-[var(--muted)]" />
    </div>
  )
}

export default function DeanDashboardPage() {
  return (
    <Suspense fallback={<DeanDashboardSkeleton />}>
      <DeanDashboard />
    </Suspense>
  )
}

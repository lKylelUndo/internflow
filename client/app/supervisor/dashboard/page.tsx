import { Suspense } from "react"
import { DashboardSkeleton } from "@/components/features/dashboard/DashboardSkeleton"
import { SupervisorDashboard } from "@/components/features/supervisor/dashboard/SupervisorDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Supervisor Dashboard",
  description: "Company supervisor workspace for InternFlow at Cordova Public College.",
}

export default function SupervisorDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <SupervisorDashboard />
    </Suspense>
  )
}

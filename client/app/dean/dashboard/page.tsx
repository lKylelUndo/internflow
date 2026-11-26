import { Suspense } from "react"
import { DashboardSkeleton } from "@/components/features/dashboard/DashboardSkeleton"
import { DeanDashboard } from "@/components/features/dean/dashboard/DeanDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dean Dashboard",
  description: "Dean workspace for InternFlow at Cordova Public College.",
}

export default function DeanDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DeanDashboard />
    </Suspense>
  )
}

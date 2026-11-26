import { Suspense } from "react"
import { DashboardSkeleton } from "@/components/features/dashboard/DashboardSkeleton"
import { AdminDashboard } from "@/components/features/admin/dashboard/AdminDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrator workspace for InternFlow at Cordova Public College.",
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboard />
    </Suspense>
  )
}

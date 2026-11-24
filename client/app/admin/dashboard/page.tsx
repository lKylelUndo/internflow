import { Suspense } from "react"
import { AdminDashboard } from "@/components/features/admin/dashboard/AdminDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrator workspace for InternFlow at Cordova Public College.",
}

function AdminDashboardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-card p-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-[var(--muted)]" />
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<AdminDashboardSkeleton />}>
      <AdminDashboard />
    </Suspense>
  )
}

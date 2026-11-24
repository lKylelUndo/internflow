import { Suspense } from "react"
import { StudentDashboard } from "@/components/features/student/dashboard/StudentDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Student workspace for InternFlow at Cordova Public College.",
}

function StudentDashboardSkeleton() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-card p-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-[var(--muted)]" />
    </div>
  )
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<StudentDashboardSkeleton />}>
      <StudentDashboard />
    </Suspense>
  )
}

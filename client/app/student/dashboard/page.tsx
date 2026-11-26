import { Suspense } from "react"
import { DashboardSkeleton } from "@/components/features/dashboard/DashboardSkeleton"
import { StudentDashboard } from "@/components/features/student/dashboard/StudentDashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Student workspace for InternFlow at Cordova Public College.",
}

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <StudentDashboard />
    </Suspense>
  )
}

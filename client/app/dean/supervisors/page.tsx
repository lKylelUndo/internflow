import { Suspense } from "react"
import { SupervisorTableSkeleton } from "@/components/features/dean/supervisors/SupervisorTableSkeleton"
import { SupervisorVerification } from "@/components/features/dean/supervisors/SupervisorVerification"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Supervisor Verification",
  description: "Review company supervisors assigned to your department for InternFlow at Cordova Public College.",
}

export default function DeanSupervisorsPage() {
  return (
    <Suspense fallback={<SupervisorTableSkeleton />}>
      <SupervisorVerification />
    </Suspense>
  )
}

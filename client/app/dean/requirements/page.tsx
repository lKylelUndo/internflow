import { Suspense } from "react"
import { OjtRequirements } from "@/components/features/dean/requirements/OjtRequirements"
import { RequirementTableSkeleton } from "@/components/features/dean/requirements/RequirementTableSkeleton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "OJT Requirements",
  description: "Set OJT hours and document requirements for InternFlow at Cordova Public College.",
}

export default function DeanRequirementsPage() {
  return (
    <Suspense fallback={<RequirementTableSkeleton />}>
      <OjtRequirements />
    </Suspense>
  )
}

import { Suspense } from "react"
import { Deployments } from "@/components/features/dean/deployments/Deployments"
import { DeploymentTableSkeleton } from "@/components/features/dean/deployments/DeploymentTableSkeleton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Deployments",
  description: "Coordinate student internships and track deployment status at Cordova Public College.",
}

export default function DeanDeploymentsPage() {
  return (
    <Suspense fallback={<DeploymentTableSkeleton />}>
      <Deployments />
    </Suspense>
  )
}

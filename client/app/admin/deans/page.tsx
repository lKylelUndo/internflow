import { Suspense } from "react"
import { DeanTableSkeleton } from "@/components/features/admin/deans/DeanTableSkeleton"
import { DeanVerification } from "@/components/features/admin/deans/DeanVerification"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dean Verification",
  description: "Review dean accounts and departments for InternFlow at Cordova Public College.",
}

export default function AdminDeansPage() {
  return (
    <Suspense fallback={<DeanTableSkeleton />}>
      <DeanVerification />
    </Suspense>
  )
}

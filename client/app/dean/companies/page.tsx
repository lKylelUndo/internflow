import { Suspense } from "react"
import { CompanyTableSkeleton } from "@/components/features/dean/companies/CompanyTableSkeleton"
import { CompanyDirectory } from "@/components/features/dean/companies/CompanyDirectory"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Company Partners",
  description: "Maintain the companies hosting interns from your department at Cordova Public College.",
}

export default function DeanCompaniesPage() {
  return (
    <Suspense fallback={<CompanyTableSkeleton />}>
      <CompanyDirectory />
    </Suspense>
  )
}

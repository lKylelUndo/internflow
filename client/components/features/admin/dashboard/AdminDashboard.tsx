"use client"

import DashboardPage, { formatMemberSince, humanizeAccountStatus } from "@/components/features/dashboard/DashboardPage"
import type { DashboardDetail } from "@/components/features/dashboard/DashboardPage"
import { useAuthContext } from "@/context/AuthContext"

const NEXT_STEPS: { title: string; body: string; href?: string }[] = [
  { title: "Dean verification queue", body: "Review pending dean accounts and confirm their departments.", href: "/admin/deans" },
  { title: "Company and supervisor records", body: "Keep partner companies and company supervisors current." },
  { title: "Departments and programs", body: "Maintain the academic structure the placements run on." },
  { title: "Deployment oversight", body: "Monitor placements and reports across the college." },
]

export function AdminDashboard() {
  const { user } = useAuthContext()
  const roleLabel = "Administrator"

  const details: DashboardDetail[] = [
    { label: "Role", value: roleLabel },
    { label: "Email", value: user?.email ?? "Not assigned" },
    { label: "Account status", value: humanizeAccountStatus(user?.accountStatus) },
    { label: "Member since", value: formatMemberSince(user?.createdAt) },
  ]

  return (
    <DashboardPage
      roleLabel={roleLabel}
      title="Administrator workspace"
      description="Workspace administration for Cordova Public College's internship deployment and monitoring system."
      details={details}
      nextSteps={NEXT_STEPS}
    />
  )
}

"use client"

import DashboardPage, { formatMemberSince, humanizeAccountStatus } from "@/components/features/dashboard/DashboardPage"
import type { DashboardDetail } from "@/components/features/dashboard/DashboardPage"
import { useAuthContext } from "@/context/AuthContext"
import type { User } from "@/services/auth.service"

const NEXT_STEPS: { title: string; body: string; href?: string }[] = [
  { title: "Student eligibility review", body: "Verify student eligibility before a placement is deployed." },
  { title: "Placement coordination", body: "Coordinate placements across your department.", href: "/dean/deployments" },
  { title: "Supervisor liaison", body: "Keep in step with the company supervisors hosting your interns.", href: "/dean/supervisors" },
  { title: "Progress monitoring", body: "Follow intern progress through the deployment." },
]

export function DeanDashboard() {
  const { user } = useAuthContext()
  const department = (user as User & { deanProfile?: { department: { name: string } } })?.deanProfile?.department

  const details: DashboardDetail[] = [
    { label: "Department", value: department?.name ?? "Not assigned" },
    { label: "Email", value: user?.email ?? "Not assigned" },
    { label: "Account status", value: humanizeAccountStatus(user?.accountStatus) },
    { label: "Member since", value: formatMemberSince(user?.createdAt) },
  ]

  return (
    <DashboardPage
      roleLabel="Dean"
      title="Dean workspace"
      description="College-side coordination of internship placements at Cordova Public College."
      details={details}
      nextSteps={NEXT_STEPS}
    />
  )
}

"use client"

import DashboardPage, { formatMemberSince, humanizeAccountStatus } from "@/components/features/dashboard/DashboardPage"
import type { DashboardDetail } from "@/components/features/dashboard/DashboardPage"
import { useAuthContext } from "@/context/AuthContext"
import type { User } from "@/services/auth.service"

const NEXT_STEPS: { title: string; body: string }[] = [
  { title: "Intern assignments", body: "See the interns placed with your company." },
  { title: "Mentor assignment", body: "Assign the mentor who will guide each intern." },
  { title: "Performance evaluation", body: "Record your evaluation of the intern's work." },
  { title: "Completion confirmation", body: "Confirm when a deployment is complete." },
]

export function SupervisorDashboard() {
  const { user } = useAuthContext()
  const profile = (user as User & { supervisorProfile?: { position: string | null; company: { name: string } } })?.supervisorProfile

  const details: DashboardDetail[] = [
    { label: "Company", value: profile?.company?.name ?? "Not assigned" },
    { label: "Position", value: profile?.position ?? "Not assigned" },
    { label: "Email", value: user?.email ?? "Not assigned" },
    { label: "Account status", value: humanizeAccountStatus(user?.accountStatus) },
    { label: "Member since", value: formatMemberSince(user?.createdAt) },
  ]

  return (
    <DashboardPage
      roleLabel="Company Supervisor"
      title="Supervisor workspace"
      description="Company-side hosting and evaluation of interns from Cordova Public College."
      details={details}
      nextSteps={NEXT_STEPS}
    />
  )
}

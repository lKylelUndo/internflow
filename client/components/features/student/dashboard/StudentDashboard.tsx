"use client"

import DashboardPage, { humanizeAccountStatus, humanizeLabel } from "@/components/features/dashboard/DashboardPage"
import type { DashboardDetail } from "@/components/features/dashboard/DashboardPage"
import { useAuthContext } from "@/context/AuthContext"
import type { User } from "@/services/auth.service"

const NEXT_STEPS: { title: string; body: string }[] = [
  { title: "Application and placement", body: "Follow your application through to a placement." },
  { title: "Hour logging", body: "Record the hours you complete on your deployment." },
  { title: "Supervisor evaluation", body: "Track your supervisor's evaluation of your work." },
  { title: "Completion record", body: "Keep your internship completion on your college record." },
]

export function StudentDashboard() {
  const { user } = useAuthContext()
  const profile = (user as User & { studentProfile?: { studentNumber: string; yearLevel: number; eligibilityStatus: string; program: { name: string }; department: { name: string } } })?.studentProfile

  const details: DashboardDetail[] = [
    { label: "Student number", value: profile?.studentNumber ?? "Not assigned" },
    { label: "Year level", value: profile?.yearLevel != null ? String(profile.yearLevel) : "Not assigned" },
    { label: "Program", value: profile?.program?.name ?? "Not assigned" },
    { label: "Department", value: profile?.department?.name ?? "Not assigned" },
    { label: "Eligibility status", value: humanizeLabel(profile?.eligibilityStatus) },
    { label: "Account status", value: humanizeAccountStatus(user?.accountStatus) },
  ]

  return (
    <DashboardPage
      roleLabel="Student"
      title="Student workspace"
      description="Your internship placement record at Cordova Public College."
      details={details}
      nextSteps={NEXT_STEPS}
    />
  )
}

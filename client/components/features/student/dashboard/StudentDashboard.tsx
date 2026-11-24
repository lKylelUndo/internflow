"use client"

import { useAuthContext } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/services/auth.service"

export function StudentDashboard() {
  const { user, refreshUser, isAuthenticated } = useAuthContext()
  const profile = (user as User & { studentProfile?: { studentNumber: string; yearLevel: number; eligibilityStatus: string; program: { name: string }; department: { name: string } } })?.studentProfile

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[var(--cpc-navy)]">Student Dashboard</h1>
        <p className="text-[var(--cpc-slate)] text-muted-foreground">
          Your internship placement record at Cordova Public College.
        </p>
      </div>

      {isAuthenticated && user ? (
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>Internship details from your student record.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Name</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{user.firstName} {user.lastName}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Email</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{user.email}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Student number</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{profile?.studentNumber ?? "Not assigned"}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Year level</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{profile?.yearLevel ?? "Not assigned"}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Program</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{profile?.program?.name ?? "Not assigned"}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Department</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{profile?.department?.name ?? "Not assigned"}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Eligibility status</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{profile?.eligibilityStatus ?? "Not assigned"}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Account status</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{user.accountStatus}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Coming to this workspace</CardTitle>
          <CardDescription>Modules for managing your internship deployment.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-[var(--cpc-slate)] text-sm leading-relaxed">
            <li>Internship application and placement tracking</li>
            <li>Deployment hour logging</li>
            <li>Supervisor evaluation requests</li>
            <li>Internship completion records</li>
          </ul>
          <p className="mt-4 text-xs text-[var(--cpc-slate)]">
            These modules are being released by the College Internship Office.
            No data is shown here until a module is active for your account.
          </p>
        </CardContent>
      </Card>

      <button
        onClick={() => refreshUser()}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--cpc-crimson)] hover:underline"
      >
        Refresh session
      </button>
    </section>
  )
}

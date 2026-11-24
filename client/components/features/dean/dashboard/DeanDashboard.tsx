"use client"

import { useAuthContext } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { User } from "@/services/auth.service"

export function DeanDashboard() {
  const { user, refreshUser, isAuthenticated } = useAuthContext()
  const department = (user as User & { deanProfile?: { department: { name: string } } })?.deanProfile?.department

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[var(--cpc-navy)]">Dean Dashboard</h1>
        <p className="text-[var(--cpc-slate)] text-muted-foreground">
          College-side coordination of internship placements at Cordova Public
          College.
        </p>
      </div>

      {isAuthenticated && user ? (
        <Card>
          <CardHeader>
            <CardTitle>Your profile</CardTitle>
            <CardDescription>Account details from your college employee record.</CardDescription>
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
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Department</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{department?.name ?? "Not assigned"}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Account status</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{user.accountStatus}</dd>
              </div>
              <div className="col-span-2 border-b pb-3 last:border-0 last:pb-0">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Member since</dt>
                <dd className="text-[var(--cpc-navy)] font-medium">{new Date(user.createdAt).toLocaleDateString("en-PH")}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Coming to this workspace</CardTitle>
          <CardDescription>Modules for deans coordinating internship deployments.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-[var(--cpc-slate)] text-sm leading-relaxed">
            <li>Student application review and eligibility verification</li>
            <li>Department placement coordination</li>
            <li>Company supervisor liaison records</li>
            <li>Intern progress monitoring across your department</li>
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

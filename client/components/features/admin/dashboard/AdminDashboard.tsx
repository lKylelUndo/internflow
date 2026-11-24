"use client"

import { useAuthContext } from "@/context/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function AdminDashboard() {
  const { user, refreshUser, isAuthenticated } = useAuthContext()

  return (
    <section className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-[var(--cpc-navy)]">Administrator Dashboard</h1>
        <p className="text-[var(--cpc-slate)] text-muted-foreground">
          Workspace administration for Cordova Public College&rsquo;s internship
          deployment and monitoring system.
        </p>
      </div>

      {isAuthenticated && user ? (
        <Card>
          <CardHeader>
            <CardTitle>Your account</CardTitle>
            <CardDescription>Institutional account details from your employee record.</CardDescription>
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
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">Role</dt>
                <dd className="text-[var(--cpc-navy)] font-medium capitalize">{user.role}</dd>
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
          <CardDescription>Modules the college internship office will use next.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-[var(--cpc-slate)] text-sm leading-relaxed">
            <li>Student application intake and verification queue</li>
            <li>Department and program configuration</li>
            <li>Company partnership and supervisor records</li>
            <li>Intern deployment tracking and timesheet review</li>
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

import Link from "next/link"
import Logo from "@/components/common/layout/Logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "InternFlow — Cordova Public College",
  description:
    "Internship deployment and monitoring system for Cordova Public College, Cebu, Philippines. Students apply for placements, deans and company supervisors oversee internships, and administrators manage the workspace.",
  alternates: {
    canonical: "/",
  },
}

const ROLES = [
  {
    key: "student",
    title: "Student",
    summary:
      "Apply for internship placements, track your application status, and record your internship hours through your college record.",
    href: "/signup/student",
    label: "Apply as a student",
  },
  {
    key: "dean",
    title: "Dean",
    summary:
      "Review student applications, verify eligibility, and oversee college-side coordination of the internship program.",
    href: "/login",
    label: "Sign in",
  },
  {
    key: "supervisor",
    title: "Company Supervisor",
    summary:
      "Host interns at your organization, assign mentors, and evaluate intern performance during the deployment period.",
    href: "/login",
    label: "Sign in",
  },
  {
    key: "admin",
    title: "Administrator",
    summary:
      "Manage user accounts, departments, programs, and system configuration for the college internship office.",
    href: "/login",
    label: "Sign in",
  },
]

export default function Page() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-[var(--foreground)]">
      <header className="border-b border-[var(--border)] bg-background/80 backdrop-blur-sm sticky top-0 z-20 supports-[backdrop-filter]:bg-background/[0.7]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size="md" priority />
            <span className="font-serif font-semibold text-[var(--cpc-navy)] tracking-tight">InternFlow</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block rounded-full border border-[var(--cpc-navy)]/20 bg-[var(--cpc-parchment)] px-3 py-1 text-xs font-medium text-[var(--cpc-navy)] mb-6">
              Cordova Public College · Cebu, Philippines
            </span>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-[var(--cpc-navy)] sm:text-5xl mb-6">
              Internship deployment,<br />
              monitored with care
            </h1>
            <p className="text-lg text-[var(--cpc-slate)] leading-relaxed mb-8 max-w-xl mx-auto">
              InternFlow is Cordova Public College&rsquo;s internship deployment
              and monitoring system. Students apply for placements, deans verify
              eligibility and coordinate with partner companies, company
              supervisors host and evaluate interns, and administrators oversee
              the workspace &mdash; all in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "lg" }), "bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90 px-6 py-2.5 h-auto text-base")}
              >
                Sign in
              </Link>
              <Link
                href="/signup/student"
                className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-[var(--cpc-navy)] text-[var(--cpc-navy)] hover:bg-[var(--cpc-navy)] hover:text-[var(--cpc-navy-foreground)] px-6 py-2.5 h-auto text-base")}
              >
                Apply as a student
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--cpc-parchment)] py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center font-serif text-3xl font-semibold text-[var(--cpc-navy)] mb-12">
              Who uses InternFlow
            </h2>
            <div className="grid gap-y-12 gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
              {ROLES.map((role) => (
                <div key={role.key} className="p-6 border border-[var(--border)] rounded-xl bg-card">
                  <h3 className="font-serif text-xl font-semibold text-[var(--cpc-navy)] mb-2">
                    {role.title}
                  </h3>
                  <p className="text-[var(--cpc-slate)] text-sm leading-relaxed">
                    {role.summary}
                  </p>
                  <Link
                    href={role.href}
                    className="mt-4 inline-block text-sm font-medium text-[var(--cpc-crimson)] hover:underline"
                  >
                    {role.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--cpc-parchment)] text-[var(--cpc-parchment-foreground)] py-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Logo size="sm" />
              <span className="font-serif font-semibold text-[var(--cpc-navy)] tracking-tight">InternFlow</span>
            </div>
            <p className="text-xs text-[var(--cpc-slate)]">
              &copy; {new Date().getFullYear()} Cordova Public College ·
              InternFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

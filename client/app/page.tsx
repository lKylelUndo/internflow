import Link from "next/link"
import Header from "@/components/common/layout/Header"
import Footer from "@/components/common/layout/Footer"
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

const STEPS = [
  {
    title: "Apply",
    body: "Students submit their application with their student number, year level, program, and contact details.",
  },
  {
    title: "Verify",
    body: "The dean reviews the application and confirms eligibility before any placement moves forward.",
  },
  {
    title: "Deploy",
    body: "Approved students are placed with a partner company and assigned a company supervisor.",
  },
  {
    title: "Monitor",
    body: "Supervisors evaluate the intern through the deployment while administrators keep the workspace in order.",
  },
] as const

const ROLES = [
  {
    key: "student",
    title: "Student",
    summary: "Apply for a placement, track your status, and keep internship hours on your college record.",
  },
  {
    key: "dean",
    title: "Dean",
    summary: "Verify eligibility and oversee the college side of each deployment.",
  },
  {
    key: "supervisor",
    title: "Company supervisor",
    summary: "Host interns, guide them through the placement, and record your evaluation.",
  },
  {
    key: "admin",
    title: "Administrator",
    summary: "Manage accounts, departments, programs, and workspace settings.",
  },
] as const

/**
 * Hero visual: the system itself, drawn in CSS/SVG. A navy panel carrying
 * the crest in a white badge, a gold hairline, and one line of product copy.
 * Deliberately does NOT repeat the role or process copy in the sections
 * below, and carries no invented figures.
 */
function PlacementDiagram() {
  return (
    <div className="navy-surface relative overflow-hidden rounded-2xl border border-white/10 px-6 py-7 sm:px-8 sm:py-9">
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full text-white/[0.07]"
      >
        <defs>
          <pattern
            id="internflow-record-grid"
            width="28"
            height="28"
            patternUnits="userSpaceOnUse"
          >
            <path d="M28 0 L0 0 L0 28" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#internflow-record-grid)" />
      </svg>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <Logo size="md" badge />
          <div className="text-right">
            <p className="font-serif text-sm font-semibold">Placement record</p>
            <p className="text-xs text-[var(--cpc-on-navy-muted)]">Cordova Public College</p>
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-[var(--cpc-gold)]/70" />

        <p className="mt-7 text-sm leading-relaxed text-[var(--cpc-on-navy-muted)]">
          Every sign-off stays with the placement.
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return (
    <div id="top" className="flex min-h-svh flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero — asymmetric two-column: copy left, the system drawn right. */}
        <section className="mx-auto max-w-7xl px-6 pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
          <div className="animate-hero-in grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="h-px w-16 bg-[var(--cpc-gold)]" />
              <h1 className="mt-5 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] text-balance sm:text-display-lg lg:text-display-xl xl:text-display-2xl">
                From application to completion, every internship hour accounted
                for.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--cpc-slate)] sm:text-lg">
                Students apply, deans verify eligibility, and company supervisors
                evaluate interns on site.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href="/signup/student"
                  className={cn(
                    buttonVariants({ size: "lg" }),
                    "h-11 bg-[var(--cpc-crimson)] px-6 text-sm text-[var(--cpc-crimson-foreground)] hover:bg-[var(--cpc-crimson)]/90"
                  )}
                >
                  Apply as a student
                </Link>
                <Link
                  href="/login"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" }),
                    "h-11 border-[var(--cpc-navy)]/30 px-6 text-sm text-[var(--cpc-navy)] hover:bg-[var(--cpc-navy)] hover:text-[var(--cpc-navy-foreground)]"
                  )}
                >
                  Sign in
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <PlacementDiagram />
            </div>
          </div>
        </section>

        {/* Process — a genuine four-step sequence on a gold timeline. */}
        <section
          id="how-it-works"
          className="scroll-mt-20 border-y border-[var(--border)] bg-[var(--cpc-parchment)] py-16 sm:py-20 lg:py-24"
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <div className="h-px w-16 bg-[var(--cpc-gold)]" />
              <h2 className="mt-5 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] sm:text-display-lg">
                How it works
              </h2>
              <p className="mt-4 text-base leading-relaxed text-[var(--cpc-slate)]">
                Four steps, in order. A placement does not move forward until
                the step before it is signed off.
              </p>
            </div>

            <ol className="relative mt-12 grid gap-10 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-8">
              {STEPS.map((step, index) => (
                <li key={step.title} className="relative">
                  {index < STEPS.length - 1 && (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute top-11 -bottom-10 left-[1.375rem] w-px bg-[var(--cpc-gold)]/55 sm:hidden"
                      />
                      <span
                        aria-hidden="true"
                        className="absolute top-[1.375rem] -right-8 left-11 hidden h-px bg-[var(--cpc-gold)]/55 lg:block"
                      />
                    </>
                  )}
                  <span className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--cpc-gold)] bg-[var(--cpc-parchment)] font-serif text-base font-semibold text-[var(--cpc-navy)]">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--cpc-slate)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Roles — editorial list, not a card grid; no repeated per-role links. */}
        <section id="who-it-serves" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-4">
                <div className="h-px w-16 bg-[var(--cpc-gold)]" />
                <h2 className="mt-5 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] sm:text-display-lg">
                  Who it serves
                </h2>
                <p className="mt-4 max-w-sm text-base leading-relaxed text-[var(--cpc-slate)]">
                  Four roles, one record.
                </p>
              </div>

              <ul className="lg:col-span-8">
                {ROLES.map((role) => (
                  <li
                    key={role.key}
                    className="border-t border-[var(--border)] py-7 first:border-t-0 first:pt-0"
                  >
                    <h3 className="font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
                      {role.title}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--cpc-slate)] sm:text-base">
                      {role.summary}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

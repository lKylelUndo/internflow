import Link from "next/link"
import Logo from "@/components/common/layout/Logo"
import { AuthGuard } from "@/components/features/auth/AuthGuard"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Account",
  description: "Sign in or apply for an internship account at Cordova Public College.",
}

/**
 * Public auth shell: a quiet navy brand panel on the left (a compact navy
 * header above the form on mobile) beside a focused light form surface. No
 * marketing footer; a single minimal legal line sits inside the form column.
 * Both brand marks link home.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="GUEST">
      <div className="flex min-h-svh flex-col bg-background lg:flex-row">
        {/* Left: college mark + product line + one sentence, whole block links home. */}
        <aside className="navy-surface hidden shrink-0 lg:sticky lg:top-0 lg:flex lg:h-svh lg:w-[38%] lg:max-w-md lg:flex-col lg:justify-between lg:self-start lg:px-10 lg:py-12 xl:px-14">
          <Link href="/" aria-label="InternFlow home" className="block rounded-lg">
            <Logo size="lg" badge priority />
            <span className="mt-6 flex flex-col leading-tight">
              <span className="font-serif text-xl font-semibold tracking-tight">InternFlow</span>
              <span className="text-sm text-[var(--cpc-on-navy-muted)]">Cordova Public College</span>
            </span>
          </Link>

          <div className="max-w-xs">
            <div className="h-px w-16 bg-[var(--cpc-gold)]" />
            <p className="mt-5 text-sm leading-relaxed text-[var(--cpc-on-navy-muted)]">
              The college&apos;s internship record, in one place.
            </p>
          </div>
        </aside>

        {/* Right: focused form surface; scrolls naturally for long signups. */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Compact navy brand header until the two-column layout takes over; whole block links home. */}
          <div className="navy-surface lg:hidden">
            <Link href="/" aria-label="InternFlow home" className="flex items-center gap-3 px-5 py-4">
              <Logo size="sm" badge priority />
              <span className="flex flex-col leading-tight">
                <span className="font-serif text-base font-semibold tracking-tight">InternFlow</span>
                <span className="text-[0.7rem] text-[var(--cpc-on-navy-muted)]">Cordova Public College</span>
              </span>
            </Link>
          </div>

          <main className="flex flex-1 flex-col">
            <div className="m-auto w-full max-w-md px-5 py-10 sm:px-8 sm:py-12 lg:py-14">{children}</div>
          </main>

          {/* Minimal one-line legal footer inside the form column; no links, no marketing. */}
          <p className="mx-auto max-w-md px-5 pb-8 text-center text-xs text-[var(--cpc-slate)] sm:px-8">
            &copy; {new Date().getFullYear()} Cordova Public College. All rights reserved.
          </p>
        </div>
      </div>
    </AuthGuard>
  )
}

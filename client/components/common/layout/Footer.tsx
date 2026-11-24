import Link from "next/link"
import Logo from "@/components/common/layout/Logo"

/**
 * Public footer. Grounded in the college and product names only.
 */
export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--cpc-parchment)] text-[var(--cpc-parchment-foreground)] py-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo size="sm" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              Cordova Public College, Cebu, Philippines. InternFlow is the
              college&apos;s internship deployment and monitoring system, serving
              students, deans, company supervisors, and administrators.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--cpc-navy)]">InternFlow</h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-[var(--cpc-slate)] hover:text-[var(--cpc-crimson)] hover:underline"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-sm text-[var(--cpc-slate)] hover:text-[var(--cpc-crimson)] hover:underline"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--cpc-slate)]">
          &copy; {new Date().getFullYear()} Cordova Public College &middot;
          InternFlow. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

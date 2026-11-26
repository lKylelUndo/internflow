import Link from "next/link"
import Logo from "@/components/common/layout/Logo"

const FOOTER_LINKS = [
  { href: "/#top", label: "Home" },
  { href: "/login", label: "Sign in" },
  { href: "/signup/student", label: "Apply as a student" },
] as const

/**
 * Public footer on the navy field. Crest in a white circular badge, linked
 * home; concise institution and product copy; only links that resolve. Not
 * rendered on auth pages.
 */
export default function Footer() {
  return (
    <footer className="navy-surface border-t border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="max-w-md">
            <Link href="/#top" aria-label="InternFlow home" className="flex items-center gap-3 rounded-lg">
              <Logo size="sm" badge />
              <span className="flex flex-col leading-tight">
                <span className="font-serif text-lg font-semibold tracking-tight">InternFlow</span>
                <span className="text-xs text-[var(--cpc-on-navy-muted)]">Cordova Public College</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-[var(--cpc-on-navy-muted)]">
              Internship deployment and monitoring for Cordova Public College, Cebu, Philippines.
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--cpc-on-navy-muted)] transition-colors hover:text-[var(--cpc-on-navy)] hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-10 h-px w-full bg-[var(--cpc-gold)]/40" />
        <p className="mt-5 text-xs text-[var(--cpc-on-navy-muted)]">
          &copy; {new Date().getFullYear()} Cordova Public College. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

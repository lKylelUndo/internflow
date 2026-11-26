import Link from "next/link"
import Logo from "@/components/common/layout/Logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#who-it-serves", label: "Who it serves" },
] as const

/**
 * Public marketing header. Sticky on a solid light surface: crest and
 * wordmark left, section anchors plus sign-in and student application
 * entry points right. The crimson button is the one accent on the bar.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/#top" aria-label="InternFlow home" className="flex items-center gap-2.5 rounded-lg">
          <Logo size="sm" priority />
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-lg font-semibold tracking-tight text-[var(--cpc-navy)]">
              InternFlow
            </span>
            <span className="text-[0.7rem] font-medium text-[var(--cpc-slate)]">
              Cordova Public College
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-3 sm:gap-5">
          <div className="hidden items-center gap-5 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--cpc-navy)] transition-colors hover:text-[var(--cpc-crimson)]"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <Link
            href="/login"
            className="text-sm font-medium text-[var(--cpc-navy)] transition-colors hover:text-[var(--cpc-crimson)]"
          >
            Sign in
          </Link>

          <Link
            href="/signup/student"
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 bg-[var(--cpc-crimson)] px-3.5 text-[var(--cpc-crimson-foreground)] hover:bg-[var(--cpc-crimson)]/90 sm:px-4"
            )}
          >
            <span className="sm:hidden">Apply</span>
            <span className="hidden sm:inline">Apply as a student</span>
          </Link>
        </nav>
      </div>
    </header>
  )
}

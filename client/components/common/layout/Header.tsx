import Link from "next/link"
import Logo from "@/components/common/layout/Logo"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Public marketing header (landing and auth pages). Institution-grounded:
 * the college mark sits beside the product name, with sign-in and student
 * application entry points.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:bg-background/[0.85]">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo size="md" priority />
          <span className="font-serif font-semibold text-[var(--cpc-navy)] tracking-tight">InternFlow</span>
        </Link>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-[var(--cpc-navy)] border-[var(--cpc-navy)] hover:bg-[var(--cpc-navy)] hover:text-[var(--cpc-navy-foreground)]")}
          >
            Sign in
          </Link>
          <Link
            href="/signup/student"
            className={cn(buttonVariants({ size: "sm" }), "bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90")}
          >
            Apply as a student
          </Link>
        </nav>
      </div>
    </header>
  )
}

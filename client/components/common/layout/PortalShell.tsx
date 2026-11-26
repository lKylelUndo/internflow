"use client"

import { ChevronDown, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Logo from "@/components/common/layout/Logo"
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

interface PortalShellProps {
  children: React.ReactNode
  roleLabel: string
  navItems: { href: string; label: string }[]
}

/**
 * Shared role portal shell. A solid sticky bar carries the college mark and
 * wordmark, the live module links for this role, a compact role chip, and the
 * user menu. Only the routes supplied by the role layout are rendered.
 */
export default function PortalShell({
  children,
  roleLabel,
  navItems,
}: PortalShellProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-background">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-3 px-4 py-3 sm:flex-nowrap sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <Logo size="sm" priority />
            <span className="flex min-w-0 flex-col leading-tight">
              <span className="font-serif text-lg font-semibold tracking-tight text-[var(--cpc-navy)]">
                InternFlow
              </span>
              <span className="hidden text-[0.7rem] font-medium text-[var(--cpc-slate)] sm:block">
                Cordova Public College
              </span>
            </span>
          </div>

          <nav aria-label="Portal" className="order-3 w-full sm:order-none sm:w-auto">
            <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--border)] pt-3 sm:border-0 sm:pt-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "inline-block border-b-2 pb-1 text-sm font-medium transition-colors",
                        isActive
                          ? "border-[var(--cpc-gold)] text-[var(--cpc-navy)]"
                          : "border-transparent text-[var(--cpc-slate)] hover:text-[var(--cpc-navy)]"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--cpc-navy)] sm:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cpc-gold)]" aria-hidden="true" />
              {roleLabel}
            </span>
            <UserMenu roleLabel={roleLabel} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--cpc-parchment)]">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
          <p className="text-xs text-[var(--cpc-slate)]">
            <span className="font-serif font-semibold text-[var(--cpc-navy)]">InternFlow</span>, Cordova Public College
          </p>
          <p className="mt-1 text-xs text-[var(--cpc-slate)]">
            &copy; {new Date().getFullYear()} Cordova Public College. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

function UserMenu({ roleLabel }: { roleLabel: string }) {
  const { user, logout } = useAuthContext()
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Account"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "max-w-[11rem] gap-1.5 px-2 text-[var(--cpc-navy)] sm:max-w-[15rem]")}>
        <span className="min-w-0 truncate">{name}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="block py-1.5 text-left">
            <span className="block truncate text-sm font-semibold text-[var(--cpc-navy)]">{name}</span>
            <span className="mt-0.5 block truncate text-xs font-normal text-[var(--cpc-slate)]">
              {user?.email ?? "Not assigned"}
            </span>
            <span className="mt-2 block text-xs text-[var(--cpc-slate)]">
              Role: <span className="font-medium text-[var(--cpc-navy)]">{roleLabel}</span>
            </span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOut aria-hidden="true" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

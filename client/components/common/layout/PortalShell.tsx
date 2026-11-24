"use client"

import { User as UserIcon } from "lucide-react"
import Logo from "@/components/common/layout/Logo"
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

interface PortalShellProps {
  children: React.ReactNode
  roleLabel: string
}

/**
 * Shared role portal shell. Header carries the college mark, product
 * wordmark, a role badge, and a user dropdown with sign out. The only live
 * navigation item in this slice is Dashboard; no dead module links are
 * rendered.
 */
export default function PortalShell({
  children,
  roleLabel,
}: PortalShellProps) {
  return (
    <div className="flex flex-col min-h-svh">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-background/90 backdrop-blur-sm supports-[backdrop-filter]:bg-background/[0.85]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" />
            <span className="font-serif font-semibold text-[var(--cpc-navy)] tracking-tight">InternFlow</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-md border border-[var(--cpc-navy)]/20 bg-[var(--cpc-parchment)] px-2.5 py-1 text-xs font-medium text-[var(--cpc-navy)]">
              <span
                className="relative flex h-1.5 w-1.5 rounded-full bg-[var(--cpc-navy)]"
                aria-hidden="true"
              />
              {roleLabel}
            </span>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--cpc-parchment)] pt-8 pb-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-xs text-[var(--cpc-slate)]">
          &copy; {new Date().getFullYear()} Cordova Public College &middot;
          InternFlow. All rights reserved.
        </div>
      </footer>
    </div>
  )
}

function UserMenu() {
  const { user, logout } = useAuthContext()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-[var(--cpc-navy)] border-[var(--cpc-navy)]/30 hover:bg-[var(--cpc-navy)]/5")}>
        {user?.firstName} {user?.lastName}
        <UserIcon className="ml-2 h-3.5 w-3.5" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>
          <DropdownMenuLabel className="text-[var(--cpc-navy)] font-medium">
            {user?.email}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  )
}

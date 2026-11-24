"use client"

import Spinner from "@/components/common/layout/Spinner"
import { useAuthContext } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { ReactNode, useEffect } from "react"

export type GuardMode = "GUEST" | "ADMIN" | "DEAN" | "STUDENT" | "COMPANY_SUPERVISOR"

const ROLE_DASHBOARD: Record<Exclude<GuardMode, "GUEST">, string> = {
  ADMIN: "/admin/dashboard",
  DEAN: "/dean/dashboard",
  STUDENT: "/student/dashboard",
  COMPANY_SUPERVISOR: "/supervisor/dashboard",
}

interface AuthGuardProps {
  children: ReactNode
  mode?: GuardMode
}

export function AuthGuard({ children, mode = "GUEST" }: AuthGuardProps) {
  const { isLoading, isAuthenticated, user } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) {
      return
    }

    const target = ROLE_DASHBOARD[user?.role ?? "ADMIN"]

    // Not logged in on a protected page → login.
    if (!isAuthenticated && mode !== "GUEST") {
      router.replace("/login")
      return
    }

    // Authenticated but wrong role → own dashboard.
    if (mode !== "GUEST" && user?.role !== mode) {
      router.replace(target)
      return
    }

    // Logged in on a guest-only page → own dashboard.
    if (mode === "GUEST" && isAuthenticated) {
      router.replace(target)
    }
  }, [isLoading, isAuthenticated, user, mode, router])

  // Guest pages (login, signup) render immediately — no auth gate.
  if (mode === "GUEST") {
    if (isAuthenticated) {
      return <Spinner content="Redirecting..." />
    }
    return <>{children}</>
  }

  // Protected routes: spin while the session is being determined.
  if (isLoading) {
    return <Spinner content="Verifying session..." />
  }

  // No glimpse of protected UI while a redirect happens.
  if (!isAuthenticated) {
    return <Spinner content="Redirecting..." />
  }

  // Role mismatch: redirect spinner, never the wrong dashboard.
  if (user?.role !== mode) {
    return <Spinner content="Redirecting..." />
  }

  return <>{children}</>
}

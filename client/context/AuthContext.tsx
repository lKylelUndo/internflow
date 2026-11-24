"use client"

import { useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { authService, type User, type UserRole } from "@/services/auth.service"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const ROLE_DASHBOARD: Record<UserRole, string> = {
  ADMIN: "/admin/dashboard",
  DEAN: "/dean/dashboard",
  STUDENT: "/student/dashboard",
  COMPANY_SUPERVISOR: "/supervisor/dashboard",
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const response = await authService.getMe()
        if (mounted) {
          setUser(response?.data?.user ?? null)
        }
      } catch (error) {
        console.error("Session verification failed", error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authService.login({ email, password })

      const userData = response.data?.user
      if (response.code === 200 && userData) {
        setUser(userData)

        // Full document navigation so the dashboard loads with the session
        // cookies attached. Client-side navigation races cookie state and
        // forces a manual refresh before the session is recognized.
        const target = ROLE_DASHBOARD[userData.role] ?? "/"
        window.location.href = target
      } else {
        throw new Error(response.message ?? "Login failed.")
      }
    },
    [],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } catch {
      // Sign out regardless of API outcome; the cookie is cleared on the server.
    } finally {
      setUser(null)
      router.replace("/login")
    }
  }, [router])

  const refreshUser = useCallback(async () => {
    const response = await authService.getMe()
    setUser(response?.data?.user ?? null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error(
      "useAuthContext must be used within an AuthProvider component",
    )
  }
  return context
}

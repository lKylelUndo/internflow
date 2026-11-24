import Header from "@/components/common/layout/Header"
import Footer from "@/components/common/layout/Footer"
import Logo from "@/components/common/layout/Logo"
import { AuthGuard } from "@/components/features/auth/AuthGuard"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Account · InternFlow",
  description: "Sign in or apply for an internship account at Cordova Public College.",
}

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="GUEST">
      <div className="min-h-svh flex flex-col bg-background">
        <Header />

        <main className="flex-1 grid grid-cols-1 lg:grid-cols-2">
          {/* Left panel: college mark and product introduction */}
          <div className="hidden lg:flex lg:flex-col lg:items-center lg:justify-center p-10 bg-[var(--cpc-parchment)] text-[var(--cpc-parchment-foreground)]">
            <div className="max-w-sm text-center">
              <Logo size="lg" className="mx-auto mb-6" />
              <h2 className="font-serif text-3xl font-semibold text-[var(--cpc-navy)] mb-3">
                InternFlow
              </h2>
              <p className="text-sm leading-relaxed">
                Internship deployment and monitoring for Cordova Public College,
                Cebu, Philippines. Sign in to your account, or apply as a
                student to get started.
              </p>
            </div>
          </div>

          {/* Right panel: the sign-in or sign-up form */}
          <div className="w-full flex items-center justify-center p-6 sm:p-12 lg:p-24">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  )
}

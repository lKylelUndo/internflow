import PortalShell from "@/components/common/layout/PortalShell"
import { AuthGuard } from "@/components/features/auth/AuthGuard"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Supervisor Dashboard",
  description: "Company supervisor dashboard for InternFlow at Cordova Public College.",
}

export default function SupervisorRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="COMPANY_SUPERVISOR">
      <PortalShell roleLabel="Company Supervisor" navItems={[{ href: "/supervisor/dashboard", label: "Dashboard" }]}>{children}</PortalShell>
    </AuthGuard>
  )
}

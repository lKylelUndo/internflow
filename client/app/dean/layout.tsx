import PortalShell from "@/components/common/layout/PortalShell"
import { AuthGuard } from "@/components/features/auth/AuthGuard"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Dean Dashboard",
  description: "Dean dashboard for InternFlow at Cordova Public College.",
}

export default function DeanRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="DEAN">
      <PortalShell roleLabel="Dean" navItems={[{ href: "/dean/dashboard", label: "Dashboard" }, { href: "/dean/deployments", label: "Deployments" }, { href: "/dean/supervisors", label: "Supervisors" }, { href: "/dean/companies", label: "Companies" }, { href: "/dean/requirements", label: "Requirements" }]}>{children}</PortalShell>
    </AuthGuard>
  )
}

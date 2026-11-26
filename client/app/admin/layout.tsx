import PortalShell from "@/components/common/layout/PortalShell"
import { AuthGuard } from "@/components/features/auth/AuthGuard"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Administrator dashboard for InternFlow at Cordova Public College.",
}

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="ADMIN">
      <PortalShell roleLabel="Administrator" navItems={[{ href: "/admin/dashboard", label: "Dashboard" }, { href: "/admin/deans", label: "Deans" }]}>{children}</PortalShell>
    </AuthGuard>
  )
}

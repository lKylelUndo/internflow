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
      <PortalShell roleLabel="Dean">{children}</PortalShell>
    </AuthGuard>
  )
}

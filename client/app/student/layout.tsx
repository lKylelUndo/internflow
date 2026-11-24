import PortalShell from "@/components/common/layout/PortalShell"
import { AuthGuard } from "@/components/features/auth/AuthGuard"
import type { Metadata } from "next"
import type { ReactNode } from "react"

export const metadata: Metadata = {
  title: "Student Dashboard",
  description: "Student dashboard for InternFlow at Cordova Public College.",
}

export default function StudentRootLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard mode="STUDENT">
      <PortalShell roleLabel="Student">{children}</PortalShell>
    </AuthGuard>
  )
}

import { Source_Sans_3, Crimson_Pro } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
})

const serif = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700"],
})

export const metadata: Metadata = {
  title: {
    default: "InternFlow — Cordova Public College",
    template: "%s · InternFlow",
  },
  description:
    "Internship deployment and monitoring system for Cordova Public College, Cebu, Philippines. Student internship applications, dean and company supervision, and administrative oversight.",
  keywords: [
    "internflow",
    "cordova public college",
    "internship",
    "cebu",
    "philippines",
    "internship monitoring",
  ],
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", sans.variable, serif.variable, "font-sans")}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>{children}<Toaster /></ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

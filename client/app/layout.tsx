import { Instrument_Sans, Fraunces } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { Toaster } from "@/components/ui/sonner"

const sans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
})

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
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
      data-scroll-behavior="smooth"
      className={cn("antialiased", sans.variable, display.variable, "font-sans")}
    >
      <body>
        <AuthProvider>
          <ThemeProvider>{children}<Toaster /></ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

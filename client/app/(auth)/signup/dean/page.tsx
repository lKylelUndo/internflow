import SignupForm from "@/components/features/auth/SignupForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply as a dean",
  description: "Dean account application for Cordova Public College.",
  alternates: {
    canonical: "/signup/dean",
  },
}

export default function DeanSignupPage() {
  return <SignupForm role="dean" />
}

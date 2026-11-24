import SignupForm from "@/components/features/auth/SignupForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply as a company supervisor",
  description: "Company supervisor account application for Cordova Public College.",
  alternates: {
    canonical: "/signup/supervisor",
  },
}

export default function SupervisorSignupPage() {
  return <SignupForm role="supervisor" />
}

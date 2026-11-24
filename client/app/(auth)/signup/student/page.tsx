import SignupForm from "@/components/features/auth/SignupForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply as a student",
  description: "Student internship application for Cordova Public College.",
  alternates: {
    canonical: "/signup/student",
  },
}

export default function StudentSignupPage() {
  return <SignupForm role="student" />
}

import LoginForm from "@/components/features/auth/LoginForm"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your InternFlow account at Cordova Public College.",
  alternates: {
    canonical: "/login",
  },
}

export default function LoginPage() {
  return <LoginForm />
}

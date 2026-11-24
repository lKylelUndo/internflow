"use client"

import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input, PasswordInput } from "@/components/ui/input"
import { useAuthContext } from "@/context/AuthContext"
import { loginSchema, type LoginInput } from "@/services/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

const LOGIN_FIELDS = ["email", "password"] as const
type LoginField = (typeof LOGIN_FIELDS)[number]

/** Backend paths may be prefixed (body.email) or nested; map them to a form field. */
function normalizeFieldPath(path: string): LoginField | null {
  const stripped = path.replace(/^(body|query|params)\./, "")
  const leaf = stripped.split(".").pop() ?? ""
  return LOGIN_FIELDS.find((field) => field === leaf) ?? null
}

export default function LoginForm() {
  const { login } = useAuthContext()
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { errors, isSubmitting } = form.formState

  async function onSubmit(data: LoginInput) {
    try {
      await login(data.email, data.password)
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { path?: string; message?: string } } }
      const serverError = axiosError?.response?.data
      console.error("Login form error:", serverError)

      const field = serverError?.path ? normalizeFieldPath(serverError.path) : null
      if (field && serverError?.message) {
        form.setError(field, { type: "server", message: serverError.message })
      } else {
        toast.error(serverError?.message ?? "Something went wrong")
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex w-full items-center justify-between">
        <Link href="/" className="text-sm font-medium text-[var(--cpc-navy)] hover:underline">
          ← Back to Cordova Public College
        </Link>
        <Link href="/signup/student" className="text-sm text-[var(--cpc-slate)] hover:text-[var(--cpc-crimson)] hover:underline">
          Need an account? Apply as a student
        </Link>
      </div>

      <form id="form-rhf-login" onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="form-rhf-email">Email address</FieldLabel>
            <Input
              id="form-rhf-email"
              type="email"
              placeholder="name@example.com"
              required
              autoComplete="email"
              aria-invalid={!!errors.email}
              {...form.register("email")}
            />
            <FieldError errors={[errors.email]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="form-rhf-password">Password</FieldLabel>
            <PasswordInput
              id="form-rhf-password"
              required
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>
        </FieldGroup>

        <Field orientation="horizontal" className="mt-6">
          <Button
            type="submit"
            form="form-rhf-login"
            disabled={isSubmitting}
            className="w-full bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </Field>
      </form>
    </div>
  )
}

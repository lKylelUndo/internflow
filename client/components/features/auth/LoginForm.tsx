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

      const field = serverError?.path ? normalizeFieldPath(serverError.path) : null
      if (field && serverError?.message) {
        form.setError(field, { type: "server", message: serverError.message })
      } else {
        toast.error(serverError?.message ?? "Something went wrong")
      }
    }
  }

  return (
    <div className="w-full">
      <h1 className="font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] sm:text-display-lg">
        Sign in
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--cpc-slate)]">
        Use the email address registered with Cordova Public College.
      </p>

      <form id="form-rhf-login" onSubmit={form.handleSubmit(onSubmit)} className="mt-7">
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
              className="h-11 px-3.5"
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
              className="h-11 pl-3.5"
              {...form.register("password")}
            />
            <FieldError errors={[errors.password]} />
          </Field>
        </FieldGroup>

        <Button
          type="submit"
          form="form-rhf-login"
          disabled={isSubmitting}
          className="mt-6 h-11 w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <p className="mt-6 text-sm text-[var(--cpc-slate)]">
        Need an account?{" "}
        <Link
          href="/signup/student"
          className="font-medium text-[var(--cpc-crimson)] hover:underline"
        >
          Apply as a student
        </Link>
      </p>
    </div>
  )
}

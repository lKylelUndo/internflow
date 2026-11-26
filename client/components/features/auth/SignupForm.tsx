"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input, PasswordInput } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { academicService } from "@/services/academic.service"
import { companyService } from "@/services/company.service"
import { authService, deanSignupSchema, studentSignupSchema, supervisorSignupSchema, type DeanSignupInput, type StudentSignupInput, type SupervisorSignupInput } from "@/services/auth.service"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm, useWatch, type Resolver } from "react-hook-form"

type Role = "student" | "dean" | "supervisor"

interface SignupFormProps {
  role: Role
}

/** One flat form value shape for all three role-specific payloads. */
interface SignupFormValues {
  firstName: string
  middleName: string
  lastName: string
  email: string
  password: string
  contactNumber: string
  studentNumber: string
  yearLevel: number
  programId: string
  departmentId: string
  companyId: string
  position: string
}

const SIGNUP_FIELDS = ["firstName", "middleName", "lastName", "email", "password", "contactNumber", "studentNumber", "yearLevel", "programId", "departmentId", "companyId", "position"] as const
type SignupField = (typeof SIGNUP_FIELDS)[number]

/** Backend paths may be prefixed (body.email) or nested; map them to a form field. */
function normalizeFieldPath(path: string): SignupField | null {
  const stripped = path.replace(/^(body|query|params)\./, "")
  for (const part of stripped.split(".")) {
    const match = SIGNUP_FIELDS.find((field) => field === part)
    if (match) {
      return match
    }
  }
  return null
}

/** Full document navigation keeps the freshly set session cookie in play. */
function navigateTo(path: string) {
  window.location.href = path
}

const ROLE_LABELS: Record<Role, string> = {
  student: "Student applicant",
  dean: "Dean applicant",
  supervisor: "Company supervisor applicant",
}

const ROLE_COPY: Record<Role, { title: string; lede: string }> = {
  student: {
    title: "Apply as a student",
    lede: "Create your applicant record. Your department and program are confirmed by the college before you are deployed.",
  },
  dean: {
    title: "Apply as a dean",
    lede: "Request a dean account for your department. College accounts are verified by the internship office before access is granted.",
  },
  supervisor: {
    title: "Apply as a company supervisor",
    lede: "Request a supervisor account for your company. Accounts are verified with the college before access is granted.",
  },
}

const YEAR_LEVELS = [1, 2, 3, 4, 5, 6]
const yearLevelItems = YEAR_LEVELS.map((level) => ({ value: String(level), label: `Year ${level}` }))

interface DepartmentOption {
  id: string
  name: string
  programs: { id: string; name: string }[]
}

interface CompanyOption {
  id: string
  name: string
  address: string
  description: string
}

export default function SignupForm({ role }: SignupFormProps) {
  const [departments, setDepartments] = useState<DepartmentOption[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(true)
  const [companyState, setCompanyState] = useState<{ departmentId: string; companies: CompanyOption[] }>({ departmentId: "", companies: [] })

  useEffect(() => {
    let cancelled = false
    const loadDepartments = async () => {
      try {
        const envelope = await academicService.getDepartments()
        if (!cancelled) {
          setDepartments(envelope?.data?.departments ?? [])
        }
      } catch {
        if (!cancelled) {
          setDepartments([])
        }
      } finally {
        if (!cancelled) {
          setDepartmentsLoading(false)
        }
      }
    }
    void loadDepartments()
    return () => {
      cancelled = true
    }
  }, [])

  // The active role decides which schema validates the submitted values.
  // A single cast bridges the union of role schemas and the flat form shape.
  const roleSchema = role === "student" ? studentSignupSchema : role === "dean" ? deanSignupSchema : supervisorSignupSchema
  const resolver = zodResolver(roleSchema) as unknown as Resolver<SignupFormValues>
  const form = useForm<SignupFormValues>({
    resolver,
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      password: "",
      contactNumber: "",
      studentNumber: "",
      yearLevel: 1,
      programId: "",
      departmentId: "",
      companyId: "",
      position: "",
    },
  })

  const { errors, isSubmitting } = form.formState

  // Cascading selects stay reactive: programs and companies are derived from
  // the watched department, not read once from getValues(). useWatch is the
  // compiler-safe form of form.watch for this subscription.
  const departmentId = useWatch({ control: form.control, name: "departmentId" })
  const programs = role === "student" ? departments.find((department) => department.id === departmentId)?.programs ?? [] : []

  const departmentItems = departments.map((department) => ({ value: department.id, label: department.name }))
  const programItems = programs.map((program) => ({ value: program.id, label: program.name }))
  const companies = companyState.departmentId === departmentId ? companyState.companies : []
  const companyItems = companies.map((company) => ({ value: company.id, label: company.name }))
  const companiesLoading = role === "supervisor" && !!departmentId && companyState.departmentId !== departmentId

  useEffect(() => {
    if (role !== "supervisor" || !departmentId) {
      return
    }
    let cancelled = false
    const loadCompanies = async () => {
      try {
        const envelope = await companyService.getPublicCompanies(departmentId)
        if (!cancelled) {
          setCompanyState({ departmentId, companies: envelope?.data?.companies ?? [] })
        }
      } catch {
        if (!cancelled) {
          setCompanyState({ departmentId, companies: [] })
        }
      }
    }
    void loadCompanies()
    return () => {
      cancelled = true
    }
  }, [departmentId, role])

  async function onSubmit(data: SignupFormValues) {
    try {
      switch (role) {
        case "student": {
          const payload: StudentSignupInput = {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            contactNumber: data.contactNumber,
            studentNumber: data.studentNumber,
            yearLevel: data.yearLevel,
            programId: data.programId,
          }
          const response = await authService.signupStudent(payload)
          toast.success(response.message ?? "Application received.")
          navigateTo("/student/dashboard")
          return
        }
        case "dean": {
          const payload: DeanSignupInput = {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            contactNumber: data.contactNumber,
            departmentId: data.departmentId,
          }
          await authService.signupDean(payload)
          toast.success("Application received — awaiting verification.")
          navigateTo("/login")
          return
        }
        case "supervisor": {
          const payload: SupervisorSignupInput = {
            firstName: data.firstName,
            middleName: data.middleName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            contactNumber: data.contactNumber,
            companyId: data.companyId,
            position: data.position,
          }
          await authService.signupSupervisor(payload)
          toast.success("Application received — awaiting verification.")
          navigateTo("/login")
          return
        }
      }
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { path?: string; message?: string; errors?: { path: string; message: string }[] } }
      }
      const serverError = axiosError?.response?.data

      if (serverError?.errors?.length) {
        let attached = false
        serverError.errors.forEach((err) => {
          const field = normalizeFieldPath(err.path)
          if (field) {
            form.setError(field, { type: "server", message: err.message })
            attached = true
          }
        })
        if (attached) {
          return
        }
      }

      const field = serverError?.path ? normalizeFieldPath(serverError.path) : null
      if (field && serverError?.message) {
        form.setError(field, { type: "server", message: serverError.message })
        return
      }

      toast.error(serverError?.message ?? "Something went wrong.")
    }
  }

  return (
    <div className="w-full max-w-md">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-[var(--cpc-navy)] transition-colors hover:text-[var(--cpc-crimson)]"
      >
        ← Back to Cordova Public College
      </Link>

      <h1 className="mt-7 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] sm:text-display-lg">
        {ROLE_COPY[role].title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--cpc-slate)]">
        {ROLE_COPY[role].lede}
      </p>
      <p className="mt-4 text-sm text-[var(--cpc-slate)]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[var(--cpc-crimson)] hover:underline"
        >
          Sign in
        </Link>
      </p>

      <form
        id="form-rhf-signup"
        onSubmit={form.handleSubmit(onSubmit)}
        className="mt-8"
      >
        <FieldGroup>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="form-rhf-firstName">First name</FieldLabel>
              <Input id="form-rhf-firstName" required autoComplete="given-name" aria-invalid={!!errors.firstName} className="h-11 px-3.5" {...form.register("firstName")} />
              <FieldError errors={[errors.firstName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-rhf-middleName">Middle name</FieldLabel>
              <Input id="form-rhf-middleName" autoComplete="additional-name" aria-invalid={!!errors.middleName} className="h-11 px-3.5" {...form.register("middleName")} />
              <FieldError errors={[errors.middleName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-rhf-lastName">Last name</FieldLabel>
              <Input id="form-rhf-lastName" required autoComplete="family-name" aria-invalid={!!errors.lastName} className="h-11 px-3.5" {...form.register("lastName")} />
              <FieldError errors={[errors.lastName]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-rhf-email">Email address</FieldLabel>
              <Input id="form-rhf-email" type="email" required autoComplete="email" aria-invalid={!!errors.email} className="h-11 px-3.5" {...form.register("email")} />
              <FieldError errors={[errors.email]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-rhf-password">Password</FieldLabel>
              <PasswordInput id="form-rhf-password" required autoComplete="new-password" aria-invalid={!!errors.password} className="h-11 pl-3.5" {...form.register("password")} />
              <FieldError errors={[errors.password]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="form-rhf-contactNumber">Contact number</FieldLabel>
              <Input id="form-rhf-contactNumber" autoComplete="tel" aria-invalid={!!errors.contactNumber} className="h-11 px-3.5" {...form.register("contactNumber")} />
              <FieldError errors={[errors.contactNumber]} />
            </Field>
          </div>

          {role === "student" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="form-rhf-studentNumber">Student number</FieldLabel>
                  <Input id="form-rhf-studentNumber" required aria-invalid={!!errors.studentNumber} className="h-11 px-3.5" {...form.register("studentNumber")} />
                  <FieldError errors={[errors.studentNumber]} />
                </Field>
                <Controller
                  name="yearLevel"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="form-rhf-yearLevel">Year level</FieldLabel>
                      <Select
                        items={yearLevelItems}
                        value={String(field.value)}
                        onValueChange={(value) => field.onChange(value === null ? 0 : Number(value))}
                      >
                        <SelectTrigger id="form-rhf-yearLevel" aria-invalid={fieldState.invalid} className="h-11 w-full data-[size=default]:h-11">
                          <SelectValue placeholder="Select year level" />
                        </SelectTrigger>
                        <SelectContent>
                          {YEAR_LEVELS.map((level) => (
                            <SelectItem key={level} value={String(level)}>Year {level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>
            </>
          )}

          {(role === "student" || role === "dean" || role === "supervisor") && (
            <Controller
              name="departmentId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="form-rhf-departmentId">Department</FieldLabel>
                  <Select
                    items={departmentItems}
                    value={field.value || null}
                    onValueChange={(value) => {
                      field.onChange(value ?? "")
                      // A new department invalidates both downstream choices.
                      form.setValue("programId", "")
                      form.setValue("companyId", "")
                    }}
                    disabled={departmentsLoading}
                  >
                    <SelectTrigger id="form-rhf-departmentId" aria-invalid={fieldState.invalid} className="h-11 w-full data-[size=default]:h-11">
                      <SelectValue placeholder="Choose a department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>{department.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                  {departmentsLoading && (
                    <p className="mt-1 text-xs text-[var(--cpc-slate)]">Loading departments…</p>
                  )}
                </Field>
              )}
            />
          )}

          {role === "student" && (
            <Controller
              name="programId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field>
                  <FieldLabel htmlFor="form-rhf-programId">Program</FieldLabel>
                  <Select
                    items={programItems}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                    disabled={!departmentId || departmentsLoading}
                  >
                    <SelectTrigger id="form-rhf-programId" aria-invalid={fieldState.invalid} className="h-11 w-full data-[size=default]:h-11">
                      <SelectValue placeholder="Choose a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}

          {role === "supervisor" && (
            <>
              <Controller
                name="companyId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="form-rhf-companyId">Company</FieldLabel>
                    <Select
                      items={companyItems}
                      value={field.value || null}
                      onValueChange={(value) => field.onChange(value ?? "")}
                      disabled={companiesLoading || !departmentId}
                    >
                      <SelectTrigger id="form-rhf-companyId" aria-invalid={fieldState.invalid} className="h-11 w-full data-[size=default]:h-11">
                        <SelectValue placeholder="Choose a company" />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                    {companiesLoading && (
                      <p className="mt-1 text-xs text-[var(--cpc-slate)]">Loading companies…</p>
                    )}
                  </Field>
                )}
              />
              <Field>
                <FieldLabel htmlFor="form-rhf-position">Position</FieldLabel>
                <Input id="form-rhf-position" placeholder="e.g. Internship Coordinator" aria-invalid={!!errors.position} className="h-11 px-3.5" {...form.register("position")} />
                <FieldError errors={[errors.position]} />
              </Field>
            </>
          )}
        </FieldGroup>

        <Button
          type="submit"
          form="form-rhf-signup"
          disabled={isSubmitting}
          className="mt-7 h-11 w-full"
        >
          {isSubmitting ? "Submitting…" : `Submit ${ROLE_LABELS[role]} application`}
        </Button>
      </form>
    </div>
  )
}

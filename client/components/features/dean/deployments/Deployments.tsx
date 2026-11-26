"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Inbox, LoaderCircle, Plus, RotateCw, TriangleAlert } from "lucide-react"
import { Controller, useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { applicationService, type Application } from "@/services/application.service"
import { cancelDeploymentSchema, createDeploymentSchema, deploymentService, type CreateDeploymentInput, type Deployment, type DeploymentStatus } from "@/services/deployment.service"
import { supervisorService, type SafeSupervisor } from "@/services/supervisor.service"
import { z } from "zod"

const LOADING_ROWS = [0, 1, 2, 3]

const STATUS_FILTERS = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING_ACCEPTANCE", label: "Pending acceptance" },
  { value: "DEPLOYED", label: "Deployed" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
] as const

type StatusFilter = (typeof STATUS_FILTERS)[number]["value"]

const STATUS_LABELS: Record<DeploymentStatus, string> = {
  PENDING_ACCEPTANCE: "Pending acceptance",
  DEPLOYED: "Deployed",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
}

const STATUS_DOTS: Record<DeploymentStatus, string> = {
  PENDING_ACCEPTANCE: "bg-[var(--cpc-gold)]",
  DEPLOYED: "bg-[var(--cpc-navy)]",
  IN_PROGRESS: "bg-[var(--cpc-gold)]",
  COMPLETED: "bg-[var(--cpc-navy)]",
  CANCELLED: "bg-[var(--cpc-slate)]",
}

const createFormSchema = createDeploymentSchema.extend({
  startDate: z.string().min(1, "Start date is required."),
  endDate: z.string(),
}).refine((values) => !values.endDate || values.endDate >= values.startDate, {
  path: ["endDate"],
  message: "End date must be on or after start date.",
})

type CreateFormValues = z.infer<typeof createFormSchema>
type CancelFormValues = z.infer<typeof cancelDeploymentSchema>

function errorMessage(error: unknown, fallback: string): string {
  const backendMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message
  if (typeof backendMessage === "string" && backendMessage.trim()) return backendMessage
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-PH")
}

function fullName(user: { firstName: string; lastName: string }): string {
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Name not provided"
}

function hoursLabel(deployment: Deployment): string {
  const required = Number(deployment.requiredHours)
  const completed = Number(deployment.completedHours)
  if (!Number.isFinite(required) || required <= 0) return "Not set"
  return `${Number.isFinite(completed) ? completed : 0} / ${required} hrs`
}

function isTerminal(status: DeploymentStatus): boolean {
  return status === "COMPLETED" || status === "CANCELLED"
}

function StatusChip({ status }: { status: DeploymentStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--cpc-navy)]">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", STATUS_DOTS[status])} aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  )
}

/**
 * Dean deployment board. Every row and mutation comes from the live deployment
 * endpoints; create options are read from approved applications and active
 * supervisors only.
 */
export function Deployments() {
  const [status, setStatus] = useState<StatusFilter>("ALL")
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<Deployment | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [applications, setApplications] = useState<Application[]>([])
  const [supervisors, setSupervisors] = useState<SafeSupervisor[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [optionsError, setOptionsError] = useState<string | null>(null)
  const [optionsKey, setOptionsKey] = useState(0)

  const createForm = useForm<CreateFormValues>({
    resolver: zodResolver(createFormSchema),
    defaultValues: { applicationId: "", supervisorId: "", startDate: "", endDate: "" },
  })
  const { errors: createErrors, isSubmitting: isCreating } = createForm.formState
  const selectedApplicationId = useWatch({ control: createForm.control, name: "applicationId" })
  const selectedStartDate = useWatch({ control: createForm.control, name: "startDate" })

  const cancelForm = useForm<CancelFormValues>({
    resolver: zodResolver(cancelDeploymentSchema),
    defaultValues: { cancelledReason: "" },
  })
  const { errors: cancelErrors, isSubmitting: isCancelling } = cancelForm.formState

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await deploymentService.list(status === "ALL" ? undefined : status)
        if (cancelled) return
        if (response.status !== "success") {
          setDeployments([])
          setError(response.message || "Could not load deployments.")
          return
        }
        setDeployments(response.data?.deployments ?? [])
      } catch (caught) {
        if (cancelled) return
        setDeployments([])
        setError(errorMessage(caught, "Could not load deployments."))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [status, reloadKey])

  useEffect(() => {
    if (!createOpen) {
      return
    }
    let cancelled = false

    const loadOptions = async () => {
      setOptionsLoading(true)
      setOptionsError(null)
      try {
        const [applicationResponse, supervisorResponse] = await Promise.all([
          applicationService.listApproved(),
          supervisorService.list("ACTIVE"),
        ])
        if (cancelled) return

        const failure = applicationResponse.status !== "success"
          ? applicationResponse.message
          : supervisorResponse.status !== "success"
            ? supervisorResponse.message
            : null
        if (failure) {
          setApplications([])
          setSupervisors([])
          setOptionsError(failure || "Could not load deployment options.")
          return
        }

        // Only an unfiltered list is a safe basis for hiding deployed applications.
        const deployedApplicationIds = new Set(
          status === "ALL"
            ? deployments.map((deployment) => deployment.applicationId).filter((id): id is string => typeof id === "string")
            : [],
        )
        setApplications((applicationResponse.data?.applications ?? []).filter((application) => !deployedApplicationIds.has(application.id)))
        setSupervisors(supervisorResponse.data?.supervisors ?? [])
      } catch (caught) {
        if (cancelled) return
        setApplications([])
        setSupervisors([])
        setOptionsError(errorMessage(caught, "Could not load deployment options."))
      } finally {
        if (!cancelled) setOptionsLoading(false)
      }
    }

    void loadOptions()
    return () => {
      cancelled = true
    }
  }, [createOpen, optionsKey, status, deployments])

  const selectedApplication = applications.find((application) => application.id === selectedApplicationId)
  const supervisorOptions = selectedApplication
    ? supervisors.filter((supervisor) => supervisor.company.id === selectedApplication.internship.company.id)
    : []
  const applicationItems = applications.map((application) => ({
    value: application.id,
    label: `${fullName(application.studentProfile.user)} — ${application.internship.title} — ${application.internship.company.name}`,
  }))
  const supervisorItems = supervisorOptions.map((supervisor) => ({
    value: supervisor.id,
    label: fullName(supervisor.user),
  }))
  const filterItems = STATUS_FILTERS.map((filter) => ({ value: filter.value, label: filter.label }))
  const createBusy = isCreating || busyId === "create"
  const cancelBusy = isCancelling || (cancelTarget !== null && busyId === cancelTarget.id)

  const openCreate = () => {
    createForm.reset({ applicationId: "", supervisorId: "", startDate: "", endDate: "" })
    setOptionsError(null)
    setOptionsKey((key) => key + 1)
    setCreateOpen(true)
  }

  const closeCreate = () => {
    setCreateOpen(false)
    createForm.reset()
  }

  const openCancel = (deployment: Deployment) => {
    cancelForm.reset({ cancelledReason: "" })
    setCancelTarget(deployment)
  }

  const closeCancel = () => {
    setCancelTarget(null)
    cancelForm.reset()
  }

  const handleStatusChange = (value: string | null) => {
    const next = STATUS_FILTERS.find((filter) => filter.value === value)
    setStatus(next ? next.value : "ALL")
  }

  const onSubmitCreate = async (values: CreateFormValues) => {
    if (supervisorOptions.length === 0) {
      return
    }
    const payload: CreateDeploymentInput = {
      applicationId: values.applicationId,
      supervisorId: values.supervisorId,
      startDate: values.startDate,
      ...(values.endDate ? { endDate: values.endDate } : {}),
    }

    setBusyId("create")
    try {
      const response = await deploymentService.create(payload)
      if (response.status === "success") {
        toast.success(response.message || "Deployment created successfully")
        closeCreate()
        setReloadKey((key) => key + 1)
      } else {
        toast.error(response.message || "Could not create the deployment.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not create the deployment."))
    } finally {
      setBusyId(null)
    }
  }

  const onSubmitCancel = async (values: CancelFormValues) => {
    const target = cancelTarget
    if (!target) return

    setBusyId(target.id)
    try {
      const response = await deploymentService.cancel(target.id, { cancelledReason: values.cancelledReason.trim() })
      if (response.status === "success") {
        toast.success(response.message || "Deployment cancelled successfully")
        closeCancel()
        setReloadKey((key) => key + 1)
      } else {
        toast.error(response.message || "Could not cancel the deployment.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not cancel the deployment."))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold)]" />
          <p className="mt-5 text-sm font-medium text-[var(--cpc-navy)]">Dean</p>
          <h1 className="mt-3 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] text-balance sm:text-display-lg">
            Deployments
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--cpc-slate)]">
            Coordinate student placements and track deployment status across your department.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4 self-start">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={isLoading || busyId !== null}
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--cpc-crimson)] transition-colors hover:underline disabled:opacity-60 disabled:no-underline"
          >
            {isLoading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
          <Button type="button" size="sm" onClick={openCreate} disabled={busyId !== null} className="bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90">
            <Plus aria-hidden="true" />
            New deployment
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Select items={filterItems} value={status} onValueChange={handleStatusChange}>
          <SelectTrigger aria-label="Filter deployments by status" className="h-9 w-48 data-[size=default]:h-9">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map((filter) => (
              <SelectItem key={filter.value} value={filter.value}>{filter.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!isLoading && !error ? (
          <p className="text-sm text-[var(--cpc-slate)]">
            {deployments.length} {deployments.length === 1 ? "deployment" : "deployments"} shown
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-crimson)]">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            Couldn&apos;t load deployments
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">{error}</p>
          <Button type="button" variant="outline" onClick={() => setReloadKey((key) => key + 1)} className="mt-6 border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]">
            Try again
          </Button>
        </div>
      ) : !isLoading && deployments.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-slate)]">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            No deployments in this view
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">
            Create a deployment from an approved application, or choose a different status filter.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
          <Table className="min-w-[72rem]">
            <TableHeader>
              <TableRow className="bg-[var(--cpc-parchment)] hover:bg-[var(--cpc-parchment)]">
                <TableHead className="min-w-[14rem] text-xs text-[var(--cpc-slate)]">Student</TableHead>
                <TableHead className="min-w-[14rem] text-xs text-[var(--cpc-slate)]">Placement</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Supervisor</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Schedule</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Hours</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Status</TableHead>
                <TableHead className="text-right text-xs text-[var(--cpc-slate)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                LOADING_ROWS.map((row) => (
                  <TableRow key={row}>
                    <TableCell colSpan={7} className="py-4">
                      <div className="h-6 w-full rounded bg-[var(--muted)]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                deployments.map((deployment) => {
                  const rowBusy = busyId === deployment.id
                  const terminal = isTerminal(deployment.status)
                  return (
                    <TableRow key={deployment.id} aria-busy={rowBusy} className={cn(rowBusy && "opacity-60")}>
                      <TableCell className="whitespace-normal">
                        <span className="block font-medium text-[var(--cpc-navy)]">{fullName(deployment.studentProfile.user)}</span>
                        <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">
                          {deployment.studentProfile.studentNumber} — Year {deployment.studentProfile.yearLevel}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="block font-medium text-[var(--cpc-navy)]">{deployment.company.name}</span>
                        <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">{deployment.internship.title}</span>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="block font-medium text-[var(--cpc-navy)]">{fullName(deployment.supervisor.user)}</span>
                        <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">{deployment.supervisor.position ?? "Supervisor"}</span>
                      </TableCell>
                      <TableCell className="whitespace-normal text-sm text-[var(--cpc-slate)]">
                        {formatDate(deployment.startDate)} – {deployment.endDate ? formatDate(deployment.endDate) : "Open-ended"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-[var(--cpc-slate)]">{hoursLabel(deployment)}</TableCell>
                      <TableCell><StatusChip status={deployment.status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end whitespace-nowrap">
                          {terminal ? (
                            <span className="text-sm text-[var(--cpc-slate)]">—</span>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={rowBusy || isLoading || busyId !== null}
                              onClick={() => openCancel(deployment)}
                              className="border-[var(--cpc-crimson)]/40 text-[var(--cpc-crimson)] hover:bg-[var(--cpc-crimson)]/10 hover:text-[var(--cpc-crimson)]"
                            >
                              {rowBusy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={(open) => { if (!open) closeCreate() }}>
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
              New deployment
            </DialogTitle>
            <DialogDescription>
              Deploy an approved application to a company supervisor and set the schedule.
            </DialogDescription>
          </DialogHeader>

          {optionsError ? (
            <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-8 text-center">
              <TriangleAlert className="mx-auto h-5 w-5 text-[var(--cpc-crimson)]" aria-hidden="true" />
              <p className="mt-3 text-sm leading-relaxed text-[var(--cpc-slate)]">{optionsError}</p>
              <Button type="button" variant="outline" onClick={() => setOptionsKey((key) => key + 1)} className="mt-4 border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]">
                Try again
              </Button>
            </div>
          ) : optionsLoading ? (
            <div className="flex items-center gap-2 py-8 text-sm text-[var(--cpc-slate)]" role="status">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Loading approved applications and active supervisors…
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-8 text-center">
              <Inbox className="mx-auto h-5 w-5 text-[var(--cpc-slate)]" aria-hidden="true" />
              <p className="mt-3 font-medium text-[var(--cpc-navy)]">No approved applications available</p>
              <p className="mt-1 text-sm leading-relaxed text-[var(--cpc-slate)]">
                Approve a student application before creating a deployment. Applications already deployed are hidden here.
              </p>
            </div>
          ) : (
            <form id="deployment-create-form" onSubmit={createForm.handleSubmit(onSubmitCreate)}>
              <FieldGroup>
                <Controller
                  name="applicationId"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="deployment-application">Approved application</FieldLabel>
                      <Select
                        items={applicationItems}
                        value={field.value || null}
                        onValueChange={(value) => {
                          field.onChange(value ?? "")
                          createForm.setValue("supervisorId", "")
                        }}
                      >
                        <SelectTrigger id="deployment-application" aria-invalid={fieldState.invalid} className="h-11 w-full data-[size=default]:h-11">
                          <SelectValue placeholder="Select an application" />
                        </SelectTrigger>
                        <SelectContent>
                          {applications.map((application) => (
                            <SelectItem key={application.id} value={application.id}>
                              <span className="flex flex-col gap-0.5">
                                <span className="font-medium">{fullName(application.studentProfile.user)} — {application.studentProfile.studentNumber}</span>
                                <span className="text-xs text-[var(--cpc-slate)]">{application.internship.title} — {application.internship.company.name}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  name="supervisorId"
                  control={createForm.control}
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor="deployment-supervisor">Company supervisor</FieldLabel>
                      <Select
                        items={supervisorItems}
                        value={field.value || null}
                        onValueChange={(value) => field.onChange(value ?? "")}
                        disabled={!selectedApplicationId || supervisorOptions.length === 0}
                      >
                        <SelectTrigger id="deployment-supervisor" aria-invalid={fieldState.invalid} className="h-11 w-full data-[size=default]:h-11">
                          <SelectValue placeholder={selectedApplicationId ? "Select a supervisor" : "Select an application first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {supervisorOptions.map((supervisor) => (
                            <SelectItem key={supervisor.id} value={supervisor.id}>
                              <span className="flex flex-col gap-0.5">
                                <span className="font-medium">{fullName(supervisor.user)}</span>
                                <span className="text-xs text-[var(--cpc-slate)]">{supervisor.position ?? "Supervisor"}</span>
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FieldError errors={[fieldState.error]} />
                      {selectedApplicationId && supervisorOptions.length === 0 ? (
                        <p className="text-xs text-[var(--cpc-slate)]">
                          No active supervisors are available for this company. Verify a supervisor first.
                        </p>
                      ) : null}
                    </Field>
                  )}
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="deployment-start-date">Start date</FieldLabel>
                    <Input
                      id="deployment-start-date"
                      type="date"
                      className="h-11 px-3.5"
                      aria-invalid={!!createErrors.startDate}
                      {...createForm.register("startDate")}
                    />
                    <FieldError errors={[createErrors.startDate]} />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="deployment-end-date">End date (optional)</FieldLabel>
                    <Input
                      id="deployment-end-date"
                      type="date"
                      min={selectedStartDate || undefined}
                      className="h-11 px-3.5"
                      aria-invalid={!!createErrors.endDate}
                      {...createForm.register("endDate")}
                    />
                    <FieldError errors={[createErrors.endDate]} />
                  </Field>
                </div>
              </FieldGroup>
            </form>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" disabled={createBusy} onClick={closeCreate}>
              Cancel
            </Button>
            <Button
              type="submit"
              form="deployment-create-form"
              disabled={createBusy || optionsLoading || optionsError !== null || applications.length === 0 || supervisorOptions.length === 0}
              className="bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90"
            >
              {createBusy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              Create deployment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelTarget !== null} onOpenChange={(open) => { if (!open) closeCancel() }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
              Cancel deployment
            </DialogTitle>
            <DialogDescription>
              {cancelTarget
                ? `Cancel the deployment for ${fullName(cancelTarget.studentProfile.user)} at ${cancelTarget.company.name}. This cannot be undone.`
                : "Cancel this deployment. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <form id="deployment-cancel-form" onSubmit={cancelForm.handleSubmit(onSubmitCancel)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="deployment-cancel-reason">Cancellation reason</FieldLabel>
                <Textarea
                  id="deployment-cancel-reason"
                  rows={3}
                  minLength={3}
                  maxLength={500}
                  placeholder="Explain why this deployment is being cancelled."
                  aria-invalid={!!cancelErrors.cancelledReason}
                  {...cancelForm.register("cancelledReason")}
                />
                <FieldError errors={[cancelErrors.cancelledReason]} />
                <p className="text-xs text-[var(--cpc-slate)]">Between 3 and 500 characters.</p>
              </Field>
            </FieldGroup>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={cancelBusy} onClick={closeCancel}>
              Keep deployment
            </Button>
            <Button
              type="submit"
              form="deployment-cancel-form"
              disabled={cancelBusy}
              className="bg-[var(--cpc-crimson)] text-[var(--cpc-crimson-foreground)] hover:bg-[var(--cpc-crimson)]/90"
            >
              {cancelBusy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              Cancel deployment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

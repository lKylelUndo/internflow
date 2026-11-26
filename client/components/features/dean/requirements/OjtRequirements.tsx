"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Inbox, LoaderCircle, Pencil, Plus, RotateCw, Trash2, TriangleAlert } from "lucide-react"
import { Controller, useFieldArray, useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAuthContext } from "@/context/AuthContext"
import { cn } from "@/lib/utils"
import { academicService } from "@/services/academic.service"
import { ojtRequirementService, type OjtRequirement } from "@/services/ojt-requirement.service"
import { z } from "zod"

const ALL_PROGRAMS = "all"
const MAX_DOCUMENTS = 20
const LOADING_ROWS = [0, 1, 2, 3]

const requirementFormSchema = z.object({
  programId: z.string(),
  requiredHours: z.string()
    .min(1, "Required hours are required.")
    .refine((value) => Number.isInteger(Number(value)) && Number(value) >= 1 && Number(value) <= 2000, "Enter a whole number from 1 to 2000."),
  requiredDocuments: z.array(z.object({ value: z.string() })),
  isActive: z.boolean(),
})

type RequirementFormValues = z.infer<typeof requirementFormSchema>
type EditorTarget = OjtRequirement | "create" | null

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

function documentSummary(documents: string[]): string {
  if (documents.length === 0) return "No documents listed"
  const preview = documents.slice(0, 2).join(", ")
  return documents.length > 2 ? `${preview} and ${documents.length - 2} more` : preview
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--cpc-navy)]">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", active ? "bg-[var(--cpc-navy)]" : "bg-[var(--cpc-slate)]")} aria-hidden="true" />
      {active ? "Active" : "Inactive"}
    </span>
  )
}

/**
 * Dean-side OJT requirement administration. Reads and writes only the live
 * requirement endpoints; every action reports the backend message and refetches.
 */
export function OjtRequirements() {
  const { user } = useAuthContext()
  const departmentId = user?.deanProfile?.department.id ?? ""

  const [requirements, setRequirements] = useState<OjtRequirement[]>([])
  const [programs, setPrograms] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editing, setEditing] = useState<EditorTarget>(null)

  const form = useForm<RequirementFormValues>({
    resolver: zodResolver(requirementFormSchema),
    defaultValues: {
      programId: ALL_PROGRAMS,
      requiredHours: "",
      requiredDocuments: [{ value: "" }],
      isActive: true,
    },
  })
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "requiredDocuments" })
  const { errors, isSubmitting } = form.formState

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await ojtRequirementService.list()
        if (cancelled) return
        if (response.status !== "success") {
          setRequirements([])
          setError(response.message || "Could not load OJT requirements.")
          return
        }
        setRequirements(response.data?.requirements ?? [])
      } catch (caught) {
        if (cancelled) return
        setRequirements([])
        setError(errorMessage(caught, "Could not load OJT requirements."))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  useEffect(() => {
    if (!departmentId) {
      return
    }
    let cancelled = false

    const loadPrograms = async () => {
      try {
        const response = await academicService.getDepartments()
        const department = response?.data?.departments?.find((item) => item.id === departmentId)
        if (!cancelled) setPrograms(department?.programs ?? [])
      } catch {
        if (!cancelled) setPrograms([])
      }
    }

    void loadPrograms()
    return () => {
      cancelled = true
    }
  }, [departmentId])

  const openCreate = () => {
    setEditing("create")
    form.reset({
      programId: ALL_PROGRAMS,
      requiredHours: "",
      requiredDocuments: [{ value: "" }],
      isActive: true,
    })
  }

  const openEdit = (requirement: OjtRequirement) => {
    setEditing(requirement)
    form.reset({
      programId: requirement.programId ?? ALL_PROGRAMS,
      requiredHours: String(requirement.requiredHours),
      requiredDocuments: requirement.requiredDocuments.length > 0 ? requirement.requiredDocuments.map((document) => ({ value: document })) : [{ value: "" }],
      isActive: requirement.isActive,
    })
  }

  const closeDialog = () => {
    setEditing(null)
    form.reset()
  }

  const handleToggle = async (requirement: OjtRequirement) => {
    setBusyId(requirement.id)
    try {
      const response = await ojtRequirementService.update(requirement.id, { isActive: !requirement.isActive })
      if (response.status === "success") {
        toast.success(response.message || (requirement.isActive ? "Requirement deactivated." : "Requirement activated."))
        setReloadKey((key) => key + 1)
      } else {
        toast.error(response.message || "Could not update the requirement.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not update the requirement."))
    } finally {
      setBusyId(null)
    }
  }

  async function onSubmit(values: RequirementFormValues) {
    const target = editing
    if (!target) return

    const documents = values.requiredDocuments.map((entry) => entry.value.trim()).filter(Boolean)
    const programId = values.programId === ALL_PROGRAMS ? undefined : values.programId
    const key = target === "create" ? "create" : target.id

    setBusyId(key)
    try {
      const response = target === "create"
        ? await ojtRequirementService.create({
          requiredHours: Number(values.requiredHours),
          requiredDocuments: documents,
          ...(programId ? { programId } : {}),
          isActive: values.isActive,
        })
        : await ojtRequirementService.update(target.id, {
          requiredHours: Number(values.requiredHours),
          requiredDocuments: documents,
          programId: programId ?? null,
          isActive: values.isActive,
        })

      if (response.status === "success") {
        toast.success(response.message || (target === "create" ? "Requirement created." : "Requirement updated."))
        closeDialog()
        setReloadKey((value) => value + 1)
      } else {
        toast.error(response.message || "Could not save the requirement.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not save the requirement."))
    } finally {
      setBusyId(null)
    }
  }

  const programItems = [
    { value: ALL_PROGRAMS, label: "All programs" },
    ...programs.map((program) => ({ value: program.id, label: program.name })),
  ]
  const dialogBusy = editing !== null && busyId === (editing === "create" ? "create" : editing.id)
  const documentError = errors.requiredDocuments
  const documentMessage = typeof documentError?.message === "string" ? documentError.message : undefined

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold)]" />
          <p className="mt-5 text-sm font-medium text-[var(--cpc-navy)]">Dean</p>
          <h1 className="mt-3 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] text-balance sm:text-display-lg">
            OJT requirements
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--cpc-slate)]">
            Set the required hours and documents students must complete before deployment.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4 self-start">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={isLoading}
            className="inline-flex items-center gap-2 text-xs font-medium text-[var(--cpc-crimson)] transition-colors hover:underline disabled:opacity-60 disabled:no-underline"
          >
            {isLoading ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {isLoading ? "Refreshing…" : "Refresh"}
          </button>
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
            className="bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90"
          >
            <Plus aria-hidden="true" />
            Add requirement
          </Button>
        </div>
      </header>

      {!isLoading && !error ? (
        <p className="text-sm text-[var(--cpc-slate)]">
          {requirements.length} {requirements.length === 1 ? "requirement" : "requirements"} for your department
        </p>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-crimson)]">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            Couldn&apos;t load OJT requirements
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">{error}</p>
          <Button type="button" variant="outline" onClick={() => setReloadKey((key) => key + 1)} className="mt-6 border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]">
            Try again
          </Button>
        </div>
      ) : !isLoading && requirements.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-slate)]">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            No requirements yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">
            Add a department default or a program-specific requirement to define OJT hours and documents.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
          <Table className="min-w-[56rem]">
            <TableHeader>
              <TableRow className="bg-[var(--cpc-parchment)] hover:bg-[var(--cpc-parchment)]">
                <TableHead className="min-w-[16rem] text-xs text-[var(--cpc-slate)]">Program</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Required hours</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Documents</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Status</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Updated</TableHead>
                <TableHead className="text-right text-xs text-[var(--cpc-slate)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                LOADING_ROWS.map((row) => (
                  <TableRow key={row}>
                    <TableCell colSpan={6} className="py-4">
                      <div className="h-6 w-full rounded bg-[var(--muted)]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                requirements.map((requirement) => {
                  const rowBusy = busyId === requirement.id
                  return (
                    <TableRow key={requirement.id} aria-busy={rowBusy} className={cn(rowBusy && "opacity-60")}>
                      <TableCell className="whitespace-normal">
                        <span className="block font-medium text-[var(--cpc-navy)]">{requirement.program?.name ?? "All programs"}</span>
                        <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">{requirement.program?.code ?? "Department default"}</span>
                      </TableCell>
                      <TableCell className="whitespace-normal text-sm text-[var(--cpc-slate)]">{requirement.requiredHours} hours</TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="block font-medium text-[var(--cpc-navy)]">
                          {requirement.requiredDocuments.length} {requirement.requiredDocuments.length === 1 ? "document" : "documents"}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">{documentSummary(requirement.requiredDocuments)}</span>
                      </TableCell>
                      <TableCell><StatusChip active={requirement.isActive} /></TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-[var(--cpc-slate)]">{formatDate(requirement.updatedAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={rowBusy || isLoading}
                            onClick={() => openEdit(requirement)}
                            className="border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]"
                          >
                            <Pencil aria-hidden="true" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={rowBusy || isLoading}
                            onClick={() => void handleToggle(requirement)}
                            className={requirement.isActive
                              ? "border-[var(--cpc-crimson)]/40 text-[var(--cpc-crimson)] hover:bg-[var(--cpc-crimson)]/10 hover:text-[var(--cpc-crimson)]"
                              : "border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]"}
                          >
                            {rowBusy ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
                            {requirement.isActive ? "Deactivate" : "Activate"}
                          </Button>
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

      <Dialog open={editing !== null} onOpenChange={(open) => { if (!open) closeDialog() }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
              {editing === "create" ? "Add requirement" : "Edit requirement"}
            </DialogTitle>
            <DialogDescription>
              Set the hours and documents students must complete, and choose whether the requirement is active.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FieldGroup>
              <Controller
                name="programId"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor="requirement-program">Program</FieldLabel>
                    <Select items={programItems} value={field.value} onValueChange={(value) => field.onChange(value ?? ALL_PROGRAMS)}>
                      <SelectTrigger id="requirement-program" aria-invalid={fieldState.invalid} className="h-11 w-full data-[size=default]:h-11">
                        <SelectValue placeholder="Select a program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_PROGRAMS}>All programs</SelectItem>
                        {programs.map((program) => (
                          <SelectItem key={program.id} value={program.id}>{program.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />

              <Field>
                <FieldLabel htmlFor="requirement-hours">Required hours</FieldLabel>
                <Input
                  id="requirement-hours"
                  type="number"
                  min={1}
                  max={2000}
                  inputMode="numeric"
                  placeholder="e.g. 486"
                  aria-invalid={!!errors.requiredHours}
                  className="h-11 px-3.5"
                  {...form.register("requiredHours")}
                />
                <FieldError errors={[errors.requiredHours]} />
              </Field>

              <Field>
                <FieldLabel>Required documents</FieldLabel>
                <p className="text-xs text-[var(--cpc-slate)]">Add each document students must submit.</p>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <Input
                        aria-label={`Document ${index + 1}`}
                        placeholder={`Document ${index + 1}`}
                        className="h-10 px-3"
                        {...form.register(`requiredDocuments.${index}.value`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Remove document ${index + 1}`}
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        className="text-[var(--cpc-crimson)] hover:bg-[var(--cpc-crimson)]/10 hover:text-[var(--cpc-crimson)]"
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  ))}
                </div>
                {documentMessage ? <FieldError errors={[{ message: documentMessage }]} /> : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={fields.length >= MAX_DOCUMENTS}
                  onClick={() => append({ value: "" })}
                  className="self-start border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]"
                >
                  <Plus aria-hidden="true" />
                  Add document
                </Button>
                <p className="text-xs text-[var(--cpc-slate)]">{fields.length} of {MAX_DOCUMENTS} document rows</p>
              </Field>

              <Field orientation="horizontal">
                <input
                  id="requirement-active"
                  type="checkbox"
                  className="h-4 w-4 shrink-0 accent-[var(--cpc-navy)]"
                  {...form.register("isActive")}
                />
                <FieldLabel htmlFor="requirement-active" className="cursor-pointer">Active</FieldLabel>
              </Field>
            </FieldGroup>

            <DialogFooter>
              <Button type="button" variant="outline" disabled={dialogBusy || isSubmitting} onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={dialogBusy || isSubmitting}
                className="bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90"
              >
                {(dialogBusy || isSubmitting) ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
                {editing === "create" ? "Add requirement" : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

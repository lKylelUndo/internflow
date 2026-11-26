"use client"

import { useEffect, useState } from "react"
import { Inbox, LoaderCircle, Pencil, Plus, RotateCw, TriangleAlert } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { companyService, companyFormSchema, type CompanyCreateInput, type CompanyDetail, type CompanyFormInput, type CompanyUpdateInput, type CompanyWithCounts } from "@/services/company.service"
import { cn } from "@/lib/utils"

const LOADING_ROWS = [0, 1, 2, 3]

type CompanyRecord = CompanyWithCounts | CompanyDetail

const EMPTY_FORM: CompanyFormInput = {
  name: "",
  address: "",
  contactEmail: "",
  contactNumber: "",
  website: "",
  description: "",
  isActive: true,
}

function errorMessage(error: unknown, fallback: string): string {
  const backendMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message
  if (typeof backendMessage === "string" && backendMessage.trim()) return backendMessage
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function toFormValues(company: CompanyRecord): CompanyFormInput {
  return {
    name: company.name,
    address: company.address,
    contactEmail: company.contactEmail ?? "",
    contactNumber: company.contactNumber ?? "",
    website: company.website ?? "",
    description: company.description ?? "",
    isActive: company.isActive,
  }
}

function createPayload(values: CompanyFormInput): CompanyCreateInput {
  const payload: CompanyCreateInput = {
    name: values.name.trim(),
    address: values.address.trim(),
  }
  const contactEmail = values.contactEmail.trim()
  const contactNumber = values.contactNumber.trim()
  const website = values.website.trim()
  const description = values.description.trim()
  if (contactEmail) payload.contactEmail = contactEmail
  if (contactNumber) payload.contactNumber = contactNumber
  if (website) payload.website = website
  if (description) payload.description = description
  return payload
}

/**
 * Dean company partner directory. Every row and every mutation comes from
 * the live company endpoints; the form reuses the signup field primitives.
 */
export function CompanyDirectory() {
  const [companies, setCompanies] = useState<CompanyWithCounts[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionKind, setActionKind] = useState<"toggle" | "edit" | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formSource, setFormSource] = useState<CompanyRecord | null>(null)

  const form = useForm<CompanyFormInput>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: EMPTY_FORM,
  })
  const { errors, isSubmitting } = form.formState

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await companyService.listCompanies()
        if (cancelled) return
        if (response.status !== "success") {
          setCompanies([])
          setError(response.message || "Could not load company partners.")
          return
        }
        setCompanies(response.data?.companies ?? [])
      } catch (caught) {
        if (cancelled) return
        setCompanies([])
        setError(errorMessage(caught, "Could not load company partners."))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadKey])

  const openCreate = () => {
    form.reset(EMPTY_FORM)
    setEditingId(null)
    setFormSource(null)
    setFormOpen(true)
  }

  const openEdit = async (company: CompanyWithCounts) => {
    setActionId(company.id)
    setActionKind("edit")
    let source: CompanyRecord = company
    try {
      const response = await companyService.getCompany(company.id)
      if (response.status === "success" && response.data?.company) {
        source = response.data.company
      }
    } catch {
      // Fall back to the already-loaded row when the detail fetch fails.
    }
    form.reset(toFormValues(source))
    setEditingId(company.id)
    setFormSource(source)
    setActionId(null)
    setActionKind(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setFormSource(null)
  }

  const handleToggle = async (company: CompanyWithCounts) => {
    setActionId(company.id)
    setActionKind("toggle")
    try {
      const response = await companyService.updateCompany(company.id, { isActive: !company.isActive })
      if (response.status === "success") {
        toast.success(response.message || "Company status updated")
        setReloadKey((key) => key + 1)
      } else {
        toast.error(response.message || "Could not update the company.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not update the company."))
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  const onSubmit = async (values: CompanyFormInput) => {
    try {
      if (editingId) {
        const next = createPayload(values)
        const payload: CompanyUpdateInput = { isActive: values.isActive }
        if (!formSource || next.name !== formSource.name) payload.name = next.name
        if (!formSource || next.address !== formSource.address) payload.address = next.address
        if (next.contactEmail !== undefined && next.contactEmail !== formSource?.contactEmail) payload.contactEmail = next.contactEmail
        if (next.contactNumber !== undefined && next.contactNumber !== formSource?.contactNumber) payload.contactNumber = next.contactNumber
        if (next.website !== undefined && next.website !== formSource?.website) payload.website = next.website
        if (next.description !== undefined && next.description !== formSource?.description) payload.description = next.description

        const response = await companyService.updateCompany(editingId, payload)
        if (response.status !== "success") {
          toast.error(response.message || "Could not save the company.")
          return
        }
        toast.success(response.message || "Company updated")
      } else {
        const response = await companyService.createCompany(createPayload(values))
        if (response.status !== "success") {
          toast.error(response.message || "Could not add the company.")
          return
        }
        toast.success(response.message || "Company added")
      }
      closeForm()
      setReloadKey((key) => key + 1)
    } catch (caught) {
      const fallback = editingId ? "Could not save the company." : "Could not add the company."
      toast.error(errorMessage(caught, fallback))
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold)]" />
          <p className="mt-5 text-sm font-medium text-[var(--cpc-navy)]">Dean</p>
          <h1 className="mt-3 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] text-balance sm:text-display-lg">
            Company partners
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--cpc-slate)]">
            Maintain the companies hosting interns from your department.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-4 self-start">
          <button
            type="button"
            onClick={() => setReloadKey((key) => key + 1)}
            disabled={isLoading || actionId !== null}
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
            disabled={actionId !== null}
            className="bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90"
          >
            <Plus aria-hidden="true" />
            Add company
          </Button>
        </div>
      </header>

      {error ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-crimson)]">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            Couldn&apos;t load company partners
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">{error}</p>
          <Button type="button" variant="outline" onClick={() => setReloadKey((key) => key + 1)} className="mt-6 border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]">
            Try again
          </Button>
        </div>
      ) : !isLoading && companies.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-slate)]">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            No company partners yet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">
            Add a company to start recording the partners hosting interns from your department.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
          <Table className="min-w-[56rem]">
            <TableHeader>
              <TableRow className="bg-[var(--cpc-parchment)] hover:bg-[var(--cpc-parchment)]">
                <TableHead className="min-w-[16rem] text-xs text-[var(--cpc-slate)]">Company</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Contact</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Placements</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Status</TableHead>
                <TableHead className="text-right text-xs text-[var(--cpc-slate)]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                LOADING_ROWS.map((row) => (
                  <TableRow key={row}>
                    <TableCell colSpan={5} className="py-4">
                      <div className="h-6 w-full rounded bg-[var(--muted)]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                companies.map((company) => {
                  const rowBusy = actionId === company.id
                  const supervisorCount = company._count?.supervisors ?? 0
                  const internshipCount = company._count?.internships ?? 0
                  return (
                    <TableRow key={company.id}>
                      <TableCell className="min-w-0 whitespace-normal">
                        <span className="block font-medium text-[var(--cpc-navy)]">{company.name}</span>
                        <span className="mt-0.5 block break-words text-xs text-[var(--cpc-slate)]">{company.address}</span>
                      </TableCell>
                      <TableCell className="min-w-0 whitespace-normal">
                        {company.contactEmail || company.contactNumber ? (
                          <span className="min-w-0">
                            {company.contactEmail ? (
                              <span className="block break-all text-sm text-[var(--cpc-navy)]">{company.contactEmail}</span>
                            ) : null}
                            {company.contactNumber ? (
                              <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">{company.contactNumber}</span>
                            ) : null}
                          </span>
                        ) : (
                          <span className="text-sm text-[var(--cpc-slate)]">Not provided</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="block text-sm font-medium text-[var(--cpc-navy)]">
                          {supervisorCount} {supervisorCount === 1 ? "supervisor" : "supervisors"}
                        </span>
                        <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">
                          {internshipCount} {internshipCount === 1 ? "internship" : "internships"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--cpc-navy)]">
                          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", company.isActive ? "bg-[var(--cpc-navy)]" : "bg-[var(--cpc-slate)]")} aria-hidden="true" />
                          {company.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={actionId !== null || isLoading}
                            onClick={() => openEdit(company)}
                            className="border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]"
                          >
                            {rowBusy && actionKind === "edit" ? (
                              <LoaderCircle className="animate-spin" aria-hidden="true" />
                            ) : (
                              <Pencil aria-hidden="true" />
                            )}
                            Edit
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={actionId !== null || isLoading}
                            onClick={() => handleToggle(company)}
                            className={company.isActive
                              ? "border-[var(--cpc-crimson)]/40 text-[var(--cpc-crimson)] hover:bg-[var(--cpc-crimson)]/10 hover:text-[var(--cpc-crimson)]"
                              : "border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]"}
                          >
                            {rowBusy && actionKind === "toggle" ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
                            {company.isActive ? "Deactivate" : "Activate"}
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

      <Dialog open={formOpen} onOpenChange={(open) => { if (!open) closeForm() }}>
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
              {editingId ? "Edit company" : "Add company"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the partner record used by supervisors and placements."
                : "Add a company to the partner directory for your department."}
            </DialogDescription>
          </DialogHeader>

          <form id="company-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="company-name">Name</FieldLabel>
                <Input id="company-name" className="h-10 px-3" aria-invalid={!!errors.name} {...form.register("name")} />
                <FieldError errors={[errors.name]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-address">Address</FieldLabel>
                <Textarea id="company-address" rows={2} aria-invalid={!!errors.address} {...form.register("address")} />
                <FieldError errors={[errors.address]} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="company-email">Contact email</FieldLabel>
                  <Input id="company-email" type="email" inputMode="email" className="h-10 px-3" aria-invalid={!!errors.contactEmail} {...form.register("contactEmail")} />
                  <FieldError errors={[errors.contactEmail]} />
                </Field>
                <Field>
                  <FieldLabel htmlFor="company-phone">Contact number</FieldLabel>
                  <Input id="company-phone" type="tel" inputMode="tel" className="h-10 px-3" aria-invalid={!!errors.contactNumber} {...form.register("contactNumber")} />
                  <FieldError errors={[errors.contactNumber]} />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="company-website">Website</FieldLabel>
                <Input id="company-website" type="url" inputMode="url" placeholder="https://" className="h-10 px-3" aria-invalid={!!errors.website} {...form.register("website")} />
                <FieldError errors={[errors.website]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="company-description">Description</FieldLabel>
                <Textarea id="company-description" rows={3} aria-invalid={!!errors.description} {...form.register("description")} />
                <FieldError errors={[errors.description]} />
              </Field>
              {editingId ? (
                <Field orientation="horizontal">
                  <input id="company-isActive" type="checkbox" className="h-4 w-4 shrink-0 accent-[var(--cpc-navy)]" {...form.register("isActive")} />
                  <FieldLabel htmlFor="company-isActive" className="cursor-pointer">Active</FieldLabel>
                </Field>
              ) : null}
            </FieldGroup>
          </form>

          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={closeForm}>
              Cancel
            </Button>
            <Button type="submit" form="company-form" disabled={isSubmitting} className="bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90">
              {isSubmitting ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : null}
              {isSubmitting ? "Saving…" : editingId ? "Save changes" : "Add company"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

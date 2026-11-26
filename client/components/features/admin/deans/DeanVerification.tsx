"use client"

import { useEffect, useState } from "react"
import { Ban, Inbox, LoaderCircle, RotateCw, ShieldCheck, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { adminService, type AccountStatus, type SafeDean } from "@/services/admin.service"
import { cn } from "@/lib/utils"

const FILTERS: { value: AccountStatus; label: string; phrase: string; empty: string }[] = [
  {
    value: "PENDING_VERIFICATION",
    label: "Pending",
    phrase: "awaiting verification",
    empty: "No pending dean accounts right now. New applications will appear here when they arrive.",
  },
  {
    value: "ACTIVE",
    label: "Active",
    phrase: "with active status",
    empty: "No active dean accounts yet. Verified deans will appear here.",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
    phrase: "with suspended status",
    empty: "No suspended dean accounts. Accounts that are suspended will appear here.",
  },
]

const LOADING_ROWS = [0, 1, 2, 3]

function fullName(dean: SafeDean): string {
  return [dean.firstName, dean.middleName, dean.lastName].filter(Boolean).join(" ") || "Dean account"
}

function initials(dean: SafeDean): string {
  const first = dean.firstName?.trim().charAt(0) ?? ""
  const last = dean.lastName?.trim().charAt(0) ?? ""
  return `${first}${last}`.toUpperCase() || "D"
}

function errorMessage(error: unknown, fallback: string): string {
  const backendMessage = (error as { response?: { data?: { message?: unknown } } })?.response?.data?.message
  if (typeof backendMessage === "string" && backendMessage.trim()) return backendMessage
  if (error instanceof Error && error.message.trim()) return error.message
  return fallback
}

function statusLabel(status: string): string {
  if (status === "PENDING_VERIFICATION") return "Pending verification"
  if (status === "ACTIVE") return "Active"
  if (status === "SUSPENDED") return "Suspended"
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (character) => character.toUpperCase())
}

function statusDotClass(status: string): string {
  if (status === "PENDING_VERIFICATION") return "bg-[var(--cpc-gold)]"
  if (status === "ACTIVE") return "bg-[var(--cpc-navy)]"
  if (status === "SUSPENDED") return "bg-[var(--cpc-crimson)]"
  return "bg-[var(--cpc-slate)]"
}

function formatDate(value?: string | null): string {
  if (!value) return "—"
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-PH")
}

function StatusChip({ status }: { status: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] px-2 py-1 text-xs font-medium text-[var(--cpc-navy)]">
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDotClass(status))} aria-hidden="true" />
      {statusLabel(status)}
    </span>
  )
}

/**
 * Admin dean verification queue. Reads only the live admin endpoints; every
 * action reports the backend message and refetches the current filter.
 */
export function DeanVerification() {
  const [filter, setFilter] = useState<AccountStatus>("PENDING_VERIFICATION")
  const [deans, setDeans] = useState<SafeDean[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionKind, setActionKind] = useState<"verify" | "suspend" | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<SafeDean | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await adminService.listDeans(filter)
        if (cancelled) return
        if (response.status !== "success") {
          setDeans([])
          setError(response.message || "Could not load dean accounts.")
          return
        }
        setDeans(response.data?.deans ?? [])
      } catch (caught) {
        if (cancelled) return
        setDeans([])
        setError(errorMessage(caught, "Could not load dean accounts."))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filter, reloadKey])

  const handleVerify = async (dean: SafeDean) => {
    setActionId(dean.id)
    setActionKind("verify")
    try {
      const response = await adminService.verifyDean(dean.id)
      if (response.status === "success") {
        toast.success(`${fullName(dean)} verified`)
        setReloadKey((key) => key + 1)
      } else {
        toast.error(response.message || "Could not verify the dean account.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not verify the dean account."))
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  const handleSuspend = async () => {
    const dean = suspendTarget
    if (!dean) return

    setActionId(dean.id)
    setActionKind("suspend")
    try {
      const response = await adminService.suspendDean(dean.id)
      if (response.status === "success") {
        toast.success(`${fullName(dean)} suspended`)
        setSuspendTarget(null)
        setReloadKey((key) => key + 1)
      } else {
        toast.error(response.message || "Could not suspend the dean account.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not suspend the dean account."))
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  const activeFilter = FILTERS.find((item) => item.value === filter) ?? FILTERS[0]
  const busySuspend = actionKind === "suspend" && actionId === suspendTarget?.id

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold)]" />
          <p className="mt-5 text-sm font-medium text-[var(--cpc-navy)]">Administrator</p>
          <h1 className="mt-3 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] text-balance sm:text-display-lg">
            Dean verification
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--cpc-slate)]">
            Review dean accounts, confirm their departments, and keep the college-side records in order.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((key) => key + 1)}
          disabled={isLoading}
          className="inline-flex shrink-0 items-center gap-2 self-start text-xs font-medium text-[var(--cpc-crimson)] transition-colors hover:underline disabled:opacity-60 disabled:no-underline"
        >
          {isLoading ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isLoading ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter deans by account status" className="inline-flex flex-wrap gap-1 rounded-lg border border-[var(--border)] p-1">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                filter === item.value
                  ? "bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)]"
                  : "text-[var(--cpc-navy)] hover:bg-[var(--cpc-parchment)]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        {!isLoading && !error ? (
          <p className="text-sm text-[var(--cpc-slate)]">
            {deans.length} {deans.length === 1 ? "account" : "accounts"} {activeFilter.phrase}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-crimson)]">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            Couldn&apos;t load dean accounts
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">{error}</p>
          <Button type="button" variant="outline" onClick={() => setReloadKey((key) => key + 1)} className="mt-6 border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]">
            Try again
          </Button>
        </div>
      ) : !isLoading && deans.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-slate)]">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            No accounts in this view
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">
            {activeFilter.empty}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-card">
          <Table className="min-w-[52rem]">
            <TableHeader>
              <TableRow className="bg-[var(--cpc-parchment)] hover:bg-[var(--cpc-parchment)]">
                <TableHead className="min-w-[16rem] text-xs text-[var(--cpc-slate)]">Dean</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Department</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Contact</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Applied</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Status</TableHead>
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
                deans.map((dean) => {
                  const rowBusy = actionId === dean.id
                  return (
                    <TableRow key={dean.id}>
                      <TableCell className="whitespace-normal">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cpc-parchment)] font-serif text-sm font-semibold text-[var(--cpc-navy)]">
                            {initials(dean)}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-[var(--cpc-navy)]">{fullName(dean)}</span>
                            <span className="mt-0.5 block break-all text-xs text-[var(--cpc-slate)]">{dean.email}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="block font-medium text-[var(--cpc-navy)]">
                          {dean.deanProfile?.department?.name ?? "Not assigned"}
                        </span>
                        {dean.deanProfile?.department?.code ? (
                          <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">
                            {dean.deanProfile.department.code}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm text-[var(--cpc-slate)]">{dean.contactNumber ?? "Not provided"}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-[var(--cpc-slate)]">{formatDate(dean.createdAt)}</TableCell>
                      <TableCell><StatusChip status={dean.accountStatus} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          {dean.accountStatus === "PENDING_VERIFICATION" ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={rowBusy || isLoading}
                              onClick={() => handleVerify(dean)}
                              className="bg-[var(--cpc-navy)] text-[var(--cpc-navy-foreground)] hover:bg-[var(--cpc-navy)]/90"
                            >
                              {rowBusy && actionKind === "verify" ? (
                                <LoaderCircle className="animate-spin" aria-hidden="true" />
                              ) : (
                                <ShieldCheck aria-hidden="true" />
                              )}
                              Verify
                            </Button>
                          ) : null}
                          {dean.accountStatus === "PENDING_VERIFICATION" || dean.accountStatus === "ACTIVE" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={rowBusy || isLoading}
                              onClick={() => setSuspendTarget(dean)}
                              className="border-[var(--cpc-crimson)]/40 text-[var(--cpc-crimson)] hover:bg-[var(--cpc-crimson)]/10 hover:text-[var(--cpc-crimson)]"
                            >
                              {rowBusy && actionKind === "suspend" ? (
                                <LoaderCircle className="animate-spin" aria-hidden="true" />
                              ) : (
                                <Ban aria-hidden="true" />
                              )}
                              Suspend
                            </Button>
                          ) : (
                            <span className="text-xs text-[var(--cpc-slate)]">No action</span>
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

      <Dialog open={suspendTarget !== null} onOpenChange={(open) => { if (!open) setSuspendTarget(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
              Suspend dean account
            </DialogTitle>
            <DialogDescription>
              Suspending {suspendTarget ? fullName(suspendTarget) : "this dean"} blocks access to the dean workspace immediately. This action cannot be undone from this screen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={busySuspend} onClick={() => setSuspendTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={busySuspend}
              onClick={handleSuspend}
              className="bg-[var(--cpc-crimson)] text-[var(--cpc-crimson-foreground)] hover:bg-[var(--cpc-crimson)]/90"
            >
              {busySuspend ? <LoaderCircle className="animate-spin" aria-hidden="true" /> : <Ban aria-hidden="true" />}
              Suspend account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

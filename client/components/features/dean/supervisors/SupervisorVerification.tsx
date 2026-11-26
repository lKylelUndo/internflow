"use client"

import { useEffect, useState } from "react"
import { Ban, Inbox, LoaderCircle, RotateCw, ShieldCheck, TriangleAlert } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { supervisorService, type AccountStatus, type SafeSupervisor } from "@/services/supervisor.service"
import { cn } from "@/lib/utils"

const FILTERS: { value: AccountStatus; label: string; phrase: string; empty: string }[] = [
  {
    value: "PENDING_VERIFICATION",
    label: "Pending",
    phrase: "awaiting verification",
    empty: "No pending supervisor accounts right now. New supervisor registrations will appear here when they arrive.",
  },
  {
    value: "ACTIVE",
    label: "Active",
    phrase: "with active status",
    empty: "No active supervisor accounts yet. Verified supervisors will appear here.",
  },
  {
    value: "SUSPENDED",
    label: "Suspended",
    phrase: "with suspended status",
    empty: "No suspended supervisor accounts. Supervisors suspended from this queue will appear here.",
  },
]

const LOADING_ROWS = [0, 1, 2, 3]

function fullName(supervisor: SafeSupervisor): string {
  const user = supervisor.user
  return [user.firstName, user.middleName, user.lastName].filter(Boolean).join(" ") || "Supervisor account"
}

function initials(supervisor: SafeSupervisor): string {
  const user = supervisor.user
  const first = user.firstName?.trim().charAt(0) ?? ""
  const last = user.lastName?.trim().charAt(0) ?? ""
  return `${first}${last}`.toUpperCase() || "S"
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
 * Dean-side supervisor verification queue. Reads only the live supervisor
 * endpoints; every action reports the backend message and refetches the
 * current filter.
 */
export function SupervisorVerification() {
  const [filter, setFilter] = useState<AccountStatus>("PENDING_VERIFICATION")
  const [supervisors, setSupervisors] = useState<SafeSupervisor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [actionId, setActionId] = useState<string | null>(null)
  const [actionKind, setActionKind] = useState<"verify" | "suspend" | null>(null)
  const [suspendTarget, setSuspendTarget] = useState<SafeSupervisor | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await supervisorService.list(filter)
        if (cancelled) return
        if (response.status !== "success") {
          setSupervisors([])
          setError(response.message || "Could not load supervisor accounts.")
          return
        }
        setSupervisors(response.data?.supervisors ?? [])
      } catch (caught) {
        if (cancelled) return
        setSupervisors([])
        setError(errorMessage(caught, "Could not load supervisor accounts."))
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [filter, reloadKey])

  const handleVerify = async (supervisor: SafeSupervisor) => {
    const userId = supervisor.user.id
    setActionId(userId)
    setActionKind("verify")
    try {
      const response = await supervisorService.verify(userId)
      if (response.status === "success") {
        toast.success(`${fullName(supervisor)} verified`)
        setReloadKey((key) => key + 1)
      } else {
        toast.error(response.message || "Could not verify the supervisor account.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not verify the supervisor account."))
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  const handleSuspend = async () => {
    const supervisor = suspendTarget
    if (!supervisor) return

    const userId = supervisor.user.id
    setActionId(userId)
    setActionKind("suspend")
    try {
      const response = await supervisorService.suspend(userId)
      if (response.status === "success") {
        toast.success(`${fullName(supervisor)} suspended`)
        setSuspendTarget(null)
        setReloadKey((key) => key + 1)
      } else {
        toast.error(response.message || "Could not suspend the supervisor account.")
      }
    } catch (caught) {
      toast.error(errorMessage(caught, "Could not suspend the supervisor account."))
    } finally {
      setActionId(null)
      setActionKind(null)
    }
  }

  const activeFilter = FILTERS.find((item) => item.value === filter) ?? FILTERS[0]
  const busySuspend = actionKind === "suspend" && actionId === suspendTarget?.user.id

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold)]" />
          <p className="mt-5 text-sm font-medium text-[var(--cpc-navy)]">Dean</p>
          <h1 className="mt-3 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] text-balance sm:text-display-lg">
            Supervisor verification
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--cpc-slate)]">
            Review company supervisors assigned to your department and keep their access current.
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
        <div role="group" aria-label="Filter supervisors by account status" className="inline-flex flex-wrap gap-1 rounded-lg border border-[var(--border)] p-1">
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
            {supervisors.length} {supervisors.length === 1 ? "supervisor" : "supervisors"} {activeFilter.phrase}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-[var(--border)] bg-card px-6 py-12 text-center">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cpc-parchment)] text-[var(--cpc-crimson)]">
            <TriangleAlert className="h-5 w-5" aria-hidden="true" />
          </span>
          <h2 className="mt-5 font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
            Couldn&apos;t load supervisor accounts
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--cpc-slate)]">{error}</p>
          <Button type="button" variant="outline" onClick={() => setReloadKey((key) => key + 1)} className="mt-6 border-[var(--cpc-navy)]/30 text-[var(--cpc-navy)]">
            Try again
          </Button>
        </div>
      ) : !isLoading && supervisors.length === 0 ? (
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
                <TableHead className="min-w-[16rem] text-xs text-[var(--cpc-slate)]">Supervisor</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Company</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Contact</TableHead>
                <TableHead className="text-xs text-[var(--cpc-slate)]">Added</TableHead>
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
                supervisors.map((supervisor) => {
                  const rowBusy = actionId === supervisor.user.id
                  const status = supervisor.user.accountStatus
                  return (
                    <TableRow key={supervisor.id}>
                      <TableCell className="whitespace-normal">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cpc-parchment)] font-serif text-sm font-semibold text-[var(--cpc-navy)]">
                            {initials(supervisor)}
                          </span>
                          <span className="min-w-0">
                            <span className="block font-medium text-[var(--cpc-navy)]">{fullName(supervisor)}</span>
                            <span className="mt-0.5 block break-all text-xs text-[var(--cpc-slate)]">{supervisor.user.email}</span>
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <span className="block font-medium text-[var(--cpc-navy)]">{supervisor.company.name}</span>
                        <span className="mt-0.5 block text-xs text-[var(--cpc-slate)]">
                          {supervisor.position ?? "Position not provided"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-[var(--cpc-slate)]">{supervisor.user.contactNumber ?? "Not provided"}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-[var(--cpc-slate)]">{formatDate(supervisor.createdAt)}</TableCell>
                      <TableCell><StatusChip status={status} /></TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          {status === "PENDING_VERIFICATION" ? (
                            <Button
                              type="button"
                              size="sm"
                              disabled={rowBusy || isLoading}
                              onClick={() => handleVerify(supervisor)}
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
                          {status === "PENDING_VERIFICATION" || status === "ACTIVE" ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={rowBusy || isLoading}
                              onClick={() => setSuspendTarget(supervisor)}
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
              Suspend supervisor account
            </DialogTitle>
            <DialogDescription>
              Suspending {suspendTarget ? fullName(suspendTarget) : "this supervisor"} blocks access to the supervisor workspace immediately. This action cannot be undone from this screen.
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

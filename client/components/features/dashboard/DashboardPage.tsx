"use client"

import { useState } from "react"
import { ArrowUpRight, LoaderCircle, RotateCw } from "lucide-react"
import Link from "next/link"
import Logo from "@/components/common/layout/Logo"
import { useAuthContext } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

export interface DashboardDetail {
  label: string
  value: string
}

export interface DashboardPageProps {
  roleLabel: string
  title: string
  description: string
  details: DashboardDetail[]
  nextSteps: { title: string; body: string; href?: string }[]
}

const ACCOUNT_STATUS_LABELS: Record<string, string> = {
  PENDING_VERIFICATION: "Pending verification",
  ACTIVE: "Active",
  SUSPENDED: "Suspended",
}

export function humanizeLabel(value?: string | null): string {
  if (!value) return "Not assigned"
  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

export function humanizeAccountStatus(status?: string | null): string {
  if (!status) return "Not assigned"
  return ACCOUNT_STATUS_LABELS[status] ?? humanizeLabel(status)
}

export function formatMemberSince(createdAt?: string | null): string {
  if (!createdAt) return "Not assigned"
  const date = new Date(createdAt)
  return Number.isNaN(date.getTime())
    ? "Not assigned"
    : date.toLocaleDateString("en-PH")
}

function statusDotClass(status?: string | null): string {
  switch (status) {
    case "PENDING_VERIFICATION":
      return "bg-[var(--cpc-gold)]"
    case "ACTIVE":
      return "bg-[var(--cpc-navy)]"
    case "SUSPENDED":
      return "bg-[var(--cpc-crimson)]"
    default:
      return "bg-[var(--cpc-slate)]"
  }
}

function accountName(firstName?: string | null, lastName?: string | null): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "Your account"
}

/**
 * Shared authenticated dashboard. Role wrappers supply the copy and the
 * detail rows; everything about the record, its status, and the refresh
 * action comes from the live auth context.
 */
export default function DashboardPage({
  roleLabel,
  title,
  description,
  details,
  nextSteps,
}: DashboardPageProps) {
  const { user, refreshUser, isAuthenticated } = useAuthContext()
  const [isRefreshing, setIsRefreshing] = useState(false)

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <p className="text-sm text-[var(--cpc-slate)]">Loading your record…</p>
      </div>
    )
  }

  const name = accountName(user.firstName, user.lastName)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUser()
    } catch {
      // Leave the current record on screen; the button stays usable.
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        <div>
          <div className="h-px w-16 bg-[var(--cpc-gold)]" />
          <p className="mt-5 text-sm font-medium text-[var(--cpc-navy)]">
            {roleLabel}
          </p>
          <h1 className="mt-3 font-serif text-display-md font-semibold tracking-tight text-[var(--cpc-navy)] text-balance sm:text-display-lg">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--cpc-slate)]">
            {description}
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex shrink-0 items-center gap-2 self-start text-xs font-medium text-[var(--cpc-crimson)] transition-colors hover:underline disabled:opacity-60 disabled:no-underline"
        >
          {isRefreshing ? (
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          ) : (
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {isRefreshing ? "Refreshing…" : "Refresh record"}
        </button>
      </header>

      <div className="grid gap-6 lg:grid-cols-12">
        <section aria-label="Account record" className="overflow-hidden rounded-xl border border-[var(--border)] bg-card lg:col-span-7">
          <div className="navy-surface flex items-center gap-4 px-6 py-6">
            <Logo size="md" badge />
            <div className="min-w-0">
              <p className="font-serif text-display-sm font-semibold tracking-tight">
                {name}
              </p>
              <p className="mt-1 break-all text-sm text-[var(--cpc-on-navy-muted)]">
                {user.email}
              </p>
            </div>
          </div>
          <dl className="border-b border-[var(--border)] sm:grid sm:grid-cols-2">
            {details.map((detail) => (
              <div key={detail.label} className="min-w-0 border-t border-[var(--border)] px-6 py-4 sm:even:border-l">
                <dt className="text-xs font-medium text-[var(--cpc-slate)]">
                  {detail.label}
                </dt>
                <dd className="mt-1 break-words text-sm font-medium text-[var(--cpc-navy)]">
                  {detail.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <aside aria-label="Workspace" className="rounded-xl border border-[var(--border)] bg-card lg:col-span-5">
          <div className="border-b border-[var(--border)] px-6 py-5">
            <h2 className="font-serif text-display-sm font-semibold tracking-tight text-[var(--cpc-navy)]">
              Workspace
            </h2>
          </div>

          <dl className="px-6 py-2">
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3">
              <dt className="text-xs font-medium text-[var(--cpc-slate)]">Account status</dt>
              <dd className="flex items-center gap-2 text-right text-sm font-medium text-[var(--cpc-navy)]">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", statusDotClass(user.accountStatus))} aria-hidden="true" />
                {humanizeAccountStatus(user.accountStatus)}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] py-3">
              <dt className="text-xs font-medium text-[var(--cpc-slate)]">Role</dt>
              <dd className="text-right text-sm font-medium text-[var(--cpc-navy)]">
                {roleLabel}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-xs font-medium text-[var(--cpc-slate)]">Member since</dt>
              <dd className="text-right text-sm font-medium text-[var(--cpc-navy)]">
                {formatMemberSince(user.createdAt)}
              </dd>
            </div>
          </dl>

          <div className="border-t border-[var(--border)] px-6 pb-6 pt-5">
            <h3 className="text-xs font-semibold text-[var(--cpc-navy)]">
              Next in this workspace
            </h3>
            <ul className="mt-3">
              {nextSteps.map((step) => (
                <li key={step.title} className="border-[var(--cpc-gold-line)] py-4 first:border-t-0 first:pt-0 last:pb-0 sm:border-t">
                  {step.href ? (
                    <Link href={step.href} className="group/step inline-flex items-center gap-1.5 font-serif text-base font-semibold text-[var(--cpc-navy)] transition-colors hover:text-[var(--cpc-crimson)]">
                      {step.title}
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--cpc-crimson)]" aria-hidden="true" />
                    </Link>
                  ) : (
                    <p className="font-serif text-base font-semibold text-[var(--cpc-navy)]">
                      {step.title}
                    </p>
                  )}
                  <p className="mt-1 text-sm leading-relaxed text-[var(--cpc-slate)]">
                    {step.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  )
}

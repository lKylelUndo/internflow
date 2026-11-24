"use client"

interface SpinnerProps {
  content?: string
}

/**
 * Minimal loading indicator used while the auth session is being verified.
 * Honors prefers-reduced-motion via the global style rule in globals.css.
 */
export default function Spinner({ content = "Verifying session..." }: SpinnerProps) {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center text-[var(--cpc-slate)]">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-[var(--border)] border-t-[var(--cpc-navy)] animate-spin"
        aria-hidden="true"
      >
        <span className="sr-only">Loading</span>
      </div>
      <p className="mt-4 text-sm">{content}</p>
    </div>
  )
}

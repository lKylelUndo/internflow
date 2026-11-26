import Image from "next/image"
import { cn } from "cn"

const sizeMap = {
  sm: { crest: "h-10 w-10", badge: "h-14 w-14 p-1.5", sizes: "56px" },
  md: { crest: "h-12 w-12", badge: "h-16 w-16 p-1", sizes: "64px" },
  lg: { crest: "h-16 w-16", badge: "h-24 w-24 p-2", sizes: "96px" },
} as const

type LogoSize = keyof typeof sizeMap

interface LogoProps {
  size?: LogoSize
  priority?: boolean
  /** Seat the crest in a white circular badge — required on navy surfaces. */
  badge?: boolean
  className?: string
}

/**
 * Cordova Public College crest. Rendered at its intrinsic aspect ratio —
 * never stretched or recolored. On dark surfaces it sits inside a white
 * circular badge with padding so it never reads as a white square; on light
 * surfaces it is rendered cleanly on its own.
 */
export default function Logo({
  size = "sm",
  priority = false,
  badge = false,
  className = "",
}: LogoProps) {
  const { crest, badge: badgeClass, sizes } = sizeMap[size]

  const image = (
    <Image
      src="/logo/cpcp-logo-512.png"
      alt="Cordova Public College"
      width={512}
      height={512}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      sizes={sizes}
      className={cn("crest shrink-0 object-contain", crest, !badge && className)}
    />
  )

  if (!badge) {
    return image
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-white",
        badgeClass,
        className
      )}
    >
      {image}
    </span>
  )
}

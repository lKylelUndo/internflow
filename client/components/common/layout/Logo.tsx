import Image from "next/image"

const sizeMap = {
  sm: { className: "h-10 w-auto", sizes: "40px" },
  md: { className: "h-14 w-auto", sizes: "56px" },
  lg: { className: "h-20 w-auto", sizes: "80px" },
} as const

type LogoSize = keyof typeof sizeMap

interface LogoProps {
  size?: LogoSize
  priority?: boolean
  className?: string
}

/**
 * Cordova Public College wordmark mark. Rendered at its intrinsic aspect
 ratio — never stretched or recolored. On dark surfaces place it inside a
 * white circular badge instead of relying on a transparent background.
 */
export default function Logo({
  size = "sm",
  priority = false,
  className = "",
}: LogoProps) {
  const { className: sizeClass, sizes } = sizeMap[size]

  return (
    <Image
      src="/logo/cpcp-logo-512.png"
      alt="Cordova Public College"
      width={512}
      height={512}
      priority={priority}
      fetchPriority={priority ? "high" : undefined}
      sizes={sizes}
      className={`${sizeClass} shrink-0 object-contain ${className}`.trim()}
    />
  )
}

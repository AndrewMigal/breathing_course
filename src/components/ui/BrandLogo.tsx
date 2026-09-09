import Image from 'next/image'

interface BrandLogoProps {
  size?: number
  className?: string
}

export default function BrandLogo({ size = 48, className = '' }: BrandLogoProps) {
  return (
    <div
      className={`rounded-full bg-white flex items-center justify-center overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/logo.png"
        alt="onlybreaths"
        width={size}
        height={size}
        className="object-contain"
        priority
      />
    </div>
  )
}

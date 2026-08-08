'use client'

import Image from 'next/image'
import { useTheme } from '@/components/providers/ThemeProvider'

interface BrandLogoProps {
  size?: number
  className?: string
}

export default function BrandLogo({ size = 48, className = '' }: BrandLogoProps) {
  const { theme } = useTheme()

  return (
    <Image
      src={theme === 'dark' ? '/logo-dark.jpg' : '/logo-light.jpg'}
      alt="Inhale Exhale Co."
      width={size}
      height={size}
      className={`rounded-full object-cover logo-hero-fade ${className}`}
      priority
    />
  )
}

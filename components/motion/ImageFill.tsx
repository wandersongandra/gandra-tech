'use client'
import { useState } from 'react'
import Image from 'next/image'

interface Props {
  src: string
  alt?: string
  sizes?: string
  priority?: boolean
  quality?: number
  objectFit?: 'cover' | 'contain'
  objectPosition?: string
  fallback: React.ReactNode
}

/**
 * Preenche o container pai com uma imagem. Se o arquivo não existir
 * (ou falhar ao carregar), renderiza o fallback (placeholder).
 */
export default function ImageFill({
  src,
  alt = '',
  sizes = '100vw',
  priority = false,
  quality,
  objectFit = 'cover',
  objectPosition = 'top center',
  fallback,
}: Props) {
  const [missing, setMissing] = useState(false)

  if (missing) return <>{fallback}</>

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      fetchPriority={priority ? 'high' : 'auto'}
      quality={quality}
      style={{ objectFit, objectPosition }}
      onError={() => setMissing(true)}
    />
  )
}

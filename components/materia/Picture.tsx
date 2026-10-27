import type { CSSProperties } from 'react'
import { fallbackSrc, getMedia, srcSet } from '@/lib/media'

type Props = {
  src: string
  alt: string
  /** Atributo sizes real da moldura — decide qual largura o navegador baixa. */
  sizes: string
  className?: string
  /** 'cover' preenche a moldura usando o ponto focal; 'contain' nunca corta. */
  fit?: 'cover' | 'contain'
  /** Sobrescreve o ponto focal da direção de arte. */
  focus?: string
  priority?: boolean
  style?: CSSProperties
}

/**
 * <picture> com AVIF + WebP responsivos gerados por
 * scripts/optimize-images.mjs. Sempre emite width/height intrínsecos
 * (reserva espaço, CLS 0); o enquadramento fica no CSS da moldura.
 * Componente de servidor: zero JavaScript no cliente.
 */
export default function Picture({ src, alt, sizes, className, fit = 'cover', focus, priority = false, style }: Props) {
  const info = getMedia(src)
  const objectPosition = focus ?? info?.focus ?? '50% 50%'
  const imgStyle = { objectFit: fit, objectPosition, ...style } as CSSProperties

  if (!info) {
    // Imagem fora do manifesto: entrega o arquivo original sem quebrar a página.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} className={className} style={imgStyle} loading={priority ? 'eager' : 'lazy'} decoding="async" />
    )
  }

  return (
    <picture className="m-picture">
      <source type="image/avif" srcSet={srcSet(info, 'avif')} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet(info, 'webp')} sizes={sizes} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fallbackSrc(info)}
        alt={alt}
        width={info.width}
        height={info.height}
        className={className}
        style={imgStyle}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding={priority ? 'sync' : 'async'}
      />
    </picture>
  )
}

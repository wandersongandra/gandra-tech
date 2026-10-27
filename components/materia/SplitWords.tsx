import { Fragment, type CSSProperties, type ElementType, type ReactNode } from 'react'

type Props = {
  text: string
  as?: ElementType
  className?: string
  id?: string
  /** Atraso inicial (s) e intervalo entre palavras (s) da entrada CSS. */
  delay?: number
  step?: number
  /** Palavras (sem pontuação final) que recebem o itálico de acento. */
  accent?: string[]
  children?: ReactNode
}

/**
 * Título com revelação por máscara, 100% CSS: cada palavra sobe de dentro
 * da própria linha assim que a página pinta — não depende de hidratação,
 * então o LCP não espera o JavaScript. Com prefers-reduced-motion a
 * animação é anulada e o texto aparece pronto. O texto completo continua
 * no DOM como uma frase normal para leitores de tela e buscadores.
 */
export default function SplitWords({ text, as: Tag = 'h2', className, id, delay = 0, step = 0.06, accent = [], children }: Props) {
  const words = text.split(' ')
  return (
    <Tag id={id} className={`split ${className ?? ''}`}>
      {words.map((word, index) => {
        const bare = word.replace(/[.,;:!?]+$/, '')
        const isAccent = accent.includes(bare)
        return (
          <Fragment key={`${word}-${index}`}>
            <span className="split__mask">
              <span
                className={`split__word${isAccent ? ' split__word--accent' : ''}`}
                style={{ '--d': `${(delay + index * step).toFixed(3)}s` } as CSSProperties}
              >
                {word}
              </span>
            </span>
            {index < words.length - 1 ? ' ' : null}
          </Fragment>
        )
      })}
      {children}
    </Tag>
  )
}

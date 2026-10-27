/**
 * Parágrafo dividido em palavras para o efeito de "leitura que acende"
 * (CaseMotion). Sem JavaScript ou com movimento reduzido o texto aparece
 * inteiro e normal: o estado apagado só é aplicado pelo script.
 */
export default function ScrubText({ text, className }: { text: string; className?: string }) {
  const words = text.split(' ')
  return (
    <p className={`m-scrub ${className ?? ''}`} data-scrub>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="m-scrub__w">
          {word}
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </p>
  )
}

import type { ReactNode } from 'react'

type LegalContainerProps = {
  eyebrow: string
  title: string
  intro: string
  updatedAt: string
  children: ReactNode
}

export default function LegalContainer({
  eyebrow,
  title,
  intro,
  updatedAt,
  children,
}: LegalContainerProps) {
  return (
    <article className="legal-page">
      <div className="container legal-page__container">
        <header className="legal-page__header">
          <p className="legal-page__eyebrow">{eyebrow}</p>
          <h1 className="legal-page__title">{title}</h1>
          <p className="legal-page__intro">{intro}</p>
          <p className="legal-page__updated">Última atualização: {updatedAt}</p>
        </header>

        <aside className="legal-page__notice" role="note">
          Documento-base gerado tecnicamente. Recomenda-se a validação final por um advogado
          antes do uso comercial definitivo.
        </aside>

        <div className="legal-page__content">{children}</div>
      </div>
    </article>
  )
}

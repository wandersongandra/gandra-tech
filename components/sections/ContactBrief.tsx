'use client'

import { useEffect, useState } from 'react'
import { composeContactBrief, isKnownServiceSlug } from '@/lib/contact-brief'
import { services } from '@/lib/services'
import { contactEmail, contactMailto } from '@/lib/site'

export default function ContactBrief() {
  const [serviceSlug, setServiceSlug] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [project, setProject] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [hydrated, setHydrated] = useState(false)

  // A exportação estática mantém o mesmo HTML para todos. A origem do CTA é
  // lida apenas depois da hidratação, validada contra o catálogo real.
  useEffect(() => {
    setHydrated(true)
    const slug = new URLSearchParams(window.location.search).get('servico') ?? ''
    if (isKnownServiceSlug(slug)) setServiceSlug(slug)
  }, [])

  const brief = composeContactBrief({ serviceSlug, name, contact, project })

  const copyBrief = async () => {
    try {
      let copied = false
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(brief.copyText)
          copied = true
        } catch {
          // Permissões de clipboard variam por navegador; tenta cópia local.
        }
      }
      if (!copied) {
        const field = document.createElement('textarea')
        field.value = brief.copyText
        field.setAttribute('readonly', '')
        field.style.position = 'fixed'
        field.style.opacity = '0'
        document.body.appendChild(field)
        field.select()
        copied = document.execCommand('copy')
        field.remove()
        if (!copied) throw new Error('clipboard indisponível')
      }
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
  }

  return (
    <section id="orcamento" className="cp-brief" aria-labelledby="cp-brief-title" data-no-stain>
      <div className="container cp-brief__layout">
        <div className="cp-brief__intro">
          <span className="cp-grid__label">SEU PRÓXIMO PROJETO / 01</span>
          <h2 id="cp-brief-title">Vamos começar <em>pelo essencial.</em></h2>
          <p>
            Você não precisa ter um briefing pronto. Conte o que pretende resolver;
            nós alinhamos o escopo na conversa.
          </p>
          <div className="cp-brief__guidance">
            <span className="cp-grid__label">O QUE AJUDA NO PRIMEIRO CONTATO</span>
            <ol>
              <li>O que o seu negócio faz e quem precisa alcançar.</li>
              <li>O que você quer criar, melhorar ou automatizar.</li>
              <li>Se existe alguma data ou prioridade importante.</li>
            </ol>
          </div>
        </div>

        <div className="cp-brief__fields" role="group" aria-label="Preparar pedido de orçamento">
          <div className="cp-brief__field">
            <label htmlFor="brief-service">Qual serviço você procura?</label>
            <select
              id="brief-service"
              disabled={!hydrated}
              value={serviceSlug}
              onChange={(event) => { setServiceSlug(event.target.value); setCopyState('idle') }}
            >
              <option value="">Ainda estou definindo</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>{service.title}</option>
              ))}
            </select>
          </div>
          <div className="cp-brief__row">
            <div className="cp-brief__field">
              <label htmlFor="brief-name">Seu nome</label>
              <input
                id="brief-name"
                disabled={!hydrated}
                autoComplete="name"
                maxLength={90}
                placeholder="Como podemos chamar você?"
                value={name}
                onChange={(event) => { setName(event.target.value); setCopyState('idle') }}
              />
            </div>
            <div className="cp-brief__field">
              <label htmlFor="brief-contact">E-mail ou WhatsApp para retorno</label>
              <input
                id="brief-contact"
                disabled={!hydrated}
                autoComplete="email"
                maxLength={120}
                placeholder="Seu contato preferido"
                value={contact}
                onChange={(event) => { setContact(event.target.value); setCopyState('idle') }}
              />
            </div>
          </div>
          <div className="cp-brief__field">
            <label htmlFor="brief-project">Conte um pouco sobre o projeto</label>
            <textarea
              id="brief-project"
              disabled={!hydrated}
              rows={5}
              maxLength={600}
              placeholder="O que você precisa resolver? Pode escrever do seu jeito."
              value={project}
              onChange={(event) => { setProject(event.target.value); setCopyState('idle') }}
            />
          </div>

          <div className="cp-brief__actions">
            <a href={hydrated ? brief.mailto : contactMailto} className="cp-brief__submit">
              Abrir e-mail com a mensagem pronta <span aria-hidden="true">↗</span>
            </a>
            <button type="button" className="cp-brief__copy" onClick={copyBrief} disabled={!hydrated}>
              {copyState === 'copied' ? 'Mensagem copiada' : 'Copiar mensagem'}
            </button>
          </div>
          <details className="cp-brief__preview">
            <summary>Pré-visualizar a mensagem</summary>
            <pre tabIndex={0}>{brief.copyText}</pre>
          </details>
          <p className="cp-brief__disclaimer">
            O preenchimento não é salvo nem enviado pelo site. Revise e confirme o envio
            no seu aplicativo de e-mail para {contactEmail}.
          </p>
          <noscript>
            <p className="cp-brief__disclaimer">
              Sem JavaScript, os campos ficam desativados. Escreva diretamente para {contactEmail} pelo link de e-mail acima.
            </p>
          </noscript>
          <p className="cp-brief__feedback" role="status" aria-live="polite">
            {copyState === 'copied' ? 'Mensagem copiada. Cole no aplicativo de sua preferência e envie para o endereço indicado.' : ''}
            {copyState === 'error' ? 'Não foi possível copiar automaticamente. Abra “Pré-visualizar a mensagem” e copie o texto manualmente.' : ''}
          </p>
        </div>
      </div>
    </section>
  )
}

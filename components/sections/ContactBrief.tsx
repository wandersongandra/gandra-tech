'use client'

import { useEffect, useState } from 'react'
import { composeContactBrief, isKnownServiceSlug } from '@/lib/contact-brief'
import { services } from '@/lib/services'
import { contactEmail, contactMailto } from '@/lib/site'
import { leadSubmissionEnabled, turnstileSiteKey } from '@/lib/lead-availability'
import Link from 'next/link'
import TurnstileChallenge from './TurnstileChallenge'

export default function ContactBrief() {
  const [serviceSlug, setServiceSlug] = useState('')
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [project, setProject] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const [emailHintVisible, setEmailHintVisible] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const [website, setWebsite] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [challengeToken, setChallengeToken] = useState('')
  const [challengeResetKey, setChallengeResetKey] = useState(0)
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sendMessage, setSendMessage] = useState('')

  // A exportação estática mantém o mesmo HTML para todos. A origem do CTA é
  // lida apenas depois da hidratação, validada contra o catálogo real.
  useEffect(() => {
    setHydrated(true)
    const slug = new URLSearchParams(window.location.search).get('servico') ?? ''
    if (isKnownServiceSlug(slug)) setServiceSlug(slug)
  }, [])

  const brief = composeContactBrief({ serviceSlug, name, contact, project })

  const sendDirectly = async () => {
    if (!leadSubmissionEnabled || sendState === 'sending' || sendState === 'sent') return
    if (name.trim().length < 2 || name.trim().length > 90) {
      setSendMessage('Informe seu nome (pelo menos dois caracteres).')
      return
    }
    const contactValue = contact.trim()
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValue)
    const phoneDigits = contactValue.replace(/\D/g, '').length
    if (!isEmail && (phoneDigits < 10 || phoneDigits > 15)) {
      setSendMessage('Informe um e-mail válido ou WhatsApp com DDD.')
      return
    }
    if (project.trim().length < 15) {
      setSendMessage('Conte um pouco mais sobre o projeto (pelo menos 15 caracteres).')
      return
    }
    if (!acknowledged) {
      setSendMessage('Confirme a ciência da Política de Privacidade antes do envio.')
      return
    }
    if (!challengeToken) {
      setSendMessage('Conclua a verificação de segurança para enviar pelo site.')
      return
    }

    setSendState('sending')
    setSendMessage('Enviando sua solicitação com segurança…')
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), contact: contactValue, project: project.trim(),
          serviceSlug, token: challengeToken, website, consent: acknowledged,
        }),
      })
      if (!response.ok) throw new Error(`Falha no envio: ${response.status}`)
      setSendState('sent')
      setSendMessage('Recebemos seu pedido! Entraremos em contato pelo canal informado.')
    } catch {
      setSendState('error')
      setSendMessage('Não foi possível confirmar o envio. Tente novamente ou use a opção de e-mail abaixo.')
      setChallengeToken('')
      setChallengeResetKey((key) => key + 1)
    }
  }

  const copyBrief = async () => {
    setEmailHintVisible(false)
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
              onChange={(event) => { setServiceSlug(event.target.value); setCopyState('idle'); setEmailHintVisible(false) }}
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
                onChange={(event) => { setName(event.target.value); setCopyState('idle'); setEmailHintVisible(false) }}
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
                onChange={(event) => { setContact(event.target.value); setCopyState('idle'); setEmailHintVisible(false) }}
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
                onChange={(event) => { setProject(event.target.value); setCopyState('idle'); setEmailHintVisible(false) }}
            />
          </div>

          {leadSubmissionEnabled && (
            <>
              <div className="cp-brief__honeypot" aria-hidden="true">
                <label htmlFor="brief-website">Deixe este campo vazio</label>
                <input id="brief-website" name="website" autoComplete="off" tabIndex={-1}
                  value={website} onChange={(event) => setWebsite(event.target.value)} />
              </div>
              <label className="cp-brief__consent" htmlFor="brief-consent">
                <input id="brief-consent" type="checkbox" checked={acknowledged}
                  onChange={(event) => setAcknowledged(event.target.checked)} />
                <span>Li a <Link href="/politica-de-privacidade">Política de Privacidade</Link> e estou ciente do uso dos dados enviados para atender meu pedido.</span>
              </label>
              <TurnstileChallenge siteKey={turnstileSiteKey} onToken={setChallengeToken} resetKey={challengeResetKey} />
              <button type="button" className="cp-brief__submit cp-brief__send"
                disabled={!hydrated || sendState === 'sending' || sendState === 'sent'}
                onClick={sendDirectly}>
                {sendState === 'sending' ? 'Enviando pedido…' : sendState === 'sent' ? 'Pedido recebido' : 'Enviar pedido de orçamento'}
                <span aria-hidden="true">↗</span>
              </button>
              <p className="cp-brief__feedback" role="status" aria-live="polite">{sendMessage}</p>
            </>
          )}

          <div className="cp-brief__actions">
            <a
              href={hydrated ? brief.mailto : contactMailto}
              className="cp-brief__submit"
              onClick={() => { setEmailHintVisible(true); setCopyState('idle') }}
            >
              {leadSubmissionEnabled ? 'Prefiro enviar pelo meu e-mail' : 'Abrir e-mail com a mensagem pronta'} <span aria-hidden="true">↗</span>
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
            {leadSubmissionEnabled
              ? <>Ao escolher o envio direto, os dados serão encaminhados à Gandra Tecnologia para atendimento, com verificação antispam. Também é possível abrir o seu aplicativo de e-mail para {contactEmail}.</>
              : <>O preenchimento não é salvo nem enviado pelo site. Revise e confirme o envio no seu aplicativo de e-mail para {contactEmail}.</>}
          </p>
          <p className="cp-brief__disclaimer">
            Pedir orçamento não gera contratação automática. Veja os{' '}
            <Link href="/termos-de-uso">Termos de Uso</Link> e a{' '}
            <Link href="/politica-de-privacidade">Política de Privacidade</Link>.
          </p>
          <noscript>
            <p className="cp-brief__disclaimer">
              Sem JavaScript, os campos ficam desativados. Escreva diretamente para {contactEmail} pelo link de e-mail acima.
            </p>
          </noscript>
          <p className="cp-brief__feedback" role="status" aria-live="polite">
            {emailHintVisible ? 'Confirme o envio no aplicativo de e-mail. Se ele não abrir, use “Copiar mensagem” e envie manualmente.' : ''}
            {copyState === 'copied' ? 'Mensagem copiada. Cole no aplicativo de sua preferência e envie para o endereço indicado.' : ''}
            {copyState === 'error' ? 'Não foi possível copiar automaticamente. Abra “Pré-visualizar a mensagem” e copie o texto manualmente.' : ''}
          </p>
        </div>
      </div>
    </section>
  )
}

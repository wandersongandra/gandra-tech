'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { composeContactBrief, isKnownReferenceSlug, isKnownServiceSlug } from '@/lib/contact-brief'
import { services } from '@/lib/services'
import { contactEmail, contactMailto } from '@/lib/site'
import { leadSubmissionEnabled, turnstileSiteKey } from '@/lib/lead-availability'
import { isLeadAcceptedResponse, leadRejectionMessage, leadTransportFailureMessage } from '@/lib/lead-response'
import { isValidLeadContact } from '@/lib/lead-contact-validation'
import Link from 'next/link'
import TurnstileChallenge from './TurnstileChallenge'

type FieldName = 'name' | 'contact' | 'project' | 'consent' | 'challenge'
type FieldErrors = Partial<Record<FieldName, string>>

/** id do elemento que recebe o foco quando o campo é o primeiro inválido. */
const FIELD_IDS: Record<FieldName, string> = {
  name: 'brief-name',
  contact: 'brief-contact',
  project: 'brief-project',
  consent: 'brief-consent',
  challenge: 'brief-challenge',
}

export default function ContactBrief() {
  // Campos não controlados: ficam habilitados desde o primeiro paint e o que
  // for digitado antes da hidratação não é apagado quando o React assume.
  const serviceRef = useRef<HTMLSelectElement>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const contactRef = useRef<HTMLInputElement>(null)
  const projectRef = useRef<HTMLTextAreaElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const [serviceSlug, setServiceSlug] = useState('')
  const [referenceSlug, setReferenceSlug] = useState('')
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
  const [errors, setErrors] = useState<FieldErrors>({})

  // A exportação estática mantém o mesmo HTML para todos. A origem do CTA é
  // lida apenas depois da hidratação, validada contra o catálogo real.
  useEffect(() => {
    setHydrated(true)
    // Recupera o que o visitante já digitou antes de o JavaScript assumir.
    if (nameRef.current?.value) setName(nameRef.current.value)
    if (contactRef.current?.value) setContact(contactRef.current.value)
    if (projectRef.current?.value) setProject(projectRef.current.value)
    if (consentRef.current?.checked) setAcknowledged(true)
    const params = new URLSearchParams(window.location.search)
    const chosen = serviceRef.current?.value ?? ''
    const slug = params.get('servico') ?? ''
    if (chosen && isKnownServiceSlug(chosen)) {
      setServiceSlug(chosen)
    } else if (isKnownServiceSlug(slug)) {
      setServiceSlug(slug)
      if (serviceRef.current) serviceRef.current.value = slug
    }
    const reference = params.get('referencia') ?? ''
    if (isKnownReferenceSlug(reference)) setReferenceSlug(reference)
  }, [])

  const brief = composeContactBrief({ serviceSlug, referenceSlug, name, contact, project })

  const clearError = (field: FieldName) => {
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const validate = (): FieldErrors => {
    const found: FieldErrors = {}
    if (name.trim().length < 2 || name.trim().length > 90) {
      found.name = 'Informe seu nome (pelo menos dois caracteres).'
    }
    if (!isValidLeadContact(contact.trim())) {
      found.contact = 'Informe um e-mail válido ou WhatsApp com DDD.'
    }
    if (project.trim().length < 15) {
      found.project = 'Conte um pouco mais sobre o projeto (pelo menos 15 caracteres).'
    }
    if (!acknowledged) {
      found.consent = 'Confirme a ciência da Política de Privacidade antes do envio.'
    }
    if (!challengeToken) {
      found.challenge = 'Conclua a verificação de segurança para enviar pelo site.'
    }
    return found
  }

  const sendDirectly = async () => {
    if (!leadSubmissionEnabled || sendState === 'sending' || sendState === 'sent') return
    const found = validate()
    setErrors(found)
    const invalid = (Object.keys(FIELD_IDS) as FieldName[]).filter((field) => found[field])
    if (invalid.length) {
      setSendMessage(invalid.length === 1 ? found[invalid[0]] ?? '' : 'Revise os campos indicados antes de enviar.')
      document.getElementById(FIELD_IDS[invalid[0]])?.focus()
      return
    }
    const contactValue = contact.trim()

    setSendState('sending')
    setSendMessage('Enviando sua solicitação com segurança…')
    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        // A prévia usa Cloudflare Access: o cookie HttpOnly da sessão precisa
        // acompanhar apenas esta requisição same-origin para evitar redirect
        // ao login (e falha de CORS no fetch). Nunca enviar a outro domínio.
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        // Não manter o botão indefinidamente em "Enviando" se a rede travar.
        signal: AbortSignal.timeout(25_000),
        body: JSON.stringify({
          name: name.trim(), contact: contactValue, project: project.trim(),
          serviceSlug, referenceSlug, token: challengeToken, website, consent: acknowledged,
        }),
      })
      if (!(await isLeadAcceptedResponse(response.clone()))) {
        setSendState('error')
        setSendMessage(await leadRejectionMessage(response))
        setChallengeToken('')
        setChallengeResetKey((key) => key + 1)
        return
      }
      setSendState('sent')
      setSendMessage('Seu pedido foi encaminhado! Vamos responder pelo contato informado.')
    } catch (error) {
      setSendState('error')
      setSendMessage(leadTransportFailureMessage(error))
      setChallengeToken('')
      setChallengeResetKey((key) => key + 1)
    }
  }

  // Enter num campo envia (formulário de verdade); o fetch continua sendo o
  // único caminho de envio — a CSP (form-action 'none') barra o envio nativo.
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void sendDirectly()
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

  const errorProps = (field: FieldName) =>
    errors[field]
      ? { 'aria-invalid': true as const, 'aria-describedby': `${FIELD_IDS[field]}-error` }
      : {}

  const fieldError = (field: FieldName) =>
    errors[field] ? (
      <p id={`${FIELD_IDS[field]}-error`} className="cp-brief__error">
        {errors[field]}
      </p>
    ) : null

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

        <form
          className="cp-brief__fields"
          aria-label="Preparar pedido de orçamento"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="cp-brief__field">
            <label htmlFor="brief-service">Qual serviço você procura?</label>
            <select
              ref={serviceRef}
              id="brief-service"
              name="servico"
              defaultValue=""
              onChange={(event) => { setServiceSlug(event.target.value); setCopyState('idle'); setEmailHintVisible(false) }}
            >
              <option value="">Ainda estou definindo</option>
              {services.map((service) => (
                <option key={service.slug} value={service.slug}>{service.title}</option>
              ))}
            </select>
          </div>
          {brief.referenceName && (
            <div className="cp-brief__reference" role="group" aria-label="Referência de projeto selecionada">
              <div>
                <span className="cp-grid__label">CASE QUE INSPIROU SEU CONTATO</span>
                <p>
                  <strong>{brief.referenceName}</strong> será citado como referência na sua mensagem.
                  Podemos conversar sobre necessidades semelhantes, com uma solução própria para o seu negócio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setReferenceSlug(''); setCopyState('idle'); setEmailHintVisible(false) }}
              >
                Retirar referência
              </button>
            </div>
          )}
          <div className="cp-brief__row">
            <div className="cp-brief__field">
              <label htmlFor="brief-name">Seu nome</label>
              <input
                ref={nameRef}
                id="brief-name"
                name="nome"
                autoComplete="name"
                maxLength={90}
                required={leadSubmissionEnabled}
                placeholder="Como podemos chamar você?"
                defaultValue=""
                {...errorProps('name')}
                onChange={(event) => { setName(event.target.value); clearError('name'); setCopyState('idle'); setEmailHintVisible(false) }}
              />
              {fieldError('name')}
            </div>
            <div className="cp-brief__field">
              <label htmlFor="brief-contact">E-mail ou WhatsApp para retorno</label>
              {/* Campo misto: sem autocomplete="email" (que só sugere e-mails) e
                  com teclado de texto, que aceita "@" e números. */}
              <input
                ref={contactRef}
                id="brief-contact"
                name="contato"
                autoComplete="on"
                inputMode="text"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={120}
                required={leadSubmissionEnabled}
                placeholder="Seu contato preferido"
                defaultValue=""
                {...errorProps('contact')}
                onChange={(event) => { setContact(event.target.value); clearError('contact'); setCopyState('idle'); setEmailHintVisible(false) }}
              />
              {fieldError('contact')}
            </div>
          </div>
          <div className="cp-brief__field">
            <label htmlFor="brief-project">Conte um pouco sobre o projeto</label>
            <textarea
              ref={projectRef}
              id="brief-project"
              name="projeto"
              rows={5}
              maxLength={600}
              required={leadSubmissionEnabled}
              placeholder="O que você precisa resolver? Pode escrever do seu jeito."
              defaultValue=""
              {...errorProps('project')}
              onChange={(event) => { setProject(event.target.value); clearError('project'); setCopyState('idle'); setEmailHintVisible(false) }}
            />
            {fieldError('project')}
          </div>

          {leadSubmissionEnabled && (
            <>
              <div className="cp-brief__honeypot" aria-hidden="true">
                <label htmlFor="brief-website">Deixe este campo vazio</label>
                <input id="brief-website" name="website" autoComplete="off" tabIndex={-1}
                  value={website} onChange={(event) => setWebsite(event.target.value)} />
              </div>
              <label className="cp-brief__consent" htmlFor="brief-consent">
                <input ref={consentRef} id="brief-consent" type="checkbox" defaultChecked={false} required
                  {...errorProps('consent')}
                  onChange={(event) => { setAcknowledged(event.target.checked); clearError('consent') }} />
                <span>Li a <Link href="/politica-de-privacidade">Política de Privacidade</Link> e estou ciente do uso dos dados enviados para atender meu pedido.</span>
              </label>
              {fieldError('consent')}
              <div id="brief-challenge" tabIndex={-1}>
                <TurnstileChallenge
                  siteKey={turnstileSiteKey}
                  onToken={(token) => { setChallengeToken(token); if (token) clearError('challenge') }}
                  resetKey={challengeResetKey}
                />
              </div>
              {fieldError('challenge')}
              <button type="submit" className="cp-brief__submit cp-brief__send"
                disabled={!hydrated || sendState === 'sending' || sendState === 'sent'}>
                {sendState === 'sending' ? 'Enviando pedido…' : sendState === 'sent' ? 'Pedido encaminhado' : 'Enviar pedido de orçamento'}
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
              Sem JavaScript, os campos do pedido não são exibidos. Escreva diretamente para {contactEmail} pelo link de e-mail acima.
            </p>
          </noscript>
          <p className="cp-brief__feedback" role="status" aria-live="polite">
            {emailHintVisible ? 'Confirme o envio no aplicativo de e-mail. Se ele não abrir, use “Copiar mensagem” e envie manualmente.' : ''}
            {copyState === 'copied' ? 'Mensagem copiada. Cole no aplicativo de sua preferência e envie para o endereço indicado.' : ''}
            {copyState === 'error' ? 'Não foi possível copiar automaticamente. Abra “Pré-visualizar a mensagem” e copie o texto manualmente.' : ''}
          </p>
        </form>
      </div>
    </section>
  )
}

'use client'

import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

type TurnstileApi = {
  render: (container: HTMLElement, options: {
    sitekey: string
    action: string
    theme: 'light'
    callback: (token: string) => void
    'expired-callback': () => void
    'error-callback': () => void
  }) => string
  reset: (widgetId: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

type Props = {
  siteKey: string
  onToken: (value: string) => void
  resetKey: number
}

export default function TurnstileChallenge({ siteKey, onToken, resetKey }: Props) {
  const container = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => { onTokenRef.current = onToken }, [onToken])

  useEffect(() => {
    if (!ready || !container.current || !window.turnstile || widgetId.current !== null) return
    const api = window.turnstile
    try {
      widgetId.current = api.render(container.current, {
        sitekey: siteKey,
        action: 'gandra-lead',
        theme: 'light',
        callback: (token) => { setFailed(false); onTokenRef.current(token) },
        'expired-callback': () => onTokenRef.current(''),
        'error-callback': () => { setFailed(true); onTokenRef.current('') },
      })
    } catch {
      setFailed(true)
      onTokenRef.current('')
    }
    return () => {
      if (widgetId.current !== null) api.remove(widgetId.current)
      widgetId.current = null
    }
  }, [ready, siteKey])

  useEffect(() => {
    if (!resetKey || !window.turnstile || widgetId.current === null) return
    onTokenRef.current('')
    setFailed(false)
    window.turnstile.reset(widgetId.current)
  }, [resetKey])

  return (
    <div className="cp-brief__challenge" aria-label="Verificação de segurança">
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onReady={() => setReady(true)}
        onError={() => setFailed(true)}
      />
      <div ref={container} />
      {failed && <p className="cp-brief__warning" role="alert">Não foi possível completar a verificação. Você pode tentar novamente ou usar o envio por e-mail.</p>}
    </div>
  )
}

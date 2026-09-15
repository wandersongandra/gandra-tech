'use client'

import { useState } from 'react'

export default function CopyEmailButton({ email }: { email: string }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')

  const copyEmail = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(email)
      } else {
        const input = document.createElement('textarea')
        input.value = email
        input.setAttribute('readonly', '')
        input.style.position = 'fixed'
        input.style.opacity = '0'
        document.body.appendChild(input)
        input.select()
        const copied = document.execCommand('copy')
        input.remove()
        if (!copied) throw new Error('copy command failed')
      }
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 1800)
    } catch {
      setCopyState('error')
    }
  }

  return (
    <div className="cp-email-fallback">
      <p>Se o seu aplicativo de email não abrir, copie o endereço:</p>
      <div className="cp-email-fallback__row">
        <span className="cp-email-fallback__address" tabIndex={0}>{email}</span>
        <button type="button" onClick={copyEmail} aria-label={`Copiar ${email}`}>
          {copyState === 'copied' ? 'Copiado' : 'Copiar'}
        </button>
      </div>
      <span className="cp-email-fallback__status" role="status" aria-live="polite">
        {copyState === 'copied' ? 'Endereço copiado.' : ''}
        {copyState === 'error' ? 'Não foi possível copiar automaticamente. Selecione o endereço acima e copie manualmente.' : ''}
      </span>
    </div>
  )
}

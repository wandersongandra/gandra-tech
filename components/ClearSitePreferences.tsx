'use client'

import { useEffect, useState } from 'react'
import { removeSitePreferences } from '@/lib/site-preferences'

export default function ClearSitePreferences() {
  const [ready, setReady] = useState(false)
  const [state, setState] = useState<'idle' | 'cleared' | 'unavailable'>('idle')

  useEffect(() => setReady(true), [])

  const clearPreferences = () => {
    try {
      setState(removeSitePreferences(window.localStorage, window.sessionStorage) ? 'cleared' : 'unavailable')
    } catch {
      setState('unavailable')
    }
  }

  return (
    <div className="legal-page__preferences">
      <button type="button" onClick={clearPreferences} disabled={!ready}>
        Apagar preferências visuais deste site
      </button>
      <noscript>Para remover preferências sem JavaScript, use as configurações do navegador.</noscript>
      <p role="status" aria-live="polite" className="legal-page__preferences-status">
        {state === 'cleared' &&
          'Preferências apagadas neste navegador. Alguns efeitos podem voltar ao estado inicial após atualizar a página.'}
        {state === 'unavailable' &&
          'Não foi possível confirmar a limpeza completa. Você pode remover os dados do site nas configurações do navegador.'}
      </p>
    </div>
  )
}

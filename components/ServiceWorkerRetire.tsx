'use client'

import { useEffect } from 'react'

/**
 * Remove o service worker legado e os caches criados por ele.
 *
 * O site institucional não depende de funcionalidades offline. Manter um
 * service worker persistente aumentaria desnecessariamente a superfície de
 * execução no navegador, então esta rotina faz a migração segura para uma
 * arquitetura sem worker.
 */
export default function ServiceWorkerRetire() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return

    const retire = async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations
            .filter((registration) => registration.scope.startsWith(window.location.origin))
            .map((registration) => registration.unregister()),
        )
      }

      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(
          keys
            .filter((key) => key.startsWith('gandra-'))
            .map((key) => caches.delete(key)),
        )
      }
    }

    void retire()
  }, [])

  return null
}

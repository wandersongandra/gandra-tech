'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

type LenisLike = { scrollTo: (y: number, o?: { immediate?: boolean; force?: boolean }) => void; resize?: () => void }

const KEY = 'gt-scroll'
const norm = (p: string) => (p.length > 1 ? p.replace(/\/+$/, '') : p) || '/'

function jump(y: number) {
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis
  if (lenis) {
    // limite do Lenis pode ainda ser o da página anterior (resize com atraso)
    lenis.resize?.()
    lenis.scrollTo(y, { immediate: true, force: true })
  }
  // 'instant': com scroll-behavior: smooth no html, scrollTo(0, y) virava
  // uma rolagem animada da posição antiga até o topo, visível na troca.
  else window.scrollTo({ top: y, left: 0, behavior: 'instant' as ScrollBehavior })
}

/**
 * Memória de rolagem própria. Dois problemas que ela resolve:
 * 1) Ao navegar a partir de uma página rolada, o Next rola o <main> para a
 *    vista e a página nova chegava 65 px abaixo do topo (debaixo do header).
 *    Em navegação nova (sem âncora) a página agora começa no topo.
 * 2) Com o Lenis no desktop, o "voltar" do navegador não restaurava a
 *    posição (o scroll nativo e o do Lenis brigavam). Guardamos a posição de
 *    cada rota e devolvemos no voltar/avançar e no recarregar, com algumas
 *    tentativas enquanto pins e imagens ainda mudam a altura da página —
 *    parando assim que o visitante rola por conta própria.
 */
export default function ScrollMemory() {
  const pathname = usePathname()
  const map = useRef<Record<string, number>>({})
  const current = useRef<string | null>(null)
  const popPath = useRef<string | null>(null)
  const timers = useRef<number[]>([])
  const touched = useRef(false)
  const first = useRef(true)

  useEffect(() => {
    try {
      history.scrollRestoration = 'manual'
    } catch {}
    try {
      map.current = JSON.parse(sessionStorage.getItem(KEY) || '{}') || {}
    } catch {}
    const save = () => {
      try {
        sessionStorage.setItem(KEY, JSON.stringify(map.current))
      } catch {}
    }
    const onScroll = () => {
      // Só grava enquanto a URL ainda é a da rota rastreada: logo após um
      // pushState/popstate o scroll pertence à transição, não à página antiga.
      const cur = current.current
      if (cur && norm(location.pathname) === cur) map.current[cur] = Math.round(window.scrollY)
    }
    const onPop = () => {
      popPath.current = norm(location.pathname)
    }
    const onUser = () => {
      touched.current = true
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('popstate', onPop)
    window.addEventListener('pagehide', save)
    window.addEventListener('wheel', onUser, { passive: true })
    window.addEventListener('touchstart', onUser, { passive: true })
    window.addEventListener('keydown', onUser)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('pagehide', save)
      window.removeEventListener('wheel', onUser)
      window.removeEventListener('touchstart', onUser)
      window.removeEventListener('keydown', onUser)
      save()
    }
  }, [])

  useEffect(() => {
    const path = norm(pathname)
    const isFirst = first.current
    first.current = false
    const isPop = popPath.current === path
    popPath.current = null
    timers.current.forEach(clearTimeout)
    timers.current = []
    touched.current = false

    let target: number | null = null
    if (isFirst) {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
      const kind = nav?.type
      if ((kind === 'reload' || kind === 'back_forward') && !location.hash) target = map.current[path] ?? null
    } else if (isPop) {
      target = location.hash && map.current[path] == null ? null : map.current[path] ?? 0
    } else if (!location.hash) {
      target = 0
    }

    current.current = null
    try {
      sessionStorage.setItem(KEY, JSON.stringify(map.current))
    } catch {}

    const finish = () => {
      current.current = path
    }
    if (target == null) {
      finish()
      return
    }
    const y = target
    const attempt = () => {
      if (touched.current) return finish()
      if (Math.abs(window.scrollY - y) > 2) jump(y)
    }
    requestAnimationFrame(attempt)
    for (const ms of [120, 400, 900]) timers.current.push(window.setTimeout(attempt, ms))
    timers.current.push(window.setTimeout(() => { attempt(); finish() }, 1300))
    return () => {
      timers.current.forEach(clearTimeout)
      timers.current = []
    }
  }, [pathname])

  return null
}

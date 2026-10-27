'use client'
import { useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getReducedMotionQuery } from './reducedMotion'
import { withGsap } from '@/lib/gsap'
import { jumpToTop } from '@/lib/scroll'

/**
 * Cortina de página em blob: um path SVG cobre a viewport e a borda
 * deforma durante a varredura, como tecido puxado. Na saída (painel sobe),
 * a borda inferior estica para baixo e depois recolhe; na entrada (painel
 * vem de baixo), a borda superior avança numa crista e assenta.
 *
 * `b` é a profundidade da deformação em centésimos da altura da viewport
 * (viewBox 0..100 com preserveAspectRatio="none").
 */
const exitD = (b: number) => `M 0 0 H 100 V 100 Q 50 ${100 + b} 0 100 Z`
const enterD = (b: number) => `M 0 0 Q 50 ${-b} 100 0 V 100 H 0 Z`
const FLAT = exitD(0)

const NAMED: Record<string, string> = {
  '/': 'Início',
  '/servicos': 'Serviços',
  '/trabalhos': 'Trabalhos',
  '/contato': 'Contato',
  '/termos-de-uso': 'Termos de uso',
  '/politica-de-privacidade': 'Privacidade',
}

/** Nome do destino escrito na cortina: data-curtain do link, mapa de rotas
 *  ou o último trecho do caminho ("sistemas-sob-medida" → "Sistemas sob medida"). */
function destinationLabel(a: HTMLAnchorElement, path: string) {
  const explicit = a.dataset.curtain?.trim()
  if (explicit) return explicit
  const clean = path.replace(/\/+$/, '') || '/'
  if (NAMED[clean]) return NAMED[clean]
  const slug = clean.split('/').pop() ?? ''
  const words = decodeURIComponent(slug).replace(/-/g, ' ')
  return words.charAt(0).toUpperCase() + words.slice(1)
}

export default function PageCurtain() {
  const panelRef = useRef<HTMLDivElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const logoRef = useRef<HTMLSpanElement>(null)
  const countRef = useRef<HTMLSpanElement>(null)
  // Objeto-mutação dirigido pelos tweens — fora do state para não rerenderizar.
  const sweepRef = useRef({ b: 0 })
  const didMount = useRef(false)
  // Tempo-limite da navegação: some com a cortina se a rota não trocar.
  const guard = useRef(0)
  // Fase 5: card → case vira um morph (View Transitions) no lugar da cortina.
  const morphing = useRef(false)
  const morphDone = useRef<(() => void) | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Entrance: animate panel out on mount / route change
  useEffect(() => withGsap(({ gsap }) => {
    const panel = panelRef.current
    const path = pathRef.current
    const logo = logoRef.current
    if (!panel || !path || !logo) return
    const motionQuery = getReducedMotionQuery()
    let tl: gsap.core.Timeline | null = null

    const hidePanel = () => {
      tl?.kill()
      gsap.killTweensOf([panel, path, logo, countRef.current, sweepRef.current])
      panel.style.visibility = 'hidden'
      // Via GSAP (yPercent), nunca `style.transform = 'translateY(-100%)'`:
      // o GSAP lia esse valor como y:-100vh fixo e somava ao yPercent dos
      // tweens — a cortina de entrada nascia já fora da tela e nunca cobria.
      gsap.set(panel, { yPercent: -100, y: 0 })
      panel.inert = true
      path.setAttribute('d', FLAT)
      // Rótulo volta para dentro da máscara: voltar/avançar do navegador
      // não mostra o destino da navegação anterior.
      gsap.set(logo, { yPercent: 105 })
      if (countRef.current) gsap.set(countRef.current, { opacity: 0 })
    }

    if (motionQuery.matches) {
      hidePanel()
      window.dispatchEvent(new Event('gt:curtain-open'))
      return
    }

    const sweep = sweepRef.current
    const drawExit = () => path.setAttribute('d', exitD(sweep.b))

    // Varredura de saída: o painel sobe enquanto a borda inferior estica
    // no início do movimento e recolhe conforme ele ganha velocidade.
    const sweepOut = (delay = 0) => {
      sweep.b = 0
      drawExit()
      panel.style.visibility = 'visible'
      panel.inert = true
      tl = gsap.timeline({
        delay,
        onStart: () => window.dispatchEvent(new Event('gt:curtain-open')),
        onComplete: hidePanel,
      })
        .fromTo(
          panel,
          { yPercent: 0, y: 0 },
          { yPercent: -100, duration: 0.9, ease: 'power3.inOut' },
          0
        )
        .to(sweep, { b: 22, duration: 0.32, ease: 'power2.in', onUpdate: drawExit }, 0)
        .to(sweep, { b: 0, duration: 0.6, ease: 'power3.out', onUpdate: drawExit }, 0.32)
    }

    // Navegação cancelada ou que não trocou a rota: tira a cortina.
    const onRelease = () => sweepOut(0)
    window.addEventListener('gt:curtain-release', onRelease)

    if (!didMount.current) {
      didMount.current = true
      hidePanel()
      window.dispatchEvent(new Event('gt:curtain-open'))
      return () => window.removeEventListener('gt:curtain-release', onRelease)
    }

    // Chegada de um morph: não há cortina para tirar; só avisa o morph
    // que o DOM novo está montado (ele tira o snapshot da capa).
    if (morphing.current) {
      hidePanel()
      window.dispatchEvent(new Event('gt:curtain-open'))
      morphDone.current?.()
      morphDone.current = null
      return () => window.removeEventListener('gt:curtain-release', onRelease)
    }

    // Subsequent pathname changes: panel is at yPercent:0 (was animated in), sweep out
    if (guard.current) window.clearTimeout(guard.current)
    guard.current = 0
    sweepOut(0.05)

    const handleMotionChange = () => {
      if (motionQuery.matches) hidePanel()
    }
    motionQuery.addEventListener('change', handleMotionChange)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      window.removeEventListener('gt:curtain-release', onRelease)
      hidePanel()
    }
  }), [pathname])

  // Global link click interception → animate panel in, then navigate
  useEffect(() => withGsap(({ gsap }) => {
    const panel = panelRef.current
    const path = pathRef.current
    if (!panel || !path) return
    const motionQuery = getReducedMotionQuery()
    if (motionQuery.matches) return

    const sweep = sweepRef.current
    const drawEnter = () => path.setAttribute('d', enterD(sweep.b))

    // Navegação em curso: cliques repetidos só trocam o destino (a cortina
    // não recomeça nem empurra duas rotas); voltar/avançar no meio cancela.
    let tl: gsap.core.Timeline | null = null
    let pendingHref: string | null = null

    const cancel = () => {
      tl?.kill()
      tl = null
      pendingHref = null
      if (guard.current) window.clearTimeout(guard.current)
      guard.current = 0
    }

    // Card de projeto → página do case: a foto do card cresce até virar a
    // capa do case (View Transition do próprio documento). Sem suporte, com
    // morph em curso ou fora de um card, segue a cortina de sempre.
    const morph = (a: HTMLAnchorElement, path: string, href: string) => {
      type VT = { finished: Promise<void>; ready: Promise<void>; updateCallbackDone: Promise<void> }
      const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => VT }
      const media = a.closest('.project-card')?.querySelector<HTMLElement>('.project-card__media')
      if (!media || !doc.startViewTransition || morphing.current || !/^\/trabalhos\/[^/]+$/.test(path)) return false
      morphing.current = true
      media.style.viewTransitionName = 'gt-plate'
      document.documentElement.classList.add('is-morphing')
      const release = () => {
        morphing.current = false
        morphDone.current = null
        document.documentElement.classList.remove('is-morphing')
        const plate = document.querySelector<HTMLElement>('[data-plate]')
        if (plate) plate.style.viewTransitionName = ''
        media.style.viewTransitionName = ''
      }
      let vt: VT
      try {
        vt = doc.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              media.style.viewTransitionName = ''
              let done = false
              const finish = () => {
                if (done) return
                done = true
                window.clearTimeout(limit)
                jumpToTop()
                // Nada de rAF aqui: o navegador suspende a renderização até
                // este callback resolver — um rAF nunca chegaria.
                window.setTimeout(() => {
                  const plate = document.querySelector<HTMLElement>('[data-plate]')
                  if (plate) plate.style.viewTransitionName = 'gt-plate'
                  jumpToTop()
                  resolve()
                }, 0)
              }
              // rota que não troca (erro): o navegador desiste do morph
              const limit = window.setTimeout(finish, 2500)
              morphDone.current = finish
              router.push(href)
            })
        )
      } catch {
        release()
        return false
      }
      vt.ready.catch(() => {})
      vt.updateCallbackDone.catch(() => {})
      vt.finished.catch(() => {}).finally(release)
      return true
    }

    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element)) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = e.target.closest('a[href]') as HTMLAnchorElement | null
      if (!a) return
      if ((a.target && a.target !== '_self') || a.hasAttribute('download') || a.dataset.noCurtain !== undefined) return

      // Só links internos http(s): tel:, mailto:, whatsapp: e outros
      // domínios seguem o comportamento normal do navegador.
      let url: URL
      try {
        url = new URL(a.href, window.location.href)
      } catch {
        return
      }
      if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return
      const norm = (p: string) => p.replace(/\/+$/, '') || '/'
      const pathOnly = norm(url.pathname)
      // Mesma página (âncora ou query): sem cortina — o Next rola ou troca a query.
      if (pathOnly === norm(window.location.pathname)) return
      const href = pathOnly + url.search + url.hash

      e.preventDefault()
      if (!pendingHref && morph(a, pathOnly, href)) return
      const logo = logoRef.current
      const count = countRef.current
      if (logo) logo.textContent = destinationLabel(a, pathOnly)
      if (count) count.textContent = `→ ${pathOnly}`
      if (pendingHref) {
        pendingHref = href
        return
      }
      pendingHref = href
      gsap.killTweensOf(panel)
      gsap.killTweensOf(sweep)
      sweep.b = 0
      drawEnter()
      panel.style.visibility = 'visible'
      panel.inert = true

      // Varredura de entrada: a crista avança à frente do painel e assenta
      // quando ele cobre a tela — aí a navegação acontece por baixo.
      tl = gsap.timeline()
        .fromTo(
          panel,
          { yPercent: 100, y: 0 },
          {
            yPercent: 0,
            duration: 0.6,
            ease: 'power3.inOut',
            onComplete: () => {
              const to = pendingHref
              tl = null
              pendingHref = null
              if (!to) return
              router.push(to)
              // Se a rota não mudar (erro, rota igual), a cortina não pode
              // ficar cobrindo a tela: sai sozinha.
              guard.current = window.setTimeout(() => {
                guard.current = 0
                window.dispatchEvent(new Event('gt:curtain-release'))
              }, 4000)
            },
          },
          0
        )
        .to(sweep, { b: 20, duration: 0.22, ease: 'power2.out', onUpdate: drawEnter }, 0)
        .to(sweep, { b: 0, duration: 0.5, ease: 'power3.inOut', onUpdate: drawEnter }, 0.22)
        // Cortina tipográfica: o nome do destino sobe de dentro da máscara.
        .fromTo(logo, { yPercent: 105, opacity: 1 }, { yPercent: 0, duration: 0.55, ease: 'expo.out' }, 0.18)
        .fromTo(count, { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.3)
    }

    const onPop = () => {
      if (!tl && !guard.current) return
      cancel()
      window.dispatchEvent(new Event('gt:curtain-release'))
    }
    window.addEventListener('popstate', onPop)

    // Fase de captura: roda antes do onClick do next/link, que chama
    // preventDefault e navegaria na hora — sem isso a cortina de entrada
    // nunca tocava e só a saída aparecia.
    document.addEventListener('click', onClick, true)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', onPop)
      tl?.kill()
    }
  }), [pathname, router])

  return (
    <div ref={panelRef} className="curtain" aria-hidden="true" inert>
      <svg
        className="curtain__svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path ref={pathRef} d={FLAT} />
      </svg>
      <span className="curtain__mask">
        <span ref={logoRef} className="curtain__logo">Gandra Tech</span>
      </span>
      <span ref={countRef} className="curtain__count">000</span>
    </div>
  )
}

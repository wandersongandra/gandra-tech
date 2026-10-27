/**
 * Fase 5 — "O fólio". Terceiro módulo da camada surreal: carregado depois
 * do engine e da prensa (load + ocioso), nunca no JS inicial. Diferente dos
 * outros dois, este também monta com prefers-reduced-motion — cada peça
 * tem a sua versão parada (fade curto, cor, seção já aberta).
 *
 * Regra da fase: um efeito principal por seção. Sem GSAP, sem workers,
 * estilos só via CSSOM (a CSP não aceita atributo style).
 */

type Opts = { fine: boolean; reduced: boolean }
type Off = () => void

const SVGNS = 'http://www.w3.org/2000/svg'
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

function defsLayer(): SVGSVGElement {
  const svg = document.createElementNS(SVGNS, 'svg')
  svg.setAttribute('class', 'm-folio-defs')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('focusable', 'false')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  document.body.appendChild(svg)
  return svg
}

/** Só anima o que ainda não foi visto: o que já está na tela fica quieto. */
const belowFold = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * 0.9

/* --------------------------------------------------------------------- */
/* 1. Títulos que sangram: a tinta chega espalhada e assenta.             */
/* --------------------------------------------------------------------- */
const BLEED_SKIP =
  '.m-display, .m-case__h2, .m-label, .mono, .m-contact__title, .m-case__finale-title, .m-hero__title, .cp-hero__title, .m-clients__title, .m-manifesto__title, .service-page__item h2, .sr-only'

export function inkBleed(defs: SVGSVGElement, opts: Opts): Off {
  const heads = Array.from(document.querySelectorAll<HTMLElement>('main h1, main h2')).filter(
    (h) => !h.matches(BLEED_SKIP) && !h.closest('.sr-only') && belowFold(h)
  )
  if (!heads.length) return () => {}
  // No celular, um título por vez (cada filtro é uma camada de GPU).
  const slots = window.matchMedia('(max-width: 760px)').matches ? 1 : 3
  const filters: { id: string; disp: Element; busy: boolean }[] = []
  for (let i = 0; i < slots; i++) {
    const id = `gt-bleed-${i}`
    const f = document.createElementNS(SVGNS, 'filter')
    f.setAttribute('id', id)
    f.setAttribute('x', '-8%')
    f.setAttribute('y', '-25%')
    f.setAttribute('width', '116%')
    f.setAttribute('height', '150%')
    f.setAttribute('color-interpolation-filters', 'sRGB')
    const t = document.createElementNS(SVGNS, 'feTurbulence')
    t.setAttribute('type', 'fractalNoise')
    t.setAttribute('baseFrequency', '0.018 0.07')
    t.setAttribute('numOctaves', '2')
    t.setAttribute('seed', String(3 + i))
    const d = document.createElementNS(SVGNS, 'feDisplacementMap')
    d.setAttribute('in', 'SourceGraphic')
    d.setAttribute('scale', '60')
    d.setAttribute('xChannelSelector', 'R')
    d.setAttribute('yChannelSelector', 'G')
    f.append(t, d)
    defs.appendChild(f)
    filters.push({ id, disp: d, busy: false })
  }

  const queue: { h: HTMLElement; at: number }[] = []
  const fade = (h: HTMLElement) => {
    show(h)
    h.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' })
  }
  const rafs = new Set<number>()
  const hidden = new Set<HTMLElement>(heads)
  const show = (h: HTMLElement) => {
    hidden.delete(h)
    h.style.opacity = ''
    h.style.filter = ''
  }
  heads.forEach((h) => (h.style.opacity = '0'))

  let dead = false
  const run = () => {
    if (dead) return
    // Quem esperou demais na fila (rolagem rápida) só aparece, sem sangria:
    // título em branco esperando a vez é pior que efeito nenhum.
    while (queue.length && (opts.reduced || performance.now() - queue[0].at > 250)) fade(queue.shift()!.h)
    const slot = filters.find((f) => !f.busy)
    if (!slot || !queue.length) return
    const h = queue.shift()!.h
    slot.busy = true
    h.style.filter = `url(#${slot.id})`
    h.style.opacity = ''
    const t0 = performance.now()
    const dur = slots === 1 ? 700 : 1100
    const tick = (now: number) => {
      const p = clamp((now - t0) / dur)
      slot.disp.setAttribute('scale', (60 * Math.pow(1 - p, 2)).toFixed(2))
      h.style.opacity = String(clamp(p * 3.2))
      if (p < 1) {
        const id = requestAnimationFrame((n) => {
          rafs.delete(id)
          tick(n)
        })
        rafs.add(id)
        return
      }
      // fim: o filtro sai do elemento (texto volta a ser texto, nítido)
      show(h)
      slot.disp.setAttribute('scale', '60')
      slot.busy = false
      run()
    }
    tick(t0)
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        queue.push({ h: e.target as HTMLElement, at: performance.now() })
      }
      run()
      window.setTimeout(run, 260)
    },
    { threshold: 0.35 }
  )
  heads.forEach((h) => io.observe(h))
  // Impressão e navegação por âncora não podem achar título apagado.
  const reveal = () => hidden.forEach(show)
  window.addEventListener('beforeprint', reveal)
  window.addEventListener('hashchange', reveal)

  return () => {
    dead = true
    io.disconnect()
    rafs.forEach(cancelAnimationFrame)
    window.removeEventListener('beforeprint', reveal)
    window.removeEventListener('hashchange', reveal)
    heads.forEach(show)
  }
}

/* --------------------------------------------------------------------- */
/* 3. Mergulho: um ponto da retícula cresce 80× e vira a próxima seção.    */
/* --------------------------------------------------------------------- */
export function dive(el: HTMLElement): Off {
  const dot = el.querySelector<HTMLElement>('.m-dive__dot')
  const flood = el.querySelector<HTMLElement>('.m-dive__flood')
  const cap = el.querySelector<HTMLElement>('.m-dive__cap')
  if (!dot || !flood) return () => {}
  let raf = 0
  let last = -1
  const frame = () => {
    raf = 0
    const r = el.getBoundingClientRect()
    const span = Math.max(1, r.height - window.innerHeight)
    const p = clamp(-r.top / span)
    if (Math.abs(p - last) < 0.0005) return
    last = p
    // 0 → 0,72: o ponto cresce (exponencial: a lupa acelera); 0,55 → 1: a
    // cor da próxima seção abre em círculo a partir do centro do ponto.
    const g = clamp(p / 0.72)
    dot.style.transform = `scale(${Math.pow(80, g).toFixed(3)})`
    const f = clamp((p - 0.55) / 0.42)
    flood.style.clipPath = `circle(${(easeOut(f) * 75).toFixed(2)}% at 50% 50%)`
    if (cap) cap.style.opacity = String(1 - clamp(p / 0.25))
  }
  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(frame)
  }
  let on = false
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting === on) return
    on = e.isIntersecting
    if (on) {
      window.addEventListener('scroll', onScroll, { passive: true })
      onScroll()
    } else window.removeEventListener('scroll', onScroll)
  })
  io.observe(el)
  return () => {
    io.disconnect()
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(raf)
    dot.style.transform = ''
    flood.style.clipPath = ''
    if (cap) cap.style.opacity = ''
  }
}

/* --------------------------------------------------------------------- */
export function mountFolio(opts: Opts): Off {
  const defs = defsLayer()
  const offs: Off[] = [inkBleed(defs, opts)]
  const diveEl = document.querySelector<HTMLElement>('.m-dive')
  if (diveEl && !opts.reduced) offs.push(dive(diveEl))
  return () => {
    offs.forEach((f) => f())
    defs.remove()
  }
}

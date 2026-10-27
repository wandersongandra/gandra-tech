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
/* 5. Tipos móveis: uma caixa de tipos em JetBrains Mono que se levanta    */
/*    perto do cursor; clicar compõe palavras na grade.                    */
/* --------------------------------------------------------------------- */
const SORTS = 'GANDRATECH{}<>/=+;:01*#&?!'
const WORDS = ['OLÁ', 'GANDRA', 'CONTATO', 'SITES', 'SISTEMAS', 'CÓDIGO']

export function glyphField(host: HTMLElement, opts: Opts): Off {
  const cv = document.createElement('canvas')
  cv.className = 'm-glyphs'
  cv.setAttribute('aria-hidden', 'true')
  host.prepend(cv)
  const ctx = cv.getContext('2d')
  if (!ctx) {
    cv.remove()
    return () => {}
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const family = getComputedStyle(document.querySelector('.mono') ?? document.body).fontFamily
  const touch = !opts.fine
  let W = 0
  let H = 0
  let cw = 14
  let ch = 22
  let cols = 0
  let rows = 0
  let base = new Uint8Array(0)
  let lift = new Float32Array(0)
  // letras compostas pelo visitante: índice da célula → [letra, nascimento]
  const set = new Map<number, [string, number]>()
  let word = 0
  const mouse = { x: -1e4, y: -1e4 }
  let raf = 0
  let visible = true
  let color = '#ece8df'

  const layout = () => {
    const r = host.getBoundingClientRect()
    W = Math.round(r.width)
    H = Math.round(r.height)
    const size = W < 600 ? 13 : 15
    cw = Math.round(size * 0.92)
    ch = Math.round(size * 1.6)
    cols = Math.ceil(W / cw)
    rows = Math.ceil(H / ch)
    cv.width = Math.round(W * dpr)
    cv.height = Math.round(H * dpr)
    base = new Uint8Array(cols * rows)
    lift = new Float32Array(cols * rows)
    let seed = 7
    for (let i = 0; i < base.length; i++) {
      seed = (seed * 16807) % 2147483647
      base[i] = seed % SORTS.length
    }
    set.clear()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.font = `${size}px ${family}`
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center'
    color = getComputedStyle(host).color
    draw(performance.now(), true)
  }

  // Caixa parada pintada uma vez; por quadro só se repintam os tipos
  // levantados perto do cursor e as letras compostas (WebKit agradece).
  const bg = document.createElement('canvas')
  let active: number[] = []
  const cell = (i: number, now: number) => {
    const x = i % cols
    const y = (i / cols) | 0
    const px = x * cw + cw / 2
    const py = y * ch + ch / 2
    let k = 0
    if (!opts.reduced && !touch) {
      const d = Math.hypot(px - mouse.x, py - mouse.y)
      k = d < 150 ? 1 - d / 150 : 0
    }
    // o tipo sobe e desce com inércia (não salta)
    const prev = lift[i]
    const l = prev + (k - prev) * 0.18
    lift[i] = Math.abs(l - k) < 0.002 ? k : l
    const own = set.get(i)
    // parado e sem letra: nada a repintar
    if (!own && prev === lift[i]) return prev > 0
    let alive = lift[i] > 0 || lift[i] !== k
    ctx.clearRect(x * cw, y * ch, cw, ch)
    if (own) {
      const age = (now - own[1]) / 1000
      const a = age < 6 ? 1 : Math.max(0, 1 - (age - 6) / 2)
      if (a <= 0) set.delete(i)
      else {
        ctx.globalAlpha = a
        ctx.fillStyle = '#e5401a'
        ctx.fillText(own[0], px, py)
        return true
      }
    }
    const v = lift[i]
    ctx.globalAlpha = 0.09 + v * 0.42
    ctx.fillStyle = v > 0.62 ? '#e5401a' : color
    ctx.fillText(SORTS[base[i]], px, py - v * 5)
    return alive
  }
  const paintBase = () => {
    bg.width = cv.width
    bg.height = cv.height
    const b = bg.getContext('2d')
    if (!b) return
    b.setTransform(dpr, 0, 0, dpr, 0, 0)
    b.font = ctx.font
    b.textBaseline = 'middle'
    b.textAlign = 'center'
    b.globalAlpha = 0.09
    b.fillStyle = color
    for (let i = 0; i < base.length; i++) b.fillText(SORTS[base[i]], (i % cols) * cw + cw / 2, ((i / cols) | 0) * ch + ch / 2)
  }
  const draw = (now: number, full = false) => {
    if (full) {
      paintBase()
      active = []
    }
    ctx.globalAlpha = 1
    if (full) {
      ctx.clearRect(0, 0, W, H)
      ctx.drawImage(bg, 0, 0, W, H)
    }
    const cand = new Set<number>(active)
    set.forEach((_, i) => cand.add(i))
    if (mouse.x > -1e3 && !touch && !opts.reduced) {
      const x0 = Math.max(0, Math.floor((mouse.x - 160) / cw))
      const x1 = Math.min(cols - 1, Math.ceil((mouse.x + 160) / cw))
      const y0 = Math.max(0, Math.floor((mouse.y - 160) / ch))
      const y1 = Math.min(rows - 1, Math.ceil((mouse.y + 160) / ch))
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) cand.add(y * cols + x)
    }
    const next: number[] = []
    let busy = false
    // as células repintadas apagam o tipo de base: redesenha a base nelas
    cand.forEach((i) => {
      const x = (i % cols) * cw
      const y = ((i / cols) | 0) * ch
      const before = lift[i]
      const owned = set.has(i)
      const live = cell(i, now)
      if (!set.has(i) && lift[i] === 0 && (before !== 0 || owned)) {
        ctx.clearRect(x, y, cw, ch)
        ctx.globalAlpha = 1
        ctx.drawImage(bg, x * dpr, y * dpr, cw * dpr, ch * dpr, x, y, cw, ch)
      }
      if (live || set.has(i)) {
        next.push(i)
        busy = true
      }
    })
    active = next
    ctx.globalAlpha = 1
    return busy
  }

  const loop = (now: number) => {
    raf = 0
    if (draw(now) && visible) raf = requestAnimationFrame(loop)
  }
  const wake = () => {
    if (!raf && visible && !opts.reduced) raf = requestAnimationFrame(loop)
  }
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const r = host.getBoundingClientRect()
    mouse.x = e.clientX - r.left
    mouse.y = e.clientY - r.top
    wake()
  }
  const onLeave = () => {
    mouse.x = mouse.y = -1e4
    wake()
  }
  const onClick = (e: MouseEvent) => {
    if (opts.reduced) return
    if (e.target instanceof Element && e.target.closest('a, button, input, textarea, select, label')) return
    const r = host.getBoundingClientRect()
    const cx = Math.floor((e.clientX - r.left) / cw)
    const cy = Math.floor((e.clientY - r.top) / ch)
    const w = WORDS[word++ % WORDS.length]
    const start = Math.max(0, Math.min(cols - w.length, cx - Math.floor(w.length / 2)))
    const now = performance.now()
    for (let j = 0; j < w.length; j++) set.set(cy * cols + start + j, [w[j], now + j * 40])
    wake()
  }

  let ready = false
  const ro = new ResizeObserver(() => {
    if (ready) layout()
  })
  const io = new IntersectionObserver(([e]) => {
    visible = e.isIntersecting
    if (visible) wake()
  })
  host.addEventListener('pointermove', onMove)
  host.addEventListener('pointerleave', onLeave)
  host.addEventListener('click', onClick)
  ro.observe(host)
  io.observe(host)
  // a fonte precisa estar carregada antes de desenhar a caixa
  const font = document.fonts?.load ? document.fonts.load(`15px ${family}`) : Promise.resolve()
  font.catch(() => {}).finally(() => {
    ready = true
    layout()
    if (!opts.reduced) cv.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease-out' })
  })

  return () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    host.removeEventListener('pointermove', onMove)
    host.removeEventListener('pointerleave', onLeave)
    host.removeEventListener('click', onClick)
    cv.remove()
  }
}

/* --------------------------------------------------------------------- */
/* --------------------------------------------------------------------- */
/* 6. Texto líquido nos links: a tinta escorre e volta (hover e foco).    */
/* --------------------------------------------------------------------- */
const LIQUID = '.site-header__link, .m-link, .site-footer__legal a, .link-arrow'
const LIQUID_SKIP = '.site-header__logo, .m-footer__mark'

export function liquidLinks(defs: SVGSVGElement, opts: Opts): Off {
  // Em reduced-motion o CSS só troca a cor; aqui não há nada a fazer.
  if (opts.reduced) return () => {}
  const f = document.createElementNS(SVGNS, 'filter')
  f.setAttribute('id', 'gt-liquid')
  f.setAttribute('x', '-6%')
  f.setAttribute('y', '-30%')
  f.setAttribute('width', '112%')
  f.setAttribute('height', '160%')
  f.setAttribute('color-interpolation-filters', 'sRGB')
  const t = document.createElementNS(SVGNS, 'feTurbulence')
  t.setAttribute('type', 'fractalNoise')
  t.setAttribute('baseFrequency', '0.014 0.06')
  t.setAttribute('numOctaves', '1')
  t.setAttribute('seed', '11')
  t.setAttribute('result', 'n')
  const d = document.createElementNS(SVGNS, 'feDisplacementMap')
  d.setAttribute('in', 'SourceGraphic')
  d.setAttribute('in2', 'n')
  d.setAttribute('scale', '0')
  d.setAttribute('xChannelSelector', 'R')
  d.setAttribute('yChannelSelector', 'G')
  d.setAttribute('result', 'd')
  const o = document.createElementNS(SVGNS, 'feOffset')
  o.setAttribute('in', 'd')
  o.setAttribute('dx', '0')
  o.setAttribute('dy', '0')
  f.append(t, d, o)
  defs.appendChild(f)

  // Um filtro só, um link por vez: o novo assume, o anterior volta limpo.
  let cur: HTMLElement | null = null
  let raf = 0
  const stop = () => {
    cancelAnimationFrame(raf)
    raf = 0
    if (cur) cur.style.filter = ''
    cur = null
  }
  const run = (el: HTMLElement) => {
    if (el === cur) return
    stop()
    cur = el
    el.style.filter = 'url(#gt-liquid)'
    const t0 = performance.now()
    const dur = 620
    const tick = (now: number) => {
      const p = clamp((now - t0) / dur)
      const s = 8 * Math.sin(Math.PI * p)
      d.setAttribute('scale', s.toFixed(2))
      o.setAttribute('dx', (1.4 * Math.sin(Math.PI * 2 * p)).toFixed(2))
      if (p < 1) raf = requestAnimationFrame(tick)
      else stop()
    }
    raf = requestAnimationFrame(tick)
  }
  const pick = (n: EventTarget | null) => {
    const el = n instanceof Element ? n.closest<HTMLElement>(LIQUID) : null
    return el && !el.matches(LIQUID_SKIP) && !el.closest(LIQUID_SKIP) ? el : null
  }
  const onOver = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return
    const el = pick(e.target)
    if (!el || (e.relatedTarget instanceof Node && el.contains(e.relatedTarget))) return
    run(el)
  }
  const onFocus = (e: FocusEvent) => {
    const el = pick(e.target)
    if (el && el.matches(':focus-visible')) run(el)
  }
  document.addEventListener('pointerover', onOver, { passive: true })
  document.addEventListener('focusin', onFocus)
  return () => {
    stop()
    document.removeEventListener('pointerover', onOver)
    document.removeEventListener('focusin', onFocus)
    f.remove()
  }
}

/* --------------------------------------------------------------------- */
/* 7. Segurar para carimbar: clique normal continua instantâneo; segurar  */
/*    (ou manter a tecla) carimba "GANDRA ✶ APROVADO" ao lado do e-mail.  */
/* --------------------------------------------------------------------- */
const STAMP_TARGETS = '.m-contact__email, .cp-hero__email[href^="mailto:"]'
const HOLD_MS = 550

export function holdStamp(opts: Opts): Off {
  const stamps: HTMLElement[] = []
  let timer = 0
  let held: HTMLElement | null = null
  let swallow: HTMLElement | null = null
  let lastKey = 0

  const stamp = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    const s = document.createElement('span')
    s.className = 'm-stamp mono'
    s.setAttribute('aria-hidden', 'true')
    s.textContent = 'GANDRA ✶ APROVADO'
    const rot = -9 + Math.random() * 14
    const x = r.left + window.scrollX + r.width * (0.18 + Math.random() * 0.64)
    const y = r.top + window.scrollY + r.height * (0.2 + Math.random() * 0.6)
    s.style.left = `${x.toFixed(1)}px`
    s.style.top = `${y.toFixed(1)}px`
    s.style.setProperty('--rot', `${rot.toFixed(1)}deg`)
    document.body.appendChild(s)
    stamps.push(s)
    while (stamps.length > 6) stamps.shift()?.remove()
    const base = `translate(-50%, -50%) rotate(${rot.toFixed(1)}deg)`
    if (opts.reduced) {
      s.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 160, fill: 'both' })
    } else {
      // o carimbo desce pesado, bate e assenta com um tranco
      s.animate(
        [
          { opacity: 0, transform: `${base} scale(1.7)` },
          { opacity: 1, transform: `${base} scale(0.94)`, offset: 0.7 },
          { opacity: 1, transform: `${base} scale(1)` },
        ],
        { duration: 240, easing: 'cubic-bezier(0.55, 0, 1, 0.45)', fill: 'both' }
      )
      el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(2px)' }, { transform: 'translateY(0)' }], {
        duration: 160,
        delay: 160,
      })
    }
    window.setTimeout(() => {
      if (!s.isConnected) return
      const a = s.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 900, fill: 'forwards' })
      a.onfinish = () => {
        s.remove()
        const i = stamps.indexOf(s)
        if (i >= 0) stamps.splice(i, 1)
      }
    }, 2600)
  }

  const target = (n: EventTarget | null) => (n instanceof Element ? n.closest<HTMLElement>(STAMP_TARGETS) : null)
  const cancel = () => {
    window.clearTimeout(timer)
    timer = 0
    held?.classList.remove('is-charging')
    held = null
  }
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return
    const el = target(e.target)
    if (!el) return
    cancel()
    held = el
    swallow = null
    el.classList.add('is-charging')
    timer = window.setTimeout(() => {
      timer = 0
      el.classList.remove('is-charging')
      swallow = el
      stamp(el)
    }, HOLD_MS)
  }
  const onClick = (e: MouseEvent) => {
    const el = target(e.target)
    if (el && swallow === el) {
      // segurou: o carimbo foi a resposta; não abre o e-mail
      e.preventDefault()
      e.stopPropagation()
    }
    swallow = null
  }
  const onMenu = (e: Event) => {
    if (target(e.target) && (swallow || held)) e.preventDefault()
  }
  const onKey = (e: KeyboardEvent) => {
    const el = target(e.target)
    if (!el) return
    // Enter: o primeiro toque segue o link; mantido, carimba a cada repetição.
    // Espaço: carimba (no link ele só rolaria a página).
    const enterHold = e.key === 'Enter' && e.repeat
    if (!enterHold && e.key !== ' ') return
    e.preventDefault()
    const now = performance.now()
    if (now - lastKey < 320) return
    lastKey = now
    stamp(el)
  }
  document.addEventListener('pointerdown', onDown, { passive: true })
  document.addEventListener('pointerup', cancel, { passive: true })
  document.addEventListener('pointercancel', cancel, { passive: true })
  document.addEventListener('dragstart', cancel)
  document.addEventListener('click', onClick, true)
  document.addEventListener('contextmenu', onMenu)
  document.addEventListener('keydown', onKey)
  return () => {
    cancel()
    document.removeEventListener('pointerdown', onDown)
    document.removeEventListener('pointerup', cancel)
    document.removeEventListener('pointercancel', cancel)
    document.removeEventListener('dragstart', cancel)
    document.removeEventListener('click', onClick, true)
    document.removeEventListener('contextmenu', onMenu)
    document.removeEventListener('keydown', onKey)
    stamps.forEach((s) => s.remove())
  }
}

export function mountFolio(opts: Opts): Off {
  const defs = defsLayer()
  const offs: Off[] = [inkBleed(defs, opts), liquidLinks(defs, opts)]
  if (document.querySelector(STAMP_TARGETS)) offs.push(holdStamp(opts))
  const diveEl = document.querySelector<HTMLElement>('.m-dive')
  if (diveEl && !opts.reduced) offs.push(dive(diveEl))
  const glyphHost = document.querySelector<HTMLElement>('[data-glyphs]')
  if (glyphHost) offs.push(glyphField(glyphHost, opts))
  return () => {
    offs.forEach((f) => f())
    defs.remove()
  }
}

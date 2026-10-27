import { blobPath, dotPath, rng } from './blob'

/**
 * Camada surreal da Matéria. Carregada só depois do load + ocioso (não pesa
 * na primeira pintura) e sem GSAP: transform, clip-path e um filtro SVG,
 * todos guiados por um único loop que dorme quando nada se move.
 *
 * Momentos:
 * - hero: o GANDRA amolece — escorre tinta das letras com a velocidade do
 *   scroll/cursor e as gotas voltam para dentro quando tudo para;
 * - trabalhos: no desktop uma lente de tinta amplia a foto sob o cursor
 *   (a chegada das fotos agora é o meio-tom de press.ts);
 * - manifesto: lidas, as palavras caem para cima;
 * - processo: as etapas pendem de fios e balançam com o scroll;
 * - contato / final do case: a tinta inunda o papel e vira a seção escura;
 * - página inteira: cada clique/toque deixa uma mancha que seca e some.
 */

type Effect = { frame: (now: number, dt: number) => boolean; destroy: () => void }
type Ctx = { fine: boolean; vel: () => number }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (v: number) => v * v * (3 - 2 * v)

/* --------------------------------------------------------------------- */
/* Inundação de tinta: a seção escura entra como uma mancha que cresce.   */
/* --------------------------------------------------------------------- */
function flood(el: HTMLElement): Effect {
  const rand = rng(el.className.length * 97 + 13)
  const drips = Array.from({ length: 7 }, () => ({ x: 0.08 + rand() * 0.84, w: 5 + rand() * 14, len: 0.35 + rand() * 0.7, d: rand() }))
  const dots = Array.from({ length: 9 }, () => ({ a: Math.PI * (0.08 + rand() * 0.84), k: 1.05 + rand() * 0.35, r: 3 + rand() * 9 }))
  let last = ''
  el.classList.add('is-flooding')
  return {
    frame(now) {
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight
      const f = clamp((vh - r.top) / (vh * 0.78))
      if (f >= 1 || r.bottom < 0) {
        if (last !== 'none') {
          el.style.clipPath = ''
          last = 'none'
        }
        return false
      }
      if (f <= 0) {
        if (last !== 'zero') {
          el.style.clipPath = 'inset(0 0 100% 0)'
          last = 'zero'
        }
        return false
      }
      const e = smooth(f)
      const t = now / 1000
      const w = r.width
      const R = e * Math.hypot(w * 0.62, Math.min(r.height, vh * 1.3)) * 1.18
      const cx = w * 0.5 + Math.sin(t * 0.7) * w * 0.025
      let d = blobPath(cx, -R * 0.08, R, t * 1.4, 1.7, 1.15, 18)
      // Escorridos: a tinta desce antes da mancha, em fios com gota na ponta.
      for (const dr of drips) {
        const L = clamp(e * 1.6 - dr.d * 0.4) * dr.len * vh
        if (L < 4) continue
        const x = dr.x * w
        const half = dr.w / 2
        d += `M${(x - half).toFixed(1)} 0L${(x + half).toFixed(1)} 0L${(x + half * 0.6).toFixed(1)} ${L.toFixed(1)}L${(x - half * 0.6).toFixed(1)} ${L.toFixed(1)}Z`
        d += dotPath(x, L, half * 1.35)
      }
      // Respingos fora da borda.
      for (const dt of dots) {
        const rr = dt.r * clamp(e * 3) * (1 - e * 0.6)
        d += dotPath(cx + Math.cos(dt.a) * R * dt.k, -R * 0.08 + Math.sin(dt.a) * R * dt.k, rr)
      }
      el.style.clipPath = `path('${d}')`
      last = 'path'
      return true
    },
    destroy() {
      el.style.clipPath = ''
      el.classList.remove('is-flooding')
    },
  }
}

/* --------------------------------------------------------------------- */
/* Manifesto: as palavras já lidas caem para cima.                         */
/* --------------------------------------------------------------------- */
function fallUp(statement: HTMLElement): Effect {
  const words = Array.from(statement.querySelectorAll<HTMLElement>('.m-manifesto__word'))
  const rand = rng(words.length * 31)
  const n = words.length
  const bodies = words.map((el, i) => ({
    el,
    t: (i / n) * 0.42 + rand() * 0.2,
    s: 0.75 + rand() * 0.6,
    rot: (rand() - 0.5) * 70,
    dx: (rand() - 0.5) * 140,
    lastP: -1,
  }))
  statement.classList.add('is-weightless')
  return {
    frame() {
      const r = statement.getBoundingClientRect()
      const vh = window.innerHeight
      const q = (vh * 0.34 - r.top) / (r.height + vh * 0.45)
      for (const b of bodies) {
        const p = clamp(q - b.t, 0, 1.2)
        if (Math.abs(p - b.lastP) < 0.0005) continue
        b.lastP = p
        if (p <= 0) {
          b.el.style.transform = ''
          continue
        }
        const k = Math.pow(p, 1.55)
        b.el.style.transform = `translate3d(${(b.dx * k).toFixed(1)}px, ${(-k * vh * 1.5 * b.s).toFixed(1)}px, 0) rotate(${(b.rot * k).toFixed(1)}deg)`
      }
      return false
    },
    destroy() {
      statement.classList.remove('is-weightless')
      for (const b of bodies) b.el.style.transform = ''
    },
  }
}

/* --------------------------------------------------------------------- */
/* Processo: etapas penduradas por fios — pêndulos amortecidos.            */
/* --------------------------------------------------------------------- */
function swing(list: HTMLElement, ctx: Ctx): Effect {
  const steps = Array.from(list.querySelectorAll<HTMLElement>('.m-process__step'))
  const rand = rng(7)
  const pend = steps.map((el) => ({ el, a: 0, w: 0, k: 0.012 + rand() * 0.006, m: 0.8 + rand() * 0.5 }))
  list.classList.add('is-hanging')
  let lastV = 0
  return {
    frame(_now, dt) {
      const r = list.getBoundingClientRect()
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return false
      const v = ctx.vel()
      const acc = (v - lastV) / Math.max(dt, 1)
      lastV = v
      let moving = false
      for (const p of pend) {
        // aceleração do scroll empurra o peso; mola e atrito trazem de volta
        p.w += (-p.a * p.k - p.w * 0.05 - acc * 16 * p.m) * (dt / 16)
        p.a += p.w * (dt / 16)
        p.a = clamp(p.a, -12, 12)
        if (Math.abs(p.a) > 0.02 || Math.abs(p.w) > 0.01) moving = true
        p.el.style.transform = `rotate(${p.a.toFixed(2)}deg)`
      }
      return moving
    },
    destroy() {
      list.classList.remove('is-hanging')
      for (const p of pend) p.el.style.transform = ''
    },
  }
}

/* --------------------------------------------------------------------- */
/* Hero: o GANDRA amolece e escorre.                                       */
/* --------------------------------------------------------------------- */
const BASE = 0.885
function melt(mark: HTMLElement, ctx: Ctx, defs: SVGElement): Effect | null {
  const root = mark.querySelector<HTMLElement>('.kinetic')
  const inner = mark.querySelector<HTMLElement>('.kinetic__inner')
  if (!root || !inner || !root.classList.contains('is-free')) return null
  const masks = Array.from(inner.querySelectorAll<HTMLElement>('.kinetic__mask'))
  const letters = masks.map((m) => m.querySelector<HTMLElement>('.kinetic__letter'))
  const rand = rng(2026)
  const born = performance.now()
  let molten = false

  // Pontos onde cada glifo encosta na linha de base (fração da largura).
  const FEET: Record<string, number[]> = {
    G: [0.52], A: [0.1, 0.9], N: [0.09, 0.91], D: [0.14, 0.55], R: [0.1, 0.88],
  }
  const fs = parseFloat(letters[0] ? getComputedStyle(letters[0] as HTMLElement).fontSize : '100') || 100
  const drips = masks.flatMap((_, i) => {
    const ch = (letters[i]?.textContent || '').trim().toUpperCase()
    const feet = FEET[ch] ?? [0.5]
    const color = letters[i] ? getComputedStyle(letters[i] as HTMLElement).color : ''
    return feet.map((fx) => {
      const el = document.createElement('span')
      el.className = 'm-drip'
      el.innerHTML = '<span class="m-drip__stem"></span><span class="m-drip__bulb"></span>'
      el.style.color = color
      const w = fs * (0.035 + rand() * 0.045)
      el.style.setProperty('--w', `${w.toFixed(1)}px`)
      el.setAttribute('aria-hidden', 'true')
      masks[i].appendChild(el)
      return {
        el,
        stem: el.firstElementChild as HTMLElement,
        bulb: el.lastElementChild as HTMLElement,
        i,
        fx: fx + (rand() - 0.5) * 0.05,
        L: 0,
        max: fs * (0.18 + rand() * 0.55) * (fs < 160 ? 2.4 : 1), // no celular a palavra é pequena: gotas proporcionalmente mais longas
        gain: 0.45 + rand() * 1,
        w,
      }
    })
  })

  // Filtro de amolecimento (só desktop): ruído alongado na vertical.
  let disp: SVGFEDisplacementMapElement | null = null
  let turb: SVGFETurbulenceElement | null = null
  if (ctx.fine) {
    defs.insertAdjacentHTML(
      'beforeend',
      '<filter id="m-melt" x="-4%" y="-12%" width="108%" height="240%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.0025 0.016" numOctaves="1" seed="11" result="n"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>'
    )
    disp = defs.querySelector('#m-melt feDisplacementMap')
    turb = defs.querySelector('#m-melt feTurbulence')
  }

  let energy = 0
  let px = -1
  let py = -1
  let filterOn = false
  const onMove = (e: PointerEvent) => {
    const r = root.getBoundingClientRect()
    if (e.clientY < r.top - 40 || e.clientY > r.bottom + 40) {
      px = -1
      return
    }
    if (px >= 0) energy = Math.min(1.6, energy + Math.hypot(e.clientX - px, e.clientY - py) / 900)
    px = e.clientX
    py = e.clientY
  }
  window.addEventListener('pointermove', onMove, { passive: true })
  // Toque na palavra (KineticWordmark): a tinta escorre sem pedir sensor.
  const onPulse = () => {
    energy = Math.min(1.6, energy + 1.1)
  }
  root.addEventListener('gt:wordmark-pulse', onPulse)

  return {
    frame(now, dt) {
      const r = root.getBoundingClientRect()
      if (r.bottom < 0 || r.top > window.innerHeight) return false
      energy = Math.min(1.6, energy + Math.abs(ctx.vel()) * 0.003 * dt)
      energy *= Math.pow(0.94, dt / 16)
      let alive = energy > 0.01
      // só abre o recorte das letras depois da entrada (que sobe de baixo)
      if (!molten) {
        if (now - born < 1600 || (document.timeline?.currentTime as number) < 2400) return true
        root.classList.add('is-molten')
        molten = true
      }
      for (const d of drips) {
        const l = letters[d.i]
        if (!l) continue
        // base das maiúsculas dentro da caixa da letra (medida na Archivo)
        const x = l.offsetLeft + l.offsetWidth * d.fx
        const baseY = l.offsetTop + l.offsetHeight * BASE
        if (energy > 0.04) d.L += (d.max - d.L) * 0.07 * energy * d.gain * (dt / 16)
        else d.L *= Math.pow(0.965, dt / 16) // tensão superficial: a gota volta
        if (d.L > 0.5) alive = true
        else d.L = 0
        d.el.style.transform = `translate3d(${(x - d.w / 2).toFixed(1)}px, ${baseY.toFixed(1)}px, 0)`
        d.stem.style.transform = `scaleY(${(d.L / 100).toFixed(3)})`
        d.bulb.style.transform = `translate3d(0, ${(d.L - d.w * 0.6).toFixed(1)}px, 0) scale(${clamp(d.L / 30, 0, 1).toFixed(2)})`
      }
      if (disp && turb) {
        const sc = energy * 22
        if (sc > 0.6) {
          if (!filterOn) {
            root.style.filter = 'url(#m-melt)'
            filterOn = true
          }
          disp.setAttribute('scale', sc.toFixed(1))
          turb.setAttribute('baseFrequency', `0.0025 ${(0.016 + Math.sin(now / 900) * 0.003).toFixed(4)}`)
        } else if (filterOn) {
          root.style.filter = ''
          filterOn = false
        }
      }
      return alive
    },
    destroy() {
      window.removeEventListener('pointermove', onMove)
      root.removeEventListener('gt:wordmark-pulse', onPulse)
      drips.forEach((d) => d.el.remove())
      root.classList.remove('is-molten')
      root.style.filter = ''
      defs.querySelector('#m-melt')?.remove()
    },
  }
}

/* --------------------------------------------------------------------- */
/* Fotos dos cards: nascem de uma mancha; lente de tinta no desktop.       */
/* --------------------------------------------------------------------- */
function lens(media: HTMLElement[]): () => void {
  const off: (() => void)[] = []
  for (const el of media) {
    const img = el.querySelector('img')
    if (!img) continue
    const glass = document.createElement('span')
    glass.className = 'm-lens'
    glass.setAttribute('aria-hidden', 'true')
    el.appendChild(glass)
    const ZOOM = 1.6
    // a maior variante publicada (a lente amplia; o currentSrc pode ser a pequena)
    const best = () => {
      const src = el.querySelector('source[type="image/avif"]')?.getAttribute('srcset') || img.getAttribute('srcset') || ''
      let url = img.currentSrc || img.src
      let max = 0
      for (const part of src.split(',')) {
        const [u, w] = part.trim().split(/\s+/)
        const n = parseInt(w || '0', 10)
        if (u && n > max) {
          max = n
          url = u
        }
      }
      return new URL(url, location.href).href
    }
    const enter = () => {
      glass.style.backgroundImage = `url("${best()}")`
      el.classList.add('has-lens')
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      // a foto usa object-fit: cover — reproduz o enquadramento ampliado
      const iw = img.naturalWidth || r.width
      const ih = img.naturalHeight || r.height
      const cover = Math.max(r.width / iw, r.height / ih)
      const bw = iw * cover * ZOOM
      const bh = ih * cover * ZOOM
      const offX = (r.width - iw * cover) / 2
      const offY = (r.height - ih * cover) / 2
      glass.style.transform = `translate3d(${x.toFixed(0)}px, ${y.toFixed(0)}px, 0)`
      glass.style.backgroundSize = `${bw.toFixed(0)}px ${bh.toFixed(0)}px`
      glass.style.backgroundPosition = `${(-((x - offX) * ZOOM) + 90).toFixed(0)}px ${(-((y - offY) * ZOOM) + 90).toFixed(0)}px`
    }
    const leave = () => el.classList.remove('has-lens')
    el.addEventListener('pointerenter', enter)
    el.addEventListener('pointermove', move, { passive: true })
    el.addEventListener('pointerleave', leave)
    off.push(() => {
      el.removeEventListener('pointerenter', enter)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
      glass.remove()
      el.classList.remove('has-lens')
    })
  }
  return () => off.forEach((f) => f())
}

/* --------------------------------------------------------------------- */
/* Manchas: cada clique/toque deixa tinta molhada que seca e desaparece.   */
/* --------------------------------------------------------------------- */
function stains(): () => void {
  const layer = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  layer.setAttribute('class', 'm-stains')
  layer.setAttribute('aria-hidden', 'true')
  layer.setAttribute('focusable', 'false')
  document.body.appendChild(layer)
  let seed = 1
  let lastStain: { el: SVGPathElement; t: number } | null = null
  // Mede pelo <body> (a camada é absoluta e não entra na altura dele), nunca
  // pelo scrollHeight: a camada entrava na conta, nunca encolhia e deixava
  // papel em branco depois do rodapé ao girar o celular ou redimensionar a
  // janela (os pins do GSAP só encolhem a página depois do refresh).
  const resize = () => {
    layer.setAttribute('width', String(document.documentElement.clientWidth))
    layer.setAttribute('height', String(Math.max(document.body.offsetHeight, window.innerHeight)))
  }
  resize()
  let rq = 0
  const onResize = () => {
    cancelAnimationFrame(rq)
    rq = requestAnimationFrame(resize)
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver(onResize) : null
  ro?.observe(document.body)
  // começou um traço de pincel: a mancha do clique inicial sai
  const onBrush = () => {
    if (lastStain && performance.now() - lastStain.t < 1000) lastStain.el.remove()
    lastStain = null
  }
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    const t = e.target as Element | null
    if (t?.closest('input, textarea, select, .m-drop, [data-no-stain]')) return
    resize()
    const x = e.clientX + window.scrollX
    const y = e.clientY + window.scrollY
    const rand = rng(seed++ * 7919)
    const r = 10 + rand() * 16
    let d = blobPath(x, y, r, rand() * 6, rand() * 6, 1.8, 14)
    for (let k = 0; k < 5; k++) {
      const a = rand() * Math.PI * 2
      const dist = r * (1.35 + rand() * 1.4)
      d += dotPath(x + Math.cos(a) * dist, y + Math.sin(a) * dist, 1 + rand() * 3.2)
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    path.setAttribute('d', d)
    path.setAttribute('class', 'm-stain')
    path.style.transformOrigin = `${x}px ${y}px`
    layer.appendChild(path)
    const anim = path.animate(
      [
        { transform: 'scale(0.2)', fill: '#e5401a', opacity: 0.92, offset: 0 },
        { transform: 'scale(1.06)', fill: '#e5401a', opacity: 0.92, offset: 0.025 },
        { transform: 'scale(1)', fill: '#b3300e', opacity: 0.8, offset: 0.08 },
        { transform: 'scale(1)', fill: '#7a5b45', opacity: 0.32, offset: 0.6 },
        { transform: 'scale(1)', fill: '#9c8670', opacity: 0, offset: 1 },
      ],
      { duration: 9000, easing: 'ease-out', fill: 'forwards' }
    )
    anim.onfinish = () => path.remove()
    lastStain = { el: path, t: performance.now() }
    while (layer.childNodes.length > 14) layer.firstChild?.remove()
  }
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('resize', onResize)
  window.addEventListener('gt:brush-start', onBrush)
  return () => {
    cancelAnimationFrame(rq)
    ro?.disconnect()
    window.removeEventListener('pointerdown', onDown)
    window.removeEventListener('resize', onResize)
    window.removeEventListener('gt:brush-start', onBrush)
    layer.remove()
  }
}

/* --------------------------------------------------------------------- */
/* 404: os dígitos são tinta — amolecem com a velocidade e deixam poças.  */
/* --------------------------------------------------------------------- */
function notFound(box: HTMLElement, ctx: Ctx, defs: SVGElement): Effect {
  const els = Array.from(box.querySelectorAll<HTMLElement>('[data-letter]'))
  const prev = els.map(() => ({ x: 0, y: -9999, vy: 0 }))
  const color = getComputedStyle(els[0] ?? box).color
  defs.insertAdjacentHTML(
    'beforeend',
    '<filter id="m-melt-404" x="-10%" y="-10%" width="120%" height="130%" color-interpolation-filters="sRGB">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.004 0.02" numOctaves="1" seed="4"/>' +
      '<feDisplacementMap in="SourceGraphic" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>'
  )
  const disp = defs.querySelector('#m-melt-404 feDisplacementMap')
  let energy = 0
  let on = false
  const puddles: HTMLElement[] = []
  return {
    frame() {
      const floor = box.clientHeight - (els[0]?.offsetHeight ?? 0)
      els.forEach((el, i) => {
        const m = /translate\(([-\d.]+)px, ([-\d.]+)px\)/.exec(el.style.transform)
        if (!m) return
        const x = +m[1]
        const y = +m[2]
        const p = prev[i]
        const vy = y - p.y
        energy = Math.min(2, energy + Math.hypot(x - p.x, vy) / 600)
        // bateu no chão vindo rápido: deixa uma poça
        if (vy > 5 && y >= floor - 1 && p.y > -9000) {
          const pd = document.createElement('span')
          pd.className = 'm-puddle'
          pd.setAttribute('aria-hidden', 'true')
          const w = el.offsetWidth * (0.5 + Math.min(1, vy / 25) * 0.6)
          pd.style.cssText = `left:${(x + el.offsetWidth / 2 - w / 2).toFixed(0)}px;width:${w.toFixed(0)}px;bottom:${(el.offsetHeight * 0.16).toFixed(0)}px;color:${color}`
          box.prepend(pd)
          puddles.push(pd)
          pd.animate(
            [
              { transform: 'scale(0.1, 0.4)', opacity: 0.9 },
              { transform: 'scale(1.08, 1)', opacity: 0.85, offset: 0.06 },
              { transform: 'scale(1, 1)', opacity: 0.5, offset: 0.4 },
              { transform: 'scale(0.96, 0.9)', opacity: 0 },
            ],
            { duration: 7000, easing: 'ease-out', fill: 'forwards' }
          ).onfinish = () => pd.remove()
          while (puddles.length > 9) puddles.shift()?.remove()
        }
        p.x = x
        p.y = y
        p.vy = vy
      })
      energy *= 0.9
      {
        const sc = energy * 30
        if (sc > 0.8) {
          if (!on) box.style.filter = 'url(#m-melt-404)'
          on = true
          disp?.setAttribute('scale', sc.toFixed(1))
        } else if (on) {
          box.style.filter = ''
          on = false
        }
      }
      return true
    },
    destroy() {
      box.style.filter = ''
      puddles.forEach((p) => p.remove())
      defs.querySelector('#m-melt-404')?.remove()
    },
  }
}

/* --------------------------------------------------------------------- */
/* Luz da hora: o papel muda de tom com o relógio do visitante.           */
/* --------------------------------------------------------------------- */
export function paperHour() {
  const h = new Date().getHours()
  const mood = h >= 5 && h < 8 ? 'aurora' : h >= 8 && h < 17 ? 'dia' : h >= 17 && h < 20 ? 'ocaso' : 'noite'
  document.documentElement.dataset.hora = mood
}

/* --------------------------------------------------------------------- */
let wakeLoop: () => void = () => {}

export function mount(opts: { fine: boolean }): () => void {
  const effects: Effect[] = []
  const cleanups: (() => void)[] = []

  let lastY = window.scrollY
  let lastT = performance.now()
  let vel = 0 // px/ms suavizado
  const ctx: Ctx = { fine: opts.fine, vel: () => vel }

  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  defs.setAttribute('class', 'm-svg-defs')
  defs.setAttribute('aria-hidden', 'true')
  defs.setAttribute('focusable', 'false')
  document.body.appendChild(defs)
  cleanups.push(() => defs.remove())

  const mark = document.querySelector<HTMLElement>('.m-hero__mark')
  if (mark) {
    const m = melt(mark, ctx, defs)
    if (m) effects.push(m)
  }
  const statement = document.querySelector<HTMLElement>('.m-manifesto__statement')
  if (statement) effects.push(fallUp(statement))
  const steps = document.querySelector<HTMLElement>('.m-process__steps')
  if (steps) effects.push(swing(steps, ctx))
  document.querySelectorAll<HTMLElement>('.m-contact, .m-case__finale').forEach((el) => effects.push(flood(el)))
  const media = Array.from(document.querySelectorAll<HTMLElement>('.project-card__media'))
  if (media.length) {
    if (opts.fine) cleanups.push(lens(media))
  }
  const nf = document.querySelector<HTMLElement>('.nf-play')
  if (nf) effects.push(notFound(nf, ctx, defs))
  cleanups.push(stains())

  let raf = 0
  let running = false
  const loop = (now: number) => {
    raf = 0
    // o timestamp do rAF pode ser anterior ao performance.now() do wake
    const dt = lastT < 0 ? 16 : Math.min(64, Math.max(1, now - lastT))
    lastT = now
    const y = window.scrollY
    const inst = (y - lastY) / Math.max(dt, 1)
    lastY = y
    vel += (inst - vel) * 0.25
    if (Math.abs(vel) < 0.001) vel = 0
    let busy = Math.abs(vel) > 0.002
    for (const e of effects) if (e.frame(now, dt)) busy = true
    if (busy) raf = requestAnimationFrame(loop)
    else running = false
  }
  const wake = () => {
    if (running) return
    running = true
    lastT = -1
    raf = requestAnimationFrame(loop)
  }
  wakeLoop = wake
  window.addEventListener('scroll', wake, { passive: true })
  window.addEventListener('pointermove', wake, { passive: true })
  window.addEventListener('resize', wake)
  wake()

  return () => {
    cancelAnimationFrame(raf)
    running = false
    window.removeEventListener('scroll', wake)
    window.removeEventListener('pointermove', wake)
    window.removeEventListener('resize', wake)
    effects.forEach((e) => e.destroy())
    cleanups.forEach((f) => f())
    wakeLoop = () => {}
  }
}

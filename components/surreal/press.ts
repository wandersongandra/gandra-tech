/**
 * Fase 4 — "A prensa". Segundo módulo da camada surreal, carregado junto do
 * engine (depois do load + ocioso, nunca com reduced-motion). Sem GSAP e sem
 * bibliotecas: canvas 2D, WAAPI, clip-path e Web Audio sintetizado.
 *
 * Set pieces:
 * - meio-tom: as fotos dos projetos chegam como retícula riso (preto +
 *   vermelhão desregistrado) que se abre na foto;
 * - prensa: um rolo de tinta atravessa os títulos de seção guiado pelo
 *   scroll — antes dele a letra é só relevo seco no papel;
 * - tipografia por velocidade: os títulos entortam com o scroll (só transform);
 * - pincel: arrastar no papel pinta pinceladas que secam e somem (no toque o
 *   gesto precisa ser mais horizontal que o scroll, para não roubá-lo);
 * - som: chave opcional (desligada por padrão) com sons sintetizados;
 * - modo tinta: ↑↑↓↓←→←→BA inverte papel e tinta; assinatura no console;
 * - carimbo: botões e links afundam como um carimbo ao clicar.
 */
import { Sfx } from './sfx'

type Fx = { frame: (now: number, dt: number) => boolean; destroy: () => void }

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const smooth = (v: number) => v * v * (3 - 2 * v)

// Cor do papel sob o elemento; se for o papel da página, devolve a variável
// (o modo tinta e a luz da hora trocam o tom sem desmontar nada).
function bgOf(el: Element | null): string {
  const page = getComputedStyle(document.documentElement).backgroundColor
  while (el) {
    const c = getComputedStyle(el).backgroundColor
    if (c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c)) return c === page ? 'var(--m-paper)' : c
    el = el.parentElement
  }
  return 'var(--m-paper)'
}

const solid = (c: string) => (c.startsWith('var(') ? getComputedStyle(document.documentElement).backgroundColor : c)

/* --------------------------------------------------------------------- */
/* Meio-tom: a foto nasce de uma retícula de duas cores.                 */
/* --------------------------------------------------------------------- */
function halftone(media: HTMLElement[], wake: () => void): Fx {
  const vh = window.innerHeight
  type Item = {
    el: HTMLElement
    img: HTMLImageElement
    cv: HTMLCanvasElement
    start: number
    cells: Float32Array | null
    cols: number
    rows: number
    cell: number
    paper: string
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
  const items: Item[] = []
  for (const el of media) {
    if (el.getBoundingClientRect().top < vh * 0.92) continue
    const img = el.querySelector('img')
    if (!img) continue
    const cv = document.createElement('canvas')
    cv.className = 'm-halftone'
    cv.setAttribute('aria-hidden', 'true')
    el.appendChild(cv)
    el.classList.add('is-screening')
    items.push({ el, img, cv, start: 0, cells: null, cols: 0, rows: 0, cell: 8, paper: solid(bgOf(el.parentElement)) })
  }

  const prepare = (it: Item) => {
    const w = it.el.clientWidth
    const h = it.el.clientHeight
    if (!w || !h) return false
    it.cv.width = Math.round(w * dpr)
    it.cv.height = Math.round(h * dpr)
    it.cell = Math.max(6, Math.round(w / 64))
    it.cols = Math.ceil(w / it.cell)
    it.rows = Math.ceil(h / it.cell)
    try {
      const off = document.createElement('canvas')
      off.width = it.cols
      off.height = it.rows
      const o = off.getContext('2d', { willReadFrequently: true })
      if (!o) return false
      const iw = it.img.naturalWidth
      const ih = it.img.naturalHeight
      const s = Math.max(w / iw, h / ih)
      const dw = (iw * s) / it.cell
      const dh = (ih * s) / it.cell
      o.drawImage(it.img, (it.cols - dw) / 2, (it.rows - dh) / 2, dw, dh)
      const px = o.getImageData(0, 0, it.cols, it.rows).data
      const cells = new Float32Array(it.cols * it.rows * 2)
      for (let i = 0; i < it.cols * it.rows; i++) {
        const r = px[i * 4] / 255
        const g = px[i * 4 + 1] / 255
        const b = px[i * 4 + 2] / 255
        const lum = 0.299 * r + 0.587 * g + 0.114 * b
        cells[i * 2] = Math.sqrt(1 - lum) // escuro → ponto preto
        cells[i * 2 + 1] = Math.sqrt(clamp(r - Math.min(g, b)) * 1.4 + (1 - lum) * 0.25) // quente → vermelhão
      }
      it.cells = cells
      return true
    } catch {
      return false
    }
  }

  const finish = (it: Item) => {
    it.start = -1
    it.cv.remove()
    it.el.classList.remove('is-screening')
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io.unobserve(e.target)
        const it = items.find((x) => x.el === e.target)
        if (!it || it.start) continue
        it.start = -2 // carregando
        const go = () => {
          if (it.start !== -2) return
          if (!prepare(it)) return finish(it)
          it.start = performance.now()
          wake()
        }
        if (it.img.complete && it.img.naturalWidth) go()
        else it.img.decode().then(go, () => finish(it))
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  )
  items.forEach((it) => io.observe(it.el))

  const DUR = 1800
  return {
    frame(now) {
      let busy = false
      for (const it of items) {
        if (it.start <= 0 || !it.cells) continue
        const t = clamp((now - it.start) / DUR)
        if (t >= 1) {
          finish(it)
          continue
        }
        busy = true
        const ctx = it.cv.getContext('2d')
        if (!ctx) continue
        const W = it.cv.width
        const H = it.cv.height
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.globalCompositeOperation = 'source-over'
        ctx.clearRect(0, 0, W, H)
        // o papel some depois que a retícula fecha
        const paper = 1 - smooth(clamp((t - 0.42) / 0.38))
        if (paper > 0) {
          ctx.globalAlpha = paper
          ctx.fillStyle = it.paper
          ctx.fillRect(0, 0, W, H)
        }
        const c = it.cell
        const R = c * 0.56
        const shrink = 1 - smooth(clamp((t - 0.55) / 0.45))
        ctx.globalCompositeOperation = 'multiply'
        for (let layer = 0; layer < 2; layer++) {
          ctx.globalAlpha = layer ? 0.9 : 0.94
          ctx.fillStyle = layer ? '#e5401a' : '#12110e'
          // desregistro do vermelhão: deslizando até assentar
          const ox = layer ? c * (0.34 - t * 0.2) : 0
          const oy = layer ? c * (0.22 - t * 0.12) : 0
          ctx.beginPath()
          for (let y = 0; y < it.rows; y++) {
            for (let x = 0; x < it.cols; x++) {
              // a retícula varre na diagonal
              const wave = smooth(clamp(t * 2.1 - (x / it.cols) * 0.55 - (y / it.rows) * 0.35))
              const v = it.cells[(y * it.cols + x) * 2 + layer]
              const r = R * v * wave * shrink * (layer ? 0.78 : 1)
              if (r < 0.35) continue
              const cx = x * c + c / 2 + ox + (y % 2 ? c / 2 : 0)
              const cy = y * c + c / 2 + oy
              ctx.moveTo(cx + r, cy)
              ctx.arc(cx, cy, r, 0, Math.PI * 2)
            }
          }
          ctx.fill()
        }
        ctx.globalAlpha = 1
      }
      return busy
    },
    destroy() {
      io.disconnect()
      items.forEach((it) => {
        it.start = -1
        it.cv.remove()
        it.el.classList.remove('is-screening')
      })
    },
  }
}

/* --------------------------------------------------------------------- */
/* Prensa: um rolo atravessa o título; antes dele, só relevo seco.        */
/* --------------------------------------------------------------------- */
function press(headings: HTMLElement[], sfx: Sfx): Fx {
  const vh = () => window.innerHeight
  type P = { h: HTMLElement; blind: HTMLElement; wet: HTMLElement; roller: HTMLElement; p: number; extent: number; done: number }
  const list: P[] = []
  for (const h of headings) {
    const r = h.getBoundingClientRect()
    if (r.top < vh() * 0.75) continue // já lido: não "desimprime"
    const range = document.createRange()
    range.selectNodeContents(h)
    const tr = range.getBoundingClientRect()
    const extent = clamp((tr.right - r.left) / Math.max(1, r.width), 0.3, 1.04)
    const mk = (cls: string) => {
      const s = document.createElement('span')
      s.className = cls
      s.setAttribute('aria-hidden', 'true')
      return s
    }
    const blind = mk('m-press__blind')
    const wet = mk('m-press__wet')
    h.childNodes.forEach((n) => {
      blind.appendChild(n.cloneNode(true))
      wet.appendChild(n.cloneNode(true))
    })
    const roller = mk('m-press__roller')
    h.style.setProperty('--press-bg', bgOf(h))
    h.classList.add('m-press')
    h.append(wet, blind, roller)
    list.push({ h, blind, wet, roller, p: 0, extent, done: 0 })
  }
  const paint = (it: P, now: number) => {
    const w = it.h.clientWidth
    const x = it.p * it.extent * w
    it.blind.style.clipPath = `inset(-0.3em -0.4em -0.3em ${x.toFixed(1)}px)`
    const band = Math.min(w * 0.22, 220)
    const fade = it.done ? 1 - clamp((now - it.done) / 700) : 1
    it.wet.style.clipPath = `inset(-0.3em ${Math.max(0, w - x).toFixed(1)}px -0.3em ${Math.max(0, x - band).toFixed(1)}px)`
    it.wet.style.opacity = String(fade)
    it.roller.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`
    it.roller.style.opacity = it.p > 0.001 ? String(fade) : '0'
  }
  list.forEach((it) => paint(it, 0))
  return {
    frame(now, dt) {
      let busy = false
      const H = vh()
      for (const it of list) {
        if (it.done < 0) continue
        if (it.done) {
          paint(it, now)
          if (now - it.done > 720) {
            it.blind.remove()
            it.wet.remove()
            it.roller.remove()
            it.h.classList.remove('m-press')
            it.done = -1
          } else busy = true
          continue
        }
        const r = it.h.getBoundingClientRect()
        const target = clamp((H * 0.9 - r.top) / (H * 0.5))
        const prev = it.p
        it.p += (target - it.p) * Math.min(1, dt * 0.012)
        if (Math.abs(target - it.p) < 0.002) it.p = target
        if (it.p !== prev) {
          busy = true
          sfx.roll(Math.abs(it.p - prev) / Math.max(dt, 1) * 60)
        }
        if (it.p >= 0.999) {
          it.p = 1
          it.done = now
          busy = true
        }
        paint(it, now)
      }
      return busy
    },
    destroy() {
      list.forEach((it) => {
        it.blind.remove()
        it.wet.remove()
        it.roller.remove()
        it.h.classList.remove('m-press')
      })
    },
  }
}

/* --------------------------------------------------------------------- */
/* Tipografia por velocidade: títulos entortam com o scroll.              */
/* --------------------------------------------------------------------- */
function velocityType(els: HTMLElement[], vel: () => number): Fx {
  let applied = false
  return {
    frame() {
      const v = vel()
      const k = clamp(v * 1.1, -1, 1) // px/ms → -1..1
      if (Math.abs(k) < 0.01) {
        if (applied) {
          els.forEach((el) => (el.style.transform = ''))
          applied = false
        }
        return false
      }
      const H = window.innerHeight
      for (const el of els) {
        const r = el.getBoundingClientRect()
        if (r.bottom < -40 || r.top > H + 40) continue
        el.style.transform = `skewY(${(-k * 3.2).toFixed(2)}deg) scaleY(${(1 + Math.abs(k) * 0.1).toFixed(3)})`
      }
      applied = true
      return true
    },
    destroy() {
      els.forEach((el) => (el.style.transform = ''))
    },
  }
}

/* --------------------------------------------------------------------- */
/* Pincel: arrastar no papel (fora de texto e controles) pinta.           */
/* --------------------------------------------------------------------- */
const NO_PAINT =
  'a, button, input, textarea, select, label, summary, details, img, picture, video, canvas, [contenteditable], [role="button"], .project-card, .kinetic, .m-drop, [data-no-stain], .m-sound, .nf-play'

function hasOwnText(el: Element) {
  for (const n of Array.from(el.childNodes)) if (n.nodeType === 3 && n.textContent && n.textContent.trim()) return true
  return false
}

function brush(sfx: Sfx, wake: () => void): Fx & { painted: () => boolean } {
  const cv = document.createElement('canvas')
  cv.className = 'm-brush'
  cv.setAttribute('aria-hidden', 'true')
  document.body.appendChild(cv)
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const size = () => {
    cv.width = Math.round(window.innerWidth * dpr)
    cv.height = Math.round(window.innerHeight * dpr)
  }
  size()
  type Pt = { x: number; y: number; w: number }
  type Stroke = { pts: Pt[]; t: number; end: number; color: string; seed: number }
  const strokes: Stroke[] = []
  let cur: Stroke | null = null
  let down: { x: number; y: number } | null = null
  let last: { x: number; y: number; t: number } | null = null
  let count = 0
  let paintedFlag = false

  const onDown = (e: PointerEvent) => {
    // zera sempre: um traço que terminou sem "click" (soltou fora da janela,
    // em cima de um link) não pode engolir o próximo clique num link
    paintedFlag = false
    if (e.button !== 0) return
    // mouse e toque: no toque o gesto precisa ser mais horizontal que o
    // scroll (ver onMove), senão a página continua rolando.
    if (e.pointerType !== 'mouse' && e.pointerType !== 'touch' && e.pointerType !== 'pen') return
    const t = e.target as Element | null
    if (!t || t.closest(NO_PAINT) || hasOwnText(t)) return
    down = { x: e.clientX, y: e.clientY }
  }
  const onMove = (e: PointerEvent) => {
    if (!down) return
    // botão solto fora da janela: o pointerup nunca chegou
    if (e.pointerType === 'mouse' && e.buttons === 0) return onUp()
    const x = e.clientX + window.scrollX
    const y = e.clientY + window.scrollY
    const now = performance.now()
    if (!cur) {
      const dx = e.clientX - down.x
      const dy = e.clientY - down.y
      const dist = Math.hypot(dx, dy)
      // mouse: 5px; toque: 28px e predominante horizontal (não rouba o scroll)
      const touch = e.pointerType === 'touch'
      if (dist < (touch ? 28 : 5)) return
      if (touch && Math.abs(dy) >= Math.abs(dx) * 0.85) {
        down = null
        return
      }
      document.documentElement.classList.add('is-painting')
      window.getSelection()?.removeAllRanges()
      count++
      const ink = getComputedStyle(document.documentElement).getPropertyValue('--m-ink').trim() || '#12110e'
      cur = { pts: [], t: now, end: 0, color: count % 3 === 0 ? '#e5401a' : ink, seed: count * 31 }
      strokes.push(cur)
      while (strokes.length > 24) strokes.shift()
      paintedFlag = true
      // a mancha do pointerdown não pertence a um traço de pincel
      window.dispatchEvent(new Event('gt:brush-start'))
    }
    const sp = last ? Math.hypot(x - last.x, y - last.y) / Math.max(1, now - last.t) : 0
    const w = clamp(17 - sp * 7, 3, 17)
    const prevW = cur.pts.length ? cur.pts[cur.pts.length - 1].w : w
    cur.pts.push({ x, y, w: prevW + (w - prevW) * 0.35 })
    last = { x, y, t: now }
    sfx.brush(sp)
    wake()
  }
  const onUp = () => {
    if (cur) cur.end = performance.now()
    cur = null
    down = null
    last = null
    document.documentElement.classList.remove('is-painting')
    sfx.brush(0)
    // o "click" (se vier) chega na mesma tarefa do pointerup; depois disso a
    // trava não vale mais
    if (paintedFlag) window.setTimeout(() => (paintedFlag = false), 0)
  }
  // um arrasto pintado não vira clique (nem mancha)
  const onClick = (e: MouseEvent) => {
    if (paintedFlag) {
      e.stopPropagation()
      e.preventDefault()
      paintedFlag = false
    }
  }
  // touchmove não-passivo só enquanto pinta: segura o scroll da página
  const onTouchMove = (e: TouchEvent) => {
    if (cur) e.preventDefault()
  }
  window.addEventListener('pointerdown', onDown, { passive: true })
  window.addEventListener('pointermove', onMove, { passive: true })
  window.addEventListener('pointerup', onUp, { passive: true })
  window.addEventListener('pointercancel', onUp, { passive: true })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('click', onClick, true)
  window.addEventListener('resize', size)

  const DRY = 2600
  const FADE = 3200
  return {
    painted: () => paintedFlag,
    frame(now) {
      const ctx = cv.getContext('2d')
      if (!ctx) return false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cv.width, cv.height)
      if (!strokes.length) return false
      const sx = window.scrollX
      const sy = window.scrollY
      let alive = false
      for (let i = strokes.length - 1; i >= 0; i--) {
        const s = strokes[i]
        const age = s.end ? now - s.end : 0
        const a = s.end ? 1 - clamp((age - DRY) / FADE) : 1
        if (a <= 0) {
          strokes.splice(i, 1)
          continue
        }
        alive = true
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.strokeStyle = s.color
        // cerdas: um traço cheio + fios desencontrados
        for (let b = 0; b < 4; b++) {
          ctx.globalAlpha = a * (b ? 0.42 : 0.86)
          const off = b ? ((b * 37 + s.seed) % 7) - 3 : 0
          ctx.beginPath()
          for (let k = 1; k < s.pts.length; k++) {
            const p0 = s.pts[k - 1]
            const p1 = s.pts[k]
            const dx = p1.x - p0.x
            const dy = p1.y - p0.y
            const len = Math.hypot(dx, dy) || 1
            const nx = (-dy / len) * off * (p1.w / 6)
            const ny = (dx / len) * off * (p1.w / 6)
            ctx.lineWidth = b ? Math.max(1, p1.w * 0.16) : p1.w * 0.8
            ctx.moveTo(p0.x - sx + nx, p0.y - sy + ny)
            ctx.lineTo(p1.x - sx + nx, p1.y - sy + ny)
          }
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      return alive
    },
    destroy() {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('click', onClick, true)
      window.removeEventListener('resize', size)
      document.documentElement.classList.remove('is-painting')
      cv.remove()
    },
  }
}

/* --------------------------------------------------------------------- */
/* Carimbo: botões e links afundam como um carimbo.                       */
/* --------------------------------------------------------------------- */
function stamps(sfx: Sfx): () => void {
  const onDown = (e: PointerEvent) => {
    if (e.button !== 0) return
    const el = (e.target as Element | null)?.closest<HTMLElement>('.m-button, .m-link, .m-header a, .project-card')
    sfx.drip()
    if (!el) return
    sfx.stamp()
    el.animate(
      [
        { transform: 'none' },
        { transform: 'scale(0.94) translateY(2px)', offset: 0.3 },
        { transform: 'scale(1.015)', offset: 0.7 },
        { transform: 'none' },
      ],
      { duration: 360, easing: 'cubic-bezier(.2,.8,.2,1)', composite: 'add' }
    )
  }
  window.addEventListener('pointerdown', onDown, { passive: true })
  return () => window.removeEventListener('pointerdown', onDown)
}

/* --------------------------------------------------------------------- */
/* Modo tinta (Konami) e assinatura no console.                           */
/* --------------------------------------------------------------------- */
const KONAMI = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']

function toast(text: string) {
  let el = document.querySelector<HTMLElement>('.m-toast')
  if (!el) {
    el = document.createElement('div')
    el.className = 'm-toast mono'
    el.setAttribute('role', 'status')
    el.setAttribute('aria-live', 'polite')
    document.body.appendChild(el)
  }
  el.textContent = text
  el.classList.remove('is-on')
  void el.offsetWidth
  el.classList.add('is-on')
}

export function setInkMode(on: boolean, sfx?: Sfx, animate = true) {
  const html = document.documentElement
  let applied = false
  const apply = () => {
    if (applied) return
    applied = true
    if (on) html.dataset.tinta = 'on'
    else delete html.dataset.tinta
    try {
      if (on) sessionStorage.setItem('gt-tinta', '1')
      else sessionStorage.removeItem('gt-tinta')
    } catch {}
  }
  if (!animate) return apply()
  const flood = document.createElement('div')
  flood.className = 'm-tinta-flood'
  flood.setAttribute('aria-hidden', 'true')
  flood.style.background = on ? '#12110e' : '#ece8df'
  document.body.appendChild(flood)
  sfx?.flood()
  const a = flood.animate(
    [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }],
    { duration: 520, easing: 'cubic-bezier(.77,0,.175,1)', fill: 'forwards' }
  )
  const afterCover = () => {
    apply()
    const b = flood.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, easing: 'ease-out', fill: 'forwards' })
    const done = () => flood.remove()
    b.onfinish = done
    // WAAPI onfinish pode falhar em headless; garante remoção + apply.
    window.setTimeout(() => {
      apply()
      if (flood.isConnected) flood.remove()
    }, 1000)
  }
  a.onfinish = afterCover
  // Fallback se a animação não disparar onfinish (CI / WebKit headless).
  window.setTimeout(afterCover, 700)
  toast(on ? 'Modo tinta ligado — repita o código para voltar ao papel.' : 'De volta ao papel.')
}

function konami(sfx: Sfx): () => void {
  let i = 0
  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase()
    i = k === KONAMI[i] ? i + 1 : k === KONAMI[0] ? 1 : 0
    if (i === KONAMI.length) {
      i = 0
      setInkMode(document.documentElement.dataset.tinta !== 'on', sfx)
    }
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}

let signed = false
function signature() {
  if (signed) return
  signed = true
  try {
    if (sessionStorage.getItem('gt-sig')) return
    sessionStorage.setItem('gt-sig', '1')
  } catch {}
  console.info(
    '%cGANDRA%c\nfeito à mão, sem template — a prensa está ligada.\n↑ ↑ ↓ ↓ ← → ← → B A',
    'font: 800 28px/1 Archivo, system-ui, sans-serif; color:#e5401a; letter-spacing:-1px;',
    'font: 12px/1.6 ui-monospace, monospace; color:#5a554d;'
  )
}

/* --------------------------------------------------------------------- */
export function mountPress(opts: { fine: boolean }): () => void {
  const sfx = Sfx.get()
  const effects: Fx[] = []
  const cleanups: (() => void)[] = []

  let lastY = window.scrollY
  let lastT = -1
  let vel = 0
  let raf = 0
  let running = false

  const loop = (now: number) => {
    raf = 0
    const dt = lastT < 0 ? 16 : Math.min(64, Math.max(1, now - lastT))
    lastT = now
    const y = window.scrollY
    vel += ((y - lastY) / dt - vel) * 0.2
    lastY = y
    if (Math.abs(vel) < 0.002) vel = 0
    let busy = vel !== 0
    for (const e of effects) if (e.frame(now, dt)) busy = true
    if (busy) raf = requestAnimationFrame(loop)
    else {
      running = false
      sfx.roll(0)
    }
  }
  const wake = () => {
    if (running) return
    running = true
    lastT = -1
    lastY = window.scrollY
    raf = requestAnimationFrame(loop)
  }

  const media = Array.from(document.querySelectorAll<HTMLElement>('.project-card__media'))
  if (media.length) effects.push(halftone(media, wake))
  const heads = Array.from(document.querySelectorAll<HTMLElement>('.m-display, .m-case__h2'))
  if (heads.length) effects.push(press(heads, sfx))
  const bends = Array.from(document.querySelectorAll<HTMLElement>('.m-display, .m-case__h2, .m-contact__title, .m-case__finale-title'))
  if (bends.length) effects.push(velocityType(bends, () => vel))
  // Pincel também no toque: gesto predominantemente horizontal (ver brush).
  effects.push(brush(sfx, wake))
  cleanups.push(stamps(sfx), konami(sfx), sfx.mountToggle())
  try {
    if (sessionStorage.getItem('gt-tinta') === '1') setInkMode(true, undefined, false)
  } catch {}
  signature()

  window.addEventListener('scroll', wake, { passive: true })
  window.addEventListener('resize', wake)
  wake()

  return () => {
    cancelAnimationFrame(raf)
    running = false
    window.removeEventListener('scroll', wake)
    window.removeEventListener('resize', wake)
    effects.forEach((e) => e.destroy())
    cleanups.forEach((f) => f())
    sfx.roll(0)
  }
}

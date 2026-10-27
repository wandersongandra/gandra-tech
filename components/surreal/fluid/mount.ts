/**
 * Fluido de tinta no hero (Matéria). Carregado sob demanda — não entra no
 * bundle inicial. Pausa fora da viewport / aba oculta / ociosidade; rebaixa
 * qualidade se o FPS cair; cai no efeito estático atual se WebGL falhar.
 */
import { createFluidSim, QUALITY, type FluidQuality, type FluidSim } from './sim'

type Opts = { fine: boolean }

function pickQuality(fine: boolean): FluidQuality {
  const cores = navigator.hardwareConcurrency || 4
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
  if (saveData) return QUALITY.low
  // Touch / coarse pointer → low sim cost (mobile Lighthouse target).
  if (!fine) return QUALITY.low
  if (cores <= 4 || (mem !== undefined && mem <= 4)) return QUALITY.mid
  return QUALITY.high
}

function nextTier(q: FluidQuality): FluidQuality | null {
  if (q === QUALITY.high) return QUALITY.mid
  if (q === QUALITY.mid) return QUALITY.low
  return null
}

/** Monta o fluido no `.m-hero` da home. Retorna cleanup. */
export function mountFluid(opts: Opts): () => void {
  if (typeof window === 'undefined') return () => {}
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const hero = document.querySelector<HTMLElement>('.m-hero')
  if (!hero) return () => {}

  // Já existe? (HMR / remount)
  if (hero.querySelector('canvas.m-ink-fluid')) return () => {}

  let quality = pickQuality(opts.fine)
  const canvas = document.createElement('canvas')
  canvas.className = 'm-ink-fluid'
  canvas.setAttribute('aria-hidden', 'true')
  hero.prepend(canvas)

  let sim: FluidSim | null = null
  try {
    sim = createFluidSim(canvas, quality)
  } catch {
    sim = null
  }
  if (!sim) {
    canvas.remove()
    return () => {}
  }

  document.documentElement.dataset.fluid = 'on'

  let raf = 0
  let running = false
  let last = 0
  let lastInteract = performance.now()
  let visible = true
  let pageVisible = document.visibilityState === 'visible'
  let fpsSamples: number[] = []
  let downgraded = false
  let dead = false

  const IDLE_MS = 4500
  const seed = () => {
    if (!sim) return
    // Mancha inicial — surpresa na entrada, perto do GANDRA.
    const mark = hero.querySelector<HTMLElement>('.m-hero__mark')
    const r = (mark || hero).getBoundingClientRect()
    const hr = hero.getBoundingClientRect()
    const nx = (r.left + r.width * 0.45 - hr.left) / hr.width
    const ny = 1 - (r.top + r.height * 0.35 - hr.top) / hr.height
    sim.splat(nx, ny, 18, -40, [0.5, 0.05, 0.03], 0.00055)
    sim.splat(nx + 0.08, ny - 0.05, -12, -20, [0.15, 0.55, 0.12], 0.00028)
    sim.splat(nx - 0.06, ny + 0.04, 8, 10, [0.45, 0.06, 0.04], 0.00022)
  }
  let seeded = false
  const ensureSeed = () => {
    if (seeded) return
    seeded = true
    seed()
  }

  const stop = () => {
    if (raf) cancelAnimationFrame(raf)
    raf = 0
    running = false
    last = 0
  }

  const loop = (now: number) => {
    raf = 0
    if (dead || !sim || sim.lost()) {
      teardown()
      return
    }
    if (!pageVisible || !visible) {
      running = false
      return
    }
    if (now - lastInteract > IDLE_MS) {
      // Um último frame quieto e dorme (economiza bateria/calor).
      sim.draw(now)
      running = false
      return
    }
    const dt = last ? (now - last) / 1000 : 0.016
    last = now
    if (dt > 0) {
      const fps = 1 / dt
      fpsSamples.push(fps)
      if (fpsSamples.length > 45) fpsSamples.shift()
      if (!downgraded && fpsSamples.length >= 30) {
        const avg = fpsSamples.reduce((a, b) => a + b, 0) / fpsSamples.length
        if (avg < 28) {
          const next = nextTier(quality)
          if (next) {
            quality = next
            sim.setQuality(quality)
            // setQuality realloca FBOs vazios — reseedar para não apagar a tinta.
            seeded = false
            ensureSeed()
            fpsSamples = []
          } else {
            downgraded = true
            // GPU fraca demais: desliga o fluido e deixa o hero estático.
            teardown()
            return
          }
        }
      }
    }
    sim.step(dt)
    sim.draw(now)
    running = true
    raf = requestAnimationFrame(loop)
  }

  const wake = () => {
    if (dead || !sim || !pageVisible || !visible) return
    ensureSeed()
    lastInteract = performance.now()
    if (running) return
    running = true
    last = 0
    raf = requestAnimationFrame(loop)
  }

  // Pointer: desktop move; toque só arraste com componente horizontal
  // dominante ou tap curto — nunca preventDefault no eixo vertical.
  let pointerId: number | null = null
  let lastX = 0
  let lastY = 0
  let accDX = 0
  let accDY = 0
  let touching = false

  const toUV = (clientX: number, clientY: number) => {
    const r = hero.getBoundingClientRect()
    return {
      x: (clientX - r.left) / r.width,
      y: 1 - (clientY - r.top) / r.height,
    }
  }

  const inkColor = (): [number, number, number] => {
    // Alterna preto e vermelhão para o sotaque Matéria.
    return Math.random() > 0.78 ? [0.12, 0.72, 0.18] : [0.55, 0.07, 0.04]
  }

  const onPointerDown = (e: PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    const r = hero.getBoundingClientRect()
    if (e.clientY < r.top || e.clientY > r.bottom) return
    pointerId = e.pointerId
    lastX = e.clientX
    lastY = e.clientY
    accDX = 0
    accDY = 0
    touching = e.pointerType !== 'mouse'
    if (!touching) {
      const { x, y } = toUV(e.clientX, e.clientY)
      sim?.splat(x, y, 0, 0, inkColor(), 0.0002)
      wake()
    }
  }

  const onPointerMove = (e: PointerEvent) => {
    if (pointerId !== null && e.pointerId !== pointerId) return
    const dx = e.clientX - lastX
    const dy = e.clientY - lastY
    if (pointerId === null && e.pointerType === 'mouse') {
      // Hover trail no desktop (sem botão).
      if (Math.hypot(dx, dy) < 1) return
      const r = hero.getBoundingClientRect()
      if (e.clientY < r.top || e.clientY > r.bottom) {
        lastX = e.clientX
        lastY = e.clientY
        return
      }
      const { x, y } = toUV(e.clientX, e.clientY)
      sim?.splat(x, y, dx * 12, -dy * 12, inkColor(), 0.00018)
      lastX = e.clientX
      lastY = e.clientY
      wake()
      return
    }
    if (pointerId === null) return
    accDX += dx
    accDY += dy
    lastX = e.clientX
    lastY = e.clientY
    if (touching) {
      // Só pinta se o gesto for predominantemente horizontal (não rouba scroll).
      if (Math.abs(accDX) < 10 && Math.abs(accDY) < 10) return
      if (Math.abs(accDY) > Math.abs(accDX) * 1.15) return
    }
    const { x, y } = toUV(e.clientX, e.clientY)
    sim?.splat(x, y, dx * 14, -dy * 14, inkColor(), touching ? 0.00032 : 0.00022)
    wake()
  }

  const onPointerUp = (e: PointerEvent) => {
    if (pointerId !== null && e.pointerId !== pointerId) return
    if (touching && Math.hypot(accDX, accDY) < 8) {
      // Tap: gota local.
      const { x, y } = toUV(e.clientX, e.clientY)
      sim?.splat(x, y, 0, -30, inkColor(), 0.00045)
      wake()
    }
    pointerId = null
    touching = false
  }

  const onPulse = () => {
    const mark = hero.querySelector<HTMLElement>('.m-hero__wordmark, .m-hero__mark')
    if (!mark || !sim) return
    const r = mark.getBoundingClientRect()
    const hr = hero.getBoundingClientRect()
    const x = (r.left + r.width / 2 - hr.left) / hr.width
    const y = 1 - (r.top + r.height / 2 - hr.top) / hr.height
    sim.splat(x, y, 0, -80, [0.2, 0.7, 0.15], 0.0007)
    sim.splat(x - 0.04, y, -40, -20, [0.5, 0.06, 0.03], 0.0004)
    sim.splat(x + 0.04, y, 40, -20, [0.5, 0.06, 0.03], 0.0004)
    wake()
  }

  window.addEventListener('pointerdown', onPointerDown, { passive: true })
  window.addEventListener('pointermove', onPointerMove, { passive: true })
  window.addEventListener('pointerup', onPointerUp, { passive: true })
  window.addEventListener('pointercancel', onPointerUp, { passive: true })
  document.addEventListener('gt:wordmark-pulse', onPulse)

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries.some((e) => e.isIntersecting && e.intersectionRatio > 0.05)
      if (visible) wake()
      else stop()
    },
    { threshold: [0, 0.05, 0.2] }
  )
  io.observe(hero)

  const onVis = () => {
    pageVisible = document.visibilityState === 'visible'
    if (pageVisible) wake()
    else stop()
  }
  document.addEventListener('visibilitychange', onVis)

  const onResize = () => {
    sim?.resize()
    wake()
  }
  window.addEventListener('resize', onResize, { passive: true })

  // Ambient: após LCP (~2s), uma mancha quieta se o hero ainda estiver visível.
  const ambient = window.setTimeout(() => {
    if (!dead && visible && pageVisible) wake()
  }, 2000)

  function teardown() {
    window.clearTimeout(ambient)

    if (dead) return
    dead = true
    stop()
    io.disconnect()
    window.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerUp)
    document.removeEventListener('gt:wordmark-pulse', onPulse)
    document.removeEventListener('visibilitychange', onVis)
    window.removeEventListener('resize', onResize)
    sim?.destroy()
    sim = null
    canvas.remove()
    delete document.documentElement.dataset.fluid
  }

  return teardown
}

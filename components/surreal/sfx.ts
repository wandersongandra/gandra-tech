/**
 * Som da prensa — opcional, DESLIGADO por padrão, sem arquivos: tudo é
 * sintetizado com Web Audio (nenhuma requisição, nada de autoplay). O
 * AudioContext só nasce quando a pessoa liga a chave (gesto do usuário).
 * Preferência guardada em localStorage ("gt-som").
 */
type Loop = { src: AudioBufferSourceNode; gain: GainNode; filter: BiquadFilterNode }

const KEY = 'gt-som'

export class Sfx {
  private static one: Sfx | null = null
  static get() {
    if (!Sfx.one) Sfx.one = new Sfx()
    return Sfx.one
  }

  on = false
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private noise: AudioBuffer | null = null
  private rollLoop: Loop | null = null
  private brushLoop: Loop | null = null
  private lastStamp = 0

  private constructor() {
    try {
      this.on = localStorage.getItem(KEY) === '1'
    } catch {}
  }

  private ensure(): AudioContext | null {
    if (!this.on) return null
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return null
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.5
      this.master.connect(this.ctx.destination)
      const len = this.ctx.sampleRate
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate)
      const d = this.noise.getChannelData(0)
      let b = 0
      for (let i = 0; i < len; i++) {
        // ruído "marrom": mais papel, menos chiado
        b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02
        d[i] = b * 3.5
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
    return this.ctx
  }

  set(on: boolean) {
    this.on = on
    try {
      localStorage.setItem(KEY, on ? '1' : '0')
    } catch {}
    if (on) {
      this.ensure()
      this.stamp()
    } else {
      this.roll(0)
      this.brush(0)
      void this.ctx?.suspend()
    }
  }

  private loop(type: BiquadFilterType, freq: number, q: number): Loop | null {
    const ctx = this.ensure()
    if (!ctx || !this.master || !this.noise) return null
    const src = ctx.createBufferSource()
    src.buffer = this.noise
    src.loop = true
    const filter = ctx.createBiquadFilter()
    filter.type = type
    filter.frequency.value = freq
    filter.Q.value = q
    const gain = ctx.createGain()
    gain.gain.value = 0
    src.connect(filter).connect(gain).connect(this.master)
    src.start()
    return { src, gain, filter }
  }

  /** Rolo da prensa: ruído grave proporcional à velocidade do rolo. */
  roll(intensity: number) {
    if (!this.on) return
    if (!this.rollLoop) {
      if (intensity <= 0) return
      this.rollLoop = this.loop('lowpass', 420, 0.7)
      if (!this.rollLoop) return
    }
    const g = Math.min(0.5, intensity * 1.6)
    this.rollLoop.gain.gain.setTargetAtTime(g, this.rollLoop.gain.context.currentTime, 0.06)
  }

  /** Pincel: cerdas no papel, mais claro quanto mais rápido. */
  brush(speed: number) {
    if (!this.on) return
    if (!this.brushLoop) {
      if (speed <= 0) return
      this.brushLoop = this.loop('bandpass', 1800, 0.8)
      if (!this.brushLoop) return
    }
    const t = this.brushLoop.gain.context.currentTime
    this.brushLoop.gain.gain.setTargetAtTime(Math.min(0.35, speed * 0.25), t, 0.04)
    this.brushLoop.filter.frequency.setTargetAtTime(1200 + Math.min(3000, speed * 1500), t, 0.05)
  }

  /** Carimbo: um baque curto de madeira e papel. */
  stamp() {
    const ctx = this.ensure()
    if (!ctx || !this.master || !this.noise) return
    const now = ctx.currentTime
    if (now - this.lastStamp < 0.05) return
    this.lastStamp = now
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(150, now)
    o.frequency.exponentialRampToValueAtTime(48, now + 0.14)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.7, now + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    o.connect(g).connect(this.master)
    o.start(now)
    o.stop(now + 0.2)
    const n = ctx.createBufferSource()
    n.buffer = this.noise
    const f = ctx.createBiquadFilter()
    f.type = 'highpass'
    f.frequency.value = 2200
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.25, now)
    ng.gain.exponentialRampToValueAtTime(0.0001, now + 0.05)
    n.connect(f).connect(ng).connect(this.master)
    n.start(now, Math.random() * 0.5, 0.06)
  }

  /** Gota: "plip" de tinta caindo no papel. */
  drip() {
    const ctx = this.ensure()
    if (!ctx || !this.master) return
    const now = ctx.currentTime
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    const f0 = 700 + Math.random() * 500
    o.frequency.setValueAtTime(f0, now)
    o.frequency.exponentialRampToValueAtTime(f0 * 2.2, now + 0.07)
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.22, now + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.12)
    o.connect(g).connect(this.master)
    o.start(now)
    o.stop(now + 0.14)
  }

  /** Inundação do modo tinta: um varrido grave. */
  flood() {
    const ctx = this.ensure()
    if (!ctx || !this.master || !this.noise) return
    const now = ctx.currentTime
    const n = ctx.createBufferSource()
    n.buffer = this.noise
    const f = ctx.createBiquadFilter()
    f.type = 'lowpass'
    f.frequency.setValueAtTime(200, now)
    f.frequency.exponentialRampToValueAtTime(2400, now + 0.5)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.0001, now)
    g.gain.exponentialRampToValueAtTime(0.6, now + 0.2)
    g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)
    n.connect(f).connect(g).connect(this.master)
    n.start(now, 0, 1)
  }

  /** Chave acessível fixa no canto (aria-pressed). */
  mountToggle(): () => void {
    let btn = document.querySelector<HTMLButtonElement>('.m-sound')
    if (!btn) {
      btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'm-sound mono'
      btn.setAttribute('data-no-stain', '')
      const bars = document.createElement('span')
      bars.className = 'm-sound__bars'
      bars.setAttribute('aria-hidden', 'true')
      for (let i = 0; i < 4; i++) bars.appendChild(document.createElement('i'))
      const label = document.createElement('span')
      label.className = 'm-sound__label'
      label.textContent = 'Som'
      btn.append(bars, label)
      document.body.appendChild(btn)
    }
    const b = btn
    const sync = () => {
      b.setAttribute('aria-pressed', String(this.on))
      b.setAttribute('aria-label', 'Som da prensa')
      b.title = this.on ? 'Desligar o som' : 'Ligar o som (sintetizado, sem arquivos)'
    }
    const onClick = () => {
      this.set(!this.on)
      sync()
    }
    sync()
    b.addEventListener('click', onClick)
    requestAnimationFrame(() => b.classList.add('is-in'))
    return () => {
      b.removeEventListener('click', onClick)
      b.remove()
    }
  }
}

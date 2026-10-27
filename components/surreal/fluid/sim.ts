import {
  VERT,
  ADVECT,
  DIVERGENCE,
  PRESSURE,
  GRADIENT,
  SPLAT,
  DISPLAY,
} from './shaders'

type FBO = { tex: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number }
type Prog = { program: WebGLProgram; uniforms: Record<string, WebGLUniformLocation | null>; aPos: number }

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const err = gl.getShaderInfoLog(s) || 'shader'
    gl.deleteShader(s)
    throw new Error(err)
  }
  return s
}

function program(gl: WebGLRenderingContext, fs: string): Prog {
  const p = gl.createProgram()!
  gl.attachShader(p, compile(gl, gl.VERTEX_SHADER, VERT))
  gl.attachShader(p, compile(gl, gl.FRAGMENT_SHADER, fs))
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(p) || 'link')
  }
  const uniforms: Record<string, WebGLUniformLocation | null> = {}
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS)
  for (let i = 0; i < n; i++) {
    const info = gl.getActiveUniform(p, i)
    if (info) uniforms[info.name] = gl.getUniformLocation(p, info.name)
  }
  return { program: p, uniforms, aPos: gl.getAttribLocation(p, 'a_pos') }
}

function makeFBO(gl: WebGLRenderingContext, w: number, h: number): FBO {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  const fbo = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  return { tex, fbo, w, h }
}

function destroyFBO(gl: WebGLRenderingContext, f: FBO) {
  gl.deleteTexture(f.tex)
  gl.deleteFramebuffer(f.fbo)
}

export type FluidQuality = {
  simW: number
  simH: number
  iterations: number
  dprCap: number
  splatForce: number
}

export const QUALITY: Record<'high' | 'mid' | 'low', FluidQuality> = {
  high: { simW: 256, simH: 144, iterations: 18, dprCap: 1.5, splatForce: 4200 },
  mid: { simW: 160, simH: 90, iterations: 12, dprCap: 1.25, splatForce: 3200 },
  low: { simW: 96, simH: 54, iterations: 7, dprCap: 1, splatForce: 2400 },
}

export type FluidSim = {
  canvas: HTMLCanvasElement
  splat: (x: number, y: number, dx: number, dy: number, color?: [number, number, number], radius?: number) => void
  resize: () => void
  step: (dt: number) => void
  draw: (now: number) => void
  setQuality: (q: FluidQuality) => void
  destroy: () => void
  lost: () => boolean
}

export function createFluidSim(canvas: HTMLCanvasElement, quality: FluidQuality): FluidSim | null {
  const gl = canvas.getContext('webgl', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    powerPreference: 'low-power',
  })
  if (!gl) return null

  let lost = false
  const onLost = (e: Event) => {
    e.preventDefault()
    lost = true
  }
  const onRestored = () => {
    lost = true // force remount rather than half-recover
  }
  canvas.addEventListener('webglcontextlost', onLost, false)
  canvas.addEventListener('webglcontextrestored', onRestored, false)

  let q = quality
  let dye: { read: FBO; write: FBO; swap: () => void }
  let vel: { read: FBO; write: FBO; swap: () => void }
  let divergence: FBO
  let pressure: { read: FBO; write: FBO; swap: () => void }

  const blitBuf = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, blitBuf)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

  let progAdvect: Prog
  let progDiv: Prog
  let progPressure: Prog
  let progGrad: Prog
  let progSplat: Prog
  let progDisplay: Prog

  try {
    progAdvect = program(gl, ADVECT)
    progDiv = program(gl, DIVERGENCE)
    progPressure = program(gl, PRESSURE)
    progGrad = program(gl, GRADIENT)
    progSplat = program(gl, SPLAT)
    progDisplay = program(gl, DISPLAY)
  } catch {
    return null
  }

  const pair = (w: number, h: number) => {
    const a = makeFBO(gl, w, h)
    const b = makeFBO(gl, w, h)
    return {
      read: a,
      write: b,
      swap() {
        const t = this.read
        this.read = this.write
        this.write = t
      },
    }
  }

  const clearEncodedZero = (f: FBO) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo)
    gl.viewport(0, 0, f.w, f.h)
    gl.clearColor(0.5, 0.5, 0.5, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }
  const clearInk = (f: FBO) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, f.fbo)
    gl.viewport(0, 0, f.w, f.h)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT)
  }
  const alloc = () => {
    const { simW, simH } = q
    dye = pair(simW, simH)
    vel = pair(simW, simH)
    divergence = makeFBO(gl, simW, simH)
    pressure = pair(simW, simH)
    clearInk(dye.read)
    clearInk(dye.write)
    clearEncodedZero(vel.read)
    clearEncodedZero(vel.write)
    clearEncodedZero(divergence)
    clearEncodedZero(pressure.read)
    clearEncodedZero(pressure.write)
  }
  alloc()

  const blit = (target: FBO | null, clear = false) => {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.fbo : null)
    if (target) gl.viewport(0, 0, target.w, target.h)
    else gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
    if (clear) {
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, blitBuf)
  }

  const use = (p: Prog) => {
    gl.useProgram(p.program)
    gl.enableVertexAttribArray(p.aPos)
    gl.vertexAttribPointer(p.aPos, 2, gl.FLOAT, false, 0, 0)
  }

  const drawTris = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

  const texel = () => {
    const { simW, simH } = q
    return [1 / simW, 1 / simH] as const
  }

  const splatInner = (
    target: { read: FBO; write: FBO; swap: () => void },
    x: number,
    y: number,
    color: [number, number, number],
    radius: number,
    signed: boolean
  ) => {
    use(progSplat)
    blit(target.write)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, target.read.tex)
    gl.uniform1i(progSplat.uniforms.u_target, 0)
    gl.uniform1f(progSplat.uniforms.u_aspect, q.simW / q.simH)
    gl.uniform3f(progSplat.uniforms.u_color, color[0], color[1], color[2])
    gl.uniform2f(progSplat.uniforms.u_point, x, y)
    gl.uniform1f(progSplat.uniforms.u_radius, radius)
    gl.uniform1f(progSplat.uniforms.u_signed, signed ? 1 : 0)
    drawTris()
    target.swap()
  }

  const splat = (
    x: number,
    y: number,
    dx: number,
    dy: number,
    color: [number, number, number] = [0.55, 0.08, 0.04],
    radius = 0.00035
  ) => {
    if (lost) return
    const aspect = q.simW / q.simH
    splatInner(vel, x, y, [(dx * aspect) / q.splatForce, dy / q.splatForce, 0], radius * 1.4, true)
    splatInner(dye, x, y, color, radius, false)
  }

  const step = (dt: number) => {
    if (lost) return
    const dtClamped = Math.min(0.033, Math.max(0.008, dt))
    const [tx, ty] = texel()

    // advect velocity
    use(progAdvect)
    blit(vel.write)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, vel.read.tex)
    gl.uniform1i(progAdvect.uniforms.u_velocity, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, vel.read.tex)
    gl.uniform1i(progAdvect.uniforms.u_source, 1)
    gl.uniform2f(progAdvect.uniforms.u_texel, tx, ty)
    gl.uniform1f(progAdvect.uniforms.u_dt, dtClamped * 220)
    gl.uniform1f(progAdvect.uniforms.u_dissipation, 0.985)
    gl.uniform1f(progAdvect.uniforms.u_signed, 1)
    drawTris()
    vel.swap()

    // divergence
    use(progDiv)
    blit(divergence)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, vel.read.tex)
    gl.uniform1i(progDiv.uniforms.u_velocity, 0)
    gl.uniform2f(progDiv.uniforms.u_texel, tx, ty)
    drawTris()

    // clear pressure then jacobi (0.5 = encoded zero)
    blit(pressure.read)
    gl.clearColor(0.5, 0.5, 0.5, 1)
    gl.clear(gl.COLOR_BUFFER_BIT)
    use(progPressure)
    for (let i = 0; i < q.iterations; i++) {
      blit(pressure.write)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex)
      gl.uniform1i(progPressure.uniforms.u_pressure, 0)
      gl.activeTexture(gl.TEXTURE1)
      gl.bindTexture(gl.TEXTURE_2D, divergence.tex)
      gl.uniform1i(progPressure.uniforms.u_divergence, 1)
      gl.uniform2f(progPressure.uniforms.u_texel, tx, ty)
      drawTris()
      pressure.swap()
    }

    // gradient subtract
    use(progGrad)
    blit(vel.write)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, pressure.read.tex)
    gl.uniform1i(progGrad.uniforms.u_pressure, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, vel.read.tex)
    gl.uniform1i(progGrad.uniforms.u_velocity, 1)
    gl.uniform2f(progGrad.uniforms.u_texel, tx, ty)
    drawTris()
    vel.swap()

    // advect dye
    use(progAdvect)
    blit(dye.write)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, vel.read.tex)
    gl.uniform1i(progAdvect.uniforms.u_velocity, 0)
    gl.activeTexture(gl.TEXTURE1)
    gl.bindTexture(gl.TEXTURE_2D, dye.read.tex)
    gl.uniform1i(progAdvect.uniforms.u_source, 1)
    gl.uniform2f(progAdvect.uniforms.u_texel, tx, ty)
    gl.uniform1f(progAdvect.uniforms.u_dt, dtClamped * 220)
    gl.uniform1f(progAdvect.uniforms.u_dissipation, 0.992)
    gl.uniform1f(progAdvect.uniforms.u_signed, 0)
    drawTris()
    dye.swap()
  }

  const resize = () => {
    const rect = canvas.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, q.dprCap)
    const w = Math.max(1, Math.round(rect.width * dpr))
    const h = Math.max(1, Math.round(rect.height * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
  }

  const draw = (now: number) => {
    if (lost) return
    resize()
    use(progDisplay)
    blit(null)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, dye.read.tex)
    gl.uniform1i(progDisplay.uniforms.u_density, 0)
    gl.uniform2f(progDisplay.uniforms.u_res, canvas.width, canvas.height)
    gl.uniform1f(progDisplay.uniforms.u_time, now * 0.001)
    gl.uniform1f(progDisplay.uniforms.u_grain, 0.035)
    drawTris()
    gl.disable(gl.BLEND)
  }

  const setQuality = (nq: FluidQuality) => {
    destroyFBO(gl, dye.read)
    destroyFBO(gl, dye.write)
    destroyFBO(gl, vel.read)
    destroyFBO(gl, vel.write)
    destroyFBO(gl, divergence)
    destroyFBO(gl, pressure.read)
    destroyFBO(gl, pressure.write)
    q = nq
    alloc()
  }

  const destroy = () => {
    canvas.removeEventListener('webglcontextlost', onLost)
    canvas.removeEventListener('webglcontextrestored', onRestored)
    try {
      destroyFBO(gl, dye.read)
      destroyFBO(gl, dye.write)
      destroyFBO(gl, vel.read)
      destroyFBO(gl, vel.write)
      destroyFBO(gl, divergence)
      destroyFBO(gl, pressure.read)
      destroyFBO(gl, pressure.write)
    } catch {}
    const ext = gl.getExtension('WEBGL_lose_context')
    ext?.loseContext()
  }

  return { canvas, splat, resize, step, draw, setQuality, destroy, lost: () => lost }
}

'use client'
import { useRef, useEffect } from 'react'

const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'

// Organismo de gradiente: fbm de 5 oitavas com domain warping, aceso em
// periwinkle só nos picos do ruído. O cursor injeta brilho local.
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res.xy;
  vec2 p = uv;
  p.x *= u_res.x / u_res.y;
  vec2 m = u_mouse;
  m.x *= u_res.x / u_res.y;

  // Domain warping: o ruído deforma o próprio ruído — daí o aspecto orgânico.
  float n = fbm(p * 1.6 + vec2(u_time * 0.04, -u_time * 0.025) + fbm(p * 2.2 - u_time * 0.03) * 0.8);
  // Brilho suave ao redor do cursor.
  n += 0.35 * exp(-length(p - m) * 2.5);

  vec3 glow = vec3(0.56, 0.59, 0.87); // --accent
  vec3 col = mix(vec3(0.0), glow, smoothstep(0.38, 0.85, n) * 0.42);

  // Vinheta para afogar as bordas no preto.
  col *= mix(0.55, 1.0, smoothstep(1.2, 0.3, length(uv - 0.5)));
  gl_FragColor = vec4(col, 1.0);
}
`

/**
 * Blob WebGL do hero: camada mais profunda do fundo (atrás das partículas
 * do nome). WebGL puro, sem dependências; se o contexto falhar, some
 * silenciosamente e o hero continua preto.
 */
export default function HeroBlob() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { antialias: false, alpha: false })
    if (!gl) {
      canvas.remove()
      return
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)
      if (!s) return null
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        gl.deleteShader(s)
        return null
      }
      return s
    }
    const vertexShader = compile(gl.VERTEX_SHADER, VERT)
    const fragmentShader = compile(gl.FRAGMENT_SHADER, FRAG)
    const prog = gl.createProgram()
    if (!vertexShader || !fragmentShader || !prog) {
      if (vertexShader) gl.deleteShader(vertexShader)
      if (fragmentShader) gl.deleteShader(fragmentShader)
      if (prog) gl.deleteProgram(prog)
      canvas.remove()
      return
    }
    gl.attachShader(prog, vertexShader)
    gl.attachShader(prog, fragmentShader)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.deleteProgram(prog)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      canvas.remove()
      return
    }
    gl.useProgram(prog)

    // Triângulo fullscreen.
    const buf = gl.createBuffer()
    if (!buf) {
      gl.deleteProgram(prog)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      canvas.remove()
      return
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    if (loc < 0) {
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
      canvas.remove()
      return
    }
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(prog, 'u_res')
    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uMouse = gl.getUniformLocation(prog, 'u_mouse')

    // DPR capado: o shader é o item mais caro do site em fill-rate.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const r = parent.getBoundingClientRect()
      canvas.width = Math.round(r.width * dpr)
      canvas.height = Math.round(r.height * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 }
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.tx = (e.clientX - r.left) / r.width
      mouse.ty = 1 - (e.clientY - r.top) / r.height
    }
    window.addEventListener('mousemove', onMove)

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const render = (t: number) => {
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, t / 1000)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    if (reduced) {
      render(8000) // frame estático, ainda bonito
    } else {
      const loop = (t: number) => {
        render(t)
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      gl.deleteBuffer(buf)
      gl.deleteProgram(prog)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [])

  return <canvas ref={canvasRef} className="hero__blob" aria-hidden="true" />
}

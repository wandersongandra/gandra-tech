'use client'

import { useEffect, useRef } from 'react'

const VERTEX = `attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`

// A geometria é calculada por signed distance fields em espaço tridimensional.
// Três aros orbitais e um núcleo polido recebem luz conforme giram no scroll.
const FRAGMENT = `
precision mediump float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_scroll;

mat2 turn(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, -s, s, c);
}

vec3 transformSpace(vec3 p) {
  p.xz *= turn(u_time * 0.11 + (u_pointer.x - 0.5) * 0.62 + u_scroll * 1.4);
  p.yz *= turn(0.28 + (u_pointer.y - 0.5) * 0.42 + u_scroll * 0.5);
  return p;
}

float torus(vec3 p, vec2 t) {
  return length(vec2(length(p.xz) - t.x, p.y)) - t.y;
}

float scene(vec3 p) {
  vec3 q = transformSpace(p);
  float a = torus(q, vec2(1.03, 0.075));
  float b = torus(q.yzx, vec2(0.92, 0.054));
  float c = torus(q.zxy, vec2(1.18, 0.033));
  float core = length(q) - 0.48;
  return min(min(a, b), min(c, core));
}

vec3 normalAt(vec3 p) {
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    scene(p + e.xyy) - scene(p - e.xyy),
    scene(p + e.yxy) - scene(p - e.yxy),
    scene(p + e.yyx) - scene(p - e.yyx)
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
  vec3 ro = vec3(0.0, 0.0, 4.35);
  vec3 rd = normalize(vec3(uv * 1.8, -1.8));
  float dist = 0.0;
  float hit = 0.0;
  vec3 pos = ro;
  for (int i = 0; i < 72; i++) {
    pos = ro + rd * dist;
    float d = scene(pos);
    if (d < 0.002) { hit = 1.0; break; }
    dist += max(d * 0.85, 0.008);
    if (dist > 9.0) break;
  }

  float atmosphere = exp(-length(uv * vec2(0.85, 1.0)) * 2.9);
  vec3 color = vec3(0.015, 0.022, 0.045) * atmosphere;
  color += vec3(0.045, 0.048, 0.11) * pow(atmosphere, 3.0);

  if (hit > 0.5 && dist < 9.0) {
    vec3 n = normalAt(pos);
    vec3 light = normalize(vec3(-0.65, 0.9, 1.5));
    vec3 rimLight = normalize(vec3(0.8, -0.5, 1.2));
    float diffuse = max(dot(n, light), 0.0);
    float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.4);
    float specular = pow(max(dot(reflect(-light, n), -rd), 0.0), 45.0);
    float secondSpec = pow(max(dot(reflect(-rimLight, n), -rd), 0.0), 20.0);
    float coreMaterial = 1.0 - smoothstep(0.49, 0.53, length(transformSpace(pos)));
    vec3 metal = mix(vec3(0.20, 0.22, 0.41), vec3(0.62, 0.68, 1.0), diffuse);
    metal = mix(metal, vec3(0.27, 0.30, 0.53), coreMaterial * 0.5);
    color = metal * (0.26 + diffuse * 0.55);
    color += vec3(0.83, 0.85, 1.0) * specular * 1.65;
    color += vec3(0.39, 0.45, 1.0) * secondSpec * 0.48;
    color += vec3(0.48, 0.52, 1.0) * rim * 0.8;
    color *= 1.0 - 0.18 * smoothstep(3.0, 7.0, dist);
  }

  // Alpha orgânico permite ao papel de fundo e à grade aparecerem nas bordas.
  float alpha = hit > 0.5 ? 1.0 : atmosphere * 0.46;
  gl_FragColor = vec4(color, alpha);
}
`

export default function OrbitalArtifact() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const hostRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const host = hostRef.current
    if (!canvas || !host) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const coarse = window.matchMedia('(pointer: coarse)')
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    if (saveData) return

    const gl = canvas.getContext('webgl', {
      antialias: false,
      alpha: true,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
      preserveDrawingBuffer: false,
    })
    if (!gl) return

    function makeShader(type: number, source: string) {
      const shader = gl!.createShader(type)
      if (!shader) return null
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
        gl!.deleteShader(shader)
        return null
      }
      return shader
    }

    const vert = makeShader(gl.VERTEX_SHADER, VERTEX)
    const frag = makeShader(gl.FRAGMENT_SHADER, FRAGMENT)
    const program = gl.createProgram()
    if (!vert || !frag || !program) {
      if (vert) gl.deleteShader(vert)
      if (frag) gl.deleteShader(frag)
      if (program) gl.deleteProgram(program)
      return
    }
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      gl.deleteProgram(program)
      return
    }

    const buffer = gl.createBuffer()
    if (!buffer) {
      gl.deleteProgram(program)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      return
    }
    gl.useProgram(program)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const attr = gl.getAttribLocation(program, 'a_position')
    if (attr < 0) {
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      return
    }
    gl.enableVertexAttribArray(attr)
    gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0)

    const uniforms = {
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      pointer: gl.getUniformLocation(program, 'u_pointer'),
      time: gl.getUniformLocation(program, 'u_time'),
      scroll: gl.getUniformLocation(program, 'u_scroll'),
    }

    let frame = 0
    let lastFrame = 0
    let inView = false
    let destroyed = false
    let x = 0.5
    let y = 0.5
    let targetX = 0.5
    let targetY = 0.5
    let progress = 0

    function resize() {
      if (!gl || destroyed) return
      const { width, height } = host!.getBoundingClientRect()
      if (!width || !height) return
      // Limite absoluto de pixels: evita 4K por frame em monitores HiDPI.
      const scale = Math.min(1, 960 / width, 700 / height, coarse.matches ? 0.8 : 1)
      canvas!.width = Math.max(1, Math.round(width * scale))
      canvas!.height = Math.max(1, Math.round(height * scale))
      gl.viewport(0, 0, canvas!.width, canvas!.height)
    }

    function draw(time: number) {
      if (!gl || destroyed || gl.isContextLost()) return
      x += (targetX - x) * 0.045
      y += (targetY - y) * 0.045
      gl.uniform2f(uniforms.resolution, canvas!.width, canvas!.height)
      gl.uniform2f(uniforms.pointer, x, y)
      gl.uniform1f(uniforms.time, time * 0.001)
      gl.uniform1f(uniforms.scroll, progress)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    function stop() {
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }

    function loop(time: number) {
      if (!inView || document.hidden || reduced.matches || destroyed) {
        stop()
        return
      }
      frame = requestAnimationFrame(loop)
      const interval = coarse.matches ? 1000 / 24 : 1000 / 40
      if (time - lastFrame < interval) return
      lastFrame = time
      draw(time)
    }

    function sync() {
      stop()
      if (!inView || document.hidden || destroyed) return
      if (reduced.matches) draw(5000)
      else frame = requestAnimationFrame(loop)
    }

    function onPointer(event: PointerEvent) {
      if (coarse.matches) return
      const bounds = host!.getBoundingClientRect()
      targetX = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
      targetY = Math.min(1, Math.max(0, 1 - (event.clientY - bounds.top) / bounds.height))
    }

    function onScroll() {
      const section = host!.closest('section')!
      const rect = section.getBoundingClientRect()
      progress = Math.max(0, Math.min(1, -rect.top / Math.max(1, rect.height - window.innerHeight)))
    }

    const visibility = new IntersectionObserver((entries) => {
      inView = entries.some((entry) => entry.isIntersecting)
      if (inView) onScroll()
      sync()
    }, { rootMargin: '150px 0px', threshold: 0 })
    visibility.observe(host)
    const resizeObserver = new ResizeObserver(() => { resize(); if (reduced.matches && inView) draw(5000) })
    resizeObserver.observe(host)
    resize()
    host.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('visibilitychange', sync)
    reduced.addEventListener('change', sync)

    return () => {
      destroyed = true
      stop()
      visibility.disconnect()
      resizeObserver.disconnect()
      host.removeEventListener('pointermove', onPointer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('visibilitychange', sync)
      reduced.removeEventListener('change', sync)
      gl.deleteBuffer(buffer)
      gl.deleteShader(vert)
      gl.deleteShader(frag)
      gl.deleteProgram(program)
    }
  }, [])

  return (
    <div ref={hostRef} className="lab__scene" aria-hidden="true">
      <div className="lab__fallback" />
      <canvas ref={canvasRef} className="lab__canvas" />
    </div>
  )
}

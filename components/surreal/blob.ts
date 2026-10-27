/**
 * Contorno orgânico de mancha de tinta: raio modulado por senoides de
 * frequências primas entre si (nunca repete o mesmo desenho) e fechado com
 * Catmull-Rom → Bézier cúbica. Devolve um trecho de path SVG absoluto.
 */
export function blobPath(cx: number, cy: number, r: number, t = 0, seed = 0, wobble = 1, points = 16): string {
  if (r <= 0.01) return ''
  const pts: [number, number][] = []
  for (let k = 0; k < points; k++) {
    const a = (k / points) * Math.PI * 2
    const m =
      1 +
      wobble *
        (0.085 * Math.sin(3 * a + t + seed) +
          0.05 * Math.sin(5 * a - 1.3 * t + seed * 2.1) +
          0.028 * Math.sin(9 * a + 2.1 * t + seed * 0.7))
    pts.push([cx + Math.cos(a) * r * m, cy + Math.sin(a) * r * m])
  }
  const n = pts.length
  const f = (v: number) => v.toFixed(1)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + 'Z'
}

/** Círculo como subpath (gotas satélite), no mesmo sentido horário da mancha
 * para não abrir furos com a regra nonzero do clip-path. */
export function dotPath(cx: number, cy: number, r: number): string {
  if (r <= 0.2) return ''
  const f = (v: number) => v.toFixed(1)
  return `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 1 ${f(r * 2)} 0a${f(r)} ${f(r)} 0 1 1 ${f(-r * 2)} 0Z`
}

/** Gerador pseudoaleatório determinístico (mulberry32). */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

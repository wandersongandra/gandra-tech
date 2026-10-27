# Fluido de tinta — WebGL no hero (2026-10)

## Objetivo
Efeito surreal tipo Awwwards: simulação de tinta em tempo real (stable-fluids / Navier–Stokes simplificado) no hero da home, na linguagem Matéria — tinta preta, acentos vermelhão (`--m-signal`), papel creme, aspecto multiply + grão. Sem three.js; shaders GLSL escritos à mão em WebGL1.

## Branch
`design/fluido-tinta` · base `main` @ `9709f67`

## Onde vive
| Peça | Caminho |
|---|---|
| Shaders | `components/surreal/fluid/shaders.ts` |
| Simulação | `components/surreal/fluid/sim.ts` |
| Ciclo de vida | `components/surreal/fluid/mount.ts` |
| Ligação lazy | `components/surreal/SurrealLoader.tsx` (só `pathname === '/'`) |
| Estilo | `.m-ink-fluid` em `app/materia.css` |

Não entra no JS inicial: `import('./fluid/mount')` depois do engine, pós-load/idle (mesmo gate do SurrealLoader).

## Comportamento
### Desktop
- Rastro de tinta segue o cursor sobre o hero (hover).
- Clique deixa uma gota.
- Pulso do GANDRA (`gt:wordmark-pulse`) esguicha tinta + vermelhão na palavra.

### Mobile (toque)
- **Tap** → gota.
- **Arraste predominantemente horizontal** → pincel fluido.
- Gesto vertical **não** chama `preventDefault` — o scroll da página segue intacto (mesmo critério do pincel 2D).

### Ambient
Na montagem, três splats próximos do wordmark criam a primeira mancha (surpresa sem interação).

## Performance (hard gates)
- Lazy após first paint / idle; só com `.m-hero` na home.
- `IntersectionObserver`: pausa fora da viewport.
- `visibilitychange`: pausa com aba oculta.
- Ociosidade ~4,5s sem interação → para o `rAF` (bateria/calor).
- Qualidade adaptativa: `high` (256×144, 18 iterações) → `mid` → `low`; DPR cap 1,5 / 1,25 / 1.
- Se FPS médio < 28 com `low`, desmonta e deixa o hero estático (gotas CSS/engine atuais).
- `prefers-reduced-motion: reduce` → não carrega.
- WebGL indisponível / context lost → remove canvas, sem erro no console.
- CSP: sem `eval`, sem Worker/blob (`worker-src 'self'` intacto).

## Fallbacks
1. Reduced motion → off.
2. Sem WebGL → off (hero Matéria atual).
3. GPU fraca / FPS baixo → downgrade → off.
4. Context lost → teardown.

## QA
- `scripts-test.cjs`: presença do módulo, import lazy, sem three.js, CSP worker-src.
- `scripts/visual-qa.cjs`: whitelist `canvas.m-ink-fluid`; se WebGL ok, espera `data-fluid=on`.
- Commit separado: Konami/`data-tinta` estabilizado (WAAPI fallback + `waitForFunction`).

## Como verificar no iPhone real
1. Abrir a preview da PR na home.
2. Confirmar LCP/texto do hero intactos (fluido atrás, `pointer-events: none`).
3. Scroll vertical livre; arraste horizontal no hero pinta; tap goteja.
4. Toque em GANDRA → derrete + esguicho de tinta.
5. Rolagem para fora do hero → GPU deve esfriar (rAF parado); voltar e mexer → reacende.
6. Ajustes → Movimento → Reduzir movimentos: canvas some.
7. Safari sem WebGL / low power: página segue útil sem fluido.

## Evidências
`/workspace/gandra-audit/fluido/` — screenshots, vídeo desktop/mobile, Lighthouse before/after, FPS.

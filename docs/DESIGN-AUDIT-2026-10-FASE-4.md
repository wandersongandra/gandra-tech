# Auditoria de design — fase 4: A prensa (outubro 2026)

Continuação da [fase 3](./DESIGN-AUDIT-2026-10-FASE-3.md). Pedido: "cabe mais
efeitos e animações — me surpreenda mais". Princípio: **o site é uma oficina
gráfica**. A fase 3 fez a tinta desobedecer; a fase 4 traz o processo de
impressão inteiro: gota, retícula, rolo, pincel, carimbo e o som da oficina.
Nada de 3D, orbes ou bibliotecas novas.

## Performance primeiro: GSAP sob demanda

- `lib/gsap.ts` expõe `loadGsap()` (promise única de `gsap` + `ScrollTrigger`,
  já registrados) e `withGsap(run)`, que roda o efeito quando o kit chega e
  cancela se o componente desmontar antes.
- Os 18 usos de GSAP passaram para `withGsap`/`loadGsap`. O núcleo (~70 KB) e o
  ScrollTrigger (~43 KB) **saíram do HTML inicial** (nenhum `<script>` de GSAP
  na home ou nos cases); `Marquee` trocou `gsap.utils.wrap` por aritmética e o
  Lenis só liga `ScrollTrigger.update` depois do carregamento.
- Nenhuma entrada acima da dobra depende de GSAP (o hero é CSS), então não há
  "pisca" na chegada; a cortina funciona assim que o kit chega (antes disso
  links navegam normalmente).

## Arquitetura

- `components/surreal/Intro.tsx` (no layout, sem JS) + `lib/intro.ts`: script
  inline mínimo no `<head>` (hash SHA-256 gerado no postbuild; agora 19
  hashes). Ele só marca `html[data-intro]` na 1ª visita da sessão e fora de
  reduced-motion. Tudo mais é CSS.
- `components/surreal/press.ts` é um **segundo chunk**, importado pelo
  `SurrealLoader` logo depois do engine da fase 3 (load + ocioso, ou primeira
  interação). Um loop rAF próprio que dorme quando nada se move.
- `components/surreal/sfx.ts`: Web Audio sintetizado (sem arquivos, nenhuma
  requisição, nada de `media-src` necessário).
- O `blotReveal` da fase 3 foi removido: o meio-tom é a nova chegada das fotos.

## Set pieces

| # | Seção | Momento | Celular / toque | Reduced motion |
|---|---|---|---|---|
| 1 | Página inteira (1ª visita) | **Gota de tinta**: uma gota cai, espirra (anel + respingos), floresce no GANDRA (paths da Archivo 700, o R em vermelhão) e a folha **sobe como saindo da prensa** com borda de tinta fresca; a página "revela" como cópia no banho (cinza lavado → contraste). Overlay termina em **1,15 s**; tecla/toque pulam (~0,25 s); entradas do hero esperam a folha sair | Igual (proporções em vmin) | Não existe |
| 2 | Trabalhos (home e /trabalhos) | **Meio-tom riso**: as fotos chegam como retícula de duas cores — preto + vermelhão **desregistrado** que desliza até assentar —, varrendo na diagonal; o papel some e os pontos encolhem até virar foto | Igual (canvas ≤ 1,5× DPR, ~1,9 mil pontos) | Fotos visíveis |
| 3 | Títulos de seção (serviços, trabalhos, processo, decisões do case) | **Rolo de prensa** guiado pelo scroll: antes do rolo a letra é **relevo seco** no papel; atrás dele, tinta e uma faixa de vermelhão desregistrado que seca; trava impresso no fim | Igual (scroll) | Texto normal |
| 4 | Títulos grandes (+ contato e final do case) | **Tipografia por velocidade**: os títulos entortam (`skewY`/`scaleY`, só transform → CLS 0) com a velocidade do scroll e voltam ao parar | Igual | Parados |
| 5 | Papel (desktop) | **Pincel**: arrastar em área vazia pinta pinceladas com cerdas (largura pela velocidade; 1 em 3 em vermelhão) que **secam e somem** em ~6 s; texto continua selecionável (o pincel não começa sobre texto, links ou fotos) | Desligado (arrastar = rolar); toques mantêm as manchas da fase 3 | Não existe |
| 6 | Canto inferior esquerdo | **Som da prensa** (opcional, **desligado por padrão**): carimbo nos cliques, gota no papel, rolo enquanto imprime, cerdas do pincel e varrido do modo tinta. `<button aria-pressed>` acessível, preferência em `localStorage` | Botão só com ícone (nome acessível mantido) | Não montado |
| 7 | Página inteira | **Modo tinta**: ↑↑↓↓←→←→BA inunda a tela a partir do centro e inverte papel e tinta (vale até fechar a aba; repetir volta); aviso em `role=status`; **assinatura** no console; **carimbo** — botões, links e cards afundam ao clicar | Konami só com teclado | Não montado |

## Verificação

- Local: typecheck, lint, test, build (CSP 16 rotas + fallback, 19 hashes),
  validate:build-security e npm audit (0 vulnerabilidades) passaram.
- browser-qa (`scripts/visual-qa.cjs`) agora verifica: abertura marca
  `data-intro` e sai da tela; rolo nos títulos; meio-tom nas fotos; som nasce
  desligado; Konami liga e desliga o modo tinta; nenhum canvas além de
  `.m-ink-trail`, `.m-halftone` e `.m-brush`; e em reduced-motion nada da
  prensa nem da abertura existe.
- 16 rotas × 6 viewports (1440, 1024, 768 toque, 390 toque, 360 toque,
  390 reduced): 0 erros de console, 0 violações de CSP, 0 imagens quebradas.

### Lighthouse (local, mesma máquina das fases anteriores)

| Página | Antes (fase 3) | Fase 4 mobile (5 execuções) | Fase 4 desktop |
|---|---|---|---|
| Home | 90 | 91–94 (a11y 100, CLS 0, TBT 40–70 ms) | 100 |
| Case Telma | 91 | 92–94 (uma execução 87 com TBT 260 ms, ruído da máquina) | 100 |

A11y, boas práticas e SEO seguem em 100. As medições já incluem a abertura
(o Lighthouse sempre é 1ª visita).

## Riscos e observações

- A abertura cobre a tela por ~1,1 s na 1ª visita da sessão; o conteúdo está no
  DOM desde o início (crawlers e leitores de tela não esperam) e o h1 é pintado
  na hora (LCP preservado).
- `suppressHydrationWarning` no `<html>`: o script do head adiciona
  `data-intro` antes da hidratação (mesma técnica de temas claro/escuro).
- O pincel ignora arrastos que começam sobre texto; em áreas vazias o arrasto
  pintado não vira clique.
- Modo tinta é easter egg: sessões com ele ligado mantêm contraste AA (texto
  claro em fundo #12110e; vermelhão de texto pequeno #f26a43).

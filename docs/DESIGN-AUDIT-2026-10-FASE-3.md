# Auditoria de design — fase 3: Matéria surreal (outubro 2026)

Continuação da [fase 2](./DESIGN-AUDIT-2026-10-FASE-2.md). Pedido: "deixar o
site mais surreal". Princípio: **matéria que se comporta errado, de um jeito
bonito** — tinta, papel e tipografia que desobedecem a física. Sem orbes,
gradientes roxos, partículas ou 3D.

## Arquitetura

- `components/surreal/SurrealLoader.tsx` (no layout) importa
  `components/surreal/engine.ts` como **chunk separado**, só depois do `load`
  + `requestIdleCallback` (ou na primeira interação). Não entra no JS inicial
  nem disputa o LCP. No 404 carrega na hora (os dígitos caem já na chegada).
- O engine não usa GSAP: `transform`, `clip-path: path()`, um filtro SVG e
  WAAPI, guiados por **um único loop rAF que dorme** quando nada se move.
- Remonta a cada troca de rota e limpa tudo no desmonte.
- CSP intacta: nenhum script inline novo; só atributos `style` (já
  permitidos por `style-src 'unsafe-inline'`) e imagens `'self'`.

## Momentos

| Seção | Momento | Toque | Reduced motion |
|---|---|---|---|
| Hero | **Tinta mole**: o GANDRA amolece (filtro de deslocamento) e escorre gotas dos pés das letras com a velocidade do cursor/scroll; ao parar, as gotas voltam para dentro (tensão superficial) | Gotas guiadas pela rolagem do dedo, sem filtro | Estático |
| Trabalhos | Fotos **nascem de uma mancha** que se abre; **lente de tinta** orgânica amplia a foto sob o cursor | Mancha de revelação mantida; sem lente | Fotos visíveis |
| Manifesto | **Palavras caem para cima**: depois de lidas, cada uma solta com peso, giro e velocidade próprios; voltam ao rolar para trás | Igual (scroll) | Texto parado |
| Processo | Etapas **penduradas num prego** da linha do tempo, balançando com a aceleração do scroll | Igual | Paradas |
| Contato / final do case | **Inundação**: a seção escura chega como uma mancha de tinta que cresce do topo, com escorridos e respingos, até cobrir tudo | Igual | Seção sólida |
| Página inteira | Cada clique/toque deixa uma **mancha que seca** (vermilion → sépia → some em ~9 s) | Toques também mancham | Nada |
| 404 | Dígitos de tinta: **amolecem** com a velocidade e deixam **poças** onde caem | O dedo empurra os dígitos | Estático (já era) |
| Global | **Luz da hora**: o papel muda de tom pelo relógio de quem visita (aurora, dia, ocaso, noite) | Igual | Igual (só cor) |

Contraste no tom mais escuro do papel (`noite`, #e5e3dc): texto muted
5,76:1, signal-ink 4,89:1, vermilion grande 3,22:1 — todos dentro do AA.

## Números (build local, Lighthouse 3 execuções mobile)

| Lighthouse | Home fase 2 | Home fase 3 | Case fase 2 | Case fase 3 |
|---|---|---|---|---|
| Performance mobile | 90–91 | 90 | 91 | 91 |
| Acessibilidade | 100 | 100 | 100 | 100 |
| Boas práticas / SEO | 100 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |
| CLS | 0 | 0 | 0 | 0 |
| Performance desktop | 100 | 100 | 100 | 100 |

A camada surreal inteira chega depois da primeira pintura; o placar mobile
continua limitado pelo JS do framework (React + router) e pelo GSAP.

## Próximo passo possível

Carregar GSAP/ScrollTrigger sob demanda (`import()` nas 18 seções que usam)
tiraria ~46 KB do caminho crítico simulado. Ficou fora desta fase pelo risco
de regressão na cortina e nas entradas.

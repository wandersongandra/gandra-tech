# Auditoria de design — Fase 5 ("O fólio")

Branch `design/fase-4` · PR #47 (não fazer merge) · preview https://design-fase-4.gandra-tech.pages.dev

## Princípios

- Um efeito principal por seção.
- Tudo lazy: as peças vivem em `components/surreal/folio.ts` (≈15,6 kB, 5,8 kB gzip),
  importado pelo `SurrealLoader` depois da prensa (load + ocioso). Nada entra no JS inicial
  (o browser-qa verifica isso).
- CSP estrita: estilos só via CSSOM (`el.style.x`, `setProperty`), sem atributo `style`,
  sem blob/workers. O postbuild segue com 19 hashes.
- O fólio monta também com `prefers-reduced-motion`: cada peça tem uma versão parada.
- Toque: nada depende de hover; o cursor só soma.

## Peças

| # | Peça | Onde | Movimento | Reduced-motion / fallback |
|---|---|---|---|---|
| 1 | Títulos que sangram | `main h1, h2` abaixo da dobra (exceto displays) | feTurbulence + feDisplacementMap, escala 60→0 em 1,1 s (0,7 s no celular); 3 filtros no desktop, 1 no celular | fade de 200 ms |
| 2 | Card → case | card de projeto → `/trabalhos/*` | `document.startViewTransition` nativo, a imagem vira a placa do case (`gt-plate`), sem cortina, chega no topo | sem VT: cortina normal |
| 3 | Mergulho no ponto | depois da lista de trabalhos (home) | trilho sticky; o ponto de retícula cresce 80× e a tinta inunda (clip-path circle) | faixa vermelha de 14 px |
| 4 | Ficha carimbada | ficha técnica do case | `animation-timeline: view()` (carimbo torto que assenta) + régua `scroll(root)` presa sob o header; marcas de registro | sem `animation-timeline` (Firefox): ficha parada, sem régua |
| 5 | Tipos móveis | hero do `/contato` | canvas 2D em JetBrains Mono; o cursor levanta os tipos; clique compõe palavras em vermelho; `aria-hidden` | campo estático, sem clique |
| 6 | Texto líquido | links do header, `.m-link`, rodapé legal, `.link-arrow` (fora do logotipo) | turbulência 0→8→0 + feOffset em hover e `:focus-visible` | só troca de cor (AA) |
| 7 | Segurar para carimbar | e-mail do CTA de contato | clique curto abre na hora; segurar 0,55 s carimba "GANDRA ✶ APROVADO" e não abre; Espaço ou Enter mantido repete; `touch-action: manipulation` | carimbo aparece sem o tranco |
| 8 | Origami + 404 amassada | serviços em `/servicos`; folha da 404 | rotateX + clip-path em degraus (scaleY no Safari); a 404 chega como bola de papel (clip-path polygon) e desamassa; clique amassa de novo; foco abre | serviços abertos; 404 plana |

As peças 9 e 10 (opcionais) ficaram de fora para preservar o orçamento de desempenho no celular (LH mobile já está entre 92 e 94).

## Correções feitas durante a fase

- O morph travava porque um rAF dentro do callback da view transition nunca dispara (a renderização fica suspensa): agora usa setTimeout.
- Com `scroll-behavior: smooth`, a página nova rolava visivelmente até o topo: o salto agora é `behavior: 'instant'`.
- A fila de sangria no celular deixava títulos em branco: se um título espera mais de 250 ms, ele só faz o fade.
- Com o clique, os tipos móveis compunham a palavra e o engine também pintava uma mancha por cima: o hero e o e-mail agora têm `data-no-stain`.
- Os tipos móveis custavam cerca de 33 ms por quadro no WebKit: a base agora é pintada uma vez num canvas fora da tela, e cada quadro só repinta as células perto do cursor.
- A régua do case era `fixed` dentro de um `<main>` com filtro (pré-prensa), então pulava ao carregar (CLS de 0,0018) e não ficava presa: agora é `sticky`.

## Testes

`scripts/visual-qa.cjs` → `fase5(browser)`:

- o fólio não está no JS carregado até o load;
- canvas dos tipos;
- clique curto contra segurar no e-mail;
- `touch-action`;
- filtro líquido, que não pega o logotipo;
- morph via startViewTransition, chegando com scrollY 0;
- marcas de registro e régua;
- trilho do mergulho;
- origami fecha e abre;
- 404 amassa e desamassa;
- reduced-motion (sem origami nem filtro, troca de cor, faixa de 14 px, 404 plana, canvas estático).

## Lighthouse (local, CSP emulada)

| Página | Mobile | Desktop | A11y | BP | SEO | CLS |
|---|---|---|---|---|---|---|
| Home | 93–94 | 100 | 100 | 100 | 100 | 0 |
| Case (telma-santos) | 92 | 100 (99–100 entre rodadas) | 100 | 100 | 100 | 0 |
| Contato | 95 | 99 | 100 | 100 | 100 | 0 |
| Serviços | 97 | 100 | 100 | 100 | 100 | 0 |

## Riscos

- Os tipos móveis no WebKit headless a 1440 px ficam em cerca de 30 ms por quadro com o cursor em movimento (sem software GPU). No Safari real, o canvas é acelerado. O canvas pausa fora da tela e não roda no toque nem em reduced-motion.
- Navegadores sem `document.startViewTransition` (versões antigas) caem na cortina normal. O morph foi verificado em Chromium, WebKit e Firefox.
- A ficha carimbada e a régua dependem de `animation-timeline`. Sem ele (Firefox), a ficha fica parada.

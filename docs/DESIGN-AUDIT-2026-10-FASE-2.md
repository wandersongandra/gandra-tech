# Auditoria de design — fase 2 (outubro de 2026)

Continuação de `DESIGN-AUDIT-2026-10.md`. Escopo: todas as rotas (serviços,
cases, páginas legais, 404) em 1440, 1280, 768, 390 e 360 px; fotos dos
projetos; textos dos cases; novos efeitos na linguagem Matéria.

## Bugs corrigidos

| # | Problema | Causa | Correção |
|---|---|---|---|
| 1 | Menu mobile abria mas os links não respondiam ao toque | `backdrop-filter` no header virava bloco de contenção do painel `position: fixed` | Vidro movido para `.m-header::before` |
| 2 | Links do menu só aceitavam toque ~0,6s depois de abrir | `clip-path` animado no próprio diálogo | Cortina anima num `::before`; links entram com opacidade |
| 3 | `/#trabalhos` vindo de outra página caía no topo da home | Rolagem nativa antes de o pin do GSAP existir | `HashScroll` espera `gt:works-ready`/fontes e rola com offset do header |
| 4 | Cortina de entrada nunca tocava; só a saída aparecia | `next/link` chama `preventDefault` antes do listener (fase de bolha) | Listener em captura; links com `data-curtain` e nome real do destino |
| 5 | Fotos retrato (Telma) cortadas na cabeça em molduras largas | Um único `object-fit: cover` para tudo | Pipeline com direção de arte (foco, tom, palco) por imagem |
| 6 | Palavras do scrub reprovavam contraste (Acessibilidade 96 no case) | Opacidade 0,16 aplicada no carregamento | Scrub só é armado a uma tela de distância |
| 7 | Onda do GANDRA rodava layout a 30 fps desde o primeiro quadro no celular | Loop iniciado na montagem | Começa 1,2s após o `load` em toque |
| 8 | Lenis baixado também no celular | Import estático | Import dinâmico, só desktop |
| 9 | ~32 KB de CSS morto (pv-*, work-item, hero antigo) | Restos de versões anteriores | Removido (CSS 103,6 KB → 78,9 KB) |
| 10 | Componentes mortos (HeroParticles, ChaosMode, CardStack, CustomCursor…) | — | Apagados |

`Production Security Check` (cron): a falha de 26/10 22:39 UTC era anterior
ao merge do PR #45 — produção sem header CSP. `scripts/check-production.mjs`
passa contra produção hoje (17 URLs).

## Imagens

- `scripts/optimize-images.mjs`: AVIF + WebP em 480/768/1080/1440/1920
  (limitado à largura da origem), 88 arquivos, 3,9 MB; gera
  `lib/media.generated.ts` com dimensões e cor de fundo.
- `components/materia/Picture.tsx`: `<picture>` com `sizes`, `width/height`
  (CLS 0), `fetchpriority` na capa.
- `lib/media.ts`: foco e tom por foto. Retratos e telas de UI vão para um
  "palco" com a cor real da foto; fotos de ambiente sangram a moldura.
- **Limite**: as originais da AJN têm 1100 px e a capa da Telma 1024 px. Em
  celulares 3x elas ficam abaixo da densidade ideal; só originais maiores
  resolvem.

## Textos

Revisados sem fatos novos: repetições em SGS e Telma, papel padronizado
como "Gandra Tecnologia", capítulo "Resultado" vira "Objetivo" quando o case
ainda não tem resultado medido. Pendente com o cliente: resultados reais de
SGS e Telma, ano do case Telma ("Atual"), originais em alta das fotos.

## Efeitos novos

- Página de case redesenhada: capa com profundidade, ficha técnica,
  capítulos com scrub, galeria com proporção real, final em tinta.
- Cortina de navegação com o nome do destino subindo por máscara.
- Próximo case com a foto dentro das letras.
- Rastro de tinta vermilion (case e contato), ondulação SVG nas fotos dos
  cards, grão do papel animado (desktop).
- Letras do rodapé que caem com gravidade e podem ser arremessadas.

Tudo respeita `prefers-reduced-motion` e ponteiro grosso.

## Números (build local)

| Lighthouse | Home antes | Home depois | Case antes | Case depois |
|---|---|---|---|---|
| Performance mobile | 89 | 90–91 | 88 | 91 |
| Acessibilidade | 100 | 100 | 100 | 100 |
| Boas práticas / SEO | 100 / 100 | 100 / 100 | 100 / 100 | 100 / 100 |
| LCP mobile | 3,5 s | 3,5 s | 3,8 s | 3,5 s |
| CLS | 0 | 0 | 0 | 0 |
| Performance desktop | 100 | 100 | 100 | 100 |

O LCP observado é igual ao FCP (~0,3 s sem throttling); o 3,5 s é a
estimativa simulada do Lighthouse, dominada pelo JavaScript do framework.

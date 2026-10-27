# Auditoria de design — gandra.tech (outubro/2026)

Base auditada: `main@985f27b` (produção em gandra.tech) e o mesmo build servido localmente.
Ferramentas: Playwright (Chrome, 1440×900 e 390×844, com e sem `prefers-reduced-motion`), axe-core (WCAG 2.2 AA), Lighthouse 12 (mobile e desktop) e leitura do código.

## Principais problemas encontrados

| # | Problema | Impacto | Status no redesign |
|---|----------|---------|--------------------|
| 1 | Produção sem `Content-Security-Policy`: a linha do `_headers` passava de 2.000 caracteres e o Cloudflare Pages a descartava sem aviso | Segurança | Corrigido (CSP por rota, commit `65b3bdc`) |
| 2 | `* { cursor: none !important }` em ponteiro fino escondia o mouse sem desenhar substituto: no desktop o cursor simplesmente sumia | Usabilidade crítica | Corrigido: cursor nativo volta; o `StudioCursor` só acrescenta uma etiqueta sobre links marcados |
| 3 | Estética genérica: nebulosa escura, partículas, orbe roxo/azul e brilhos — o visual de "site feito por IA" | Identidade | Substituído pelo sistema Matéria |
| 4 | Três famílias tipográficas disputando atenção e rótulos de 11px | Hierarquia e legibilidade | Uma família variável (Archivo) + itálico de acento + mono técnico em 12px |
| 5 | Contêiner estreito (1200px), h2 quebrando em 5 linhas, manifesto em `opacity: 0` antes do JS e grade 2×2 sem ritmo | Composição | Grade de 1360–1680px, títulos curtos, manifesto legível sem JS, trabalhos em scroll horizontal fixado |
| 6 | A mesma frase de SEO repetida 3 vezes na home | Conteúdo | Cada seção com texto próprio, reaproveitando apenas cópia real do repositório |
| 7 | Efeitos desconectados (blur reveal, glitch na cortina, grão animado repintando a tela) e conteúdo oculto sem JS | Coerência e performance | Um vocabulário único de movimento (máscara, largura variável, scrub); tudo visível sem JS |
| 8 | 2 violações de contraste no axe e anel de foco fraco | Acessibilidade | 0 violações; foco de 2px na cor de sinal (3,38:1 no papel) |
| 9 | LCP mobile de 3,8s puxado pelo blob WebGL e pelas partículas no primeiro quadro | Performance | WebGL só no laboratório, montado sob demanda; LCP 3,5s e TBT de 270→80ms. Depois, a pedido do cliente, o laboratório 3D saiu do site e a home ficou sem WebGL |
| 10 | Links do cabeçalho em tom periwinkle e faixa de clientes pequena demais | Acabamento | Cabeçalho com barra de progresso, CTA e menu mobile em tela cheia |

## Números (build local, mesmo servidor com gzip)

| Lighthouse | Antes (mobile) | Depois (mobile) | Antes (desktop) | Depois (desktop) |
|---|---|---|---|---|
| Performance | 82 | 91 | 99 | 100 |
| Acessibilidade | 100 | 100 | 96 | 100 |
| Boas práticas | 100 | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 | 100 |
| LCP | 3,8 s | 3,5 s | 0,7 s | 0,7 s |
| CLS | 0,011 | 0 | 0,001 | 0 |
| TBT | 270 ms | 80 ms | 10 ms | 0 ms |

axe (7 rotas × 2 viewports): 2 violações de contraste antes, 0 depois.

## Direção escolhida

**Matéria — "Movimento é matéria."** Ver `docs/DESIGN-SYSTEM.md`.

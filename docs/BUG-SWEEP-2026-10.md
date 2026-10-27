# Caça a bugs — outubro de 2026

Escopo: **somente correções** (nenhuma feature, efeito ou mudança visual). Base: `main` em `66b90ed`;
branch `fix/bug-sweep-2026-10`. Produção auditada: `https://www.gandra.tech` (e apex).

## Como foi verificado

- **Rotas e retornos** — 16 rotas exportadas + 404 + `/offline`: status, `<title>`, canonical,
  description, robots, `og:url`/`og:image`, um `<h1>` por página, CSP por rota; todos os links
  internos encontrados no crawl (200, exceto `/cdn-cgi/l/email-protection`, ver N1).
- **Cliques** — todos os `a[href]` e `button` de cada página (header, menu mobile, rodapé, cards,
  breadcrumbs, “próximo case”, voltar ao topo, botão de som, copiar e-mail) em Chromium e Firefox
  desktop (1440×900), Chromium e WebKit mobile (iPhone 13) e WebKit/Chromium tablet: URL de destino,
  âncora, cortina, rolagem travada, erros de página.
- **Modos** — sem JavaScript, `prefers-reduced-motion`, carga direta com âncora (`/#trabalhos`),
  voltar/avançar, recarregar, navegação rápida repetida, teclado (skip link, Esc no menu).
- **Robustez** — console/CSP/rede, hidratação (relógio adiantado), vazamento de listeners/nós em
  navegação longa, service worker (precache, offline, versão de cache).
- **Qualidade** — lint, typecheck, testes, build + `scripts/visual-qa.cjs`, Lighthouse mobile.

Evidências (fora do repositório, que é público): `/workspace/gandra-audit/bugs2/`.

## Bugs encontrados e corrigidos

| # | Sev. | Página | O que acontecia | Correção |
|---|------|--------|-----------------|----------|
| B1 | Média | todas (offline) | O Pages responde `/offline.html` com **308 → `/offline`**. O SW guardava essa resposta com `redirected: true` e o navegador recusa servi-la a uma navegação: offline, abrir uma página ainda não visitada dava `net::ERR_FAILED` (tela de erro do Chrome) em vez da página “conexão indisponível”. | `public/sw.js`: precache próprio (`fetch` + `withoutRedirect`) no lugar de `cache.addAll`, e o cache de navegação também recria a resposta sem o flag; versão `materia-2026-10-v3` limpa os caches antigos. Verificado no preview: `/trabalhos/telma-santos` offline → página offline (200); `/` e `/servicos` do cache. |
| B2 | Média | todas | O rodapé renderizava `new Date().getFullYear()`. O HTML é exportado no build; a partir de **01/01/2027** o cliente calcularia outro ano → **React #418 (hydration mismatch) em todas as páginas** e re-render completo da árvore. Reproduzido com relógio do navegador em 2027-01-03. | `components/Footer.tsx`: ano do build (`siteLastModified`) no SSR e na hidratação; o ano corrente entra num efeito após montar. |
| B3 | Baixa/Média | `/contato` | O campo de glifos continuava desenhando depois de sair da página (ou com o host colapsado): `drawImage` com canvas 0×0 → erro não tratado (Chromium “width or height of 0”, Firefox “Passed-in canvas is empty”, WebKit “The object is in an invalid state”) a cada navegação a partir do contato. | `components/surreal/folio.ts`: flag `disposed`, `layout()` ignora host < 1 px, laço e callback de fontes param após a limpeza. |
| B4 | Média | home via header/menu “Trabalhos” | Clicando “Trabalhos” (`/#trabalhos`) a partir de uma página mais **curta** que a home (404, termos, privacidade, contato, /trabalhos) no desktop, a rolagem parava no meio da home (ex.: `y=776` vindo do 404, `y=1887` vindo de /trabalhos) em vez da seção. Causa: o Lenis remede a página com 250 ms de atraso e ainda usava o limite de rolagem da página anterior. | `lib/scroll.ts` e `components/ScrollMemory.tsx`: `lenis.resize()` antes de cada rolagem programática. Verificado em 5 origens: a seção fica a 65 px (altura do header) — antes/depois em `anchor-trabalhos-from-404-*.png`. |

### Testes de regressão adicionados

- `scripts-test.cjs`: SW usa `withoutRedirect` e não usa `cache.addAll`; `scrollToSection` chama
  `resize()` antes de `scrollTo`.
- `scripts/visual-qa.cjs` → `bugSweep()`: relógio no ano seguinte sem #418 e ano atualizado;
  `/#trabalhos` a partir de `/termos-de-uso` cai na seção; `/contato` com o host de glifos colapsado
  e navegando para fora sem `pageerror`.

## Encontrado e não corrigido (com motivo)

| # | Sev. | O quê | Por quê |
|---|------|-------|---------|
| N1 | Baixa | Sem JavaScript, o e-mail aparece como “[email protected]” e o link vai para `/cdn-cgi/l/email-protection` (404). | É o *Email Address Obfuscation* da zona Cloudflare reescrevendo o HTML. Desligar é configuração da conta/zona — decisão do dono. Com JS (≈100 % das visitas) o e-mail aparece normal. |
| N2 | Baixa | `www.gandra.tech` e `gandra.tech` respondem 200 (sem redirect); o canonical aponta para o apex. | Um redirect exige regra na Cloudflare (fora do escopo “sem mudar DNS/config”). O canonical já consolida para buscadores. |
| N3 | Info | `/404` e `/_not-found` respondem 200. | Comportamento do Cloudflare Pages para arquivos exportados; ambos têm `noindex`. Rotas inexistentes reais respondem 404. |
| N4 | Info | Na 404, duas metas `robots` (uma do Next, outra da página) e `og:url` herdado da home. | Ambas dizem `noindex`; a página não é indexada nem compartilhada. Mexer exigiria sobrescrever todo o `openGraph` da página. |
| N5 | Info | No preview `*.pages.dev`, o beacon do Web Analytics dá erro de CORS. | Só no domínio de preview (o beacon é configurado para gandra.tech). Em produção não ocorre. |

## Falsos positivos descartados

- “Pular para o conteúdo” não clicável com o mouse: o skip link só aparece com foco; por teclado
  (Tab → Enter → Tab) o foco entra no `<main>` em Chromium, Firefox e WebKit.
- `CURTAIN-STUCK` / `WRONG-URL` esporádicos no teste de cliques: lentidão da máquina de teste com 5
  navegadores em paralelo; repetido isoladamente, a cortina sai e a URL troca em todas as rotas.
- Ficha do case escondida sem JS (animação CSS por scroll, conteúdo continua no DOM), imagens de
  prévia dos serviços (só no hover), aviso de “scroll-linked positioning” do Firefox, botão “Som”
  “ausente” (índice do teste; o botão existe e alterna `aria-pressed` em todas as páginas).

## Resultados

- lint, typecheck, test, build (CSP: 16 rotas + fallback, 25 hashes) e `visual-qa.cjs` — verdes.
- Lighthouse mobile da home (3 execuções, máquina quieta): produção **88 / 93 / 93**, preview
  **93 / 92 / 93**; CLS ≈ 0 (0,0001) no preview; acessibilidade 100.

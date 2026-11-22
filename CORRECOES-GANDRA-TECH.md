# Correções Gandra Tech

Retomada da auditoria visual, SEO, conversão e código em 22/11/2026, no
branch `fix/auditoria-2026-11`. Este registro cobre o trabalho continuado a
partir do SEO-03; não representa publicação em produção.

## Implementado

- SEO-03: `public/llms.txt` passou a ser gerado do catálogo real, com os cinco
  cases, Vespasiano/Grande BH, formulário de orçamento e limites editoriais.
- SEO-05: JSON-LD de serviços e trabalhos passou a usar `siteUrl`.
- SEO-06: removida a repetição dos nós `Service` no JSON-LD da coleção de
  serviços; as páginas individuais continuam com seu schema e FAQ.
- SEO-07: adicionados `app/manifest.ts` e `themeColor` responsivo no viewport.
- UX-04/UX-05: o formulário é o caminho principal de `/contato`, o e-mail
  virou alternativa discreta e o FAQ aponta para o formulário atual.
- CONV-06/CONV-08: SGS declara a relação confirmada como produto próprio; as
  notas abstratas de contato foram substituídas por orientações práticas.
- A11Y-06: o QA visual foi repetido depois da tipografia mínima passar a 12 px.
- CONV-02: WhatsApp ativado com o número comercial confirmado; os CTAs
  condicionais, o telefone no JSON-LD e o aviso de canal na política de
  privacidade acompanham a configuração.
- CONV-05: prazo de primeira resposta definido como `Respondo em até 1 dia útil`;
  o site continua sem prometer prazo de entrega ou faixa de investimento.
- UX-06: ano do case Telma Santos atualizado para `2026`, conforme confirmação
  do responsável.
- A11Y-07: no mobile, o rodapé reserva o espaço do botão fixo de som; o alvo
  continua com 44×44 px e não cobre o controle de letras nem o botão de voltar
  ao topo.
- PERF-05: em ponteiros coarse, `touch-action: pan-y` preserva a rolagem
  vertical nativa e deixa o gesto horizontal disponível para o pincel depois
  do limiar de direção; a seleção de texto e os controles continuam fora do
  pincel.
- CONV-04: criado o contrato opcional para métricas e depoimentos verificáveis,
  com renderização somente quando houver conteúdo autorizado e fonte indicada.
- COD-01: ESLint flat config com `eslint-config-next` (core web vitals e
  TypeScript), `jsx-a11y` e o lint estrutural existente. Foram corrigidos os
  erros encontrados, sem desabilitar as regras.
- COD-02: `lib/site-catalog.ts` virou fonte única para serviços, cases e rotas;
  a Function de leads, service worker, testes e validadores consomem o catálogo
  ou o JSON gerado no build.
- COD-04: removido `gsapNow`, que não tinha consumidores.
- COD-05: Node 22 documentado em `engines` e `.nvmrc`; o pacote passou a usar
  ESM explícito, eliminando os avisos `MODULE_TYPELESS_PACKAGE_JSON`.
- COD-06: removida a opção `images.qualities`, sem efeito com `unoptimized`.
- O gerador de CSP continua idempotente e o manifest é explicitamente
  `force-static` para o export do Next 16.

## Validação

Todos os checks abaixo foram executados no checkout local:

- `npm run lint` — `PASS` (ESLint + lint estrutural).
- `npm run typecheck` — `PASS`.
- `npm test` — `PASS`.
- `npm run build` — `PASS` (Next 16.4.6; 22 páginas estáticas, incluindo
  manifest).
- `npm run validate:build-security` — `PASS` (17 rotas, CSP por hash,
  headers fortes e nenhum artefato sensível).
- `npm run validate:seo` — `PASS` (14 rotas comerciais).
- `npm run audit` — `PASS`, 0 vulnerabilidades reportadas.
- QA real com Chromium no export local `http://127.0.0.1:4173` — `PASS` para
  desktop/mobile, reduced-motion, menu, carimbo, galeria, rotas e regressões.
- QA de conversão — `PASS` para serviço/case pré-selecionados, mensagem,
  fallback sem JavaScript, cópia e overflow desktop/mobile.
- QA coarse mobile — `PASS` para `touch-action: pan-y`, alvo do botão de som e
  ausência de sobreposição com os controles do rodapé.
- Checagem final no Chromium — `PASS` para WhatsApp, prazo de primeira resposta,
  telefone no JSON-LD, ano `2026` do case Telma e aviso de privacidade do canal.

### Antes × depois visual

As capturas pós-mudança estão em `qa-after/` (ignorado pelo Git). A comparação
foi feita no mesmo viewport de 390×844 ou 1440×900, no fim da rolagem. A segunda
passada da linha de base foi usada para medir o ruído natural da animação.

| Página | Baseline | Depois | Delta | Leitura |
| --- | ---: | ---: | ---: | --- |
| Home mobile | 9.815 px | 9.781 px | -34 px | reserva do alvo de som no rodapé |
| Home desktop | 11.431 px | 11.433 px | +2 px | estável |
| Contato mobile | 5.849 px | 6.047 px | +198 px | resposta, canal e reserva do alvo de som sem overflow |
| Contato desktop | 4.367 px | 4.211 px | -156 px | redução intencional do hero para priorizar o formulário |
| Case SGS mobile | 6.196 px | 6.343 px | +147 px | ficha técnica e reserva do alvo de som |
| Case SGS desktop | 7.610 px | 7.614 px | +4 px | estável |
| Serviço mobile | 6.020 px | 6.088 px | +68 px | reserva do alvo de som no rodapé |
| Serviço desktop | 5.696 px | 5.705 px | +9 px | estável |

O diff RGB das capturas finais variou de 3,18% a 13,02% de pixels acima do
limiar de comparação; a faixa maior no mobile inclui o espaço reservado para o
alvo fixo de som no rodapé, além da nova hierarquia do contato, prazo de
resposta, canal alternativo, FAQ e ficha do SGS. O QA comportamental e o
overflow passaram; não foi tratado como prova de identidade pixel a pixel.

## Pendências e limites

- CONV-04 — `BLOCKED POR DADOS`: faltam métricas, depoimentos autorizados,
  fonte de cada número, bloco do responsável e URLs sociais reais. Nenhuma
  prova foi fabricada.
- PERF-05: mitigação implementada. A equivalência pixel a pixel entre engines
  de toque continua não sendo uma propriedade garantível do navegador.
- Produção, DNS, deploy e recebimento real de lead: `NÃO VERIFICADO` nesta
  retomada; a validação executada foi local.

## Git/Produção

commit: NÃO REALIZADO
push: NÃO REALIZADO
PR: NÃO ABERTO
deploy: NÃO REALIZADO

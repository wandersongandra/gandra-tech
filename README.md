# Gandra Tecnologia

Site institucional e vitrine de produtos da **Gandra Tecnologia**, construído com foco em direção visual, motion design, interação e apresentação de soluções digitais.

O projeto utiliza **Next.js 16**, **React 19** e **TypeScript**, com animações baseadas em **GSAP** e navegação/scroll refinados com **Lenis**.

## Estrutura da experiência

A página principal é organizada em blocos independentes e reutilizáveis:

- `Hero` — apresentação principal da marca;
- `Services` — sites institucionais, portfólios profissionais, sistemas sob medida, automações e aplicações web;
- `WorkList` — trabalhos e soluções em evidência;
- `Manifesto` — posicionamento e visão da marca;
- `Contact` — contato e conversão;
- `Marquee`, `ScrollThread` e `CardStack` — camadas de movimento e narrativa visual.

O portfólio publicado atualmente contém somente dois projetos reais:

- **SGS — Sistema de Gestão de Segurança**;
- **Portfólio Telma Santos**.

O SGS é apresentado como um dos trabalhos selecionados, com página própria e detalhes do produto.

A página `/servicos` detalha os cinco serviços públicos da empresa: sites institucionais,
portfólios profissionais, sistemas sob medida, automações e aplicações web. O site também publica
`/robots.txt`, `/sitemap.xml` e `/llms.txt` com o domínio canônico `https://gandra.tech`.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 |
| UI | React 19 |
| Linguagem | TypeScript 5 |
| Motion | GSAP 3 |
| Smooth scroll | Lenis |
| Testes de navegador | Playwright |

## Desenvolvimento local

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Next.js no terminal.

## Validação local

```bash
npm run lint
npm run typecheck
npm test
npm run audit
npm run build
npm run validate:build-security
```

Para verificar o domínio publicado sem alterar nada:

```bash
npm run check:production
```

## Checklist de Lançamento (Ações Manuais)

Estas etapas são executadas nos painéis da Cloudflare e do Google após o push para a branch `main`.

### 1. Revisar robôs de IA no WAF da Cloudflare

1. Abra o painel da Cloudflare, selecione o domínio `gandra.tech` e entre em **Security > WAF > Custom rules**.
2. Preserve o acesso dos crawlers de descoberta `Googlebot`, `Bingbot`, `OAI-SearchBot`, `PerplexityBot`, `Claude-SearchBot`, `Applebot`, `DuckAssistBot`, `ChatGPT-User`, `Perplexity-User`, `Claude-User`, `Manus Bot` e `MistralAI-User`, preferindo sinais de bot verificado quando disponíveis.
3. Não libere `GPTBot`, `ClaudeBot`, `CCBot`, `Bytespider`, `Amazonbot`, `meta-externalagent`, `Google-Extended` ou `Applebot-Extended`: eles permanecem bloqueados pela política do projeto e pelo `robots.txt`.
4. Salve somente regras específicas e confirme nos eventos do WAF que não há impacto em usuários legítimos. Não use uma exceção ampla para todo o tráfego.

> A regra do WAF não substitui o `robots.txt`. Se a Cloudflare estiver gerenciando o arquivo para bloquear crawlers de IA, revise essa configuração separadamente em **Settings > Bots > Managed robots.txt** antes de considerar a liberação concluída.

### 2. Verificar o domínio e enviar o sitemap no Google Search Console

1. Acesse o [Google Search Console](https://search.google.com/search-console) e escolha **Adicionar propriedade**.
2. Selecione **Domínio**, informe `gandra.tech` e copie o registro TXT de verificação fornecido pelo Google.
3. No painel da Cloudflare, abra **DNS > Records > Add record**, selecione **TXT**, use `@` no campo de nome e cole o valor completo fornecido pelo Google. Mantenha o TTL automático e salve.
4. Volte ao Search Console e clique em **Verificar**. A propagação do TXT pode levar algum tempo; não remova o registro após a validação.
5. Na propriedade validada, abra **Sitemaps**, informe `sitemap.xml` e envie. O endereço esperado é `https://gandra.tech/sitemap.xml`.

### 3. Configurar o Cloudflare Email Routing para receber leads

1. No painel da Cloudflare, selecione `gandra.tech` e abra **Email > Email Routing**.
2. Ative o serviço, informe um endereço de destino que você controla e confirme a mensagem de verificação recebida nessa caixa.
3. Crie uma regra para o endereço personalizado `contato@gandra.tech`, encaminhando-a para o destino verificado.
4. Confirme que os registros DNS de email solicitados pelo Email Routing foram criados pela Cloudflare. Não mantenha registros MX conflitantes de outro provedor.
5. Envie um email de teste para `contato@gandra.tech` e confirme o recebimento no endereço de destino.

### 4. Confirmar o deploy no Cloudflare Pages

1. Abra **Workers & Pages**, selecione o projeto do site e entre em **Deployments**.
2. Confirme que o deploy mais recente da branch `main` terminou com status de sucesso e corresponde ao commit desta limpeza.
3. Acesse `https://gandra.tech/servicos` e `https://gandra.tech/llms.txt`. As duas URLs devem retornar HTTP 200 e exibir o conteúdo novo.
4. Se alguma URL não retornar 200, consulte os logs do deploy, confirme que a produção está ligada à branch `main` e aguarde a conclusão do build antes de alterar qualquer configuração.

## Build de produção

```bash
npm run build
npm run start
```

## Segurança e disponibilidade

As configurações de segurança, disponibilidade, limites do plano e pendências de painel estão em [SECURITY-CONFIG.md](SECURITY-CONFIG.md). O procedimento de contenção, análise de eventos, rollback e uso controlado da API está em [INCIDENT-RESPONSE.md](INCIDENT-RESPONSE.md). A revisão mensal está em [SECURITY-CHECKLIST.md](SECURITY-CHECKLIST.md), e o relatório da execução está em [SECURITY-HARDENING-REPORT.md](SECURITY-HARDENING-REPORT.md).

O código já contém headers de segurança, HSTS, CSP em enforcement, política de crawlers, validação do export, CI com audit moderado e workflow CodeQL. A proteção da `main`, Dependabot, Secret Scanning e Push Protection estão habilitados no GitHub. DDoS padrão, WAF, rate limiting, cache gerenciado, Always Online, DNSSEC, Email Routing e uptime externo ainda exigem confirmação no painel; não são considerados ativos apenas por estarem documentados.

O script `scripts/cloudflare-emergency.mjs` não executa nada sem `CF_ZONE_ID`, `CF_API_TOKEN` e `--confirm`. Nunca versione tokens nem execute bloqueios sem evidência do incidente.

Os workflows de CI usam `npm ci --ignore-scripts`, validam o export estático e executam lint, typecheck, testes, audit moderado, Gitleaks e CodeQL. Novos assets devem continuar sendo otimizados antes do commit com `npm run optimize:images`.

## Estrutura principal

```text
app/          rotas e composição da aplicação
components/   seções, componentes e sistema de motion
docs/         documentação do projeto
lib/          utilitários e código compartilhado
public/       imagens e assets estáticos
```

## Projetos publicados

**SGS — Sistema de Gestão de Segurança**  
Plataforma SaaS B2B multi-tenant para gestão de Saúde e Segurança do Trabalho.

- Produto: https://app.sgsseguranca.com.br
- Repositório: https://github.com/wandersongandra/sgsseguranca

**Portfólio Telma Santos**
Projeto de portfólio desenvolvido para apresentar trabalho, identidade visual e serviços.

Os dados dos projetos ficam em `lib/projects.ts`. Cada entrada declara explicitamente o
`workImage` da lista e as imagens `coverImage` e `mainImage` da página de detalhe.

## Páginas jurídicas

As páginas internas de [Termos de Uso](/termos-de-uso) e [Política de Privacidade](/politica-de-privacidade)
usam o componente compartilhado `components/LegalContainer.tsx`. Elas têm `noindex` e ficam
fora do sitemap público por serem documentos legais internos.

## Como adicionar um novo projeto

1. Confirme que o projeto é real e que os textos e imagens podem ser publicados.
2. Adicione a entrada em `lib/projects.ts` com slug, conteúdo e os três caminhos de imagem.
3. Coloque os assets válidos em `public/images/projects/<slug>/`.
4. Otimize os novos PNGs antes do commit com `npm run optimize:images` e confirme que as dimensões foram preservadas.
5. Execute `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
6. Verifique a página de trabalhos, a rota de detalhe, o sitemap e os principais viewports.

O script de otimização converte os assets SGS definidos em `scripts/optimize-images.mjs`
para WebP com qualidade 84. Ao adicionar novos assets, atualize a lista do script,
execute a conversão e aponte o catálogo para os arquivos WebP antes de criar o commit.

---

**Gandra Tecnologia** — software, produtos digitais e experiências tecnológicas.

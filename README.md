# Gandra Tecnologia

Site institucional da Gandra Tecnologia, construído com Next.js 16, React 19,
TypeScript, GSAP e Lenis. Produção em <https://gandra.tech>

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js 16 |
| UI | React 19 |
| Linguagem | TypeScript 5 |
| Motion | GSAP 3 |
| Smooth scroll | Lenis |
| Testes de navegador | Playwright |

## Desenvolvimento local

    npm install
    npm run dev

Abra o endereço exibido pelo Next.js no terminal.

## Validação local

    npm run lint
    npm run typecheck
    npm test
    npm run audit
    npm run build
    npm run validate:build-security

Para verificar o domínio publicado sem alterar nada:

    npm run check:production

## Estrutura

    app/          rotas e composição da aplicação
    components/   seções, componentes e sistema de motion
    docs/         documentação técnica, segurança e assets
    lib/          conteúdo e configuração (projects, services, faq, legal, seo)
    public/       imagens, ícones, llms.txt e _headers
    scripts/      utilitários de build
    .github/      workflows de CI, CodeQL e Dependabot

## Páginas

A página principal é organizada em seções reutilizáveis: Hero, Services,
WorkList, Manifesto e Contact. A página `/servicos` detalha os cinco serviços
da empresa. O portfólio está em `/trabalhos` com páginas individuais por case.

O site publica `/robots.txt`, `/sitemap.xml` e `/llms.txt`.

## Como adicionar um novo projeto

1. Confirme que o projeto é real e que textos e imagens podem ser publicados.
2. Adicione a entrada em `lib/projects.ts` com slug, conteúdo e os três
   caminhos de imagem (workImage, coverImage, mainImage).
3. Coloque os assets válidos em `public/images/projects/<slug>/`.
4. Otimize os novos PNGs antes do commit com `npm run optimize:images` e
   confirme que as dimensões foram preservadas.
5. Execute `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
6. Verifique a página de trabalhos, a rota de detalhe, o sitemap e os
   principais viewports.

O script de otimização converte assets para WebP com qualidade 84. Ao
adicionar novos assets, atualize a lista em `scripts/optimize-images.mjs`,
execute a conversão e aponte o catálogo para os arquivos WebP antes do commit.

## Projetos publicados

**SGS — Sistema de Gestão de Segurança**
Plataforma SaaS B2B multi-tenant para gestão de Saúde e Segurança do Trabalho.

- Produto: <https://app.sgsseguranca.com.br>
- Repositório: <https://github.com/wandersongandra/sgsseguranca>

**Portfólio Telma Santos**
Projeto de portfólio desenvolvido para apresentar trabalho, identidade visual
e serviços.

## Páginas jurídicas

Termos de Uso e Política de Privacidade usam o componente compartilhado
`components/LegalContainer.tsx`. Têm noindex e ficam fora do sitemap público.

## Qualidade e publicação

Todo pull request executa lint, typecheck, test, build, audit moderado,
Gitleaks e CodeQL. Merge exige checks verdes e conversa resolvida. A branch
main é protegida: sem push direto, sem force push. Merge em main dispara
build e publicação automáticos no Cloudflare Pages. Rollback pelo painel do
Pages, em Deployments, escolhendo a versão anterior estável.

Commits seguem convenção semântica: feat, fix, chore, docs, refactor.

## Segurança e Infraestrutura

As políticas e procedimentos de segurança ficam separados das pendências que
exigem configuração no GitHub, Cloudflare, registrador ou provedor de email:

- [SECURITY.md — políticas gerais](docs/SECURITY.md)
- [Configuração de segurança — SECURITY-CONFIG.md](docs/security/configuration.md)
- [Resposta a incidentes — INCIDENT-RESPONSE.md](docs/security/incident-response.md)
- [PANEL-TASKS.md — pendências de painel](PANEL-TASKS.md)

## Segurança

Headers de segurança vivem em `public/_headers`. Políticas, procedimentos
de contenção, análise de eventos, rollback e revisão mensal estão em
[docs/SECURITY.md](docs/SECURITY.md), [docs/security/configuration.md](docs/security/configuration.md),
[docs/security/incident-response.md](docs/security/incident-response.md) e
[docs/security/checklist.md](docs/security/checklist.md). Não versione segredos,
tokens ou arquivos de ambiente. O push protection do GitHub bloqueia credenciais
conhecidas.

## Licença e propriedade

Copyright Gandra Tecnologia. Todos os direitos reservados. Os cases
publicados pertencem aos respectivos clientes e são exibidos com autorização.
Código disponível para consulta, sem licença de uso comercial.

## Contato

<contato@gandra.tech>


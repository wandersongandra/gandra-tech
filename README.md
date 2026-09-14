# Gandra Tecnologia

Site institucional e vitrine de produtos da **Gandra Tecnologia**, construído com foco em direção visual, motion design, interação e apresentação de soluções digitais.

O projeto utiliza **Next.js 16**, **React 19** e **TypeScript**, com animações baseadas em **GSAP** e navegação/scroll refinados com **Lenis**.

## Estrutura da experiência

A página principal é organizada em blocos independentes e reutilizáveis:

- `Hero` — apresentação principal da marca;
- `FeaturedProduct` — destaque para o SGS — Sistema de Gestão de Segurança;
- `WorkList` — trabalhos e soluções em evidência;
- `Manifesto` — posicionamento e visão da marca;
- `Contact` — contato e conversão;
- `Marquee`, `ScrollThread` e `CardStack` — camadas de movimento e narrativa visual.

O portfólio publicado atualmente contém somente dois projetos reais:

- **SGS — Sistema de Gestão de Segurança**;
- **Portfólio Telma Santos**.

O SGS é apresentado como produto em destaque, com mockup, conteúdo institucional e animações acionadas por scroll.

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
```

## Build de produção

```bash
npm run build
npm run start
```

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
4. Execute `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.
5. Verifique a página de trabalhos, a rota de detalhe, o sitemap e os principais viewports.

---

**Gandra Tecnologia** — software, produtos digitais e experiências tecnológicas.

# Imagens do site

Os componentes têm fallback listrado para desenvolvimento, mas os assets declarados no
catálogo devem existir antes de uma publicação.

## Por projeto — imagens reais

Os projetos publicados são definidos em `lib/projects.ts`. Cada entrada declara os
caminhos de imagem usados pela lista, pelo hero e pela galeria da página de detalhe.

Os assets de detalhe ficam em `images/projects/<slug>/`. O `workImage` pode apontar para
outro caminho local, conforme declarado no catálogo:

| campo | proporção | tamanho sugerido | onde aparece |
|---|---|---|---|
| `workImage` | 4:3 recomendado | conforme a fonte | lista da home e arquivo de trabalhos |
| `coverImage` | fonte livre; recorte 21:9 no hero | largura mínima 1600px | topo da página do projeto |
| `mainImage` | 4:3 recomendado | conforme a fonte | imagem de destaque da galeria |
| `gallery[].src` | 4:3 recomendado | conforme a fonte | galeria visual do projeto |

## Home

| arquivo | proporção | tamanho sugerido | onde aparece |
|---|---|---|---|
| `workImage` | — | — | caminho declarado para a lista de trabalhos |

## Regras que evitam retrabalho

**Largura mínima.** O container da lista de trabalhos exibe ~460px CSS, que em
tela retina vira ~920px reais. Exportar abaixo disso borra — não há como
recuperar resolução depois.

As imagens dos cases devem ser registros reais do produto, da equipe, da
operação ou do conteúdo publicado pelo cliente. Quando o projeto não tiver uma
captura de interface disponível, use uma fotografia autorizada do próprio
contexto do case e descreva a origem em `visualNote`.

Os arquivos antigos em SVG permanecem no repositório para histórico e fallback,
mas não são mais usados no catálogo visual atual.

**Qualidade.** Screenshots de UI com texto miúdo usam `quality={95}`; o padrão
75 do Next borra. Valores permitidos ficam em `next.config.ts` →
`images.qualities` (Next 16 rejeita silenciosamente o que não estiver lá).

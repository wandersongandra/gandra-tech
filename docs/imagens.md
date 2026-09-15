# Imagens do site

Todas opcionais: quando o arquivo não existe, o componente cai num
placeholder listrado e o layout continua de pé.

## Por projeto — 3 imagens

Os projetos publicados são definidos em `lib/projects.ts`. Cada entrada declara os
caminhos de imagem usados pela lista e pela página de detalhe.

Os assets de detalhe ficam em `images/projects/<slug>/`. O `workImage` pode apontar para
outro caminho local, conforme declarado no catálogo:

| campo | proporção | tamanho sugerido | onde aparece |
|---|---|---|---|
| `workImage` | — | — | lista da home e arquivo de trabalhos |
| `coverImage` | 21:9 | 2100×900 | topo da página do projeto |
| `mainImage` | 2:1 | 1920×960 | corpo da página do projeto |

## Home

| arquivo | proporção | tamanho sugerido | onde aparece |
|---|---|---|---|
| `workImage` | — | — | caminho declarado para a lista de trabalhos |
| `manifesto/campo.png` | — | — | seção manifesto |

## Regras que evitam retrabalho

**Largura mínima.** O container da lista de trabalhos exibe ~460px CSS, que em
tela retina vira ~920px reais. Exportar abaixo disso borra — não há como
recuperar resolução depois.

**Fundo transparente** nos mockups de `work/`: eles são
compostos sobre o papel bege da seção. Um fundo opaco aparece como retângulo
recortado.

**Qualidade.** Screenshots de UI com texto miúdo usam `quality={95}`; o padrão
75 do Next borra. Valores permitidos ficam em `next.config.ts` →
`images.qualities` (Next 16 rejeita silenciosamente o que não estiver lá).

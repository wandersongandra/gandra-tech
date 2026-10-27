# Sistema Matéria

Folha principal: `app/materia.css` (carregada depois de `app/globals.css`).

## Ideia

A tipografia é o material. Os eixos variáveis da Archivo (largura 62–125 e peso 100–900) respondem ao cursor e ao scroll: a palavra **GANDRA** no hero e **Gandra.tech** no rodapé ganham massa perto do cursor e se comprimem longe dele. Em volta disso, uma grade suíça com anotações em mono, como num desenho técnico, e uma única cor de sinal.

O que fica de fora de propósito: neon, gradientes roxo/azul, partículas, fotos de banco e jargão.

## Cores

| Token | Valor | Uso | Contraste |
|---|---|---|---|
| `--m-paper` | `#ece8df` | fundo | — |
| `--m-paper-2` | `#e2ddd1` | superfícies | — |
| `--m-ink` | `#12110e` | texto, seções escuras | 15,4:1 no papel |
| `--m-signal` | `#e5401a` | gráfico, texto grande, foco | 3,38:1 no papel · 4,57:1 na tinta |
| `--m-signal-ink` | `#b3300e` | texto pequeno de acento sobre papel | 5,13:1 |
| `--m-muted` | `#5a554d` | texto secundário no papel | 6,04:1 |
| `--m-muted-dark` | `#a39d92` | texto secundário na tinta | 7,01:1 |

## Tipografia (auto-hospedada via `next/font`)

- **Archivo** (variável, `wght` + `wdth`): tudo — títulos com peso 540 e largura 86%.
- **Instrument Serif itálico**: apenas a palavra de acento de cada título (`<em>`).
- **JetBrains Mono**: rótulos, índices e metadados (12px, caixa alta).

## Movimento

| Peça | Arquivo | Comportamento | Movimento reduzido |
|---|---|---|---|
| Palavra cinética | `components/motion/KineticWordmark.tsx` | largura/peso por proximidade do cursor (gaussiana); onda lenta no toque; compressão no scroll; letras posicionadas só por `transform` (CLS 0) | estática |
| Revelação por máscara | `components/materia/SplitWords.tsx` | palavras sobem dentro de uma máscara (CSS) | sem animação |
| Faixa de projetos | `components/materia/ClientMarquee.tsx` | velocidade, sentido e inclinação seguem o scroll | lista estática |
| Serviços | `components/sections/Services.tsx` | linha preenche com tinta, prévia do case acompanha o cursor | sem prévia |
| Trabalhos | `components/sections/WorkList.tsx` | ≥1024px: seção fixada com scroll horizontal, recorte e parallax por card | grade vertical |
| Manifesto | `components/sections/Manifesto.tsx` | palavras acendem com o scroll (piso de 0,42 para manter contraste) | texto pleno |
| Processo | `components/sections/Process.tsx` | linha desenha e etapas acendem | estático |
| Cursor | `components/motion/StudioCursor.tsx` | cursor nativo + etiqueta em `[data-cursor]` | desligado |

Regras: tudo é legível sem JS; nenhum efeito roda fora da tela (IntersectionObserver e `visibilitychange`); efeitos de ponteiro só com `(hover: hover) and (pointer: fine)`; Lenis fica desligado em movimento reduzido, mobile e ponteiro grosso. A preferência é lida por `components/motion/useMotion.ts`.

## Acessibilidade

Foco visível de 2px em `--m-signal`; as palavras cinéticas são `aria-hidden` (o nome real está no `h1` e nos links); a faixa de projetos tem uma lista `sr-only`; o menu mobile mantém o diálogo com trap de foco e fecha com Esc.

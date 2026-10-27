# Lista de projetos e convite para o site no ar (outubro de 2026)

## O que mudou

### Home — "(02) Trabalhos selecionados"
- As imagens grandes em trilho horizontal deram lugar a um **índice tipográfico**: número, nome do projeto em destaque, tipo, ano e domínio do site no ar.
- A linha inteira é um link para o **case** (`/trabalhos/<slug>`). O site do cliente não abre direto da home: o visitante conhece o processo primeiro.
- Em desktop com mouse, passar sobre a linha mostra uma prévia pequena do site (decorativa, `aria-hidden`). Com movimento reduzido ou tela de toque a prévia não é carregada.
- Saíram o pin horizontal e a barra de progresso; a seção ficou mais leve e funciona igual no celular.

### Case — "Veja o site funcionando."
- Novo bloco após a galeria, antes do encerramento, convidando a abrir o site do cliente:
  "Este case conta o processo e as decisões. O resultado está publicado: abra o site e navegue como qualquer visitante."
- Botão **Visitar o site** (`target="_blank" rel="noopener noreferrer"`, aviso "abre em nova aba" para leitores de tela), domínio escrito por extenso e captura do site em moldura de navegador + celular.
- O bloco só aparece quando o endereço foi verificado.

### Arquivo /trabalhos
- Os cards usam a captura do site quando existe (proporção 16:10, sem corte) e mantêm a foto real nos demais.
- Títulos dos cards passaram de `h3` para `h2` (ordem de títulos correta após o `h1`; Lighthouse acessibilidade 100).

## Endereços verificados (27/10/2026)

| Projeto | Endereço | Situação |
|---|---|---|
| AJN Consultoria e Engenharia | https://ajnengenharia.com.br/ | 200 |
| Telma Santos | https://www.telmaformadoraeducacional.com.br/ | 200 |
| Gisley Nunes Imóveis | https://www.gisleynunesimoveis.com.br/ | 200 (domínio sem www redireciona) |
| SGS Segurança | https://app.sgsseguranca.com.br/ | só tela de login; sem convite, a lista mostra "Plataforma com acesso restrito" |

## Fotos
- Capturas 2× dos sites no ar (desktop 1440×900 e celular 390×844) entram no pipeline AVIF/WebP (`scripts/optimize-images.mjs`) como `site-desktop` e `site-mobile`.
- Uso: prévia da lista, cards do arquivo e bloco "Veja o site funcionando".
- As fotos reais (retrato da Telma, imóvel da Gisley, equipe AJN) continuam como capa e galeria dos cases. O SGS mantém a captura real do painel.
- Ao atualizar um site de cliente, refaça as capturas e rode `npm run optimize:images`.

## Testes
- `scripts/visual-qa.cjs`: lista com 4 links para cases (sem `target`), domínio visível, prévias AVIF/WebP com dimensões, convite externo com `noopener noreferrer` e SGS sem convite.
- typecheck, lint, testes unitários, build e validação de segurança do build passando.

## Pendências com o cliente
- SGS: existe um endereço público (site institucional) para divulgar? Hoje só há a tela de login.
- Gisley: o destaque do site usa uma foto de banco de imagens ("imagem de referência"), visível na captura.

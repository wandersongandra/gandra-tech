# SEO e indexação — Gandra Tecnologia (09/11/2026)

## Evidência do Search Console

Propriedade observada: `sc-domain:gandra.tech`. Os dados de desempenho são da pesquisa na Web, período de três meses com dados disponíveis até 07/11/2026. O relatório de indexação foi atualizado em 05/11/2026, **antes** das melhorias publicadas em 09/11/2026.

| Métrica | Valor observado |
| --- | ---: |
| Cliques na pesquisa | 4 |
| Impressões | 46 |
| CTR | 8,7% |
| Posição média | 13 |
| URLs indexadas | 1 (home) |
| URLs conhecidas não indexadas | 16 |

Motivos das 16 URLs: 12 descobertas, mas não rastreadas/indexadas; 2 redirecionamentos; 1 alternativa com canonical adequado; 1 arquivo de fonte `.woff2` rastreado, mas não indexado. **A prioridade são as 12 páginas comerciais descobertas**; os outros motivos não indicam, por si, defeito em páginas indexáveis.

O sitemap `https://gandra.tech/sitemap.xml` estava processado, com 13 URLs encontradas, última leitura em 06/11/2026. A versão publicada em 09/11 contém 14 URLs comerciais, incluindo o Laboratório Dental Araújo. A diferença decorre da data da última leitura observada, não de uma falha confirmada do sitemap.

## Trabalho de código desta rodada

- Todos os serviços passam a ser acessíveis por links HTML semânticos no rodapé de **todas** as páginas comerciais, além dos links já existentes na home e na página de serviços.
- Os links do índice de serviços recebem textos âncora específicos por serviço.
- Quatro serviços que têm projetos relacionados mostram uma descrição factual do case e um link contextual. A área de automações permanece sem case forçado.
- A página de serviços comunica a base em Vespasiano (Grande BH) e o atendimento remoto nacional, sem promessas de posição no Google.
- O validador de export verifica os links internos em cada rota, o conteúdo contextual e os metadados existentes.

## Acompanhamento operacional — não realizado nesta PR

1. Conferir no Search Console uma nova leitura do sitemap após a publicação; se necessário, reenviar o sitemap já existente. Envio não garante indexação.
2. Inspecionar e priorizar a indexação de `/servicos`, `/servicos/sites-institucionais`, `/servicos/sistemas-sob-medida` e `/trabalhos/laboratorio-dental-araujo` (publicado recentemente). Usar a inspeção individual para distinguir rastreamento pendente de algum impedimento técnico novo.
3. Revisar a tendência de indexação após o próximo ciclo de rastreamento e comparar cliques, impressões, consultas não relacionadas à marca e páginas de entrada em períodos equivalentes. Não atribuir variação de curto prazo à PR sem dados suficientes.
4. Planejar conteúdo útil com demanda real (dúvidas de contratação, escolha de site versus sistema e processos de entrega), evitando páginas locais artificiais e números comerciais não comprovados.
5. Revisar presença empresarial local e referências de clientes somente com dados públicos/autorizados e sem avaliações ou backlinks fabricados.

## Limites da evidência

- A posição média 13 deriva de somente 46 impressões; não representa classificação para termos concorridos como “criação de sites em BH”.
- A indexação é decisão do Google. Melhores links internos e conteúdo contextual ajudam a descoberta e compreensão, mas **não garantem** rastreamento, posicionamento ou cliques.
- Nenhuma alteração de WAF, DNS, domínio, Search Console ou infraestrutura é aplicada por esta PR.

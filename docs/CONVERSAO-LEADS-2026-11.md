# Gandra Tech — jornada comercial (novembro de 2026)

## Objetivo

Fazer as páginas de serviços e cases conduzirem visitantes interessados a um
pedido de proposta claro, mantendo a identidade visual, os efeitos de tinta,
as animações, o export estático e a CSP existente.

## Rodada implementada: pedido de orçamento assistido

- Os principais CTAs comerciais da home, cabeçalho, lista de serviços, páginas individuais e
  cases apontam para `/contato#orcamento`.
- Páginas de serviço e cases levam a seleção de serviço conhecida por query
  string `?servico=<slug>`, validada contra o catálogo real após a hidratação.
- `/contato` tem preparação local de mensagem, com resumo do projeto, serviço,
  nome e contato, seguida de link `mailto:` e opção de copiar a mensagem.
- Não há coleta de dados no servidor, envio automático, promessa de resposta
  em prazo específico, preço fictício ou dependência nova.
- Sem JavaScript, os campos são desativados; o contato por e-mail continua
  disponível. A página mostra explicitamente que o envio não é automático.

## Limites

Essa etapa **não é um formulário de leads com backend**. Um visitante precisa
confirmar o envio no aplicativo de e-mail ou copiar a mensagem. Não é possível
contar pedidos efetivamente recebidos usando apenas esses links. O retorno de
uma campanha comercial deve ser avaliado com dados reais, sem inferir conversão
somente por cliques em CTA.

## Próximas prioridades comerciais

1. **Captação direta:** integrar um endpoint do Cloudflare Workers com proteção
   antispam, limites de requisição, validação server-side, consentimento e
   entrega de e-mail/CRM. Requer definição do destino de leads e credenciais
   da ferramenta de envio, sem armazenar dados sem uma política de retenção.
2. **Canal alternativo:** adicionar WhatsApp Business somente com número
   profissional confirmado e jornada de atendimento definida.
3. **Mensuração:** definir eventos de CTA e envio real, métricas de conversão
   por página e atribuição de origem com respeito à privacidade.
4. **Prova comercial:** acrescentar resultados, depoimentos e números somente
   quando os clientes autorizarem e houver evidências verificáveis.
5. **Acompanhamento:** revisar semanalmente consultas de busca, páginas de
   entrada, pedidos recebidos, qualificação e contratos fechados.

## Verificações

- `npm test`
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run validate:seo`
- `npm run validate:build-security`
- Browser QA novo: `node scripts/conversion-qa.cjs` na CI após o export.

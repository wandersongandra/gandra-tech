# Pendências de painel e infraestrutura

Este documento reúne tarefas que não podem ser resolvidas por código neste
repositório. Marque um item somente depois de aplicar a configuração no painel
correspondente e registrar a evidência da validação.

Situação verificada em 09/11/2026: a PR de segurança #63 foi incorporada à
`main` e publicada; o monitor remoto de produção passou. As duas regras WAF
amplas baseadas em `User-Agent` foram desabilitadas, a regra de rate limit
existente para `/api/lead` permaneceu ativa, cinco CNAMEs de e-mail passaram
para **Somente DNS** e o TLS mínimo foi elevado para **1.2**. Os detalhes e
as limitações estão em [`docs/security/audit-2026-11-09.md`](docs/security/audit-2026-11-09.md).

## DNS e infraestrutura

- [x] Desabilitar bypass WAF global por `User-Agent` e confirmar o rate limit
  específico de `/api/lead` ativo (09/11; detalhes na auditoria).
- [x] Ajustar cinco CNAMEs de e-mail para Somente DNS e confirmar resposta
  pública; manter MX/SPF existentes (09/11).
- [x] Definir TLS mínimo 1.2 e confirmar persistência no painel (09/11).
- [ ] Avaliar proteção e falsos positivos das Managed Rules com os eventos
  reais do WAF antes de modificar sua ação ou sensibilidade.
- [ ] Examinar tráfego legítimo e anômalo antes de adicionar limites globais;
  não empilhar regras de bloqueio genéricas em `/contato` (página estática) ou
  bloquear exclusivamente por `User-Agent` falsificável.
- [ ] Validar certificado de origem e configuração SSL antes de considerar
  migrar `Completo` para `Completo (estrito)`.
- [ ] Planejar DNSSEC na Cloudflare **em conjunto com** a publicação de DS no
  registrador, com plano de reversão e testes externos.
- [ ] Avaliar SSL Labs (meta A+, quando compatível com usuários reais) e
  monitorar negociação TLS 1.0/1.1.
- [ ] Conferir alertas externos de disponibilidade de `/`, `/servicos` e
  `/llms.txt`; manter o check automatizado periódico existente.
- [ ] Revisar cache por tipo de recurso e invalidação por deploy. **Não**
  habilitar Cache Everything/TTL de 1 mês em HTML ou respostas de API sem
  estratégia de versionamento e regressão; não ativar Always Online no escuro.

## Segurança da conta

- [ ] Habilitar commits assinados e configurar chave SSH ou GPG.
- [ ] Confirmar 2FA com aplicativo autenticador no GitHub, Cloudflare, registrador e email.
- [ ] Salvar recovery codes em local seguro offline.

## Email

- [x] Preservar MX, SPF e CNAMEs DKIM existentes da Hostinger e os registros
  específicos do subdomínio de envio Resend; DNS público conferido (09/11).
- [ ] Confirmar recebimento e envio reais na Hostinger e validar alinhamento
  SPF/DKIM/DMARC pelos cabeçalhos de mensagens autorizadas.
- [ ] Avaliar relatórios DMARC e somente então elevar gradualmente `p=none`
  para uma política de maior proteção, sem quebrar e-mails legítimos.

## Evidência operacional

Para cada item concluído, registrar fora deste arquivo a data, o painel, o
ambiente, a configuração aplicada e o resultado do teste. Nunca versionar
tokens, recovery codes, screenshots com dados sensíveis ou credenciais.

## Rechecagem operacional — 10/11/2026

- A zona `gandra.tech` continua ativa nos NS `neil.ns.cloudflare.com` e
  `walk.ns.cloudflare.com`. O painel Cloudflare mostra DNSSEC **desabilitado**;
  a consulta oficial de RDAP na ICANN informa `Unsigned`.
- A ICANN identifica **HOSTINGER operations, UAB** como registrador do `.tech`.
  A sessão Hostinger disponível no navegador não lista `gandra.tech` entre os
  domínios administrados. Portanto, não há como confirmar/gravar o DS na conta
  correta com esse acesso. Nenhuma ativação DNSSEC foi iniciada.
- A Cloudflare mantém SSL/TLS **Completo** em modo automático. A zona usa
  Cloudflare Pages como destino dos CNAMEs web. O certificado da origem efetiva
  ainda não foi inspecionado: não trocar para `Completo (estrito)` apenas pelo
  certificado público da borda.
- No painel de regras, os dois bypass/bloqueios por `User-Agent` continuam
  **Desabilitados**, e `Gandra Leads — limite por IP` continua **Ativo**. A
  seção de regras gerenciadas não apresenta uma implantação própria; existem
  proteções padrão da Cloudflare. Avaliar ativação de regras gerenciadas somente
  após examinar eventos e o risco de falso positivo.
- MX, SPF, DMARC e CNAMEs de e-mail permanecem como na auditoria anterior.
  Duas mensagens de devolução da Hostinger foram examinadas: código de resposta
  `452 4.2.2` (*caixa do destinatário sem espaço*), sem evidência de falha de
  SPF/DKIM. Não há, nesta amostra, cabeçalhos suficientes para certificar o
  alinhamento de mensagens **entregues**. DMARC segue `p=none` por segurança.
- O monitor de DNS passa a rejeitar SPF com `+all`, `?all`, ausência do
  mecanismo final seguro ou políticas `all` contraditórias. Isso só reforça o
  **monitor**: não altera o TXT real de produção nem prova autenticação de envio.

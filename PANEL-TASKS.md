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
- [x] Ativar DNSSEC na Cloudflare, publicar o DS na Hostinger e validar a
  cadeia de assinaturas via DNS público (`AD: true`, 10/11/2026).
- [x] Criar e validar redirecionamento `www.gandra.tech` para `gandra.tech`
  com 301, preservando caminho e parâmetros (10/11/2026).
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

## Conclusão dos ajustes de DNSSEC e canonical WWW — 10/11/2026

- Após login na **conta Hostinger titular** de `gandra.tech`, a zona manteve
  os NS `neil.ns.cloudflare.com` e `walk.ns.cloudflare.com`; bloqueio de
  transferência e privacidade do registro continuaram ativos.
- Foi habilitada a assinatura DNSSEC na Cloudflare. O registro DS com **Key Tag
  2371, Algorithm 13 (ECDSA P-256) e Digest Type 2 (SHA-256)** foi adicionado
  na Hostinger, conferindo o digest com os dados gerados pela Cloudflare.
- O Google Public DNS retornou o registro DS esperado na delegação `.tech`
  e respondeu consultas `A` e `MX` de `gandra.tech` com `Status: 0` e
  **`AD: true`**, confirmando validação criptográfica fim a fim. O painel
  Cloudflare passou a informar: `Sucesso! gandra.tech está protegido com DNSSEC.`
- Criada regra Cloudflare `Canonical www para gandra.tech`, ativa, com
  redirecionamento 301 de `https://www.gandra.tech/*` para
  `https://gandra.tech/${1}` e preservação de query string. A navegação
  real por `www` (inclusive a partir de HTTP) chegou ao endereço canônico
  com caminho/parâmetro preservado e conteúdo do site carregado.
- DNS MX permaneceu em `mx1.hostinger.com` (prioridade 5) e
  `mx2.hostinger.com` (prioridade 10). Não foram alterados SPF, DKIM, DMARC,
  nameservers ou conteúdo do site; as animações permaneceram intactas.
- SSL/TLS continua em modo **automático**, atualmente `Completo`, pois a
  identidade/cadeia do certificado da origem não foi verificada. O painel de
  certificados Cloudflare Origin CA não lista certificados, o que não prova
  ausência de certificado válido na origem Cloudflare Pages. Não migrar
  forçadamente para `Completo (estrito)` sem teste compatível e rollback.

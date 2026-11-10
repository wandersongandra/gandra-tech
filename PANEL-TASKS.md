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

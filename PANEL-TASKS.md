# Pendências de painel e infraestrutura

Este documento reúne tarefas que não podem ser resolvidas por código neste
repositório. Marque um item somente depois de aplicar a configuração no painel
correspondente e registrar a evidência da validação.

## DNS e infraestrutura

- [ ] Habilitar DNSSEC na Cloudflare e publicar o DS no registrador.
- [ ] Configurar rate limiting no WAF: 100 requisições/10 segundos global e 30 requisições/minuto em `/contato`.
- [ ] Habilitar WAF Managed Rules com sensibilidade Medium.
- [ ] Criar regra de bloqueio para User-Agents maliciosos, incluindo `sqlmap`, `nikto` e `nmap`.
- [ ] Habilitar Always Online.
- [ ] Configurar cache agressivo com Cache Everything e Edge TTL de 1 mês, validando antes o efeito sobre HTML e atualização de deploy.
- [ ] Validar o certificado no SSL Labs com meta A+.
- [ ] Configurar monitoramento de uptime com três monitores UptimeRobot.

## Segurança da conta

- [ ] Habilitar commits assinados e configurar chave SSH ou GPG.
- [ ] Confirmar 2FA com aplicativo autenticador no GitHub, Cloudflare, registrador e email.
- [ ] Salvar recovery codes em local seguro offline.

## Email

- [ ] Escolher e consolidar o provedor: Email Routing da Cloudflare ou Hostinger.
- [ ] Configurar SPF, DKIM e DMARC coerentes com o provedor escolhido.

## Evidência operacional

Para cada item concluído, registrar fora deste arquivo a data, o painel, o
ambiente, a configuração aplicada e o resultado do teste. Nunca versionar
tokens, recovery codes, screenshots com dados sensíveis ou credenciais.

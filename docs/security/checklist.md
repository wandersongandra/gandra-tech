# Checklist Mensal de Segurança

Checklist operacional do site `gandra.tech`. Marque cada item somente depois de observar a evidência correspondente. Não registre tokens, cookies, emails pessoais ou dados de visitantes.

## Disponibilidade e Cloudflare

- [ ] Verificar os monitores HTTP da home, `/servicos` e `/llms.txt`.
- [ ] Revisar Security Events e investigar picos de requests, 5xx ou bloqueios indevidos.
- [ ] Confirmar que WAF Managed Rules, regras customizadas e rate limiting estão habilitados e sem falsos positivos relevantes.
- [ ] Confirmar a política de crawlers autorizados: Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot e DuckAssistBot.
- [ ] Confirmar que os crawlers de treinamento definidos pelo projeto continuam bloqueados.
- [ ] Revisar cache, TTL e invalidação após o último deploy.
- [ ] Confirmar que o deploy de produção corresponde ao commit aprovado.
- [ ] Verificar que o certificado HTTPS está válido e repetir o teste no [SSL Labs](https://www.ssllabs.com/ssltest/).

## DNS e email

- [ ] Confirmar DNSSEC publicado e validando no registrador.
- [ ] Inventariar A, AAAA, CNAME, MX e TXT; investigar qualquer registro desconhecido antes de remover.
- [ ] Confirmar um único provedor de email para `gandra.tech`.
- [ ] Validar SPF sem registros duplicados.
- [ ] Confirmar DKIM publicado pelo provedor escolhido.
- [ ] Revisar DMARC e a chegada dos relatórios na caixa de monitoramento existente.
- [ ] Testar `contato@gandra.tech` apenas com destinatários autorizados e sem gerar spam.

## GitHub e cadeia de suprimentos

- [ ] Confirmar que a proteção de `main` exige Pull Request, revisão, conversas resolvidas e checks verdes.
- [ ] Confirmar que force-push e exclusão da `main` estão bloqueados.
- [ ] Confirmar Dependabot alerts, Secret Scanning e Push Protection.
- [ ] Confirmar que o Code Scanning/CodeQL executou sem erro.
- [ ] Revisar PRs de dependência; atualizar via PR revisado, não com `npm update` cego.
- [ ] Executar `npm audit --audit-level=moderate`.
- [ ] Confirmar execução do OSV Scanner no workflow e revisar qualquer vulnerabilidade encontrada.
- [ ] Executar Gitleaks no checkout e revisar qualquer alerta sem imprimir o segredo.
- [ ] Confirmar que nenhum `.env`, log, dump, chave privada ou source map entrou no commit.

## Validação do export

- [ ] Executar `npm run lint`.
- [ ] Executar `npm run typecheck`.
- [ ] Executar `npm test`.
- [ ] Executar `npm run build`.
- [ ] Executar `npm run validate:build-security`.
- [ ] Executar `npm run check:production` após o deploy.
- [ ] Confirmar manualmente as rotas críticas em desktop e mobile.

## Resposta a incidentes

- [ ] Confirmar que `incident-response.md` e os contatos privados estão atualizados.
- [ ] Revisar o procedimento de Under Attack Mode sem ativá-lo fora de incidente validado.
- [ ] Confirmar que o rollback de Pages é conhecido e que existe um deployment estável identificável.
- [ ] Fazer um exercício de tabletop sem tráfego ofensivo e registrar lacunas.

## Registro

```text
Data:
Responsável:
Deployment verificado:
Itens pendentes:
Evidências privadas:
```

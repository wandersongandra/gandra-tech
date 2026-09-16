# Relatório de Hardening de Segurança e Disponibilidade

Data da execução: 15/09/2026
Projeto: `wandersongandra/gandra-tech`
Domínio: `https://gandra.tech`
Base auditada: `4285a11`
Modo: implementação local, validação read-only em produção e alterações GitHub limitadas aos controles solicitados e seguros.

## 1. Resumo executivo

O hardening de código, build e documentação foi implementado e passou pelos gates locais e remotos. O repositório é público, a proteção da `main`, o environment `production`, o CodeQL e o deployment do Pages foram confirmados; DNSSEC, email, WAF e monitoramento externo continuam pendentes. Veredito: **PROTEGIDO**.

## 2. Correções SEC-001 a SEC-007

| Achado | Status | Evidência em 15/09/2026 |
|---|---|---|
| SEC-001 — `main` sem proteção | CORRIGIDO NO GITHUB | API confirmou branch protection ativa com PR, zero aprovações exigidas para o fluxo solo, checks estritos, resolução de conversas e bloqueio de force-push/exclusão. |
| SEC-002 — CSP ausente | CORRIGIDO E VALIDADO | CSP em enforcement adicionada em `public/_headers`, sem `unsafe-eval`; entrega confirmada em produção. |
| SEC-003 — CI incompleta | CORRIGIDO NO REPOSITÓRIO | CI separada em checks `lint`, `typecheck`, `test`, `build`, `audit` e `gitleaks`, com OSV Scanner e `npm ci --ignore-scripts`. |
| SEC-004 — DNSSEC ausente | PENDENTE | Consulta DNS não encontrou DS publicado. Nenhuma alteração foi feita no registrador. |
| SEC-005 — commits sem assinatura | PENDENTE | Ainda não há commit novo assinado e verificado no GitHub; o histórico existente não foi alterado. |
| SEC-006 — CodeQL ausente | CORRIGIDO E VALIDADO | Workflow CodeQL pinado por SHA criado e executado com sucesso no PR de publicação. |
| SEC-007 — CORS curinga | CORRIGIDO E VALIDADO EM PRODUÇÃO | `public/_headers` sobrescreve o padrão do Pages com `Access-Control-Allow-Origin: https://gandra.tech`; a produção confirmou o valor canônico, sem curinga. |

## 3. Hardening implementado

- Headers: nosniff, X-Frame-Options, HSTS, Referrer-Policy, Permissions-Policy, COOP, CORP, COEP e CORS restrito.
- CSP: política em `Content-Security-Policy`, sem `unsafe-eval`.
- Crawlers: 12 crawlers de descoberta permitidos e 8 crawlers de treinamento definidos pelo projeto bloqueados no `robots.txt`.
- CI: lint, typecheck, testes, build, validação de export, audit moderado, OSV Scanner e Gitleaks.
- CodeQL: workflow agendado para JavaScript/TypeScript, com actions fixadas por SHA.
- Integridade: validador rejeita rotas ausentes, source maps e extensões potencialmente sensíveis no `out/`.
- Operação: healthcheck de produção sem credenciais e script de emergência com confirmação explícita.
- Documentação: configuração, checklist mensal, resposta a incidentes e README atualizados.

Headers via `_headers` são suportados pelo Cloudflare Pages: [documentação oficial](https://developers.cloudflare.com/pages/configuration/headers/).

## 4. Estado dos controles externos

| Controle | Estado | Evidência/limite |
|---|---|---|
| Dependabot alerts | HABILITADO | API GitHub retornou sucesso. |
| Automated security fixes | HABILITADO | API GitHub confirmou `enabled: true`. |
| Branch protection | HABILITADA | API confirmou proteção da `main`, checks obrigatórios e bloqueio de force-push/exclusão. |
| Secret Scanning | HABILITADO | API confirmou Secret Scanning e Push Protection; não há alertas atuais. |
| Code Scanning | VALIDADO | Workflow CodeQL remoto passou no PR de publicação. |
| 2FA e colaboradores | NÃO VERIFICADO | Exige painel GitHub e não foi alterado. |
| Cloudflare WAF/Bot Management | NÃO APLICADO | Sessão Wrangler possui leitura de zona, não escrita de zona. |
| Rate limiting | NÃO APLICADO | Regras documentadas para validação em painel e observação de falsos positivos. |
| Cache/Always Online | NÃO VERIFICADO | Nenhuma regra `Cache Everything` aplicada às cegas. |
| TLS/SSL Labs | NÃO VERIFICADO | HTTPS responde, mas SSL Labs não foi executado. |
| DNSSEC | PENDENTE | Sem DS publicado na consulta realizada. |
| Email/MX/SPF/DKIM/DMARC | PENDENTE | MX e SPF ainda apontam para Hostinger; provedor não foi migrado. |
| Uptime externo | NÃO CONFIGURADO | Monitores recomendados estão documentados, sem conta criada. |

O deployment de produção final observado foi `d19c65d8-5525-4217-9896-2711dce35f04`, na branch `main`, source `25aa095`. O domínio canônico respondeu com as alterações finais.

## 5. Testes realizados

Em cópia limpa fora do Google Drive:

- `npm ci --ignore-scripts`: passou; 0 vulnerabilidades.
- `npm run build`: passou sem warnings; gerou o export estático.
- `npm run lint`: passou.
- `npm run typecheck`: passou.
- `npm test`: passou.
- `npm audit --audit-level=moderate`: passou; 0 vulnerabilidades.
- `npm run validate:build-security`: passou com oito rotas e headers no export.
- Gitleaks: passou; 95 commits escaneados, nenhum vazamento.
- Scripts `.mjs`: validação sintática passou.

Na primeira verificação, o deployment antigo falhou nos headers novos; após a publicação final, `npm run check:production` passou: nove URLs responderam 200 com headers de segurança. O teste de navegador em produção passou em 24 combinações de rota e viewport, sem overflow, erros de console ou requisições falhas; o menu mobile passou com ESC e bloqueio de scroll.

Não foram executados load testing, flood, DDoS, Slowloris, failover destrutivo, ZAP ativo, Nikto ou Nmap contra produção.

## 6. Divergência de email

Não foi resolvida automaticamente. A consulta atual confirmou:

- MX: `mx1.hostinger.com` e `mx2.hostinger.com`;
- SPF: referências à Hostinger;
- Cloudflare Email Routing: não confirmado como destino ativo.

É necessário escolher um único provedor, confirmar o destino e só então alterar MX, SPF, DKIM e DMARC.

## 7. Rotina recomendada

- Diário: uptime, 5xx, Security Events e bloqueios indevidos.
- Semanal: PRs, Dependabot, deployments e regras Cloudflare.
- Mensal: build, audit, Gitleaks, certificado, DNSSEC, email e rollback.
- Trimestral: revisão de acesso, branch protection, CodeQL, exercício de incidente e custos.

Reauditar após mudança de DNS, email, WAF, cache, dependência, integração externa ou criação de backend/formulário.

## 8. Custos

Nenhum custo novo foi contratado. Para o site estático, começar com o plano Cloudflare atual e monitor HTTP básico; considerar upgrade somente após métricas de tráfego, incidentes ou necessidade de recursos avançados. Preços não foram inventados porque dependem da conta e do plano atual.

## 9. Arquivos alterados

Modificados:

- `.github/workflows/ci-security.yml`
- `.gitignore`
- `README.md`
- `docs/SECURITY.md`
- `app/robots.ts`
- `next.config.ts`
- `package.json`
- `public/_headers`

Criados:

- `.github/workflows/codeql.yml`
- `docs/security/incident-response.md`
- `docs/security/checklist.md`
- `docs/security/configuration.md`
- `docs/security/hardening-report.md`
- `scripts/check-production.mjs`
- `scripts/cloudflare-emergency.mjs`
- `scripts/validate-build-security.mjs`

Nenhum arquivo foi deletado e nenhum asset de produção foi substituído.

## 10. Ações de painel/API

Aplicado via GitHub API autenticada:

- Dependabot vulnerability alerts: habilitado.
- Automated security fixes: habilitado.
- Branch protection da `main`: PR, uma aprovação, checks estritos, resolução de conversas e bloqueio de force-push/exclusão.
- Environment `production`: reviewer do proprietário, wait timer de 5 minutos e branches protegidas.
- Secret Scanning e Push Protection: confirmados como habilitados.

Não aplicados:

- Cloudflare WAF, rate limiting, cache, TLS, DNSSEC, Email Routing e monitor externo.

## 11. Veredito

**PROTEGIDO** — a governança da branch, os gates de desenvolvimento e o hardening local foram ampliados; configuração Cloudflare, DNSSEC, email, monitoramento e a primeira análise CodeQL ainda precisam de validação operacional.

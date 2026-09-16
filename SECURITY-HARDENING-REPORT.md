# Relatório de Hardening de Segurança e Disponibilidade

Data da execução: 15/09/2026
Projeto: `wandersongandra/gandra-tech`
Domínio: `https://gandra.tech`
Base auditada: `4285a11`
Modo: implementação local, validação read-only em produção e alterações GitHub limitadas aos controles solicitados e seguros.

## 1. Resumo executivo

O hardening de código, build e documentação foi implementado e passou pelos gates locais. O repositório agora é público, a proteção da `main` e o environment `production` foram configurados, e os controles GitHub disponíveis estão habilitados; CodeQL remoto, Cloudflare, DNSSEC, email e monitoramento externo ainda dependem de validação separada. Veredito: **PROTEGIDO**.

## 2. Correções SEC-001 a SEC-007

| Achado | Status | Evidência em 15/09/2026 |
|---|---|---|
| SEC-001 — `main` sem proteção | CORRIGIDO NO GITHUB | API confirmou branch protection ativa com PR, uma aprovação, checks estritos, resolução de conversas e bloqueio de force-push/exclusão. Os workflows novos ainda precisam ser publicados para os checks executarem. |
| SEC-002 — CSP ausente | IMPLEMENTADO LOCALMENTE | CSP em enforcement adicionada em `public/_headers`, sem `unsafe-eval`; entrega em produção aguarda deployment. |
| SEC-003 — CI incompleta | CORRIGIDO NO REPOSITÓRIO | CI separada em checks `lint`, `typecheck`, `test`, `build`, `audit` e `gitleaks`, com OSV Scanner e `npm ci --ignore-scripts`. |
| SEC-004 — DNSSEC ausente | PENDENTE | Consulta DNS não encontrou DS publicado. Nenhuma alteração foi feita no registrador. |
| SEC-005 — commits sem assinatura | PENDENTE | Ainda não há commit novo assinado e verificado no GitHub; o histórico existente não foi alterado. |
| SEC-006 — CodeQL ausente | IMPLEMENTADO NO REPOSITÓRIO | Workflow CodeQL pinado por SHA criado; a execução remota depende do push e da disponibilidade de Code Scanning. |
| SEC-007 — CORS curinga | VALIDADO NO PREVIEW | `public/_headers` sobrescreve o padrão do Pages com `Access-Control-Allow-Origin: https://gandra.tech`; a resposta do preview confirmou o valor canônico, sem curinga. A produção canônica ainda aguarda publicação. |

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
| Code Scanning | PENDENTE | Workflow criado localmente; ainda depende de push e primeira execução remota. |
| 2FA e colaboradores | NÃO VERIFICADO | Exige painel GitHub e não foi alterado. |
| Cloudflare WAF/Bot Management | NÃO APLICADO | Sessão Wrangler possui leitura de zona, não escrita de zona. |
| Rate limiting | NÃO APLICADO | Regras documentadas para validação em painel e observação de falsos positivos. |
| Cache/Always Online | NÃO VERIFICADO | Nenhuma regra `Cache Everything` aplicada às cegas. |
| TLS/SSL Labs | NÃO VERIFICADO | HTTPS responde, mas SSL Labs não foi executado. |
| DNSSEC | PENDENTE | Sem DS publicado na consulta realizada. |
| Email/MX/SPF/DKIM/DMARC | PENDENTE | MX e SPF ainda apontam para Hostinger; provedor não foi migrado. |
| Uptime externo | NÃO CONFIGURADO | Monitores recomendados estão documentados, sem conta criada. |

O deployment de produção observado foi `516d30e6-7226-4874-baa0-d4c13aae219e`, na branch `main`, source `4285a11`. As alterações deste relatório ainda não foram publicadas.

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

Contra produção, `npm run check:production` encontrou HTTP 200 nas rotas testadas, mas falhou porque o deployment atual não entrega COOP, CORP, COEP e CSP. Isso não é considerado falha de implementação local; é evidência de que o código ainda não foi publicado.

Em preview Cloudflare do snapshot final (`security-hardening`), o mesmo healthcheck passou: nove URLs retornaram HTTP 200 com os headers de segurança esperados. Essa validação não substitui a confirmação no domínio canônico.

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
- `SECURITY.md`
- `app/robots.ts`
- `next.config.ts`
- `package.json`
- `public/_headers`

Criados:

- `.github/workflows/codeql.yml`
- `INCIDENT-RESPONSE.md`
- `SECURITY-CHECKLIST.md`
- `SECURITY-CONFIG.md`
- `SECURITY-HARDENING-REPORT.md`
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

- Code Scanning nativo/primeira análise CodeQL remota;
- Cloudflare WAF, rate limiting, cache, TLS, DNSSEC, Email Routing e monitor externo.

## 11. Veredito

**PROTEGIDO** — a governança da branch, os gates de desenvolvimento e o hardening local foram ampliados; configuração Cloudflare, DNSSEC, email, monitoramento e a primeira análise CodeQL ainda precisam de validação operacional.

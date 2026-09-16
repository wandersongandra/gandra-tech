# Configuração de Segurança e Disponibilidade

Documento de referência do hardening do site estático `gandra.tech`. Ele separa o que está no repositório do que precisa ser confirmado no painel Cloudflare, GitHub ou no provedor de email.

## Estado resumido

| Área | Estado | Evidência ou limite |
|---|---|---|
| Static Export | IMPLEMENTADO | `next.config.ts` usa `output: 'export'` e imagens não otimizadas pelo servidor. |
| Headers de segurança | VALIDADO EM PRODUÇÃO | `public/_headers` contém os headers básicos, os de isolamento, CSP em enforcement e CORS restrito à origem canônica; a entrega foi confirmada no deployment `d19c65d8`. |
| CSP | IMPLEMENTADO | `Content-Security-Policy` em enforcement, sem `unsafe-eval`; a política foi conferida contra os recursos locais do export. |
| Política de crawlers | IMPLEMENTADO NO REPOSITÓRIO | `app/robots.ts` permite os 12 crawlers de descoberta aprovados e bloqueia os 8 crawlers de treinamento definidos pelo projeto. |
| Integridade do export | IMPLEMENTADO | `npm run validate:build-security` verifica rotas, arquivos públicos, headers, source maps e extensões sensíveis. |
| CI e CodeQL | VALIDADO NO GITHUB | Build, lint, typecheck, testes, validação do export, audit moderado, Gitleaks e CodeQL passaram no PR de publicação. |
| Proteção da `main` | IMPLEMENTADO NO GITHUB | Branch protection ativa com PR, zero aprovações exigidas para o fluxo solo, checks estritos, resolução de conversas e bloqueio de force-push/exclusão. |
| Alertas nativos do GitHub | HABILITADO | Dependabot alerts, automated security fixes, Secret Scanning e Push Protection estão habilitados; não há alertas atuais. |
| Environment `production` | IMPLEMENTADO NO GITHUB | Reviewer configurado para o proprietário, wait timer de 5 minutos e deploy limitado a branches protegidas. Isso só afeta jobs GitHub Actions que referenciem esse environment; o Pages continua com seu próprio fluxo. |
| DDoS padrão Cloudflare | NÃO VERIFICADO NO PAINEL | A proteção padrão e o plano contratado não foram confirmados nesta execução. |
| WAF, Bot Management e rate limiting | NÃO APLICADO | Exigem painel/API autenticada e validação com tráfego real; nenhuma regra foi criada por este repositório. |
| Cache e Always Online | NÃO VERIFICADO NO PAINEL | Não há mudança segura de cache aplicada às cegas. |
| DNSSEC | PENDENTE | Deve ser habilitado na Cloudflare e publicado no registrador. |
| Email Routing | NÃO CONFIGURADO | A configuração atual de MX/SPF precisa ser confirmada antes de qualquer migração. |
| Monitor externo | NÃO CONFIGURADO | Os scripts locais existem, mas não substituem um monitor com alertas. |

## Antes e depois

| Componente | Antes | Depois |
|---|---|---|
| `public/_headers` | Headers básicos de segurança; sem isolamento COOP/CORP/COEP e sem CSP | Headers básicos preservados, `payment=()` adicionado, isolamento e CSP em enforcement incluídos |
| `app/robots.ts` | Permissão geral e exceções para três crawlers | Lista explícita de 12 crawlers de descoberta e 8 crawlers de treinamento bloqueados |
| CI principal | Build, audit de severidade alta e Gitleaks | Instalação sem scripts, build, lint, typecheck, testes, validação do export e audit moderado |
| Code scanning | Nenhum workflow CodeQL no repositório | Workflow agendado para JavaScript/TypeScript com actions fixadas por SHA |
| Pós-build | Não havia gate específico para arquivos exportados | Verificação de rotas, assets públicos, headers, source maps e extensões sensíveis |
| Produção | Sem healthcheck versionado para as rotas críticas | `npm run check:production` verifica HTTP e headers sem alterar o domínio |
| Emergência | Procedimento e script não versionados neste checkout | `incident-response.md` e script com confirmação explícita para Under Attack/IP block |

## Estado confirmado no GitHub

- O repositório está **público**, confirmado pela API em 15/09/2026.
- `main` está protegida por API, com PR obrigatório, uma aprovação, checks `lint`, `typecheck`, `test`, `build`, `audit` e `gitleaks`, além de `codeql`, resolução de conversas e bloqueio de force-push/exclusão.
- O environment `production` foi criado com reviewer do proprietário, wait timer de 5 minutos e política para branches protegidas.
- Dependabot alerts e automated security fixes foram habilitados via API em 15/09/2026.
- Secret Scanning e Push Protection estão habilitados; não há alertas atuais.
- O workflow CodeQL foi executado remotamente no PR de publicação e passou.
- O token usado pela sessão GitHub não é armazenado nem documentado neste arquivo.
- O Wrangler está autenticado para a conta Cloudflare, mas a sessão expõe somente leitura de zona; não há permissão de escrita suficiente para aplicar WAF, DNSSEC, cache ou TLS por API.

## 1. Segurança no código e no build

### Headers

O arquivo `public/_headers` é consumido pelo Cloudflare Pages e define:

- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- HSTS com um ano, subdomínios e preload;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` sem câmera, microfone, geolocalização ou pagamentos;
- COOP, CORP e COEP para isolamento de contexto;
- CORS restrito a `https://gandra.tech`, sem origem curinga;
- CSP em enforcement.

O COEP `require-corp` deve ser validado no preview em todas as páginas e com cache limpo. O Cloudflare Web Analytics injeta um beacon externo; por isso, a CSP permite somente `static.cloudflareinsights.com` para o script e `cloudflareinsights.com` para o envio de métricas. Se outro recurso de terceiro for adicionado no futuro, ele deverá ser hospedado localmente ou fornecer uma política CORP/CORS compatível. O CORS restrito foi adicionado porque o Pages fornece origem curinga por padrão, embora este site não exponha API pública.

### CSP

Política aplicada, incluindo o endpoint observado do Cloudflare Web Analytics:

```text
default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://cloudflareinsights.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'; frame-src 'none'; worker-src 'self'; manifest-src 'self'; upgrade-insecure-requests
```

Procedimento para promover:

1. Faça um preview do commit.
2. Abra todas as rotas em desktop e mobile com o console aberto.
3. Verifique se não há violações CSP relacionadas a scripts, fontes, imagens, animações ou navegação.
4. Corrija a causa de cada violação legítima; não amplie a política por conveniência.
5. Se um recurso futuro exigir alteração, ajuste a política de forma específica e repita os gates.

### SRI e informações de implementação

A aplicação não carrega scripts externos diretamente. O Cloudflare Web Analytics pode injetar o beacon com SRI na borda; esse endpoint está explicitamente permitido na CSP. Se outro script de terceiro for incluído, ele deve ser hospedado de modo controlado e receber `integrity` e `crossorigin` quando o recurso tiver hash estável.

`poweredByHeader: false` permanece em `next.config.ts`. O validador rejeita source maps, arquivos com extensões potencialmente sensíveis e CORS curinga no export.

### Validações locais

```powershell
npm ci --ignore-scripts
npm run lint
npm run typecheck
npm test
npm run build
npm run validate:build-security
```

Para uma checagem HTTP após o deployment:

```powershell
npm run check:production
```

Esse healthcheck não aceita credenciais, não modifica produção e falha se uma rota crítica ou header obrigatório estiver ausente.

## 2. Política de crawlers e WAF

### Crawlers autorizados

O `robots.txt` gerado por `app/robots.ts` mantém acesso para Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot, DuckAssistBot, ChatGPT-User, Perplexity-User, Claude-User, Manus Bot e MistralAI-User.

### Crawlers de treinamento bloqueados

GPTBot, ClaudeBot, CCBot, Bytespider, Amazonbot, `meta-externalagent`, Google-Extended e Applebot-Extended continuam com `Disallow: /`. WAF, robots.txt e identificação de bot devem ser tratados como camadas diferentes; `robots.txt` não é um controle de segurança.

No WAF, não crie uma exceção genérica por User-Agent. User-Agent é facilmente falsificado. Se o plano oferecer identificação de bots verificados, combine esse sinal com uma lista de exceção restrita e monitore os eventos.

### Regras sugeridas para validação no painel

Estas regras são uma proposta, não uma confirmação de que foram aplicadas:

| Controle | Proposta segura | Estado |
|---|---|---|
| Ferramentas de ataque | Desafiar ou bloquear somente padrões confirmados como `sqlmap`, `nikto`, `masscan`, `zgrab` e semelhantes | PENDENTE DE PAINEL |
| User-Agent ausente | Monitorar antes de bloquear; permitir o que for necessário para healthchecks conhecidos | PENDENTE DE PAINEL |
| Tráfego abusivo | Rate limit inicial de 100 requests/10s/IP com challenge, excluindo crawlers verificados | PENDENTE DE PAINEL |
| `/contato` | Rate limit de 20 requests/min/IP, após observar falsos positivos | PENDENTE DE PAINEL |
| Limite global emergencial | 1000 requests/10s/IP somente como fallback medido, não junto de regras conflitantes | PENDENTE DE PAINEL |

O projeto é estático e `/contato` não recebe dados: ele apresenta um link `mailto`. Rate limiting protege disponibilidade e scraping, mas não é substituto de validação de backend.

Não é recomendado bloquear genericamente `curl`, `python-requests` ou `wget` sem observar a origem: isso pode derrubar monitores, auditorias e integrações legítimas. Também não foi inventada uma lista de ASNs maliciosos; ela deve ser derivada dos Security Events do próprio domínio.

## 3. Cloudflare: TLS, cache e disponibilidade

### TLS

Confirmar no painel, sem alterar às cegas:

1. SSL/TLS mode compatível com o origin Pages, preferencialmente **Full (strict)** quando a tela permitir.
2. **Always Use HTTPS**.
3. **Automatic HTTPS Rewrites**.
4. TLS 1.3 e demais opções de edge compatíveis com o plano.
5. HSTS após validar todos os subdomínios; o repositório já declara HSTS no `_headers`.

A documentação do Cloudflare informa que o Minimum TLS Version não pode ser configurado para hostnames do Cloudflare Pages; confirme a tela aplicável ao domínio antes de considerar esse item concluído: [Minimum TLS Version](https://developers.cloudflare.com/ssl/edge-certificates/additional-options/minimum-tls/).

O resultado do SSL Labs ainda é NÃO VERIFICADO. Execute um teste autorizado em [SSL Labs SSL Server Test](https://www.ssllabs.com/ssltest/) e registre data, nota e hostname, sem colar tokens ou dados de conta no repositório.

### Cache e compressão

Não foi adicionada uma regra `Cache Everything` automaticamente, pois cachear HTML de forma agressiva pode servir uma versão antiga após um deploy. A política deve ser validada no preview e no domínio canônico antes de aplicar:

- assets versionados: cache longo, desde que a invalidação do Pages esteja confirmada;
- HTML: TTL moderado e purge após alteração importante;
- `/robots.txt`, `/sitemap.xml` e `/llms.txt`: confirmar que o conteúdo novo chega após deploy;
- Always Online: validar disponibilidade e limites antes de tratá-lo como failover.

Cloudflare Pages já documenta compressão Brotli/Gzip e ETags para conteúdo estático quando aplicável; isso é comportamento da plataforma, não uma garantia criada por código local: [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/). Early Hints é documentado como automático para domínios Pages compatíveis: [Early Hints](https://developers.cloudflare.com/pages/configuration/early-hints/).

### DDoS e emergência

A proteção DDoS padrão do Cloudflare, o nível de segurança, Managed Rules, Bot Management e rate limiting precisam ser confirmados no painel conforme o plano. O repositório fornece apenas o script controlado em `scripts/cloudflare-emergency.mjs` e o procedimento em `incident-response.md`.

Não foram executados testes de flood, Slowloris, DDoS, desativação do Pages ou qualquer teste de ataque contra produção.

## 4. DNS e email

### DNSSEC

Habilitar DNSSEC exige gerar/obter os dados da zona no Cloudflare e publicar o registro DS no registrador. Validar a cadeia com DNSSEC depois da propagação: [DNSSEC](https://developers.cloudflare.com/dns/dnssec/).

Não remover registros órfãos por suposição. Inventarie A, AAAA, CNAME, MX e TXT, confirme o proprietário de cada subdomínio e procure referências em Pages antes de alterar.

### Email

Não há mudança de DNS neste hardening. O MX/SPF observado na auditoria anterior apontava para Hostinger. Antes de usar Cloudflare Email Routing, confirme o provedor que deve receber as mensagens, verifique o destino e substitua registros somente com autorização.

Depois de escolher o provedor, publique SPF, DKIM e DMARC coerentes. Não publique `rua=mailto:dmarc@gandra.tech` sem garantir que essa caixa exista e que o provedor aceite os relatórios. O SPF não deve conter dois registros SPF no mesmo nome.

## 5. Monitoramento

Nenhum monitor externo foi criado automaticamente. Configure um provedor escolhido pelo proprietário com:

| URL | Frequência sugerida | Condição |
|---|---:|---|
| `https://gandra.tech/` | 5 min | HTTP 200 e tempo de resposta observado |
| `https://gandra.tech/servicos` | 15 min | HTTP 200 |
| `https://gandra.tech/llms.txt` | 1 h | HTTP 200 e texto disponível |

Cadastre alertas de indisponibilidade sustentada, tempo acima de 3 segundos e expiração de certificado abaixo de 30 dias. O plano gratuito e os canais SMS variam por provedor; compare [UptimeRobot](https://uptimerobot.com/), [Better Stack](https://betterstack.com/) e [Pingdom](https://www.pingdom.com/) na conta antes de contratar.

No Cloudflare, revisar Security Events, Analytics e alterações de regras. No GitHub, manter Dependabot, Secret Scanning e Code Scanning conforme a disponibilidade do plano/conta. Os workflows do repositório executam Gitleaks, CodeQL, OSV Scanner, audit moderado e os gates de qualidade; a ativação dos recursos nativos de alertas ainda precisa ser confirmada no painel.

Na configuração do repositório GitHub, a branch `main` está protegida: exige Pull Request, zero aprovações para o fluxo solo, resolução de conversas e os checks `lint`, `typecheck`, `test`, `build`, `audit`, `gitleaks` e `codeql`; force-push e exclusão estão bloqueados. A API autenticada confirmou esses controles em 15/09/2026.

## 6. Testes de resiliência

Estado atual: NÃO EXECUTADO contra produção.

Qualquer teste futuro deve usar preview/staging ou janela autorizada, limites pequenos e critérios de parada. O plano seguro é:

1. smoke HTTP e headers;
2. carga progressiva com k6 ou Artillery em ambiente autorizado;
3. monitoramento de p50/p95/p99, erro e throughput;
4. parada imediata ao observar impacto em usuários legítimos;
5. revisão dos eventos do Cloudflare;
6. nenhum flood, Slowloris, DDoS simulado ou desligamento do Pages sem autorização explícita do proprietário e do provedor.

OWASP ZAP pode ser usado em modo passivo contra preview. Nikto, Nmap e scanners ativos não foram executados e não devem ser direcionados a terceiros ou produção sem escopo formal.

## 7. Rotina de revisão

### Diária

- verificar uptime e incidentes;
- conferir erros 5xx e alertas do Cloudflare;
- confirmar que não há bloqueios indevidos de usuários ou crawlers autorizados.

### Semanal

- revisar Security Events e regras alteradas;
- revisar PRs e alertas do Dependabot;
- executar `npm audit` conforme o lockfile e avaliar o resultado;
- confirmar último deployment e branch de produção.

### Mensal

- executar build, lint, typecheck, testes e `validate:build-security`;
- revisar certificado em SSL Labs e Certificate Transparency em [crt.sh](https://crt.sh/);
- revisar DNS, DNSSEC, MX, SPF, DKIM e DMARC;
- testar o monitor de uptime e o procedimento de rollback;
- revisar regras de cache, WAF e rate limiting.

### Trimestral

- repetir auditoria de segurança do repositório;
- revisar colaboradores, proteção de `main`, 2FA e permissões do GitHub/Cloudflare;
- executar teste controlado de recuperação em preview;
- atualizar o plano de resposta e os contatos de emergência;
- comparar custos e necessidade real de upgrade.

## 8. Custos e decisão de plano

Nenhum custo novo foi contratado por esta alteração. Os limites e preços mudam por conta, região e plano, portanto não foram inventados valores.

| Opção | Adequação inicial | Observação |
|---|---|---|
| Cloudflare Free | Site estático institucional e proteção básica | Validar disponibilidade de regras WAF/rate limiting e retenção de eventos no painel. |
| Cloudflare Pro/Business | Mais controles operacionais e suporte/recursos adicionais | Avaliar somente após necessidade real de WAF avançado, analytics, regras ou suporte. |
| Enterprise | Requisitos de governança, volume ou controles especializados | Não é justificável apenas pelo site estático sem métricas de tráfego e risco. |
| Monitor gratuito | Uptime HTTP básico | Pode atender os três endpoints iniciais; confirmar frequência, retenção e alertas. |
| Monitor pago | Intervalo menor, SMS, equipes e retenção maior | Contratar apenas se os alertas necessários não estiverem no plano inicial. |
| Scanning open source | CI e auditoria periódica | Gitleaks, npm audit, OSV e ZAP passivo podem ser usados sem nova licença; esforço operacional continua existindo. |

Para o porte atual, a recomendação é começar com o plano Cloudflare já contratado, monitor HTTP externo básico e os gates do GitHub; medir tráfego, incidentes e falsos positivos antes de upgrade.

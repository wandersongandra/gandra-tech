# Auditoria de segurança reforçada — 21/09/2026

## Escopo

Revisão defensiva do site institucional estático `gandra.tech`, do repositório `wandersongandra/gandra-tech`, da cadeia de build, GitHub Actions, headers de navegador, navegação client-side e mecanismos de cache persistente.

Esta revisão não executa exploração destrutiva, flood, DDoS, brute force ou scanners ofensivos contra produção.

## Superfície de ataque observada

- aplicação Next.js exportada estaticamente;
- sem API própria, banco de dados, autenticação, sessão ou cookies da aplicação;
- sem formulários que enviem dados ao servidor;
- contato por `mailto:`;
- sem `localStorage`, `sessionStorage`, `document.cookie`, `postMessage` ou `dangerouslySetInnerHTML` no runtime;
- assets e imagens do portfólio servidos localmente;
- Cloudflare Web Analytics é a única origem de script externo explicitamente permitida pela CSP;
- Cloudflare Pages publica automaticamente a branch de produção.

Essa arquitetura reduz muito o risco de classes como SQL injection, SSRF, IDOR, CSRF de mutação, upload malicioso e falhas de autorização, porque esses componentes simplesmente não existem neste site.

## Controles endurecidos nesta rodada

### Navegador

- CSP em enforcement mais restritiva;
- bloqueio de event handlers inline com `script-src-attr 'none'`;
- `base-uri 'none'` e `form-action 'none'`;
- bloqueio de frames, objetos, media e novos workers;
- `img-src` restrito a origem própria e `data:`;
- remoção de CORS global desnecessário;
- HSTS de dois anos com `includeSubDomains` e `preload`;
- `X-XSS-Protection: 0` para desativar o filtro legado;
- COOP, CORP e COEP preservados;
- Permissions-Policy restritiva;
- serialização de JSON-LD neutraliza `<` antes de inserir dados em `<script type="application/ld+json">`;
- navegação animada valida URL e só encaminha rotas da mesma origem.

### Persistência no cliente

- o service worker de cache deixa de ser registrado;
- registros existentes são removidos em clientes que atualizarem a aplicação;
- caches `gandra-*` são limpos;
- `sw.js` permanece temporariamente apenas como worker de retirada e é servido com `Cache-Control: no-store`.

### Cadeia de suprimentos e CI

- `npm` com lifecycle scripts desabilitados por padrão via `.npmrc`;
- `npm ci --ignore-scripts` em todos os jobs;
- lockfile v3 validado;
- pacotes resolvidos precisam vir do registry oficial do npm;
- integridade SHA-512 exigida para pacotes resolvidos;
- GitHub Actions precisam estar fixadas por SHA completo;
- credenciais do checkout não permanecem no workspace;
- `npm audit signatures` verifica assinaturas/proveniência suportadas pelo registry;
- auditoria de dependências de produção bloqueia achados a partir de severidade baixa;
- auditoria completa mantém gate em severidade moderada;
- OSV Scanner, Gitleaks e CodeQL permanecem ativos;
- CodeQL ampliado com `security-extended`;
- Dependabot passa a monitorar npm e GitHub Actions;
- jobs possuem timeout para limitar execuções presas ou abusivas.

### Deploy e produção

- build rejeita source maps e extensões potencialmente sensíveis;
- build rejeita handlers HTML inline e URLs `javascript:`;
- build valida a política CSP e a retirada do service worker;
- `/.well-known/security.txt` publicado para divulgação responsável;
- URLs `pages.dev` recebem `X-Robots-Tag: noindex, nofollow, noarchive`;
- workflow separado valida produção após merge e diariamente, com retries para propagação do Pages;
- healthcheck verifica rotas críticas, 404, headers, CSP, HSTS, ausência de `X-Powered-By`, worker de retirada e redirect HTTP→HTTPS.

## Dependências críticas verificadas

O lockfile atual resolve `next` 16.3.4, `react` 19.2.8 e `react-dom` 19.2.8. A auditoria automatizada de dependências permanece obrigatória em cada PR. Versões não devem ser promovidas fora do lockfile ou sem CI.

## Riscos residuais que não podem ser eliminados apenas pelo repositório

### P0 — controle da conta e do domínio

- confirmar 2FA forte no GitHub, Cloudflare, registrador e email administrativo;
- guardar recovery codes offline;
- revisar sessões e dispositivos ativos;
- limitar tokens/API keys por escopo e expiração;
- ativar trava de transferência do domínio no registrador.

### P0 — DNS

- habilitar DNSSEC na Cloudflare;
- publicar e validar o DS no registrador;
- revisar registros DNS e remover somente registros comprovadamente órfãos.

### P1 — Cloudflare Edge

- confirmar WAF Managed Rules compatíveis com o plano;
- revisar Security Events antes de criar bloqueios agressivos;
- configurar rate limiting com limites medidos e exceção para bots verificados;
- confirmar TLS/HTTPS e resultado de teste externo;
- revisar proteção contra bots conforme recursos do plano.

### P1 — email do domínio

- consolidar o provedor de email;
- validar SPF único;
- habilitar DKIM;
- publicar DMARC de forma progressiva e monitorada.

### P1 — monitoramento independente

- manter monitor externo para `https://gandra.tech/` e rotas críticas;
- alertar para indisponibilidade, degradação e expiração de certificado;
- GitHub Actions não substitui um monitor externo se GitHub ou a integração estiver indisponível.

## Limitações deliberadas

`script-src` e `style-src` ainda precisam de `'unsafe-inline'` por causa do HTML/estilos gerados pela arquitetura atual do Next.js e pelos estilos inline usados pela experiência visual. `script-src-attr 'none'` reduz a superfície bloqueando handlers HTML inline, e `'unsafe-eval'` é proibido. A retirada completa de `'unsafe-inline'` exige uma migração arquitetural testada para hashes/nonces ou redução adicional de scripts inline; não deve ser feita às cegas.

## Critério de promoção

O hardening só deve ir para `main` quando lint, typecheck, testes, build, validação do export, auditoria de supply chain, npm audit, OSV, Gitleaks e CodeQL estiverem verdes. Após o merge, o Cloudflare Pages precisa publicar o SHA da `main` e o `Production Security Check` precisa ficar verde.

## Conclusão técnica

O maior risco remanescente deste site estático não está em banco, autenticação ou APIs — eles não existem aqui. O risco dominante passa a ser controle-plane: comprometimento de GitHub, Cloudflare, registrador, DNS, email administrativo ou cadeia de dependências. Por isso, a próxima etapa após o hardening do código é fechar as pendências P0/P1 de painel e identidade.

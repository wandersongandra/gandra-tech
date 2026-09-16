# Resposta a Incidentes

Procedimento operacional para indisponibilidade, abuso de tráfego, scraping agressivo ou bloqueios indevidos no site estático `gandra.tech`.

Este documento não autoriza mudanças destrutivas nem testes de ataque. Ações que alteram Cloudflare, DNS ou Pages devem ser feitas pelo proprietário, com registro do horário, motivo e estado anterior.

## 1. Identificar o incidente

Considere abrir um incidente quando houver uma combinação de:

- alerta de uptime por mais de cinco minutos;
- aumento anormal de respostas 5xx ou timeouts;
- latência acima do padrão observado;
- aumento repentino de requests ou de eventos bloqueados no Cloudflare;
- deploy do Pages com falha ou conteúdo incorreto;
- relatos de usuários legítimos que não conseguem acessar o site.

Antes de bloquear qualquer origem, compare o comportamento em uma rede comum e registre:

```text
data/hora e fuso
URL afetada
status HTTP
tempo de resposta
região/rede de teste
User-Agent usado
ID ou URL do deployment, quando aplicável
```

Não use um único teste local como prova de ataque. Confirme o evento no Cloudflare Security Events e no monitor de disponibilidade.

## 2. Contenção no Cloudflare

### Ativar Under Attack Mode

Use somente durante um ataque validado ou uma degradação claramente associada a tráfego abusivo. O modo pode apresentar um desafio aos visitantes e afetar a experiência de usuários legítimos.

1. Acesse o painel da Cloudflare.
2. Selecione `gandra.tech`.
3. Abra **Security > Settings**.
4. Ative **I'm Under Attack Mode**.
5. Registre o horário e acompanhe os eventos em **Security > Events**.
6. Desative o modo assim que a causa estiver contida e a disponibilidade normal tiver sido confirmada.

Referência oficial: [Under Attack Mode](https://developers.cloudflare.com/fundamentals/reference/under-attack-mode/).

### Bloquear um IP validado

Bloqueie apenas um IP que tenha evidência suficiente de abuso. Prefira uma regra específica e temporária, com nota e revisão posterior.

O script seguro do repositório exige `CF_ZONE_ID`, `CF_API_TOKEN` e a confirmação explícita `--confirm`. Ele não imprime o token nem executa sem esses requisitos:

```powershell
$env:CF_ZONE_ID = 'COLE_O_ZONE_ID_AQUI'
$env:CF_API_TOKEN = 'COLE_UM_TOKEN_DE_ESCOPO_MINIMO_AQUI'
node scripts/cloudflare-emergency.mjs block-ip 203.0.113.10 --confirm
```

Para ativar o modo de emergência pela API:

```powershell
node scripts/cloudflare-emergency.mjs under-attack --confirm
```

Também há wrappers Bash locais em `scripts/incident/` para ativar/desativar o modo de emergência e bloquear um IP validado. Essa pasta é ignorada pelo Git de propósito; os wrappers devem ser mantidos somente em uma máquina administrativa protegida e nunca receber tokens embutidos.

Não coloque token em arquivo versionado, histórico do shell ou issue. Remova as variáveis da sessão ao terminar:

```powershell
Remove-Item Env:CF_ZONE_ID -ErrorAction SilentlyContinue
Remove-Item Env:CF_API_TOKEN -ErrorAction SilentlyContinue
```

A pasta `scripts/incident/` é reservada para wrappers locais e está ignorada pelo Git. O script versionado e auditável fica em `scripts/cloudflare-emergency.mjs`; não crie wrappers com tokens dentro do repositório.

## 3. Analisar o tráfego

1. Abra **Security > Events** no Cloudflare.
2. Filtre pelo intervalo do incidente.
3. Compare IP, ASN, país, método, caminho, User-Agent, ação aplicada e regra acionada.
4. Separe crawlers autorizados de User-Agents apenas declarados pelo cliente; User-Agent pode ser falsificado.
5. Crie uma regra específica somente após confirmar o padrão.
6. Reavalie a regra depois do incidente e remova exceções temporárias que não sejam mais necessárias.

Os crawlers de descoberta autorizados pelo projeto são Googlebot, Bingbot, OAI-SearchBot, PerplexityBot, Claude-SearchBot, Applebot, DuckAssistBot, ChatGPT-User, Perplexity-User, Claude-User, Manus Bot e MistralAI-User. A política do projeto mantém bloqueados GPTBot, ClaudeBot, CCBot, Bytespider, Amazonbot, `meta-externalagent`, Google-Extended e Applebot-Extended. Uma exceção ampla para todos os bots não é aceitável.

## 4. Rollback de deploy

1. Acesse **Workers & Pages** e selecione o projeto `gandra-tech`.
2. Abra **Deployments**.
3. Identifique o último deployment estável por commit, horário e status.
4. Use a ação de rollback disponível no painel, sem apagar deployments.
5. Valide as rotas críticas e os headers antes de encerrar o incidente:

```powershell
$env:PRODUCTION_URL = 'https://gandra.tech'
npm run check:production
Remove-Item Env:PRODUCTION_URL -ErrorAction SilentlyContinue
```

Se o rollback não estiver disponível na interface, publique novamente o commit estável pelo fluxo normal de revisão. Não faça force-push.

## 5. Evidência e encerramento

O incidente pode ser encerrado quando:

- os monitores voltarem ao estado normal;
- as rotas `/`, `/servicos`, `/trabalhos`, `/contato`, `/llms.txt`, `/sitemap.xml` e `/robots.txt` retornarem 200;
- não houver bloqueio indevido de crawlers autorizados;
- o deployment estável estiver identificado;
- Under Attack Mode e bloqueios temporários tiverem sido revertidos quando apropriado;
- o resumo do incidente estiver salvo em local privado, sem tokens, cookies ou dados pessoais.

## 6. Contatos de emergência

Mantenha os contatos atualizados fora do repositório:

- suporte Cloudflare;
- registrador do domínio;
- responsável pelo GitHub e Cloudflare Pages;
- provedor de email e encaminhamento;
- responsável técnico da Gandra Tecnologia.

Não publique contatos pessoais, credenciais ou IDs de conta neste arquivo.

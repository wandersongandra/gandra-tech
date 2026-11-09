# Pedidos de orçamento por Cloudflare Pages Functions + Resend

**Estado: código preparado; envio direto DESATIVADO por padrão.** A jornada
atual (mensagem pronta para e-mail e copiar) continua funcionando sem nenhuma
configuração nova. Não habilitar em produção antes dos passos abaixo.

**Verificação em 09/11/2026:** Cloudflare Email Sending exige Workers Paid nesta
conta. Escolhido Resend Free para envio transacional sem assinatura Workers
Paid. Widget Turnstile `Gandra Tech — Orçamentos` criado para `gandra.tech`,
com `TURNSTILE_SECRET_KEY` armazenada como segredo, a sitekey pública e
`LEADS_FROM_EMAIL=orcamentos@envios.gandra.tech` como variáveis no ambiente de
produção do Cloudflare Pages. Conta Resend acessada e
domínio `envios.gandra.tech` criado em São Paulo, com tracking desativado.
Os três registros de autenticação exigidos pelo Resend Forge foram adicionados
ao DNS da Cloudflare (TXT `resend._domainkey.envios`, CNAME `rsend.envios` e
CNAME `send.envios`, ambos os CNAME em modo **Somente DNS**). Os MX da Hostinger
e o SPF do domínio raiz foram conferidos e preservados. O Resend confirmou a
verificação de `envios.gandra.tech`; uma chave com permissão **Sending access**,
restrita a esse subdomínio, foi criada e salva somente no ambiente **Production**
do Cloudflare Pages como segredo criptografado `RESEND_API_KEY`. Uma chave anterior
de configuração que não chegou a ser utilizada foi revogada; a chave do SGS
permaneceu intacta. **Ainda pendentes:** publicação e testes em preview isolado,
comprovação de entrega real na caixa de entrada, proteção de rate limiting,
revisão final de privacidade e liberação controlada. O formulário segue desativado
por padrão no site público.

## Arquitetura e dados

- Frontend: `components/sections/ContactBrief.tsx`, com ativação por flags no
  build e widget Cloudflare Turnstile carregado só quando ativo.
- Backend: `functions/api/lead.ts` (Cloudflare Pages Function, POST `/api/lead`).
- Antispam: token de Turnstile verificado no servidor, com `hostname` e
  `action` obrigatórios; honeypot, limites de tamanho, validações de campos e
  restrição de origem.
- Entrega: Resend Email REST API, remetente verificado configurado no servidor
  e destinatário fixo `contato@gandra.tech`. Contatos que informem e-mail são
  incluídos como `reply_to` para facilitar o retorno comercial, sem falsificar
  o remetente autenticado. Contatos por telefone não geram `reply_to`.
- Dados: nenhuma gravação em banco ou Analytics. Conteúdo do pedido é processado
  pelo Resend e pela caixa postal comercial. Eventos/registros técnicos e
  retenção do Resend precisam de revisão de privacidade antes de produção.
- Segurança: falha fechada (503 sem configuração); respostas de erro não contêm
  dados pessoais, tokens ou detalhes do provedor; CSP do Turnstile restrita
  à página `/contato`.

## Configurar o Cloudflare antes de habilitar

1. Confirmar que o domínio está no Cloudflare Pages com suporte a Pages
   Functions; verificar como o CI publica o diretório `out/` e a pasta
   `functions/`. Não confundir com deploy estático sem Functions.
2. Widget Cloudflare Turnstile `Gandra Tech — Orçamentos` **criado** somente
   para `gandra.tech`. Configurar o segredo privado apenas no runtime Pages e
   a sitekey pública apenas no build; `action` deve ser `gandra-lead` (fixado
   no frontend e verificado no backend). Para homologação em preview, adicionar
   o hostname de preview com controle e usar exclusivamente dados fictícios.
3. Criar/acessar conta **Resend Free** do responsável. Adicionar e verificar um
   subdomínio dedicado, preferencialmente `envios.gandra.tech`, com os registros
   SPF/DKIM e eventuais registros de retorno **exatamente como apresentados
   pelo Resend**. Comparar cada registro com o DNS atual antes de aplicar.
   Desabilitar tracking de abertura e cliques, desnecessário para orçamento.
   **Não alterar MX nem SPF do domínio raiz, nem a caixa Hostinger**. O
   onboarding do domínio de envio não autoriza ativar recebimento de e-mails
   ou adicionar MX ao domínio principal.
4. Criar API key **Resend Sending access** restrita ao domínio transacional
   quando o painel permitir. Em Pages > Settings > Variables and Secrets,
   configurar **segredos**:

   | Variável do runtime Pages | Tipo | Valor esperado |
   | --- | --- | --- |
   | `TURNSTILE_SECRET_KEY` | Secret | Secret key do Turnstile |
   | `RESEND_API_KEY` | Secret | Chave de envio Resend (`re_...`) |
   | `LEADS_FROM_EMAIL` | Variable | Remetente verificado, ex.: `orcamentos@envios.gandra.tech` |
   | `LEADS_ALLOWED_ORIGIN` | Variable opcional | `https://gandra.tech` (valor padrão) |

5. Configurar no ambiente **de build** do Pages, somente após o backend
   estar validado:

   | Variável pública de build | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_LEADS_ENABLED` | `1` |
   | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Sitekey pública do Turnstile |

   Ambas são necessárias. A secret key do Turnstile e o API token **jamais**
   podem começar com `NEXT_PUBLIC_` nem entrar no Git.

6. Configurar regra de rate limiting/WAF específica para `POST /api/lead`,
   com tolerância razoável para usuários legítimos, e monitorar os retornos
   400/403/429/502/503 sem registrar o corpo das mensagens. Se algum plano
   não permitir essa regra, avaliar proteção equivalente antes da ativação.
7. Fazer revisão jurídica da seção de formulário/Turnstile/Resend na Política
   de Privacidade, LGPD, retenção, transferências internacionais, contratos com
   operador, e canal de privacidade. O texto do Resend é exibido apenas na
   versão com o envio direto habilitado.

## Testes e gate de ativação

Executar em branch / preview isolado:

```bash
npm ci
npm test
npm run typecheck
npm run lint
npm run build
npm run validate:build-security
npm run validate:seo
```

Validar ainda com credenciais reais no ambiente de preview controlado:

- Navegação mobile e desktop, teclado e redução de movimento;
- Widget Turnstile concluído, expirado, bloqueado e token reutilizado;
- Envio válido com e-mail chegando em `contato@gandra.tech` (verificar status
  no painel Resend e a caixa Hostinger, sem bounces);
- Serviço selecionado, resposta informativa para falhas e fallback `mailto:`;
- Rota não aceita payload inválido, sem consentimento, honeypot preenchido,
  origem diferente, nem pedidos quando secrets estão ausentes;
- Cloudflare Pages Functions não deve expor os valores de secrets no bundle;
- Confirmar que as animações do site continuam operantes sem regressão.

O retorno HTTP 202 significa que o Resend aceitou o envio e retornou um ID
válido da mensagem; **não confirma entrega, recebimento ou leitura** pelo
destinatário. Uma resposta HTTP 200 genérica ou fallback HTML não é prova de
aceite. A interface só exibe confirmação após o contrato
`202 {"code":"accepted"}`. Se a rede travar por
25 segundos, o botão deixa o estado de envio pendente e oferece o caminho por
e-mail; nesse caso, verificar se houve duplicidade antes de reenviar.
Sem validação real, o backend permanece **pronto para homologação**, não ativo
para captação em produção.

## Reversão

Remover `NEXT_PUBLIC_LEADS_ENABLED=1` e efetuar novo build/deploy restaura
imediatamente o fluxo de envio pelo aplicativo de e-mail. O endpoint é
independente e fechado sem secrets válidos. Para bloquear um incidente, também
revogar a chave de API Resend e remover o segredo Turnstile do Pages.

## Referências oficiais

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Turnstile no cliente](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Turnstile no servidor](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Turnstile CSP](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)
- [Resend Send Email REST API](https://resend.com/docs/api-reference/emails/send-email)
- [Resend: domínios verificados e subdomínios](https://resend.com/docs/dashboard/domains/introduction)
- [Resend: limites Free](https://resend.com/pricing)

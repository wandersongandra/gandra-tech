# Pedidos de orçamento por Cloudflare Pages Functions

**Estado: código preparado; envio direto DESATIVADO por padrão.** A jornada
atual (mensagem pronta para e-mail e copiar) continua funcionando sem nenhuma
configuração nova. Não habilitar em produção antes dos passos abaixo.

## Arquitetura e dados

- Frontend: `components/sections/ContactBrief.tsx`, com ativação por flags no
  build e widget Cloudflare Turnstile carregado só quando ativo.
- Backend: `functions/api/lead.ts` (Cloudflare Pages Function, POST `/api/lead`).
- Antispam: token de Turnstile verificado no servidor, com `hostname` e
  `action` obrigatórios; honeypot, limites de tamanho, validações de campos e
  restrição de origem.
- Entrega: Cloudflare Email Sending REST API, remetente configurado no servidor
  e destinatário fixo `contato@gandra.tech`.
- Dados: nenhuma gravação em banco ou Analytics. Conteúdo do pedido vai para
  a caixa postal comercial, que passa a ser o repositório das solicitações.
- Segurança: falha fechada (503 sem configuração); respostas de erro não contêm
  dados pessoais, tokens ou detalhes do provedor; CSP do Turnstile restrita
  à página `/contato`.

## Configurar o Cloudflare antes de habilitar

1. Confirmar que o domínio está no Cloudflare Pages com suporte a Pages
   Functions; verificar como o CI publica o diretório `out/` e a pasta
   `functions/`. Não confundir com deploy estático sem Functions.
2. No painel Cloudflare Turnstile, criar widget do domínio `gandra.tech` e
   obter **sitekey pública** e **secret key privada**. Usar `action`
   `gandra-lead` (já fixada no código). Verificar domínio de preview apenas
   se for testar preview com dados fictícios.
3. Configurar Cloudflare Email Sending (beta) para um domínio/remetente da
   Gandra, por exemplo `orcamentos@mail.gandra.tech`. Verificar a
   disponibilidade do serviço no plano, autenticação SPF/DKIM e sender.
   **Preservar MX e o recebimento atual do Hostinger**; onboarding de domínio
   ou subdomínio não autoriza troca indiscriminada de DNS de entrada.
4. Criar API token Cloudflare restrito a Email Sending no account correto.
   Em Pages > Settings > Variables and Secrets, configurar **segredos**:

   | Variável do runtime Pages | Tipo | Valor esperado |
   | --- | --- | --- |
   | `TURNSTILE_SECRET_KEY` | Secret | Secret key do Turnstile |
   | `CLOUDFLARE_EMAIL_SEND_TOKEN` | Secret | Token com escopo mínimo de envio |
   | `CLOUDFLARE_ACCOUNT_ID` | Secret/Variable | ID de conta de 32 hexadecimais |
   | `LEADS_FROM_EMAIL` | Variable | E-mail remetente verificado sob `gandra.tech` |
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
7. Fazer revisão jurídica da seção de formulário/Turnstile na Política de
   Privacidade, LGPD, retenção de e-mails e canal de privacidade. O texto
   alternativo já é exibido apenas na versão com o envio direto habilitado.

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
- Envio válido com e-mail chegando em `contato@gandra.tech` (sem bounces);
- Serviço selecionado, resposta informativa para falhas e fallback `mailto:`;
- Rota não aceita payload inválido, sem consentimento, honeypot preenchido,
  origem diferente, nem pedidos quando secrets estão ausentes;
- Cloudflare Pages Functions não deve expor os valores de secrets no bundle;
- Confirmar que as animações do site continuam operantes sem regressão.

O retorno HTTP 202 significa que a Cloudflare informou o destinatário em
`delivered` ou `queued`; não garante leitura da mensagem pelo destinatário.
Sem validação real, o backend permanece **pronto para homologação**, não ativo
para captação em produção.

## Reversão

Remover `NEXT_PUBLIC_LEADS_ENABLED=1` e efetuar novo build/deploy restaura
imediatamente o fluxo de envio pelo aplicativo de e-mail. O endpoint é
independente e fechado sem secrets válidos. Para bloquear um incidente, também
revogar o token do Email Sending e remover o segredo Turnstile do Pages.

## Referências oficiais

- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Turnstile no cliente](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/)
- [Turnstile no servidor](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)
- [Turnstile CSP](https://developers.cloudflare.com/turnstile/reference/content-security-policy/)
- [Cloudflare Email Sending REST API](https://developers.cloudflare.com/email-service/api/send-emails/rest-api/)

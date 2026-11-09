/**
 * Um HTTP 2xx genérico não comprova o recebimento do orçamento: caso a rota
 * de API deixe de existir, uma página HTML de fallback também pode retornar 200.
 * A interface só confirma o pedido quando recebe o contrato da nossa Function.
 */
export async function isLeadAcceptedResponse(response: Response): Promise<boolean> {
  if (response.status !== 202) return false

  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''
  if (!contentType.startsWith('application/json')) return false

  try {
    const body: unknown = await response.json()
    return Boolean(
      body && typeof body === 'object' && !Array.isArray(body) &&
      (body as { code?: unknown }).code === 'accepted',
    )
  } catch {
    return false
  }
}

/**
 * A API só expõe códigos estáveis; nunca exibimos detalhes arbitrários de uma
 * resposta externa, dados do formulário ou tokens de segurança no feedback.
 * O status ajuda a diagnosticar um Preview sem abrir o DevTools.
 */
const rejectionMessages: Record<string, string> = {
  temporarily_unavailable: 'O envio direto não está disponível neste ambiente.',
  forbidden_origin: 'Este endereço de teste não está autorizado a enviar pedidos. Abra o link oficial da prévia.',
  unsupported_media_type: 'O servidor não reconheceu o formato da solicitação.',
  invalid_payload: 'O servidor não aceitou os dados do formulário. Confira os campos preenchidos.',
  invalid_challenge: 'A verificação de segurança não foi aceita pelo servidor. Refaça a verificação.',
  challenge_unavailable: 'O serviço de verificação de segurança está temporariamente indisponível.',
  delivery_failed: 'O serviço de e-mail não confirmou o recebimento do pedido.',
}

export async function leadRejectionMessage(response: Response): Promise<string> {
  const status = response.status
  const contentType = response.headers.get('content-type')?.toLowerCase() ?? ''

  if (contentType.startsWith('application/json')) {
    try {
      const body: unknown = await response.json()
      if (body && typeof body === 'object' && !Array.isArray(body)) {
        const code = (body as { code?: unknown }).code
        if (typeof code === 'string' && Object.hasOwn(rejectionMessages, code)) {
          return `${rejectionMessages[code]} (HTTP ${status}). Use a opção de e-mail abaixo se precisar.`
        }
      }
    } catch {
      // JSON inválido também não confirma o envio.
    }
  }

  if (status === 404 || status === 405) {
    return `A função de envio não está disponível neste endereço (HTTP ${status}). Use a opção de e-mail abaixo.`
  }
  if (status === 429) {
    return 'Muitas tentativas em sequência (HTTP 429). Aguarde um pouco antes de tentar novamente.'
  }
  return `Não foi possível confirmar o envio (HTTP ${status}). Evite reenviar sem verificar o recebimento ou use a opção de e-mail abaixo.`
}

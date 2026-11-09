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

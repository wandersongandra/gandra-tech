/**
 * O export estático só exibe o envio direto quando ambos os valores públicos
 * são definidos no build. O segredo do Turnstile nunca pertence ao bundle.
 */
export const leadSubmissionEnabled =
  process.env.NEXT_PUBLIC_LEADS_ENABLED === '1' &&
  Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)

export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

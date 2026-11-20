/** Verifica fontes como tokens CSP completos; substrings de URLs não são confiáveis. */
export function hasCspSource(policy, directiveName, expectedSource) {
  const directive = policy.split(';')
    .map((part) => part.trim().split(/\s+/))
    .find((tokens) => tokens[0] === directiveName)

  return Boolean(directive?.slice(1).some((source) => source === expectedSource))
}

/** Verifica a URL completa do preload do widget, inclusive a origem. */
export function hasTurnstilePreload(html) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].some(([tag]) => {
    if (!/\brel="preload"/i.test(tag) || !/\bas="script"/i.test(tag)) return false
    const href = tag.match(/\bhref="([^"]+)"/i)?.[1]
    if (!href) return false
    try {
      const source = new URL(href)
      return source.origin === 'https://challenges.cloudflare.com' &&
        source.pathname === '/turnstile/v0/api.js' &&
        source.search === '?render=explicit'
    } catch {
      return false
    }
  })
}

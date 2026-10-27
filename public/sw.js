const VERSION = 'materia-2026-10-v3'
const STATIC_LIMIT = 120
const SHELL_CACHE = `gandra-shell-${VERSION}`
const STATIC_CACHE = `gandra-static-${VERSION}`
const RUNTIME_CACHE = `gandra-runtime-${VERSION}`
const PRECACHE_URLS = ['/', '/offline.html', '/favicon.svg', '/apple-touch-icon.png']
const NAVIGATION_PATHS = new Set([
  '/',
  '/servicos',
  '/servicos/sites-institucionais',
  '/servicos/portfolios-profissionais',
  '/servicos/sistemas-sob-medida',
  '/servicos/aplicacoes-web',
  '/servicos/automacao-de-processos-e-integracoes',
  '/trabalhos',
  '/trabalhos/sgs',
  '/trabalhos/telma-santos',
  '/trabalhos/gisley-nunes-imoveis',
  '/trabalhos/ajn-consultoria-engenharia',
  '/contato',
  '/termos-de-uso',
  '/politica-de-privacidade',
])

// O Cloudflare Pages tira o ".html" do endereço: /offline.html responde com
// 308 para /offline. O cache.addAll guardava essa resposta "redirected" e o
// navegador recusa entregá-la a uma navegação (net::ERR_FAILED) — sem rede,
// qualquer página não visitada virava a tela de erro do navegador em vez da
// página offline. Guardamos uma cópia limpa, sem a marca de redirecionamento.
async function withoutRedirect(response) {
  if (!response.redirected) return response
  const body = await response.blob()
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  })
}

async function precache() {
  const cache = await caches.open(SHELL_CACHE)
  await Promise.all(
    PRECACHE_URLS.map(async (path) => {
      const response = await fetch(path, { cache: 'reload' })
      if (!response.ok) throw new Error(`precache ${path}: ${response.status}`)
      await cache.put(path, await withoutRedirect(response))
    })
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.endsWith(VERSION))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

function isSafeCacheableResponse(response) {
  if (!response || !response.ok || response.type !== 'basic') return false

  try {
    return new URL(response.url).origin === self.location.origin
  } catch {
    return false
  }
}

async function networkFirstNavigation(request, url) {
  const cache = await caches.open(SHELL_CACHE)
  const canPersist = NAVIGATION_PATHS.has(url.pathname) && url.search === ''

  try {
    const response = await fetch(request)
    if (canPersist && isSafeCacheableResponse(response)) {
      await cache.put(url.pathname, await withoutRedirect(response.clone()))
    }
    return response
  } catch {
    // Sem rede: a própria página se estiver guardada; senão a página offline.
    // (Antes caía na home, servida no endereço errado.)
    return (
      (canPersist ? await cache.match(url.pathname) : undefined) ||
      (await cache.match('/offline.html')) ||
      new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    )
  }
}

async function cacheFirst(request, url) {
  if (url.search !== '') return fetch(request)

  const cached = await caches.match(request)
  if (cached) return cached

  const response = await fetch(request)
  if (isSafeCacheableResponse(response)) {
    const cache = await caches.open(STATIC_CACHE)
    await cache.put(request, response.clone())
    await trim(cache, STATIC_LIMIT)
  }
  return response
}

// Os chunks têm hash: a cada deploy chegam arquivos novos e os velhos
// ficariam para sempre. Mantém só os mais recentes.
async function trim(cache, limit) {
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - limit; i++) await cache.delete(keys[i])
}

async function staleWhileRevalidate(request, url) {
  if (url.search !== '') return fetch(request)

  const cache = await caches.open(RUNTIME_CACHE)
  const cached = await cache.match(request)

  const fresh = fetch(request)
    .then(async (response) => {
      if (isSafeCacheableResponse(response)) {
        await cache.put(request, response.clone())
      }
      return response
    })
    .catch(() => null)

  if (cached) return cached

  const response = await fresh
  if (response) return response

  // imagem/fonte nunca recebe HTML no lugar
  return new Response('', { status: 504, statusText: 'Offline' })
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request, url))
    return
  }

  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, url))
    return
  }

  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    /\.(?:webp|png|svg|ico|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, url))
  }
})

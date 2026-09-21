const VERSION = 'security-hardening-2026-09-v1'
const SHELL_CACHE = `gandra-shell-${VERSION}`
const STATIC_CACHE = `gandra-static-${VERSION}`
const RUNTIME_CACHE = `gandra-runtime-${VERSION}`
const PRECACHE_URLS = ['/', '/offline.html', '/favicon.svg', '/apple-touch-icon.png']
const NAVIGATION_PATHS = new Set([
  '/',
  '/servicos',
  '/trabalhos',
  '/trabalhos/sgs',
  '/trabalhos/telma-santos',
  '/contato',
  '/termos-de-uso',
  '/politica-de-privacidade',
])

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
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
      await cache.put(url.pathname, response.clone())
    }
    return response
  } catch {
    return (
      (canPersist ? await cache.match(url.pathname) : undefined) ||
      (await cache.match('/')) ||
      (await cache.match('/offline.html'))
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
  }
  return response
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

  return (await caches.match('/offline.html')) || new Response('', { status: 504, statusText: 'Offline' })
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

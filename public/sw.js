/*
 * Service worker de retirada.
 *
 * Esta versão existe somente para clientes que ainda tenham o worker antigo
 * registrado. Ao ativar, limpa os caches do site e remove a própria
 * registration. Novas páginas não registram workers.
 */
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('gandra-'))
            .map((key) => caches.delete(key)),
        ),
      ),
      self.registration.unregister(),
    ]).then(() => self.clients.claim()),
  )
})

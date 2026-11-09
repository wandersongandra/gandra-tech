const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

const output = path.resolve(__dirname, '..', 'out')
const origin = 'https://gandra.tech'
const sitemap = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8')
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
const serviceRoutes = urls.map((url) => new URL(url).pathname).filter((route) => /^\/servicos\/[^/]+$/.test(route))

assert.equal(urls.length, 14, 'sitemap deve conter as 14 páginas comerciais indexáveis')
assert.equal(new Set(urls).size, urls.length, 'sitemap contém URLs duplicadas')
const modificationDates = [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((match) => match[1])
assert.equal(modificationDates.length, urls.length, 'sitemap sem lastmod para alguma URL')
for (const date of modificationDates) {
  const timestamp = Date.parse(date)
  assert.ok(Number.isFinite(timestamp) && timestamp <= Date.now() + 86_400_000, `lastmod inválido: ${date}`)
}

function getHtml(route) {
  const filename = route === '/' ? 'index.html' : `${route.slice(1)}.html`
  return fs.readFileSync(path.join(output, filename), 'utf8')
}

function attr(html, tag, name) {
  const match = html.match(tag)
  return match?.[0].match(new RegExp(`${name}="([^"]*)"`))?.[1]
}

for (const url of urls) {
  const page = new URL(url)
  assert.equal(page.origin, origin, `sitemap de outro domínio: ${url}`)
  const route = page.pathname
  const html = getHtml(route)

  assert.match(html, /<html[^>]*lang="pt-BR"/, `${route}: idioma incorreto`)
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1]
  assert.ok(title?.endsWith(' | Gandra Tech'), `${route}: título sem marca ao final`)
  assert.ok(title.length >= 45 && title.length <= 65, `${route}: título fora da faixa editorial: ${title.length}`)

  const description = attr(html, /<meta name="description"[^>]+>/, 'content')
  assert.ok(description?.length >= 140 && description.length <= 160, `${route}: descrição incompleta ou longa: ${description?.length}`)

  const canonical = attr(html, /<link rel="canonical"[^>]+>/, 'href')
  assert.ok(canonical, `${route}: canonical ausente`)
  assert.equal(new URL(canonical).origin, origin, `${route}: canonical de outro domínio`)
  assert.equal(new URL(canonical).pathname, route, `${route}: canonical aponta para outra página`)
  assert.doesNotMatch(html, /<meta name="robots" content="[^"]*noindex/, `${route}: noindex indevido`)
  assert.equal((html.match(/<h1\b/g) || []).length, 1, `${route}: deve haver apenas um H1`)

  // O rodapé oferece caminhos rastreáveis para cada serviço em toda rota pública.
  // Isso permite encontrar as páginas mesmo fora da home animada.
  for (const serviceRoute of serviceRoutes) {
    assert.ok(html.includes(`href="${serviceRoute}"`), `${route}: link interno para ${serviceRoute} ausente`)
  }

  for (const property of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'og:locale']) {
    assert.ok(html.includes(`property="${property}"`), `${route}: ${property} ausente`)
  }
  const expectedOgType = route.startsWith('/trabalhos/') ? 'article' : 'website'
  assert.ok(html.includes(`property="og:type" content="${expectedOgType}"`), `${route}: og:type incorreto`)
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/, `${route}: Twitter Card ausente`)

  const jsonLd = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  assert.ok(jsonLd.length >= 1, `${route}: JSON-LD ausente`)
  for (const [, content] of jsonLd) assert.doesNotThrow(() => JSON.parse(content), `${route}: JSON-LD inválido`)
  if (route !== '/') {
    assert.ok(jsonLd.some(([, content]) => content.includes('BreadcrumbList')), `${route}: breadcrumb JSON-LD ausente`)
  }

  for (const image of html.match(/<img\b[^>]*>/g) || []) {
    assert.match(image, /\balt="[^"]*"/, `${route}: imagem sem alt`)
    assert.match(image, /\bwidth="\d+"/, `${route}: imagem sem width`)
    assert.match(image, /\bheight="\d+"/, `${route}: imagem sem height`)
  }
}

const servicesIndexHtml = getHtml('/servicos')
assert.match(servicesIndexHtml, /Belo Horizonte/, 'serviços: contexto local real ausente')
let documentedCases = 0
for (const serviceRoute of serviceRoutes) {
  const serviceHtml = getHtml(serviceRoute)
  if (serviceHtml.includes('Projeto relacionado:')) {
    documentedCases += 1
    assert.match(serviceHtml, /Conhecer o case de/, `${serviceRoute}: link contextual para o case ausente`)
  }
}
assert.ok(documentedCases >= 4, 'provas de projetos reais ausentes das páginas de serviço relacionadas')

const robots = fs.readFileSync(path.join(output, 'robots.txt'), 'utf8')
for (const blocked of ['/admin', '/api', '/dashboard']) {
  assert.ok(robots.includes(`Disallow: ${blocked}`), `robots.txt: bloqueio ${blocked} ausente`)
}
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap.xml`), 'robots.txt sem sitemap')

for (const filename of ['politica-de-privacidade.html', 'politica-de-cookies.html', 'termos-de-uso.html', '404.html']) {
  const html = fs.readFileSync(path.join(output, filename), 'utf8')
  assert.match(html, /<meta name="robots" content="[^"]*noindex/, `${filename}: noindex ausente`)
}

const cookiesHtml = getHtml('/politica-de-cookies')
for (const key of ['gt-intro', 'gt-som', 'gt-tinta', 'gt-sig', 'gt-scroll']) {
  assert.ok(cookiesHtml.includes(key), `política de cookies: falta explicar ${key}`)
}
assert.match(cookiesHtml, /Cloudflare Web Analytics/, 'política de cookies sem transparência da medição')
for (const route of ['/', '/contato', '/termos-de-uso', '/politica-de-privacidade']) {
  assert.ok(getHtml(route).includes('href="/politica-de-cookies"'), `${route}: link para política de cookies ausente`)
}
assert.doesNotMatch(sitemap, /politica-de-cookies/, 'página legal não deve constar no sitemap comercial')

console.log(`SEO estático validado: ${urls.length} rotas com canonical, H1, metadados, JSON-LD e imagens dimensionadas.`)

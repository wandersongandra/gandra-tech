const { chromium } = require('playwright')

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:3000'
const failures = []

const projectSlugs = [
  'sgs',
  'axiom-health',
  'norte-vivo',
  'marea-finance',
  'orbit-house',
  'vertice-open',
]

function fail(message) {
  failures.push(message)
  console.error(`FAIL: ${message}`)
}

function pass(message) {
  console.log(`PASS: ${message}`)
}

async function assertRoute(page, path, label, expectedStatus = 200) {
  const badSubresources = []
  const onResponse = (response) => {
    if (response.request().resourceType() !== 'document' && response.status() >= 400) {
      badSubresources.push(`${response.status()} ${response.url()}`)
    }
  }
  page.on('response', onResponse)

  const response = await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  if (!response || response.status() !== expectedStatus) {
    fail(`${label}: esperado HTTP ${expectedStatus}, recebido ${response?.status() ?? 'sem resposta'}`)
  } else {
    pass(`${label}: rota respondeu ${expectedStatus}`)
  }

  const pageErrors = await page.evaluate(() => window.__e2ePageErrors || [])
  if (pageErrors.length) fail(`${label}: page errors: ${pageErrors.join(' | ')}`)
  else pass(`${label}: sem page errors`)

  if (badSubresources.length) fail(`${label}: subresources >= 400: ${badSubresources.join(' | ')}`)
  else pass(`${label}: sem subresources quebradas`)

  page.off('response', onResponse)
}

async function assertProjectMetadata(page, slug) {
  const path = `/trabalhos/${slug}`
  await assertRoute(page, path, `projeto ${slug}`)

  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content')
  if (!ogImage) {
    fail(`${slug}: og:image ausente`)
    return
  }

  const response = await page.request.get(ogImage)
  if (!response.ok()) fail(`${slug}: og:image respondeu ${response.status()} (${ogImage})`)
  else pass(`${slug}: og:image válido`)
}

async function main() {
  const browser = await chromium.launch()

  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  await context.addInitScript(() => {
    sessionStorage.setItem('gt-loaded', '1')
    window.__e2ePageErrors = []
    window.addEventListener('error', (event) => {
      window.__e2ePageErrors.push(event.message)
    })
    window.addEventListener('unhandledrejection', (event) => {
      window.__e2ePageErrors.push(String(event.reason))
    })
  })
  const page = await context.newPage()

  const consoleErrors = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })

  const homeResponse = await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  if (!homeResponse) {
    fail('home: resposta ausente')
  } else {
    const headers = homeResponse.headers()
    const expectedHeaders = [
      'content-security-policy',
      'strict-transport-security',
      'x-content-type-options',
      'x-frame-options',
      'referrer-policy',
      'permissions-policy',
    ]
    for (const header of expectedHeaders) {
      if (!headers[header]) fail(`security header ausente: ${header}`)
      else pass(`security header presente: ${header}`)
    }
  }

  await assertRoute(page, '/', 'home')
  await assertRoute(page, '/trabalhos', 'trabalhos')
  await assertRoute(page, '/contato', 'contato')
  for (const slug of projectSlugs) await assertProjectMetadata(page, slug)
  await assertRoute(page, '/nao-existe', '404 customizado', 404)

  for (const [path, label] of [
    ['/trabalhos', 'trabalhos'],
    ['/contato', 'contato'],
    ['/trabalhos/sgs', 'projeto'],
  ]) {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' })
    const h1Count = await page.locator('h1').count()
    if (h1Count !== 1) fail(`${label}: esperado 1 h1, encontrado ${h1Count}`)
    else pass(`${label}: hierarquia principal possui 1 h1`)
  }

  await page.goto(`${BASE_URL}/contato`, { waitUntil: 'networkidle' })
  const unsafeBlankLinks = await page.locator('a[target="_blank"]').evaluateAll((links) =>
    links
      .filter((link) => {
        const rel = (link.getAttribute('rel') || '').toLowerCase()
        return !rel.includes('noopener') || !rel.includes('noreferrer')
      })
      .map((link) => link.getAttribute('href'))
  )
  if (unsafeBlankLinks.length) fail(`links _blank sem proteção: ${unsafeBlankLinks.join(', ')}`)
  else pass('links _blank protegidos')

  await page.goto(BASE_URL, { waitUntil: 'networkidle' })
  await page.keyboard.press('Tab')
  const focusState = await page.evaluate(() => {
    const el = document.activeElement
    if (!(el instanceof HTMLElement)) return null
    const style = getComputedStyle(el)
    return { tag: el.tagName, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth }
  })
  if (!focusState || focusState.outlineStyle === 'none' || focusState.outlineWidth === '0px') {
    fail('teclado: foco visível não detectado no primeiro elemento focável')
  } else {
    pass(`teclado: foco visível em ${focusState.tag}`)
  }

  if (consoleErrors.length) fail(`console errors: ${consoleErrors.join(' | ')}`)
  else pass('desktop: sem console.error')

  await context.close()

  const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' })
  await reducedContext.addInitScript(() => sessionStorage.setItem('gt-loaded', '1'))
  const reducedPage = await reducedContext.newPage()
  await reducedPage.goto(BASE_URL, { waitUntil: 'networkidle' })
  await reducedPage.waitForTimeout(700)

  const reducedState = await reducedPage.evaluate(() => {
    const sticky = document.querySelector('.work-rail__sticky')
    const items = Array.from(document.querySelectorAll('.work-item'))
    const hiddenMotion = Array.from(document.querySelectorAll('[data-motion]')).filter(
      (element) => getComputedStyle(element).opacity === '0'
    ).length
    const viewport = document.documentElement.clientWidth
    return {
      stickyPosition: sticky ? getComputedStyle(sticky).position : null,
      items: items.map((item) => {
        const rect = item.getBoundingClientRect()
        return { left: rect.left, right: rect.right }
      }),
      hiddenMotion,
      viewport,
      hasLenis: Boolean(window.__lenis),
    }
  })

  if (reducedState.stickyPosition !== 'static') fail(`reduced-motion: rail ainda sticky (${reducedState.stickyPosition})`)
  else pass('reduced-motion: rail usa fallback estático')

  if (reducedState.hasLenis) fail('reduced-motion: Lenis permaneceu ativo')
  else pass('reduced-motion: smooth scroll pesado desativado')

  if (reducedState.hiddenMotion) fail(`reduced-motion: ${reducedState.hiddenMotion} elementos de motion ficaram invisíveis`)
  else pass('reduced-motion: conteúdo animado permanece visível')

  const clippedItems = reducedState.items.filter((item) => item.left < -1 || item.right > reducedState.viewport + 1)
  if (clippedItems.length) fail(`reduced-motion: ${clippedItems.length} projetos horizontalmente cortados`)
  else pass('reduced-motion: todos os projetos permanecem acessíveis na viewport')

  await reducedContext.close()

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  })
  await mobileContext.addInitScript(() => sessionStorage.setItem('gt-loaded', '1'))
  const mobilePage = await mobileContext.newPage()
  await mobilePage.goto(BASE_URL, { waitUntil: 'networkidle' })
  await mobilePage.waitForTimeout(900)
  const mobileLayout = await mobilePage.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    customCursorVisible: Array.from(document.querySelectorAll('.c-dot, .c-ring')).some(
      (el) => getComputedStyle(el).display !== 'none'
    ),
  }))

  if (mobileLayout.scrollWidth > mobileLayout.viewport + 1) {
    fail(`mobile: overflow horizontal ${mobileLayout.scrollWidth}px > ${mobileLayout.viewport}px`)
  } else {
    pass('mobile: sem overflow horizontal')
  }

  if (mobileLayout.customCursorVisible) fail('mobile: cursor customizado visível em pointer coarse')
  else pass('mobile: cursor customizado corretamente oculto')

  await mobileContext.close()
  await browser.close()

  if (failures.length) {
    console.error(`\nE2E QUALITY GATE: ${failures.length} falha(s)`)
    process.exit(1)
  }

  console.log('\nE2E QUALITY GATE: PASS')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

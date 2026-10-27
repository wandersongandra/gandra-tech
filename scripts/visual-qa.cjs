const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const origin = process.env.QA_ORIGIN || 'http://127.0.0.1:4173'
const screenshotDir = path.join(__dirname, '..', 'artifacts', 'visual')
fs.mkdirSync(screenshotDir, { recursive: true })

// Regressões da caça a bugs (fase 4): cada bloco reproduz um bug que um
// visitante viu de verdade.
// Fase 5 — o fólio: peças lazy, reduced-motion e as interações principais.
async function fase5(browser) {
  const html = (n) => origin + '/' + n + '.html'
  const folio = (page) => page.waitForFunction(() => document.documentElement.dataset.folio === 'on', null, { timeout: 15000 })
  const fresh = async (opts = {}) => {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
    await ctx.addInitScript(() => sessionStorage.setItem('gt-intro', '1'))
    return ctx
  }
  // 1) nada do fólio no JS carregado até o load; depois ele monta
  {
    const ctx = await fresh()
    const page = await ctx.newPage()
    const early = []
    let loaded = false
    page.on('load', () => { loaded = true })
    page.on('response', (r) => { if (!loaded && r.url().endsWith('.js')) early.push(r) })
    await page.goto(html('contato'), { waitUntil: 'load' })
    for (const r of early) {
      const body = await r.text().catch(() => '')
      assert.ok(!body.includes('GANDRA ✶ APROVADO') && !body.includes('gt-liquid'), 'fólio: entrou no JS inicial (' + r.url() + ')')
    }
    await folio(page)
    // 5) campo de tipos: canvas decorativo, fora da árvore de acessibilidade
    assert.equal(await page.locator('canvas.m-glyphs[aria-hidden="true"]').count(), 1, 'tipos móveis: canvas ausente no hero do contato')
    // 7) clique curto abre na hora; segurar carimba e não abre
    await page.evaluate(() => {
      window.__mail = []
      document.addEventListener('click', (e) => { if (e.target.closest('a[href^="mailto:"]')) { window.__mail.push(e.defaultPrevented); e.preventDefault() } })
    })
    const box = await page.locator('.cp-hero__email').boundingBox()
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
    await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up()
    await page.waitForTimeout(100)
    assert.deepEqual(await page.evaluate(() => window.__mail), [false], 'carimbo: clique curto no e-mail não passou direto')
    assert.equal(await page.locator('.m-stamp').count(), 0, 'carimbo: clique curto carimbou')
    await page.mouse.down(); await page.waitForTimeout(800); await page.mouse.up()
    await page.waitForTimeout(150)
    assert.equal(await page.locator('.m-stamp').count(), 1, 'carimbo: segurar não carimbou')
    assert.equal((await page.evaluate(() => window.__mail)).length, 1, 'carimbo: segurar também abriu o e-mail')
    assert.equal(await page.locator('.cp-hero__email').evaluate((e) => getComputedStyle(e).touchAction), 'manipulation', 'carimbo: sem touch-action manipulation')
    // 6) texto líquido no hover; o logotipo fica de fora
    await page.locator('.site-header__link').first().hover()
    await page.waitForTimeout(120)
    assert.match(await page.locator('.site-header__link').first().evaluate((e) => e.style.filter), /gt-liquid/, 'líquido: filtro não entrou no hover')
    await page.locator('.site-header__logo').hover()
    await page.waitForTimeout(120)
    assert.equal(await page.locator('.site-header__logo').evaluate((e) => e.style.filter), '', 'líquido: o logotipo recebeu o filtro')
    await ctx.close()
  }
  // 2) card → case: view transition nativa, sem cortina, chega no topo
  {
    const ctx = await fresh()
    await ctx.addInitScript(() => {
      const vt = document.startViewTransition
      window.__vt = 0
      if (vt) document.startViewTransition = function (...a) { window.__vt++; return vt.apply(this, a) }
    })
    const page = await ctx.newPage()
    await page.goto(html('trabalhos'), { waitUntil: 'load' })
    await folio(page)
    const card = page.locator('a.project-card[href^="/trabalhos/"]').first()
    await card.scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)
    await card.click({ noWaitAfter: true })
    await page.waitForURL(/\/trabalhos\/[^/.]+/, { timeout: 8000 })
    await page.waitForTimeout(1600)
    assert.ok((await page.evaluate(() => window.__vt)) >= 1, 'morph: startViewTransition não foi usado')
    assert.ok((await page.evaluate(() => window.scrollY)) <= 2, 'morph: o case não começou no topo')
    // 4) ficha carimbada: régua e marcas de registro
    assert.equal(await page.locator('.m-case__reg').count(), 4, 'ficha: marcas de registro ausentes')
    if (await page.evaluate(() => CSS.supports('animation-timeline: scroll()'))) {
      assert.equal(await page.locator('.m-case__ruler-fill').evaluate((e) => getComputedStyle(e).animationName), 'm-ruler', 'ficha: régua sem scroll(root)')
    }
    await ctx.close()
  }
  // 3) mergulho no ponto; 8) origami e 404 amassada
  {
    const ctx = await fresh()
    const page = await ctx.newPage()
    await page.goto(html('index'), { waitUntil: 'load' })
    await folio(page)
    assert.ok((await page.locator('.m-dive').evaluate((e) => e.offsetHeight)) > 900, 'mergulho: trilho sem altura com movimento')
    await page.goto(html('servicos'), { waitUntil: 'load' })
    await folio(page)
    assert.ok((await page.locator('.service-page__item.is-folded').count()) > 0, 'origami: nenhum serviço chegou dobrado')
    for (let y = 0; y < 12000; y += 500) { await page.mouse.wheel(0, 500); await page.waitForTimeout(90) }
    await page.waitForTimeout(1200)
    assert.equal(await page.locator('.service-page__item.is-folded').count(), 0, 'origami: serviço ficou dobrado depois de rolar')
    await page.goto(html('404'), { waitUntil: 'load' })
    await folio(page)
    assert.ok(await page.locator('.nf-sheet').evaluate((e) => e.classList.contains('is-ball')), '404: a folha não chegou amassada')
    await page.waitForTimeout(3000)
    assert.equal(await page.locator('.nf-sheet').evaluate((e) => getComputedStyle(e).clipPath), 'none', '404: a folha não desamassou')
    await ctx.close()
  }
  // GSAP não chega (rede, deploy novo): o conteúdo esperando a animação aparece parado
  {
    const ctx = await fresh()
    await ctx.route(/\/_next\/static\/chunks\/.*\.js$/, async (route) => {
      const res = await route.fetch()
      const body = await res.text()
      if (/GreenSock|_getGSAP/.test(body)) return route.abort()
      return route.fulfill({ response: res, body })
    })
    const page = await ctx.newPage()
    await page.goto(html('contato'), { waitUntil: 'load' })
    await page.waitForTimeout(2000)
    assert.equal(await page.locator('.cp-hero__label').evaluate((e) => getComputedStyle(e).opacity), '1', 'sem GSAP: rótulo do contato ficou invisível')
    await ctx.close()
  }
  // reduced-motion: tudo parado e aberto, só cor no link
  {
    const ctx = await fresh({ reducedMotion: 'reduce' })
    const page = await ctx.newPage()
    await page.goto(html('servicos'), { waitUntil: 'load' })
    await folio(page)
    assert.equal(await page.locator('.service-page__item.is-folded').count(), 0, 'reduced: origami fechado')
    const link = page.locator('.site-header__link').first()
    await link.hover()
    await page.waitForTimeout(350)
    assert.equal(await link.evaluate((e) => e.style.filter), '', 'reduced: filtro líquido com movimento reduzido')
    assert.equal(await link.evaluate((e) => getComputedStyle(e).color), 'rgb(179, 48, 14)', 'reduced: link sem a troca de cor')
    await page.goto(html('index'), { waitUntil: 'load' })
    await folio(page)
    assert.ok((await page.locator('.m-dive').evaluate((e) => e.offsetHeight)) <= 16, 'reduced: mergulho não virou faixa')
    await page.goto(html('404'), { waitUntil: 'load' })
    await folio(page)
    assert.ok(!(await page.locator('.nf-sheet').evaluate((e) => e.classList.contains('is-crumpled'))), 'reduced: 404 amassada')
    await page.goto(html('contato'), { waitUntil: 'load' })
    await folio(page)
    assert.equal(await page.locator('canvas.m-glyphs').count(), 1, 'reduced: campo de tipos estático ausente')
    await ctx.close()
  }
}

async function regressions(browser) {
  const html = (n) => origin + '/' + n + '.html'
  // 1) Cortina cobre a tela no meio da troca; página nova começa no topo.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(html('trabalhos/sgs'), { waitUntil: 'load' })
    // SGS não tem site público: sem convite para "ver o site no ar".
    assert.equal(await page.locator('.m-case__live').count(), 0, 'case SGS: convite para site no ar não deveria existir')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(800)
    await page.evaluate(() => window.scrollTo(0, 1500))
    await page.waitForTimeout(400)
    await page.locator('.m-case__next').click({ noWaitAfter: true })
    let covered = false
    for (let i = 0; i < 12 && !covered; i++) {
      await page.waitForTimeout(80)
      covered = await page.evaluate(() => Math.abs(document.querySelector('.curtain').getBoundingClientRect().top) <= 8)
    }
    assert.ok(covered, 'cortina: o painel nunca cobriu a tela (y em px virava -100%)')
    await page.waitForURL(/\/trabalhos\/(?!sgs)/, { timeout: 5000 })
    await page.waitForTimeout(1600)
    assert.ok((await page.evaluate(() => window.scrollY)) <= 2, 'rolagem: página nova não começou no topo')
    // 2) tel:, Ctrl+clique e âncora da mesma página não passam pela cortina.
    const intercepted = await page.evaluate(() => {
      const out = {}
      const probe = (href, init) => {
        const a = document.createElement('a')
        a.href = href
        a.textContent = 'x'
        document.body.appendChild(a)
        let prevented = null
        const spy = (e) => { prevented = e.defaultPrevented; e.preventDefault() }
        window.addEventListener('click', spy)
        a.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0, ...init }))
        window.removeEventListener('click', spy)
        a.remove()
        return prevented
      }
      out.tel = probe('tel:+5500000000', {})
      out.ctrl = probe('/servicos', { ctrlKey: true })
      out.meta = probe('/servicos', { metaKey: true })
      out.hash = probe(location.pathname + '#x', {})
      return out
    })
    assert.deepEqual(intercepted, { tel: false, ctrl: false, meta: false, hash: false }, 'cortina: interceptou link que é do navegador')
    // 3) Camada de manchas não infla a página.
    const layer = await page.evaluate(() => {
      const l = document.querySelector('.m-stains')
      return l ? +l.getAttribute('height') - Math.max(document.body.offsetHeight, innerHeight) : 0
    })
    assert.ok(layer <= 2, 'manchas: camada mais alta que a página (' + layer + 'px)')
    // 4) Intro não repete em aba nova; modo tinta volta antes da pintura.
    await page.evaluate(() => sessionStorage.setItem('gt-tinta', '1'))
    const tab = await ctx.newPage()
    await tab.goto(html('servicos'), { waitUntil: 'domcontentloaded' })
    assert.equal(await tab.evaluate(() => document.documentElement.hasAttribute('data-intro')), false, 'abertura: repetiu em aba nova')
    await page.goto(html('contato'), { waitUntil: 'domcontentloaded' })
    assert.equal(await page.evaluate(() => document.documentElement.dataset.tinta || ''), 'on', 'modo tinta: só voltou depois da pintura')
    await page.evaluate(() => sessionStorage.removeItem('gt-tinta'))
    await ctx.close()
  }
  // 5) Interação antes do idle não monta a camada surreal duas vezes.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const page = await ctx.newPage()
    await page.goto(origin, { waitUntil: 'commit' })
    await page.waitForSelector('main')
    await page.keyboard.press('Shift')
    await page.waitForLoadState('load')
    await page.keyboard.press('Shift')
    await page.waitForFunction(() => document.documentElement.dataset.surreal === 'on', null, { timeout: 10000 })
    await page.waitForTimeout(1500)
    const n = await page.evaluate(() => [document.querySelectorAll('.m-stains').length, document.querySelectorAll('.m-brush').length, document.querySelectorAll('.m-sound').length])
    assert.deepEqual(n, [1, 1, 1], 'surreal: camada montada em dobro')
    await ctx.close()
  }
  // 6) Menu mobile: fechar não pula para o topo, chave de som some e o
  //    botão de fechar entra no ciclo do Tab.
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })
    const page = await ctx.newPage()
    await page.goto(html('servicos'), { waitUntil: 'load' })
    await page.waitForFunction(() => document.documentElement.dataset.press === 'on', null, { timeout: 10000 })
    await page.evaluate(() => window.scrollTo(0, 600))
    await page.waitForTimeout(300)
    await page.tap('.site-header__menu-toggle')
    await page.waitForTimeout(400)
    assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.m-sound')).visibility), 'hidden', 'menu: chave de som por cima do menu')
    const seq = []
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Tab')
      seq.push(await page.evaluate(() => document.activeElement?.classList.contains('site-header__menu-toggle')))
    }
    assert.ok(seq.includes(true), 'menu: botão de fechar fora do ciclo de foco')
    await page.tap('.site-header__menu-toggle')
    await page.waitForTimeout(400)
    assert.ok(Math.abs((await page.evaluate(() => window.scrollY)) - 600) <= 2, 'menu: fechar jogou a página para o topo')
    await ctx.close()
  }
}

// Caça a bugs 2026-10 (docs/BUG-SWEEP-2026-10.md).
async function bugSweep(browser) {
  const html = (n) => origin + '/' + n + '.html'
  // B2) Ano do rodapé: no ano seguinte ao build não pode haver erro de hidratação.
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } })
    const page = await ctx.newPage()
    const year = new Date().getFullYear() + 1
    await page.clock.install({ time: new Date(year + '-01-03T12:00:00-03:00') })
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()) })
    await page.goto(origin + '/', { waitUntil: 'load' })
    await page.waitForTimeout(1500)
    const copy = await page.locator('.site-footer__copy').textContent()
    assert.ok(copy.includes(String(year)), 'rodapé: ano não atualizou no cliente (' + copy + ')')
    assert.ok(!errors.some((t) => /418|[Hh]ydrat/.test(t)), 'rodapé: erro de hidratação com o ano trocado: ' + errors.join(' | '))
    await ctx.close()
  }
  // B4) /#trabalhos vindo de uma página curta cai na seção (Lenis remedido).
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript(() => sessionStorage.setItem('gt-intro', '1'))
    const page = await ctx.newPage()
    await page.goto(html('termos-de-uso'), { waitUntil: 'load' })
    await page.waitForTimeout(1500)
    await page.locator('.site-header__nav a', { hasText: 'Trabalhos' }).click()
    await page.waitForURL(/#trabalhos$/, { timeout: 8000 })
    await page.waitForTimeout(2500)
    const top = await page.evaluate(() => Math.round(document.querySelector('#trabalhos').getBoundingClientRect().top))
    assert.ok(Math.abs(top - 65) <= 6, 'âncora: /#trabalhos vindo de outra página parou fora da seção (top=' + top + ')')
    await ctx.close()
  }
  // B3) Campo de glifos do /contato: sair da página ou colapsar o host não lança.
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    await ctx.addInitScript(() => sessionStorage.setItem('gt-intro', '1'))
    const page = await ctx.newPage()
    const errors = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto(html('contato'), { waitUntil: 'load' })
    await page.waitForTimeout(1500)
    await page.evaluate(() => {
      const host = document.querySelector('[data-glyphs]')
      if (host) { host.style.width = '0px'; host.style.height = '0px'; window.dispatchEvent(new Event('resize')) }
    })
    await page.waitForTimeout(800)
    await page.locator('.site-header a[href="/"]').first().click()
    await page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 8000 })
    await page.waitForTimeout(2000)
    assert.deepEqual(errors, [], 'contato: erro de canvas ao colapsar/sair: ' + errors.join(' | '))
    await ctx.close()
  }
}


async function touchMobileQa(browser) {
  // Emulação real de toque: hover:none + pointer:coarse. Garante que as
  // adaptações mobile (dica, prévia por scroll, alvos ≥44px) existem.
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3,
  })
  const page = await ctx.newPage()
  await page.goto(origin, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1800)
  const media = await page.evaluate(() => ({
    fine: matchMedia('(hover: hover) and (pointer: fine)').matches,
    coarse: matchMedia('(pointer: coarse)').matches,
  }))
  assert.equal(media.fine, false, 'touch-qa: deveria reportar ponteiro não-fino')
  assert.equal(media.coarse, true, 'touch-qa: deveria reportar ponteiro coarse')

  const hint = await page.evaluate(() => {
    const t = document.querySelector('.m-hero__hint-touch')
    const d = document.querySelector('.m-hero__hint')
    return {
      touch: t ? getComputedStyle(t).display : 'missing',
      desk: d ? getComputedStyle(d).display : 'missing',
    }
  })
  assert.ok(hint.touch !== 'none' && hint.touch !== 'missing', 'touch-qa: dica "Toque a palavra" ausente (' + hint.touch + ')')
  assert.equal(hint.desk, 'none', 'touch-qa: dica de cursor ainda visível no toque')

  const sizes = await page.evaluate(() => {
    const box = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const b = el.getBoundingClientRect()
      return { w: Math.round(b.width), h: Math.round(b.height) }
    }
    return {
      sound: box('.m-sound'),
      toggle: box('.site-header__menu-toggle'),
    }
  })
  assert.ok(sizes.toggle && sizes.toggle.w >= 44 && sizes.toggle.h >= 44, 'touch-qa: menu < 44px')
  // a chave de som só aparece depois do idle; se já estiver no DOM, checa
  if (sizes.sound) {
    assert.ok(sizes.sound.w >= 44 && sizes.sound.h >= 44, 'touch-qa: chave de som < 44px')
  }

  // Prévia por scroll: a linha central ganha is-peek
  await page.evaluate(() => document.querySelector('#trabalhos')?.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(900)
  await page.evaluate(() => {
    const mid = innerHeight * 0.48
    const links = [...document.querySelectorAll('.work-row__link')]
    let best = null, bestD = Infinity
    for (const l of links) {
      const r = l.getBoundingClientRect()
      const d = Math.abs(r.top + r.height / 2 - mid)
      if (d < bestD) { bestD = d; best = l }
    }
    window.scrollBy(0, (best?.getBoundingClientRect().top + best?.getBoundingClientRect().height / 2) - mid)
  })
  await page.waitForTimeout(500)
  const peeked = await page.evaluate(() => document.querySelectorAll('.work-row__link.is-peek').length)
  assert.ok(peeked >= 1, 'touch-qa: nenhuma linha com prévia por scroll')

  // Serviços: prévia por scroll deve caber na viewport (borda direita ancorada)
  await page.evaluate(() => document.querySelector('#servicos')?.scrollIntoView({ block: 'center' }))
  await page.waitForTimeout(900)
  await page.evaluate(() => {
    const mid = innerHeight * 0.5
    const rows = [...document.querySelectorAll('.m-services__list [data-preview]')]
    let best = null, bestD = Infinity
    for (const row of rows) {
      const r = row.getBoundingClientRect()
      const d = Math.abs(r.top + r.height / 2 - mid)
      if (d < bestD) { bestD = d; best = row }
    }
    if (best) window.scrollBy(0, (best.getBoundingClientRect().top + best.getBoundingClientRect().height / 2) - mid)
  })
  await page.waitForTimeout(900) // espera a transição de scale da prévia
  const svcPrev = await page.evaluate(() => {
    const el = document.querySelector('.m-services__preview')
    if (!el) return { missing: true }
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return {
      visible: el.classList.contains('is-visible'),
      touch: el.classList.contains('is-touch'),
      left: Math.round(r.left),
      right: Math.round(r.right),
      w: Math.round(r.width),
      cssW: parseFloat(cs.width) || 0,
      vw: window.innerWidth,
    }
  })
  assert.ok(!svcPrev.missing, 'touch-qa: prévia de serviços ausente')
  assert.ok(svcPrev.touch, 'touch-qa: prévia de serviços sem is-touch')
  assert.ok(svcPrev.visible, 'touch-qa: prévia de serviços não ficou visível no scroll')
  assert.ok(svcPrev.left >= -2, 'touch-qa: prévia de serviços cortada à esquerda: ' + JSON.stringify(svcPrev))
  assert.ok(svcPrev.right <= svcPrev.vw + 2, 'touch-qa: prévia de serviços cortada à direita: ' + JSON.stringify(svcPrev))
  assert.ok(svcPrev.cssW >= 140 || svcPrev.w >= 140, 'touch-qa: prévia de serviços estreita demais: ' + JSON.stringify(svcPrev))

  // Footer: links de navegação ≥44px
  await page.evaluate(() => document.querySelector('footer')?.scrollIntoView())
  await page.waitForTimeout(600)
  const foot = await page.evaluate(() => [...document.querySelectorAll('.m-footer .m-link')].map((a) => {
    const b = a.getBoundingClientRect()
    return { t: a.textContent.trim().slice(0, 20), h: Math.round(b.height) }
  }))
  assert.ok(foot.length >= 3, 'touch-qa: links do rodapé ausentes')
  assert.ok(foot.every((f) => f.h >= 44), 'touch-qa: link do rodapé < 44px: ' + JSON.stringify(foot))

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
  assert.ok(overflow <= 2, 'touch-qa: overflow ' + overflow)
  await ctx.close()
}

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_CHROME || undefined })
  try {
    for (const viewport of [
      { name: 'mobile', width: 390, height: 844 },
      { name: 'desktop', width: 1440, height: 900 },
    ]) {
      const context = await browser.newContext({ viewport, deviceScaleFactor: 1 })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      await page.goto(origin, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(300)
      // Abertura (fase 4): 1ª visita da sessão marca html[data-intro] antes da pintura.
      assert.ok(await page.evaluate(() => document.documentElement.hasAttribute('data-intro')), viewport.name + ': abertura não marcou data-intro')
      assert.equal(await page.locator('.m-intro[aria-hidden="true"]').count(), 1, viewport.name + ': camada da abertura ausente')
      // Trabalhos na home: índice tipográfico (sem fotos soltas); a linha leva ao case.
      assert.equal(await page.locator('#trabalhos .project-card').count(), 0, viewport.name + ': cards com foto não deveriam voltar à home')
      const rows = await page.locator('#trabalhos .work-row__link').evaluateAll((links) => links.map((a) => ({ href: a.getAttribute('href'), target: a.getAttribute('target'), domain: a.querySelector('.work-row__domain')?.textContent || '' })))
      assert.equal(rows.length, 4, viewport.name + ': lista de projetos incompleta')
      assert.ok(rows.every((r) => /^\/trabalhos\/[a-z0-9-]+$/.test(r.href) && r.target === null), viewport.name + ': linha da lista deve abrir o case, não o site externo')
      assert.ok(rows.some((r) => r.domain.includes('ajnengenharia.com.br')), viewport.name + ': domínio do site no ar ausente na lista')
      assert.equal(await page.locator('.work-rail').count(), 0, viewport.name + ': rail horizontal antigo ainda renderizado')
      assert.equal(await page.locator('#laboratorio').count(), 0, viewport.name + ': seção do laboratório 3D não deveria existir')
      // Só os rastros de tinta 2D (.m-ink-trail) podem existir; nada de WebGL.
      assert.equal(await page.locator('canvas:not(.m-ink-trail):not(.m-halftone):not(.m-brush)').count(), 0, viewport.name + ': nenhum canvas WebGL deveria ser montado na home')
      // Prévia do site no ar (ponteiro fino): <picture> responsivo, só decoração.
      const peeks = await page.evaluate(() => [...document.querySelectorAll('.work-row__peek picture')].map(pic => ({
        avif: !!pic.querySelector('source[type="image/avif"][srcset]'),
        webp: !!pic.querySelector('source[type="image/webp"][srcset]'),
        sized: !!pic.querySelector('img[width][height]'),
        hidden: pic.closest('.work-row__peek').getAttribute('aria-hidden') === 'true',
      })))
      assert.equal(peeks.length, 4, viewport.name + ': prévias da lista ausentes')
      assert.ok(peeks.every(i => i.avif && i.webp && i.sized && i.hidden), viewport.name + ': prévia sem AVIF/WebP, sem width/height ou exposta ao leitor de tela')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert.ok(overflow <= 2, viewport.name + ': overflow de ' + overflow + 'px')
      await page.screenshot({ path: path.join(screenshotDir, 'home-' + viewport.name + '.png'), fullPage: true })
      if (viewport.name === 'mobile') {
        await page.locator('.site-header__menu-toggle').click()
        assert.ok(await page.getByRole('dialog', { name: 'Menu principal' }).isVisible())
        await page.waitForTimeout(450)
        // O menu precisa receber o toque de verdade: um ancestral com
        // backdrop-filter já prendeu o painel fixo dentro do header.
        const hit = await page.evaluate(() => {
          const link = document.querySelector('.mobile-menu__link')
          if (!link) return 'sem link'
          const r = link.getBoundingClientRect()
          const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
          return el && link.contains(el) ? 'ok' : (el ? el.className || el.tagName : 'nada')
        })
        assert.equal(hit, 'ok', 'mobile: link do menu coberto por outro elemento')
        await page.keyboard.press('Escape')
        assert.equal(await page.getByRole('dialog', { name: 'Menu principal' }).count(), 0)
      }
      // Camada surreal (fase 3): monta depois do load, sem erros.
      await page.waitForFunction(() => document.documentElement.dataset.surreal === 'on', null, { timeout: 10000 })
      assert.ok(await page.locator('.m-hero .m-drip').count() >= 6, viewport.name + ': gotas do GANDRA ausentes')
      assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.m-manifesto__word')).display), 'inline-block', viewport.name + ': palavras do manifesto sem inline-block')
      // Prensa (fase 4): abertura terminou; meio-tom, rolo, som e modo tinta.
      await page.waitForFunction(() => !document.documentElement.hasAttribute('data-intro'), null, { timeout: 3000 })
      const intro = await page.evaluate(() => ({ attr: document.documentElement.hasAttribute('data-intro'), display: getComputedStyle(document.querySelector('.m-intro')).display }))
      assert.deepEqual(intro, { attr: false, display: 'none' }, viewport.name + ': abertura não saiu da tela')
      await page.waitForFunction(() => document.documentElement.dataset.press === 'on', null, { timeout: 10000 })
      assert.ok(await page.locator('.m-press .m-press__roller').count() >= 1, viewport.name + ': rolo da prensa ausente nos títulos')
      assert.equal(await page.locator('button.m-sound[aria-pressed="false"]').count(), 1, viewport.name + ': chave de som deveria nascer desligada')
      assert.equal(await page.evaluate(() => document.querySelectorAll('canvas:not(.m-ink-trail):not(.m-halftone):not(.m-brush)').length), 0, viewport.name + ': canvas inesperado')
      if (viewport.name === 'desktop') {
        const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
        for (const k of konami) await page.keyboard.press(k)
        await page.waitForTimeout(1100)
        assert.equal(await page.evaluate(() => document.documentElement.dataset.tinta), 'on', 'desktop: código Konami não ligou o modo tinta')
        for (const k of konami) await page.keyboard.press(k)
        await page.waitForTimeout(1100)
        assert.equal(await page.evaluate(() => document.documentElement.dataset.tinta || ''), '', 'desktop: modo tinta não desligou')
      }
      await page.evaluate(() => window.scrollTo(0, window.scrollY + document.querySelector('.m-contact').getBoundingClientRect().top))
      await page.waitForTimeout(700)
      assert.equal(await page.evaluate(() => document.querySelector('.m-contact').style.clipPath), '', viewport.name + ': inundação do contato não terminou')
      await page.mouse.click(Math.round(viewport.width / 2), 200)
      assert.ok(await page.locator('.m-stains .m-stain').count() >= 1, viewport.name + ': clique não deixou mancha')
      assert.deepEqual(errors, [], viewport.name + ': erros JavaScript')
      await context.close()
    }

    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    await page.goto(origin, { waitUntil: 'domcontentloaded' })
    assert.ok(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    await page.locator('#trabalhos').scrollIntoViewIfNeeded()
    assert.ok(await page.locator('#trabalhos').isVisible())
    // Sem movimento: nada da camada surreal liga (só o tom do papel).
    await page.waitForLoadState('load')
    await page.waitForTimeout(3000)
    await page.mouse.click(200, 300)
    const still = await page.evaluate(() => ({
      surreal: document.documentElement.dataset.surreal || '',
      drips: document.querySelectorAll('.m-drip').length,
      stains: document.querySelectorAll('.m-stain').length,
      clip: document.querySelector('.m-contact')?.style.clipPath || '',
      intro: document.documentElement.hasAttribute('data-intro'),
      press: document.querySelectorAll('.m-press, .m-halftone, .m-brush, .m-sound').length,
    }))
    assert.deepEqual(still, { surreal: '', drips: 0, stains: 0, clip: '', intro: false, press: 0 }, 'reduced-motion: camada surreal/prensa não deveria montar')
    await context.close()
    for (const name of ['gisley-nunes-imoveis', 'ajn-consultoria-engenharia']) {
      assert.ok(fs.existsSync(path.join(__dirname, '..', 'out', 'trabalhos', name + '.html')) ||
        fs.existsSync(path.join(__dirname, '..', 'out', 'trabalhos', name, 'index.html')))
    }
    const caseContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const casePage = await caseContext.newPage()
    await casePage.goto(origin + '/trabalhos/gisley-nunes-imoveis.html', { waitUntil: 'domcontentloaded' })
    await casePage.waitForTimeout(250)
    assert.equal(await casePage.locator('.m-case__plate img').count(), 1, 'case: capa real ausente')
    assert.ok(await casePage.locator('.m-case__shot img').count() >= 2, 'case: galeria visual incompleta')
    assert.equal(await casePage.locator('.m-case__chapter').count(), 5, 'case: capítulos da narrativa ausentes')
    assert.equal(await casePage.locator('script[type="application/ld+json"]').count() >= 1, true, 'case: JSON-LD ausente')
    assert.ok(await casePage.locator('.m-case__next[data-curtain]').count() === 1, 'case: link do próximo case sem rótulo da cortina')
    // Convite para o site no ar: abre em nova aba, sem opener/referrer.
    const live = casePage.locator('.m-case__live a[href="https://www.gisleynunesimoveis.com.br/"]')
    assert.equal(await live.count(), 1, 'case: convite para o site no ar ausente')
    assert.equal(await live.getAttribute('target'), '_blank')
    assert.deepEqual((await live.getAttribute('rel')).split(' ').sort(), ['noopener', 'noreferrer'], 'case: link externo sem noopener noreferrer')
    assert.equal(await casePage.locator('.m-case__live .m-case__browser img[width][height]').count(), 1, 'case: captura do site sem dimensões')
    assert.ok((await casePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 2, 'case: overflow horizontal')
    await casePage.screenshot({ path: path.join(screenshotDir, 'case-gisley-desktop.png'), fullPage: true })
    // Cortina de entrada: o nome do destino aparece antes da navegação.
    // Espera a hidratação; antes dela o link navega sem a cortina.
    await casePage.waitForLoadState('networkidle')
    await casePage.waitForTimeout(800)
    const expected = await casePage.locator('.m-case__next').getAttribute('data-curtain')
    await casePage.locator('.m-case__next').click({ noWaitAfter: true })
    await casePage.waitForFunction(
      (exp) => document.querySelector('.curtain__logo')?.textContent === exp,
      expected,
      { timeout: 2500 }
    )
    const label = await casePage.evaluate(() => document.querySelector('.curtain__logo')?.textContent || '')
    assert.equal(label, expected, 'cortina: rótulo do destino não apareceu')
    await casePage.waitForURL(/\/trabalhos\/(?!gisley)/, { timeout: 5000 })
    await caseContext.close()
    await regressions(browser)
    await fase5(browser)
    await bugSweep(browser)
    process.stdout.write('QA: desktop, mobile, camada surreal, prensa (abertura, meio-tom, rolo, som, modo tinta), reduced-motion, menu, projetos reais, galeria e rotas exportadas e regressões da caça a bugs e fase 5 (fólio) passaram.\n')
    await touchMobileQa(browser)
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

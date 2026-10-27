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
      assert.equal(await page.locator('.project-grid--home .project-card').count(), 4, viewport.name + ': grade de projetos incompleta')
      assert.equal(await page.locator('.project-grid--home .project-card__media img').count(), 4, viewport.name + ': imagens reais dos projetos ausentes')
      assert.equal(await page.locator('.work-rail').count(), 0, viewport.name + ': rail horizontal antigo ainda renderizado')
      assert.equal(await page.locator('#laboratorio').count(), 0, viewport.name + ': seção do laboratório 3D não deveria existir')
      // Só os rastros de tinta 2D (.m-ink-trail) podem existir; nada de WebGL.
      assert.equal(await page.locator('canvas:not(.m-ink-trail):not(.m-halftone):not(.m-brush)').count(), 0, viewport.name + ': nenhum canvas WebGL deveria ser montado na home')
      const images = await page.evaluate(() => [...document.querySelectorAll('.project-card__media picture')].map(pic => ({
        avif: !!pic.querySelector('source[type="image/avif"][srcset]'),
        webp: !!pic.querySelector('source[type="image/webp"][srcset]'),
        sized: !!pic.querySelector('img[width][height]'),
      })))
      assert.equal(images.length, 4, viewport.name + ': cards sem <picture> responsivo')
      assert.ok(images.every(i => i.avif && i.webp && i.sized), viewport.name + ': card sem AVIF/WebP ou sem width/height')
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
      assert.ok(await page.locator('.project-card__media .m-halftone').count() >= 1, viewport.name + ': meio-tom das fotos ausente')
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
    assert.ok((await casePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 2, 'case: overflow horizontal')
    await casePage.screenshot({ path: path.join(screenshotDir, 'case-gisley-desktop.png'), fullPage: true })
    // Cortina de entrada: o nome do destino aparece antes da navegação.
    // Espera a hidratação; antes dela o link navega sem a cortina.
    await casePage.waitForLoadState('networkidle')
    await casePage.waitForTimeout(800)
    await casePage.locator('.m-case__next').click({ noWaitAfter: true })
    await casePage.waitForTimeout(150)
    const label = await casePage.evaluate(() => document.querySelector('.curtain__logo')?.textContent || '')
    const expected = await casePage.evaluate(() => document.querySelector('.m-case__next')?.getAttribute('data-curtain') || '')
    assert.equal(label, expected, 'cortina: rótulo do destino não apareceu')
    await casePage.waitForURL(/\/trabalhos\/(?!gisley)/, { timeout: 5000 })
    await caseContext.close()
    await regressions(browser)
    await fase5(browser)
    process.stdout.write('QA: desktop, mobile, camada surreal, prensa (abertura, meio-tom, rolo, som, modo tinta), reduced-motion, menu, projetos reais, galeria e rotas exportadas e regressões da caça a bugs e fase 5 (fólio) passaram.\n')
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

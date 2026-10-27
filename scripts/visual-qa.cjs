const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const origin = process.env.QA_ORIGIN || 'http://127.0.0.1:4173'
const screenshotDir = path.join(__dirname, '..', 'artifacts', 'visual')
fs.mkdirSync(screenshotDir, { recursive: true })

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
    process.stdout.write('QA: desktop, mobile, camada surreal, prensa (abertura, meio-tom, rolo, som, modo tinta), reduced-motion, menu, projetos reais, galeria e rotas exportadas passaram.\n')
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

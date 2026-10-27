const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const origin = 'http://127.0.0.1:4173'
const screenshotDir = path.join(__dirname, '..', 'artifacts', 'visual')
fs.mkdirSync(screenshotDir, { recursive: true })

async function main() {
  const browser = await chromium.launch({ headless: true })
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
      assert.equal(await page.locator('.project-grid--home .project-card').count(), 4, viewport.name + ': grade de projetos incompleta')
      assert.equal(await page.locator('.project-grid--home .project-card__media img').count(), 4, viewport.name + ': imagens reais dos projetos ausentes')
      assert.equal(await page.locator('.work-rail').count(), 0, viewport.name + ': rail horizontal antigo ainda renderizado')
      assert.equal(await page.locator('#laboratorio').count(), 0, viewport.name + ': seção do laboratório 3D não deveria existir')
      assert.equal(await page.locator('canvas').count(), 0, viewport.name + ': nenhum canvas WebGL deveria ser montado na home')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert.ok(overflow <= 2, viewport.name + ': overflow de ' + overflow + 'px')
      await page.screenshot({ path: path.join(screenshotDir, 'home-' + viewport.name + '.png'), fullPage: true })
      if (viewport.name === 'mobile') {
        await page.locator('.site-header__menu-toggle').click()
        assert.ok(await page.getByRole('dialog', { name: 'Menu principal' }).isVisible())
        await page.keyboard.press('Escape')
        assert.equal(await page.getByRole('dialog', { name: 'Menu principal' }).count(), 0)
      }
      assert.deepEqual(errors, [], viewport.name + ': erros JavaScript')
      await context.close()
    }

    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 844 } })
    const page = await context.newPage()
    await page.goto(origin, { waitUntil: 'domcontentloaded' })
    assert.ok(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    await page.locator('#trabalhos').scrollIntoViewIfNeeded()
    assert.ok(await page.locator('#trabalhos').isVisible())
    await context.close()
    for (const name of ['gisley-nunes-imoveis', 'ajn-consultoria-engenharia']) {
      assert.ok(fs.existsSync(path.join(__dirname, '..', 'out', 'trabalhos', name + '.html')) ||
        fs.existsSync(path.join(__dirname, '..', 'out', 'trabalhos', name, 'index.html')))
    }
    const caseContext = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const casePage = await caseContext.newPage()
    await casePage.goto(origin + '/trabalhos/gisley-nunes-imoveis.html', { waitUntil: 'domcontentloaded' })
    await casePage.waitForTimeout(250)
    assert.equal(await casePage.locator('.pv-gallery__figure').count(), 2, 'case: galeria visual incompleta')
    assert.ok(await casePage.locator('.pv-gallery__image img').count() >= 2, 'case: imagens reais não carregadas')
    assert.equal(await casePage.locator('.pv-hero__cover img').count(), 1, 'case: capa real ausente')
    assert.ok((await casePage.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)) <= 2, 'case: overflow horizontal')
    await casePage.screenshot({ path: path.join(screenshotDir, 'case-gisley-desktop.png'), fullPage: true })
    await caseContext.close()
    process.stdout.write('QA: desktop, mobile, reduced-motion, menu, projetos reais, galeria e rotas exportadas passaram.\n')
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

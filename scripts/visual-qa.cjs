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
      await page.locator('#laboratorio').scrollIntoViewIfNeeded()
      await page.waitForTimeout(1200)
      assert.match(await page.locator('.lab__title').innerText(), /experiência também/i)
      assert.equal(await page.locator('.lab__link').getAttribute('href'), '/trabalhos')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert.ok(overflow <= 2, viewport.name + ': overflow de ' + overflow + 'px')
      await page.screenshot({ path: path.join(screenshotDir, 'lab-' + viewport.name + '.png') })
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
    await page.locator('#laboratorio').scrollIntoViewIfNeeded()
    assert.ok(await page.locator('.lab__title').isVisible())
    await context.close()
    for (const name of ['gisley-nunes-imoveis', 'ajn-consultoria-engenharia']) {
      assert.ok(fs.existsSync(path.join(__dirname, '..', 'out', 'trabalhos', name + '.html')) ||
        fs.existsSync(path.join(__dirname, '..', 'out', 'trabalhos', name, 'index.html')))
    }
    process.stdout.write('QA: desktop, mobile, reduced-motion, menu e rotas exportadas passaram.\n')
  } finally {
    await browser.close()
  }
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})

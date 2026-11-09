const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const origin = process.env.QA_ORIGIN || 'http://127.0.0.1:4173'
const screenshotDir = path.join(__dirname, '..', 'artifacts', 'visual')
fs.mkdirSync(screenshotDir, { recursive: true })

async function main() {
  const browser = await chromium.launch()
  try {
    for (const viewport of [
      { name: 'desktop', width: 1440, height: 900 },
      { name: 'mobile', width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({ viewport, reducedMotion: 'reduce' })
      const page = await context.newPage()
      await page.goto(`${origin}/politica-de-cookies.html`, { waitUntil: 'load' })
      const button = page.getByRole('button', { name: 'Apagar preferências visuais deste site' })
      await button.waitFor()
      await page.waitForFunction(() => !document.querySelector('.legal-page__preferences button')?.disabled)

      await page.evaluate(() => {
        for (const key of ['gt-intro', 'gt-som']) localStorage.setItem(key, '1')
        for (const key of ['gt-intro', 'gt-tinta', 'gt-sig', 'gt-scroll']) sessionStorage.setItem(key, '1')
        localStorage.setItem('outro-servico', 'preservar')
        sessionStorage.setItem('outro-servico', 'preservar')
      })

      await button.click()
      assert.match(await page.locator('.legal-page__preferences-status').innerText(), /Preferências apagadas/)
      const remaining = await page.evaluate(() => ({
        local: ['gt-intro', 'gt-som'].map((key) => localStorage.getItem(key)),
        session: ['gt-intro', 'gt-tinta', 'gt-sig', 'gt-scroll'].map((key) => sessionStorage.getItem(key)),
        localOther: localStorage.getItem('outro-servico'),
        sessionOther: sessionStorage.getItem('outro-servico'),
      }))
      assert.deepEqual(remaining.local, [null, null], `${viewport.name}: chaves locais não apagadas`)
      assert.deepEqual(remaining.session, [null, null, null, null], `${viewport.name}: chaves de sessão não apagadas`)
      assert.equal(remaining.localOther, 'preservar')
      assert.equal(remaining.sessionOther, 'preservar')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert.ok(overflow <= 2, `${viewport.name}: overflow horizontal de ${overflow}px`)
      await button.scrollIntoViewIfNeeded()
      await page.screenshot({ path: path.join(screenshotDir, `cookies-controle-${viewport.name}.png`) })

      await page.evaluate(() => {
        const original = Storage.prototype.removeItem
        Storage.prototype.removeItem = function (key) {
          if (key === 'gt-som') throw new Error('armazenamento bloqueado')
          return original.call(this, key)
        }
      })
      await button.click()
      assert.match(await page.locator('.legal-page__preferences-status').innerText(), /Não foi possível confirmar/, `${viewport.name}: falha parcial omitida`)
      await context.close()
    }

    const noJs = await browser.newContext({ javaScriptEnabled: false })
    const fallback = await noJs.newPage()
    await fallback.goto(`${origin}/politica-de-cookies.html`, { waitUntil: 'load' })
    assert.equal(await fallback.getByRole('button', { name: 'Apagar preferências visuais deste site' }).isDisabled(), true)
    assert.ok(await fallback.locator('noscript').count(), 'instrução sem JavaScript ausente')
    await noJs.close()

    console.log('Privacidade: limpeza seletiva e estados de sucesso/erro validados em desktop, mobile e sem JavaScript.')
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

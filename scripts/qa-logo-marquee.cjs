const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { chromium } = require('playwright')

const origin = process.env.QA_ORIGIN || 'http://127.0.0.1:4173'
const fallbackChromium = '/usr/bin/chromium'
const executablePath = process.env.CHROMIUM_PATH ||
  (fs.existsSync(chromium.executablePath()) ? undefined :
    (fs.existsSync(fallbackChromium) ? fallbackChromium : undefined))

const expected = [
  ['sgs', 'sgs.svg'],
  ['telma-santos', 'telma-santos.webp'],
  ['gisley-nunes-imoveis', 'gisley-nunes.jpeg'],
  ['ajn-consultoria-engenharia', 'ajn.webp'],
  ['laboratorio-dental-araujo', 'laboratorio-dental-araujo.png'],
]

async function main() {
  const browser = await chromium.launch({ headless: true, executablePath, args: ['--no-sandbox'] })
  try {
    for (const { label, width, reduced } of [
      { label: 'desktop', width: 1440, reduced: false },
      { label: 'mobile', width: 390, reduced: false },
      { label: 'reduced-desktop', width: 1440, reduced: true },
      { label: 'reduced-mobile', width: 390, reduced: true },
    ]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 },
        reducedMotion: reduced ? 'reduce' : 'no-preference',
      })
      const page = await context.newPage()
      await page.goto(`${origin}/index.html`, { waitUntil: 'load' })
      const section = page.locator('.m-clients')
      await section.scrollIntoViewIfNeeded()
      const groups = page.locator('.m-clients__group')
      const links = groups.first().locator('a.m-clients__link')
      assert.equal(await groups.count(), 4, `${label}: grupos do loop`)
      assert.equal(await links.count(), expected.length, `${label}: logos únicos`)
      assert.equal(await page.locator('.m-clients__link[tabindex="-1"]').count(), expected.length * 3, `${label}: clones fora da ordem de foco`)

      for (const [index, [slug, file]] of expected.entries()) {
        const link = links.nth(index)
        assert.equal(await link.getAttribute('href'), `/trabalhos/${slug}`, `${label}: case ${slug}`)
        const img = link.locator('img')
        assert.ok((await img.getAttribute('src')).endsWith(`/images/project-logos/${file}`), `${label}: logo ${slug}`)
        assert.ok(await img.evaluate(async (element) => {
          await element.decode().catch(() => {})
          return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0
        }), `${label}: logo ${slug} precisa carregar`)
      }

      const animation = await page.locator('.m-clients__track').evaluate((element) => getComputedStyle(element).animationName)
      assert.equal(animation, reduced ? 'none' : 'm-marquee', `${label}: política de movimento`)
      if (reduced) {
        assert.ok(!(await groups.nth(1).isVisible()), `${label}: repetições ocultas`)
        const geometry = await section.evaluate((element) => ({ sectionWidth: element.getBoundingClientRect().width, documentWidth: document.documentElement.scrollWidth }))
        assert.ok(geometry.sectionWidth <= width + 2, `${label}: seção excedeu a tela`)
        assert.ok(geometry.documentWidth <= width + 2, `${label}: overflow horizontal`)
      } else {
        await page.locator('.m-clients__viewport').hover({ force: true })
        const paused = await page.locator('.m-clients__track').evaluate((element) => getComputedStyle(element).animationPlayState)
        assert.equal(paused, 'paused', `${label}: animação deve pausar no hover`)
      }
      if (process.env.QA_SCREENSHOTS === '1') {
        const target = path.join(__dirname, '..', 'artifacts', 'visual', `logos-${label}.png`)
        fs.mkdirSync(path.dirname(target), { recursive: true })
        await section.screenshot({ path: target, animations: 'disabled' })
      }
      await context.close()
      process.stdout.write(`Logo marquee ${label}: PASS\n`)
    }
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

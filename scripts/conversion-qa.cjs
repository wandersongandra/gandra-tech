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
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin })
      await context.addInitScript(() => sessionStorage.setItem('gt-intro', '1'))
      const page = await context.newPage()

      await page.goto(`${origin}/contato.html?servico=sites-institucionais#orcamento`, { waitUntil: 'load' })
      await page.waitForFunction(() => {
        const field = document.querySelector('#brief-service')
        return field && !field.disabled && field.value === 'sites-institucionais'
      }, null, { timeout: 15000 })

      await page.locator('#brief-name').fill('Cliente de teste')
      await page.locator('#brief-contact').fill('cliente@example.com')
      await page.locator('#brief-project').fill('Preciso de um site institucional para apresentar meus serviços.')

      const href = await page.locator('.cp-brief__submit').getAttribute('href')
      const emailUrl = new URL(href)
      assert.equal(emailUrl.protocol, 'mailto:')
      assert.equal(emailUrl.pathname, 'contato@gandra.tech')
      assert.match(emailUrl.searchParams.get('subject'), /Sites institucionais/)
      const body = emailUrl.searchParams.get('body')
      for (const snippet of ['Cliente de teste', 'cliente@example.com', 'Preciso de um site institucional']) {
        assert.ok(body.includes(snippet), `${viewport.name}: resumo perdeu ${snippet}`)
      }

      assert.match(await page.locator('.cp-brief__disclaimer').last().innerText(), /contratação automática/, `${viewport.name}: transparência comercial ausente`)
      assert.ok(await page.locator('.cp-brief__disclaimer a[href="/termos-de-uso"]').count(), `${viewport.name}: termos inacessíveis no orçamento`)
      assert.ok(await page.locator('.cp-brief__disclaimer a[href="/politica-de-privacidade"]').count(), `${viewport.name}: política de privacidade inacessível no orçamento`)
      await page.locator('.cp-brief__submit[href^="mailto:"]').evaluate((link) => link.addEventListener('click', (event) => event.preventDefault()))
      await page.locator('.cp-brief__submit[href^="mailto:"]').click()
      assert.match(await page.locator('.cp-brief__feedback').last().innerText(), /Confirme o envio no aplicativo de e-mail/, `${viewport.name}: orientação pós-clique ausente`)
      await page.locator('.cp-brief__copy').click()
      // A escrita no clipboard é assíncrona: aguardar o resultado real da UI.
      await page.waitForFunction(() => {
        const text = document.querySelector('.cp-brief__feedback:last-of-type')?.textContent ?? ''
        return text.includes('Mensagem copiada') || text.includes('Não foi possível copiar')
      }, null, { timeout: 5000 })
      assert.match(await page.locator('.cp-brief__feedback').last().innerText(), /Mensagem copiada/, `${viewport.name}: fallback de cópia falhou`)
      assert.match(await page.evaluate(() => navigator.clipboard.readText()), /Preciso de um site institucional/, `${viewport.name}: área de transferência não recebeu o briefing`)
      assert.doesNotMatch(await page.locator('.cp-brief__feedback').last().innerText(), /Confirme o envio/, `${viewport.name}: orientação de e-mail obsoleta após copiar`)
      await page.locator('#brief-project').fill('Preciso de um site institucional para apresentar serviços e projetos.')
      assert.equal(await page.locator('.cp-brief__feedback').last().innerText(), '', `${viewport.name}: feedback antigo permaneceu depois de editar o briefing`)

      await page.locator('.cp-brief__preview summary').click()
      assert.match(await page.locator('.cp-brief__preview pre').innerText(), /Sites institucionais/)
      await page.locator('#orcamento').scrollIntoViewIfNeeded()
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      assert.ok(overflow <= 2, `${viewport.name}: overflow horizontal de ${overflow}px`)
      await page.screenshot({ path: path.join(screenshotDir, `contato-orcamento-${viewport.name}.png`) })

      // Conteúdo desconhecido na query nunca pode definir o serviço escolhido.
      await page.goto(`${origin}/contato.html?servico=slug-inexistente`, { waitUntil: 'load' })
      await page.waitForFunction(() => !document.querySelector('#brief-service')?.disabled)
      assert.equal(await page.locator('#brief-service').inputValue(), '', 'slug desconhecido não foi ignorado')

      await page.goto(`${origin}/contato.html?servico=sites-institucionais&referencia=laboratorio-dental-araujo#orcamento`, { waitUntil: 'load' })
      await page.waitForFunction(() => document.querySelector('.cp-brief__reference')?.textContent?.includes('Laboratório Dental Araújo'))
      const caseMail = new URL(await page.locator('.cp-brief__submit[href^="mailto:"]').getAttribute('href'))
      assert.match(caseMail.searchParams.get('body'), /Case de referência: Laboratório Dental Araújo/, `${viewport.name}: contexto do case não chegou ao orçamento`)
      await page.locator('#orcamento').scrollIntoViewIfNeeded()
      assert.ok(await page.locator('.cp-brief__reference button').isVisible(), `${viewport.name}: remover referência ficou inacessível`)
      const referenceOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      assert.ok(referenceOverflow <= 2, `${viewport.name}: referência causou overflow de ${referenceOverflow}px`)
      await page.screenshot({ path: path.join(screenshotDir, `contato-referencia-${viewport.name}.png`) })
      await page.locator('.cp-brief__reference button').click()
      assert.equal(await page.locator('.cp-brief__reference').count(), 0, `${viewport.name}: referência não foi removida`)
      const plainMail = new URL(await page.locator('.cp-brief__submit[href^="mailto:"]').getAttribute('href'))
      assert.doesNotMatch(plainMail.searchParams.get('body'), /Case de referência:/, `${viewport.name}: referência removida ficou na mensagem`)

      await page.goto(`${origin}/contato.html?referencia=slug-forjado`, { waitUntil: 'load' })
      await page.waitForFunction(() => !document.querySelector('#brief-service')?.disabled)
      assert.equal(await page.locator('.cp-brief__reference').count(), 0, `${viewport.name}: referência desconhecida foi aceita`)
      assert.doesNotMatch(new URL(await page.locator('.cp-brief__submit[href^="mailto:"]').getAttribute('href')).searchParams.get('body'), /Case de referência:/)

      await page.goto(`${origin}/trabalhos/laboratorio-dental-araujo.html`, { waitUntil: 'load' })
      const finale = await page.locator('.m-case__finale a[href*="referencia="]').getAttribute('href')
      assert.ok(finale, `${viewport.name}: case não oferece caminho ao orçamento contextualizado`)
      assert.match(finale, /servico=sites-institucionais/, `${viewport.name}: serviço incorreto no CTA do case`)
      assert.match(finale, /referencia=laboratorio-dental-araujo/, `${viewport.name}: referência ausente no CTA do case`)
      await context.close()
    }

    const noJs = await browser.newContext({ javaScriptEnabled: false })
    const fallback = await noJs.newPage()
    await fallback.goto(`${origin}/contato.html`, { waitUntil: 'load' })
    assert.ok(await fallback.locator('#brief-service').isDisabled(), 'sem JS: campo não pode fingir que envia dados')
    assert.match(await fallback.locator('.cp-brief__submit').getAttribute('href'), /^mailto:contato@gandra\.tech/)
    assert.ok(await fallback.locator('noscript').count() >= 1, 'sem JS: aviso ausente')
    await noJs.close()

    console.log('Conversão: serviço pré-selecionado, mensagem dinâmica, fallback sem JS e layouts desktop/mobile validados.')
  } finally {
    await browser.close()
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

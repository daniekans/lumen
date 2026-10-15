import { expect, test, type Page } from '@playwright/test'

const collectErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

test('home lists every visualization', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  const cards = page.locator('main a[href^="/"]').filter({ has: page.locator('h3') })
  expect(await cards.count()).toBeGreaterThan(0)
  expect(errors).toEqual([])
})

test('every visualization renders and survives its steps', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  const hrefs = await page
    .locator('nav a[href^="/"]')
    .evaluateAll((links) => links.map((a) => a.getAttribute('href')!))
  expect(hrefs.length).toBeGreaterThan(0)

  for (const href of hrefs) {
    await page.goto(href)
    await expect(page.locator('main svg[role="img"]').first()).toBeVisible()
    const steps = page.locator('aside ol > li > button')
    for (let i = 0; i < (await steps.count()); i++) {
      await steps.nth(i).click()
      await page.waitForTimeout(400)
    }
    expect(errors, `errors on ${href}`).toEqual([])
  }
})

test('theme toggle switches tokens', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  const before = await html.getAttribute('data-theme')
  await page.keyboard.press('t')
  await expect(html).not.toHaveAttribute('data-theme', before ?? '')
})

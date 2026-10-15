import { expect, test, type Page } from '@playwright/test'

const collectErrors = (page: Page) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  return errors
}

/** Item links from every area's tree in the sidebar. */
const allItemLinks = async (page: Page) => {
  const hrefs = new Set<string>()
  const tabs = page.getByRole('tab')
  for (let i = 0; i < (await tabs.count()); i++) {
    await tabs.nth(i).click()
    // Open every collapsed branch so all item links are rendered.
    const collapsed = page.locator('nav button[aria-expanded="false"]')
    while ((await collapsed.count()) > 0) await collapsed.first().click()
    for (const href of await page
      .locator('nav a[href]')
      .evaluateAll((links) => links.map((a) => a.getAttribute('href')!)))
      hrefs.add(href)
  }
  return [...hrefs].filter((h) => h.split('/').filter(Boolean).length === 4)
}

test('home lists areas and courses', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mathematics' })).toBeVisible()
  expect(errors).toEqual([])
})

test('every item renders and survives its steps', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/')
  const hrefs = await allItemLinks(page)
  expect(hrefs.length).toBeGreaterThanOrEqual(7)
  for (const href of hrefs) {
    await page.goto(href)
    await expect(page.locator('main svg[role="img"]').first()).toBeVisible()
    const steps = page.locator('aside ol > li > button')
    for (let i = 0; i < (await steps.count()); i++) {
      await steps.nth(i).click()
      await page.waitForTimeout(300)
    }
    expect(errors, `errors on ${href}`).toEqual([])
  }
})

test('old paths redirect to the content tree', async ({ page }) => {
  await page.goto('/calculus/derivative-as-limit')
  await expect(page).toHaveURL(/\/mathematics\/calculus-1\/derivatives\/derivative-as-limit$/)
})

test('area, course and unit pages render', async ({ page }) => {
  const errors = collectErrors(page)
  for (const path of [
    '/mathematics',
    '/mathematics/pre-calculus',
    '/mathematics/calculus-1/derivatives',
  ]) {
    await page.goto(path)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  }
  expect(errors).toEqual([])
})

test('skill statuses can be set and persist', async ({ page }) => {
  await page.goto('/mathematics/linear-algebra/linear-transformations')
  await page.getByRole('button', { name: /The determinant as signed area: New/ }).click()
  await page.getByRole('menuitemradio', { name: /Mastered/ }).click()
  await page.waitForTimeout(500)
  await page.reload()
  await expect(
    page.getByRole('button', { name: /The determinant as signed area: Mastered/ }),
  ).toBeVisible()
  // And back down again.
  await page.getByRole('button', { name: /The determinant as signed area: Mastered/ }).click()
  await page.getByRole('menuitemradio', { name: /Practiced/ }).click()
  await expect(
    page.getByRole('button', { name: /The determinant as signed area: Practiced/ }),
  ).toBeVisible()
})

test('a lesson completes after all steps and checks', async ({ page }) => {
  await page.goto('/mathematics/calculus-1/derivatives/derivative-as-limit')
  const steps = page.locator('aside ol > li > button')
  await steps.nth(1).click()
  await steps.nth(2).click()
  await page.getByRole('radio', { name: /slope of the tangent/ }).click()
  await expect(page.getByRole('status')).toContainText('Correct.')
  await steps.nth(3).click()
  await page.getByLabel('Your answer').fill('-0.4')
  await page.getByRole('button', { name: 'Check', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Done', exact: true })).toBeVisible()
  await page.waitForTimeout(500)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Done', exact: true })).toBeVisible()
})

test('progress survives export, reset and import', async ({ page }, testInfo) => {
  await page.goto('/mathematics/complex-numbers/arithmetic')
  await page.getByRole('button', { name: /Multiplication as rotation and scaling: New/ }).click()
  await page.getByRole('menuitemradio', { name: /Proficient/ }).click()

  await page.getByRole('button', { name: 'Settings and progress' }).click()
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ])
  const file = testInfo.outputPath('progress.json')
  await download.saveAs(file)

  await page.getByRole('button', { name: 'Reset progress' }).click()
  await page.getByRole('button', { name: 'Clear all progress' }).click()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(
    page.getByRole('button', { name: /Multiplication as rotation and scaling: New/ }),
  ).toBeVisible()

  await page.getByRole('button', { name: 'Settings and progress' }).click()
  await page.locator('input[type="file"]').setInputFiles(file)
  await expect(page.getByText(/Imported progress/)).toBeVisible()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(
    page.getByRole('button', { name: /Multiplication as rotation and scaling: Proficient/ }),
  ).toBeVisible()
})

test('theme toggle switches tokens', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  const before = await html.getAttribute('data-theme')
  await page.keyboard.press('t')
  await expect(html).not.toHaveAttribute('data-theme', before ?? '')
})

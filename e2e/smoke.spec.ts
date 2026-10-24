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
  // Visits every item, so the time grows with the content.
  test.setTimeout(240_000)
  const errors = collectErrors(page)
  await page.goto('/')
  const hrefs = await allItemLinks(page)
  expect(hrefs.length).toBeGreaterThanOrEqual(7)
  for (const href of hrefs) {
    await page.goto(href)
    // Visual items draw a stage; practice and checkpoint items show problem cards.
    await expect(page.locator('main svg[role="img"], main article').first()).toBeVisible()
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
  await steps.nth(4).click()
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

  await page.getByRole('button', { name: 'Progress and backup' }).click()
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

  await page.getByRole('button', { name: 'Progress and backup' }).click()
  await page.locator('input[type="file"]').setInputFiles(file)
  await expect(page.getByText(/Imported progress/)).toBeVisible()
  await page.getByRole('button', { name: 'Close' }).click()
  await expect(
    page.getByRole('button', { name: /Multiplication as rotation and scaling: Proficient/ }),
  ).toBeVisible()
})

test('a chosen answer can be cleared', async ({ page }) => {
  await page.goto('/mathematics/calculus-1/derivatives/derivative-as-limit')
  await page.locator('aside ol > li > button').nth(2).click()
  const wrong = page.getByRole('radio', { name: /Nothing, because/ })
  await wrong.click()
  await expect(page.getByRole('status')).toContainText('Not quite.')
  await wrong.click()
  await expect(page.getByRole('status')).toHaveCount(0)
  await expect(wrong).toHaveAttribute('aria-checked', 'false')
})

test('"I already know this unit" marks content done and can be undone', async ({ page }) => {
  await page.goto('/mathematics/calculus-1/derivatives')
  // The item count grows with the unit, so read it from the page.
  const none = page.getByText(/^0 of \d+ done$/)
  await expect(none).toBeVisible()
  const total = (await none.textContent())!.match(/of (\d+)/)![1]
  await page.getByRole('button', { name: 'I already know this unit' }).click()
  await expect(page.getByText(`${total} of ${total} done`)).toBeVisible()
  await page.getByRole('button', { name: /Undo/ }).click()
  await expect(none).toBeVisible()
})

test('a practice session runs to its summary', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/mathematics/calculus-1/derivatives/difference-quotients')
  for (let i = 0; i < 8; i++) {
    const field = page.locator('math-field')
    if (i === 0 && (await field.count())) {
      await field.click()
      await page.keyboard.type('123457')
      await page.getByRole('button', { name: 'Check', exact: true }).click()
      await expect(page.getByRole('status').first()).toContainText('Not quite.')
      // A wrong first answer does not advance the counter.
      await expect(page.locator('main article').getByText('1 / 8')).toBeVisible()
    }
    await page.getByRole('button', { name: /^Show the (worked )?solution$/ }).click()
    await expect(page.getByText('Solution', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: /Next problem|See results/ }).click()
  }
  await expect(page.getByText(/of 8 correct/)).toBeVisible()
  await page.getByRole('button', { name: 'Review answers' }).click()
  await expect(page.getByText('Review', { exact: true })).toBeVisible()
  await page
    .getByRole('button', { name: 'Practice again' })
    .or(page.getByRole('button', { name: /Next/ }))
    .first()
    .click()
  expect(errors).toEqual([])
})

test('a practice session survives leaving the page', async ({ page }) => {
  await page.goto('/mathematics/calculus-1/derivatives/difference-quotients')
  const prompt = page.locator('main article').first().locator('[class*=prompt]')
  await page.getByRole('button', { name: /^Show the (worked )?solution$/ }).click()
  const first = await prompt.textContent()
  await page.waitForTimeout(500)
  await page.goto('/mathematics/calculus-1/derivatives')
  await page.goto('/mathematics/calculus-1/derivatives/difference-quotients')
  await expect(prompt).toHaveText(first ?? '')
  await expect(page.getByText('Solution', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Start over' }).click()
  await expect(page.getByText('Solution', { exact: true })).toHaveCount(0)
})

test('a checkpoint can be checked and scored', async ({ page }) => {
  const errors = collectErrors(page)
  await page.goto('/mathematics/calculus-1/derivatives/checkpoint')
  await expect(page.getByRole('article', { name: 'Problem 1', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Check answers' }).click()
  for (const no of await page.getByRole('button', { name: 'No', exact: true }).all())
    await no.click()
  await expect(page.getByText(/of \d+ \(\d+%\)/)).toBeVisible()
  await expect(page.getByText(/Not passed yet/)).toBeVisible()
  expect(errors).toEqual([])
})

test('theme toggle switches tokens', async ({ page }) => {
  await page.goto('/')
  const html = page.locator('html')
  const before = await html.getAttribute('data-theme')
  await page.keyboard.press('t')
  await expect(html).not.toHaveAttribute('data-theme', before ?? '')
})

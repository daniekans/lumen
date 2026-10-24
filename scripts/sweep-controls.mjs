// Dev helper: on every step of each route, moves every slider to both ends and back, then
// revisits the step, and reports console errors (duplicate React keys, NaN attributes, crashes).
// Duplicate keys are the usual cause of shapes left behind after a slider reaches an edge value.
// Usage: BASE_URL=http://localhost:5199 node scripts/sweep-controls.mjs /<item path> [...]
import { chromium } from '@playwright/test'

const base = process.env.BASE_URL ?? 'http://localhost:5173'
const browser = await chromium.launch()
let failed = false
for (const route of process.argv.slice(2)) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  await page.goto(base + route)
  await page.waitForTimeout(1500)
  const steps = page.locator('aside ol > li > button')
  const count = Math.max(1, await steps.count())
  for (let i = 0; i < count; i++) {
    if (await steps.count()) await steps.nth(i).click()
    await page.waitForTimeout(600)
    const sliders = page.getByRole('slider')
    for (let j = 0; j < (await sliders.count()); j++) {
      await sliders.nth(j).focus()
      for (const key of ['End', 'Home', 'End']) {
        await page.keyboard.press(key)
        await page.waitForTimeout(150)
      }
    }
    // Leave and come back, as a learner does.
    if (count > 1) {
      await steps.nth((i + 1) % count).click()
      await page.waitForTimeout(400)
      await steps.nth(i).click()
      await page.waitForTimeout(600)
    }
  }
  const unique = [...new Set(errors)]
  if (unique.length) {
    failed = true
    console.log(`ERRORS ${route}`, unique.slice(0, 5))
  } else console.log(`ok ${route}`)
  await page.close()
}
await browser.close()
process.exit(failed ? 1 : 0)

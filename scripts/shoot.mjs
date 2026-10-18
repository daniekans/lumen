// Dev helper: screenshots routes in both themes. Usage: node scripts/shoot.mjs <outDir> [route...]
// Set STEPS=1 to also click through every narrative step and capture each one.
// Set THEMES=dark to limit themes, or THEMES=paper for the paper theme.
import { chromium } from '@playwright/test'

const [outDir = 'e2e/screenshots', ...routes] = process.argv.slice(2)
const base = process.env.BASE_URL ?? 'http://localhost:5173'
const browser = await chromium.launch()
for (const theme of (process.env.THEMES ?? 'dark,light').split(',')) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  await page.addInitScript((t) => {
    localStorage.setItem(
      'lumen:ui',
      JSON.stringify({ state: { theme: t, sidebarOpen: true, asideOpen: true }, version: 0 }),
    )
  }, theme)
  const errors = []
  page.on('pageerror', (e) => errors.push(e.message))
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
  for (const route of routes.length ? routes : ['/']) {
    await page.goto(base + route)
    await page.waitForTimeout(2500)
    const name = (route === '/' ? 'home' : route.slice(1).replace(/\//g, '__')) + `.${theme}.png`
    await page.screenshot({ path: `${outDir}/${name}` })
    console.log('shot', name)
    if (process.env.STEPS) {
      const steps = page.locator('aside ol > li > button')
      const n = await steps.count()
      for (let i = 0; i < n; i++) {
        await steps.nth(i).click()
        await page.waitForTimeout(Number(process.env.STEP_WAIT ?? 3200))
        await page.screenshot({ path: `${outDir}/${name.replace('.png', `.step${i + 1}.png`)}` })
      }
    }
  }
  if (errors.length) console.log('ERRORS', theme, errors)
  await page.close()
}
await browser.close()

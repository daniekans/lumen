// Dev helper: screenshots routes. Usage: node scripts/shoot.mjs <outDir> [route...]
// STEPS=all clicks through every narrative step and captures each one; STEPS=3,5 captures only
// those steps (numbered from 1). Without STEPS, the page is captured as it opens.
// Shots are cropped to the visualization (stage and dock), which keeps images small; FULL=1 captures
// the whole window (sidebar and explanation too). Pages without a stage are always captured whole.
// THEMES=dark limits themes (default dark,light); THEMES=paper for the paper theme.
// STEP_WAIT sets the wait after each step click in ms (default 3200).
import { chromium } from '@playwright/test'

const [outDir = 'e2e/screenshots', ...routes] = process.argv.slice(2)
const base = process.env.BASE_URL ?? 'http://localhost:5173'
const stepsEnv = process.env.STEPS
const wanted =
  stepsEnv && stepsEnv !== 'all' ? new Set(stepsEnv.split(',').map((s) => Number(s.trim()))) : null
const full = Boolean(process.env.FULL)

/** The stage container: the largest svg, widened to its ancestors of the same size. */
const stageClip = (page) =>
  page.evaluate(() => {
    const svg = [...document.querySelectorAll('main svg')].sort(
      (a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width,
    )[0]
    if (!svg || svg.getBoundingClientRect().width < 300) return null
    let el = svg
    while (
      el.parentElement &&
      Math.abs(el.parentElement.getBoundingClientRect().width - svg.getBoundingClientRect().width) <
        2
    )
      el = el.parentElement
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, width: r.width, height: r.height }
  })

const shoot = async (page, path) => {
  const clip = full ? null : await stageClip(page)
  await page.screenshot(clip ? { path, clip } : { path })
}

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
    const steps = page.locator('aside ol > li > button')
    const n = stepsEnv ? await steps.count() : 0
    if (n === 0) {
      await shoot(page, `${outDir}/${name}`)
      console.log('shot', name)
    }
    for (let i = 0; i < n; i++) {
      if (wanted && !wanted.has(i + 1)) continue
      await steps.nth(i).click()
      await page.waitForTimeout(Number(process.env.STEP_WAIT ?? 3200))
      const file = name.replace('.png', `.step${i + 1}.png`)
      await shoot(page, `${outDir}/${file}`)
      console.log('shot', file)
    }
  }
  if (errors.length) console.log('ERRORS', theme, errors)
  await page.close()
}
await browser.close()

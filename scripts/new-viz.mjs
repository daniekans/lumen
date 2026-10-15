// Scaffolds a visualization folder. Usage: pnpm new:viz <section> <slug> ["Title"]
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [section, slug, title = slug?.replace(/-/g, ' ')] = process.argv.slice(2)
if (!section || !slug || !/^[a-z0-9-]+$/.test(slug)) {
  console.error('Usage: pnpm new:viz <section> <slug> ["Title"]   (slug in kebab-case)')
  process.exit(1)
}

const sections = readFileSync('src/content/sections.ts', 'utf8')
if (!sections.includes(`id: '${section}'`)) {
  console.error(`Unknown section "${section}". Add it to src/content/sections.ts first.`)
  process.exit(1)
}

const dir = join('src/visualizations', section, slug)
if (existsSync(dir)) {
  console.error(`${dir} already exists.`)
  process.exit(1)
}
mkdirSync(dir, { recursive: true })

const capitalized = title.charAt(0).toUpperCase() + title.slice(1)

writeFileSync(
  join(dir, 'meta.ts'),
  `import { defineViz } from '@/content/types'

export const meta = defineViz({
  title: '${capitalized}',
  summary: 'One or two sentences on what the visualization shows.',
  tags: [],
  level: 'intro',
  order: 99,
  status: 'draft',
  steps: [
    { id: 'first', title: 'First idea', caption: 'What the viewer should notice in this step.' },
  ],
})
`,
)

writeFileSync(
  join(dir, 'index.tsx'),
  `import { useState } from 'react'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider } from '@/ui/molecules'
import { Axes, FunctionPlot, Grid, Stage, useStepEffect, VizControls } from '@/viz-kit'

export default function ${capitalized.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c = '') => c.toUpperCase())}() {
  const [k, setK] = useState(1)

  useStepEffect({
    first: () => setK(1),
  })

  return (
    <>
      <Stage domain={{ x: [-5, 5], y: [-3, 3] }}>
        <Grid />
        <Axes />
        <FunctionPlot f={(x) => Math.sin(k * x)} color={vc.blue} />
      </Stage>
      <VizControls>
        <LabeledSlider label="$k$" value={k} onChange={setK} min={0.5} max={3} />
      </VizControls>
    </>
  )
}
`,
)

writeFileSync(
  join(dir, 'explanation.mdx'),
  `State the idea in one paragraph, then the formula, then point at what the visualization shows.

## A heading

$$
f(x) = \\sin(kx)
$$
`,
)

console.log(`Created ${dir}. It is marked as draft (visible in dev only) until you remove status.`)

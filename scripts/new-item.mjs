// Scaffolds a content item. Usage:
//   pnpm new:item <area>/<course>/<unit>/<slug> [explore|lesson] ["Title"]
// Missing course.ts and unit.ts files are created with placeholder text to edit.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [path, kind = 'explore', titleArg] = process.argv.slice(2)
const parts = path?.split('/') ?? []
const fail = (msg) => {
  console.error(msg)
  process.exit(1)
}
if (parts.length !== 4 || !parts.every((p) => /^[a-z0-9-]+$/.test(p)))
  fail(
    'Usage: pnpm new:item <area>/<course>/<unit>/<slug> [explore|lesson] ["Title"]  (kebab-case)',
  )
if (!['explore', 'lesson'].includes(kind))
  fail(`Kind "${kind}" is not supported by the scaffolder yet. Use explore or lesson.`)

const [area, course, unit, slug] = parts
const areas = readFileSync('src/content/areas.ts', 'utf8')
if (!areas.includes(`id: '${area}'`))
  fail(`Unknown area "${area}". Add it to src/content/areas.ts first.`)

const words = (s) => s.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase())
const root = 'src/content'
const write = (file, text) => {
  if (existsSync(file)) return
  writeFileSync(file, text)
  console.log(`created ${file}`)
}

mkdirSync(join(root, area, course, unit, slug), { recursive: true })
write(
  join(root, area, course, 'course.ts'),
  `import { defineCourse } from '@/catalog/types'

export const course = defineCourse({
  title: '${words(course)}',
  description: 'One sentence on what the course covers.',
  order: 99,
})
`,
)
write(
  join(root, area, course, unit, 'unit.ts'),
  `import { defineUnit } from '@/catalog/types'

export const unit = defineUnit({
  title: '${words(unit)}',
  description: 'One sentence on what the unit covers.',
  order: 99,
  skills: [{ id: 'main', title: 'The main skill this unit builds' }],
})
`,
)

const dir = join(root, area, course, unit, slug)
if (existsSync(join(dir, 'meta.ts'))) fail(`${dir} already exists.`)
const title = titleArg ?? words(slug)
const component = title
  .replace(/[^a-zA-Z0-9]+(.)?/g, (_, c = '') => c.toUpperCase())
  .replace(/^./, (c) => c.toUpperCase())
const check =
  kind === 'lesson'
    ? `
      check: {
        kind: 'choice',
        prompt: 'A question about this step.',
        options: ['Option A', 'Option B'],
        answer: 0,
        explanation: 'Why the answer is right.',
      },`
    : ''

write(
  join(dir, 'meta.ts'),
  `import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: '${kind}',
  title: '${title}',
  summary: 'One or two sentences on what the item shows.',
  tags: [],
  level: 'intro',
  order: 99,
  skills: ['main'],
  status: 'draft',
  steps: [
    {
      id: 'first',
      title: 'First idea',
      caption: 'What the learner should notice in this step.',${check}
    },
  ],
})
`,
)
write(
  join(dir, 'index.tsx'),
  `import { useState } from 'react'
import { vc } from '@/styles/viz-colors'
import { LabeledSlider } from '@/ui/molecules'
import { Axes, FunctionPlot, Grid, Stage, useStepEffect, VizControls } from '@/viz-kit'

export default function ${component}() {
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
write(
  join(dir, 'explanation.mdx'),
  `State the question the concept answers in one paragraph, then the formula, then point at what the
visualization shows.

## A heading

$$
f(x) = \\sin(kx)
$$
`,
)
console.log(`Done. The item is a draft (dev only) until you remove status: 'draft'.`)

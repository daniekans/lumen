# Adding content

## 1. Scaffold

```sh
pnpm new:item mathematics/pre-calculus/functions/function-as-mapping explore "A function as a mapping"
pnpm new:item mathematics/pre-calculus/functions/reading-graphs lesson
```

This creates the item folder with `meta.ts`, `index.tsx` and `explanation.mdx`, marked
`status: 'draft'` so it only appears in dev. Missing `course.ts` and `unit.ts` files are created with
placeholder text. A new area must first be added to `src/content/areas.ts`.

## 2. Plan the steps and skills

Write the steps in `meta.ts` before the component. Each step is one thing the learner should notice.
Lessons add a `check` to the steps worth testing (`choice` or `number`). List the unit's skills in
`unit.ts` and reference them from the item's `skills`.

The component reacts to steps with `useStepEffect`:

```tsx
useStepEffect({
  secant: () => animateH(2),
  limit: () => animateH(0.001),
})
```

## 3. Build from the kit

```tsx
<Stage domain={{ x: [-1, 6], y: [-1, 4] }} overlay={<Overlay corner="top-right">...</Overlay>}>
  <Grid />
  <Axes />
  <FunctionPlot f={f} color={vc.blue} />
  <Point at={p} onDrag={setP} />
</Stage>
<VizControls>
  <LabeledSlider label="$h$" value={h} onChange={setH} min={0} max={3} />
</VizControls>
```

- Math goes in `src/lib` with a test.
- If a piece could serve another item, add it to `src/viz-kit` (and export it from the folder's
  `index.ts`) instead of keeping it local.
- Scripted animation: `useSequence`. Smooth targets: `useAnimatedValue`.

## 4. Write the explanation

Follow `docs/WRITING.md`. Use `<C c="blue">` to match colors and `<StepLink step="id">` to link to steps.

## 5. Check

- [ ] At most three hues, all from `vc`
- [ ] Every step looks right in both themes (`STEPS=1 node scripts/shoot.mjs <dir> /<item path>`)
- [ ] Check answers are correct (compute them, do not trust memory)
- [ ] No console errors
- [ ] Dragging and controls cancel running sequences where they conflict
- [ ] Works with `prefers-reduced-motion`
- [ ] `pnpm lint && pnpm typecheck && pnpm test`
- [ ] Remove `status: 'draft'` and update the trackers (`docs/ROADMAP.md`, `docs/LEARNING_PLATFORM.md`)
- [ ] If the item moved, add a redirect in `src/catalog/redirects.ts`

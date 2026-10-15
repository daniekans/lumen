# Adding a visualization

## 1. Scaffold

```sh
pnpm new:viz calculus chain-rule "The chain rule"
```

This creates `src/visualizations/calculus/chain-rule/` with `meta.ts`, `index.tsx` and
`explanation.mdx`, marked `status: 'draft'` so it only appears in dev. A new section must first be
added to `src/content/sections.ts`.

## 2. Plan the steps

Write the steps in `meta.ts` before the component. Each step is one thing the viewer should notice.
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
- If a piece could serve another visualization, add it to `src/viz-kit` (and export it from the
  folder's `index.ts`) instead of keeping it local.
- Scripted animation: `useSequence`. Smooth targets: `useAnimatedValue`.

## 4. Write the explanation

Follow `docs/WRITING.md`. Use `<C c="blue">` to match colors and `<StepLink step="id">` to link to steps.

## 5. Check

- [ ] At most three hues, all from `vc`
- [ ] Every step looks right in both themes (`STEPS=1 node scripts/shoot.mjs <dir> /section/slug`)
- [ ] No console errors
- [ ] Dragging and controls cancel running sequences where they conflict
- [ ] Works with `prefers-reduced-motion`
- [ ] `pnpm lint && pnpm typecheck && pnpm test`
- [ ] Remove `status: 'draft'` and update `docs/ROADMAP.md`

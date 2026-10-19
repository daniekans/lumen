# Adding content

## 1. Scaffold

```sh
pnpm new:item mathematics/pre-calculus/functions/function-as-mapping explore "A function as a mapping"
pnpm new:item mathematics/pre-calculus/functions/reading-graphs lesson
pnpm new:item mathematics/pre-calculus/functions/practice-domain practice
pnpm new:item mathematics/pre-calculus/functions/checkpoint checkpoint
```

This creates the item folder with `meta.ts`, `index.tsx` and `explanation.mdx`, marked
`status: 'draft'` so it only appears in dev. Missing `course.ts` and `unit.ts` files are created with
placeholder text. A new area must first be added to `src/content/areas.ts`.

## 2. Plan the steps and skills

Write the steps in `meta.ts` before the component. Each step is one thing the learner should notice.
Lessons add a `check` to the steps worth testing (`choice` or `number`). List the unit's skills in
`unit.ts` and reference them from the item's `skills`.

Declare the terms and symbols the item defines in the unit's `terms`: `{ id, title, tex?, summary,
introducedIn }`, where `id` is global (check the glossary for an existing one first) and
`introducedIn` is the item slug. Declare what the item actually defines, not every noun. The
summary is one or two sentences and may use inline TeX.

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

- Stages with axes take `zoomable` (pan and zoom). Diagrams leave it off. Anything drawn to a
  fixed reach must cover the visible view instead (`useCoords().view`), as `TransformedGrid` does.
- Readout panels: give a panel a `title` (it can then collapse) and a `hint` on readouts whose
  meaning is not obvious. A panel with a chart can take `onExpand` and open a `VizSheet`.
- Points on zoomable stages show `(x, y)` on hover. Pass `coords={false}` for points whose
  coordinates mean nothing, or a function to word them (complex numbers use `a + bi`).
- Values worth linking (sliders, toggles) can use `useVizParam(name, default)` instead of
  `useState`, so the URL keeps them. Values that belong together go in one parameter with a codec
  (`numbersCodec`). A choice the step handlers set must be a parameter too, since a link with
  parameters skips the opening step's handler.
- 3D scenes use `<Stage3D radius={...}>` with `Grid3D`, `Axes3D` and the other `*3D` primitives
  (points as `Vec3` from `@/lib/math`). Draw back to front in tree order and keep planes
  translucent. Check the home view: a direction pointing at the viewer looks short, and a right
  angle with it looks wrong, so pick vectors (or a `home` camera) that read well.
  - Link shapes and readouts: `const hl = useHighlight()`, `highlight={hl}` on the stage,
    `hoverKey="v"` on the vector, its label and its point, and `{...hl.bind('v')}` on its readout.
  - `Plane3D` is a parallelogram of weights that fades over the outer 15% of each side: choose
    `size` so every point the step shows lies inside that band, and keep patches modest (they
    should read as a sheet, not fill the stage). Limit sliders to the patch.
  - A step that needs an exact view (edge on, from above) passes `sway={false}` and drives the
    camera; offer such views to the learner too with `views` (`edgeOnCamera(normal, azimuth)`).
  - `Pulse3D` (or `Pulse` in 2D) marks a moment: `when={uInPlane}`, `when={dot === 0}`.
- Step handlers can run again from the Replay button, so each one sets the state it starts from
  (as handlers already do when a step is revisited).
- A line of SQL on a stage uses `<SqlLabel>` (pass `literalColor` when filter values have a
  color in the item; the default is orange); other monospace text stays a `TextLabel`.
- Math goes in `src/lib` with a test.
- If a piece could serve another item, add it to `src/viz-kit` (and export it from the folder's
  `index.ts`) instead of keeping it local.
- Scripted animation: `useSequence`. Smooth targets: `useAnimatedValue`.

## 3b. Practice and checkpoints

Practice and checkpoint items have a `problems.ts` instead of `index.tsx`. Each generator:

- takes the seeded `rng` and returns `{ prompt, answer, hints, solution, data }`;
- builds TeX with the helpers in `tex` (`poly`, `sum`, `frac`, `paren`) so signs and coefficients read
  naturally for any random values;
- stores its parameters in `data`, so `problems.test.ts` can verify the answer with an independent
  computation (for example `derivative` from `src/lib/math`).

A checkpoint usually imports the unit's practice generators and adds a few problems of its own,
including `self` graded ones for proofs. Set `problemCount` in its meta.

Write TeX-heavy files with an editor or the Write tool rather than shell heredocs: some tools rewrite
`\\;` on the way in.

## 4. Write the explanation

Follow `docs/WRITING.md`. Use `<C c="blue">` to match colors and `<StepLink step="id">` to link to steps.

Link the first mention of a term defined elsewhere (another item or unit) with
`<Term id="domain">domain</Term>`. These links are the only record of where a term is used, so add
them in practice and checkpoint explanations too. Keep a word before the tag on its line and do not
start a list item with it (Prettier splits the paragraph).

## 5. Check

- [ ] Every hue from `vc` and with a meaning (see `DESIGN.md`, Palette rules)
- [ ] Every step looks right in dark and light (`STEPS=1 node scripts/shoot.mjs <dir> /<item path>`),
      and in paper (`THEMES=paper`) once per batch
- [ ] Check answers are correct (compute them, do not trust memory)
- [ ] Practice and checkpoint items: `problems.test.ts` verifies every generator independently
- [ ] New terms declared in `unit.ts`; terms from other items linked with `<Term>`
- [ ] No console errors
- [ ] Dragging and controls cancel running sequences where they conflict
- [ ] Works with `prefers-reduced-motion`
- [ ] `pnpm lint && pnpm typecheck && pnpm test`
- [ ] Remove `status: 'draft'` and update the trackers (the unit plan in `docs/plans/`, `docs/ROADMAP.md`)
- [ ] If the item moved, add a redirect in `src/catalog/redirects.ts`

# Adding content

## 0. Plan a unit

A unit plan (in `docs/plans/<course>.md`) is reviewed by the owner before the unit is built. Check
it against the owner's goals in `DECISIONS.md` (Content plan), so later sessions do not drift:

- [ ] Every rule is stated with its conditions; nothing taught now is taken back later
      (introduce, then expand)
- [ ] Each thread the outline marks (Leibniz notation, limits, linear approximation, duality, ...)
      says what this unit adds to it, including the choice of variable where an equation is
      differentiated or integrated
- [ ] Real-world scenarios are named per item where they add meaning (a rate with units, a
      physical reason, a data or ML link), in visualizations and in practice; "none" is a valid
      answer for an item, decoration is not
- [ ] Practice and the checkpoint reach mastery: varied problem types, problems in context, and a
      proof where the unit has one

When the last batch of a unit is built, self-review the whole unit against the same list and the
plan before marking it done, and record the gaps found as a revision in the unit plan (as in
"Revision after the batch 3 review" in `plans/calculus.md`).

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

The item's `summary` shows on the unit page, in the explanation pane and in search. It may use
inline TeX, as captions do: write math as `$x^2$`, `$f'(x)$` or `$\\frac{dy}{dx}$`, never as plain
text (`x^2`, `dy/dx`, a bare `ε`).

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

The Replay button runs the handler again with `{ replay: true }`. A handler that animates from the
current state (from wherever `h` is now to a target) shows nothing on replay, because the state is
already at the target. Take the start from `useStepStart` instead: it records the state when the
step becomes active and returns that same state on a replay.

```tsx
const start = useStepStart(h)
useStepEffect({
  secant: (run) => animateH(start(run), 2),
})
```

If the start already equals the target, set the target without running a sequence, so no Replay
button appears for a step that does not move.

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
  color in the item; the default is orange); a line of Python uses
  `<CodeLabel lang="python">`; other monospace text stays a `TextLabel`.
- Several lines of code on a stage use `<CodeBlock snippet={...} at={...} line={...} />`: `line`
  follows the step, `colors` gives names their shapes' hues, and `hoverKeys` links names to
  shapes with the same `hoverKey` (pass `highlight={hl}` to the stage).
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

Fenced code blocks are highlighted at build time (`python`, `sql`, `scala`, `typescript`, `bash`,
`json`, `yaml`, `text`; an unknown language or option fails the build). Options go after the
language: `title="rotate.py"`, highlighted lines `{3-5}`, `step=shear`, names in stage colors
`colors="A=blue v=orange"`, `hover="A=matrix"`, `env=spark` (where `pnpm code` runs it),
`check` (checked; CI checks the `default` environment) or `check=torch` (both), and
`raises=ValueError` for a block that fails on purpose. A following fence in the language `output`
is the block's printed output; `output excerpt` shows only some of its lines, in order.
Wrap two or more blocks in `<CodeTabs>` for the same idea in two libraries; each tab is labeled by
`tab=NumPy` (or the title).

### Code walkthrough (`code.mdx`, optional)

An item may add `code.mdx` beside `explanation.mdx`: it feeds the code panel on the stage (a
"Code" chip that opens it, hotkey `c`) and is marked with a code icon on the unit page and in
the pane header. It is MDX like the explanation (same components, `<Term>` links count). The
panel's "Whole file" shows it in a sheet over the stage, headings in monospace.

- Give a block `step=<id>` to tie it to a step. The panel shows the active step's blocks; the
  step's row gets a code button that opens the panel. Steps without a block show "No code for
  this step". Blocks without `step=` appear only in the whole file. Blocks of one `<CodeTabs>`
  stay tabs in the panel.
- **Leads.** The paragraph right before a block (or before its `<CodeTabs>`) is the block's lead,
  shown above it in the panel. Keep it to one or two sentences that say what the code does at
  this step. Only inline code and `$math$` keep their formatting there; emphasis and links show
  as plain text. A heading between the paragraph and the block means no lead.
- `codeCorner` in `meta.ts` moves the panel when readouts sit at the bottom-left (the default).
- Give names their stage colors (`colors=`) and hover keys (`hover=`, the shapes' `hoverKey`), so
  hovering `A` in the panel lights the matrix and the other way around.

Content rules for code:

- Python 3.12 with type hints; imports at the top of the first block; names that follow the
  item's notation (`A`, `v`, `x_hat`); lines up to about 72 characters. The panel shows about
  50 before a line scrolls sideways, so keep the lines that matter to a step short.
- Outputs come from real runs, never typed by hand: `pnpm code /<item path>` runs the item's
  blocks in Docker (`code-envs/`: `default` with NumPy and SymPy, `torch`, `spark`) and prints
  each output; `--write` puts the outputs into the file, `--check` compares them. Python blocks
  run in `default` unless `env=` says otherwise; SQL blocks run only with `env=spark`. Mark a
  block `check` when it runs in its environment; leave fragments and pseudo-code unmarked.
- A block maps to one step or one idea, three to fifteen lines.
- Data engineering shows what the engine does: SQL or PySpark next to its plan (`EXPLAIN` output
  as an output block), tied to the stage's partitions and shuffles.
- Deep learning: the NumPy version first (where the math shows), PyTorch in a `CodeTabs`.
- Code shows the "why", not Python itself: each line maps to a symbol, a step or a shape.

## 5. Check

- [ ] Every hue from `vc` and with a meaning (see `DESIGN.md`, Palette rules)
- [ ] The values a step is about are drawn on the stage, not only in the readouts: exact angles on
      a circle, special points, the parts a formula names
- [ ] Math labels use book notation: fractions as `\frac` (`\dfrac` where a label is small), never
      `a/b`; the same notation as the explanation
- [ ] Every control shown in a step visibly changes the drawing in that step; otherwise hide it
- [ ] Lists of shapes are keyed by index or a stable id, never by a computed value (two equal values
      give duplicate keys, and React leaves the old shapes on the stage)
- [ ] `node scripts/sweep-controls.mjs /<item path>` (moves every slider to both ends on every step)
      reports no console errors
- [ ] Every step looks right in dark and light (`STEPS=all node scripts/shoot.mjs <dir> /<item path>`),
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

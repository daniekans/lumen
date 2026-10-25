# Architecture

## Layers

```
src/
  lib/             Pure TypeScript: math, neural networks, practice, relational operations (joins,
                   keys). No React. Unit tested.
  styles/          Design tokens (CSS), motion constants and the visualization palette.
  ui/              Application chrome, organized by atomic design:
    atoms/           Button, IconButton, Slider, Switch, Tooltip, Kbd, Badge, Tex, Divider,
                     KindIcon, AreaIcon, ProgressRing, StatusDots, ResizeHandle
    molecules/       LabeledSlider, SegmentedControl, ToggleField, Readout, StepList, StepCheckView,
                     StatusPicker, Sparkline, Breadcrumbs
    organisms/       Sidebar, TopBar, ExplanationPane, ControlDock, CommandPalette, SettingsDialog,
                     CourseCard, ...
    templates/       AppShell, VizLayout, DocumentLayout
  viz-kit/         Building blocks for visualizations (public API in viz-kit/index.ts)
    stage/           Stage, coordinate system, Overlay, HtmlBox, VizSheet
    stage3d/         Stage3D (orthographic orbit camera on top of Stage), camera math, and 3D
                     primitives: Vector3D, Segment3D, Line3D, Path3D, Plane3D, Grid3D, Axes3D,
                     Point3D, MathLabel3D, DropLines3D
    math-plot/       Grid, Axes, FunctionPlot, Path, Segment, Vector, Point, Arc, MathLabel, TextLabel,
                     AxisInterval (domains, ranges and solution sets on an axis), TransformedGrid
                     (the grid of the plane under a 2x2 matrix, filling any view), WarpedGrid (the
                     grid under any map, sampled, for maps that bend), SeriesPlot (a value over
                     time with labeled axes, in its own Stage)
    graph/           DiagramNode, DiagramEdge, Packet, connector geometry
    nn/              layoutNetwork, NeuralNet, weight and gradient edge encodings
    table/           RelationTable (database tables with keys, NULLs and animated rows), tableLayout,
                     JoinGrid (the product of two tables as a grid of pairs), TransposedHeader
    anim/            useSequence, useAnimatedValue, tween (requestAnimationFrame)
    interaction/     useDrag
    runtime/         VizControls, useVizStep, useStepEffect
  catalog/         Content types, the tree builder, registry, queries and redirects
  content/         Content only: areas.ts and the area/course/unit/item folders
  progress/        Learner progress: schema, derivations, ProgressStore, the progress store hook
  practice/        Practice and checkpoint runner (problem cards, sessions, worksheets)
  state/           UI preferences (theme, panes)
  i18n/            UI copy (`msg`, typed messages) and plural, number and date helpers
  app/             Router, pages, global hotkeys, theme sync
```

Dependencies point downward: `content` uses `catalog/types`, `viz-kit`, `ui`, `lib` and `styles`;
`viz-kit` uses `lib`, `styles` and `ui/atoms`; `progress` uses `catalog/types`; `lib` depends on
nothing.

## Content tree

```
src/content/
  areas.ts                                   areas and their order
  <area>/<course>/course.ts                  defineCourse({ title, description, order })
  <area>/<course>/<unit>/unit.ts             defineUnit({ title, description, order, skills, terms })
  <area>/<course>/<unit>/<item>/meta.ts      defineItem({ kind, title, steps, skills, ... })
  <area>/<course>/<unit>/<item>/index.tsx    the visual
  <area>/<course>/<unit>/<item>/explanation.mdx
```

`src/catalog/registry.ts` globs these files and `buildCatalog` (pure, unit tested) assembles the tree.
Ids and URLs come from folder paths (`mathematics/calculus-1/derivatives/derivative-as-limit`). Each
`index.tsx` and `explanation.mdx` is its own lazily loaded chunk. Broken entries are logged and
skipped. Courses and units without items appear on course pages as planned and are hidden from the
sidebar. `status: 'draft'` hides an item from production builds.

Item kinds: `explore` (visual with steps), `lesson` (the same, plus `check` questions on steps),
`practice` and `checkpoint` (a `problems.ts` instead of `index.tsx`, rendered by `src/practice`).
Skills are declared per unit and referenced by items and problems.

Glossary terms are declared per unit (`terms` in `unit.ts`) with a global id and the item that
introduces them. Explanations mark a word with `<Term id="...">`, which opens the summary in a popover with a link to the entry. A Vite plugin
(`src/catalog/termUsesPlugin.ts`) scans every `explanation.mdx` for those tags at build time and
exposes the map as `virtual:lumen/term-uses`, so the glossary page (`/glossary`) lists where each term
is used without bundling MDX source. `buildCatalog` reports duplicate ids, unknown items and unknown
links, and `registry.test.ts` fails on any catalog problem. Terms also appear in the command palette.

One catch-all route renders any depth through `NodePage`. Paths that moved are listed in
`src/catalog/redirects.ts`; add an entry whenever content moves, because the site is public.

## Practice

Pure logic lives in `src/lib/practice` so it could also run on a server:

- `problems.ts`: a `ProblemGenerator` turns a seeded `Rng` into a `Problem` (prompt, answer, hints,
  worked solution, and the generated parameters as `data` for tests).
- `answers.ts` and `check.ts`: answer kinds (`number`, `expression`, `list` (unordered), `vector` (ordered components, typed as `(3, -1)` or a column), `matrix` (a grid of fields in the answer's shape, `MatrixInput`; the response is stored as `bmatrix` TeX and checked entry by entry, with each wrong entry marked), `choice`, `self`) and the
  checker. Expressions are equivalent when they agree at random sample points of their domain.
- `texEval.ts`: a small parser and evaluator for the TeX that MathLive produces (fractions, roots,
  powers, implicit multiplication, functions, absolute values). It replaced Compute Engine, which
  added about 1.1 MB gzipped for features the checker did not use.
- `session.ts`: picks the next generator (auto difficulty) and suggests skill statuses from a session.
- `testing.ts`: `testProblemSet` checks every generator over many seeds (determinism, KaTeX parses,
  the stored answer is accepted) plus an optional independent verification per generator.

`src/practice` renders practice items as sessions of eight problems (first answers count, hints and
solutions on demand, status suggestions the learner may apply) and checkpoints as printable
worksheets checked all at once. The math field is `MathInput` (MathLive, loaded only on these pages).
`PracticeSession` does not know about items: it takes generators (skills as global keys, see
`withSkillKeys`), the stored session and callbacks. Mixed practice (`/practice`, `MixedPractice`)
uses it with the generators of every practice item in the chosen units, and stores its scope and
session in `ProgressData.mixed`. Its answers do not count toward item progress.

## Progress

`src/progress` keeps everything about the learner: visited steps, correct checks, manual
done/not-done overrides, skill statuses and the last item opened. Two ideas stay separate:

- **Progress** is how much content is done. An item is done when every step is visited and every
  check answered, or when the learner marks it. `itemProgress` gives not started, in progress (with
  a detail such as "2 of 4 steps") or done. Unit and course rings count done items only.
- **Skill status** (new, practiced, proficient, mastered) is the learner's own assessment, later also
  suggested by practice. It never changes the rings.

Completion is derived rather than stored, so changing an item's steps never leaves stale flags.
Undoing "Done", or the reset button of an item in progress, calls `resetItem`, which clears the
item's visits, checks, counts and manual mark (sessions, sheets and skills stay).
"I already know this unit" sets manual done marks and mastered statuses, and undoing it removes them.
Nothing is scheduled or due.

The data is saved through the `ProgressStore` interface (IndexedDB locally, memory as a fallback).
Components use the `useProgress` hook only. `migrate()` validates loaded and imported data and is the
place for future schema versions. Settings offer JSON export, import and reset.

## The item page

`ItemPage` creates a runtime context per item with the step list, the active step and the
DOM node of the control dock. Inside a visualization:

- `useVizStep()` returns the active step and navigation helpers.
- `useStepEffect({ stepId: () => ... })` runs a handler each time a step becomes active.
- `<VizControls>` portals its children into the dock.

The active step is in the query string (`?step=<id>`), and `useVizParam` keeps chosen values there
too. Both write through `src/viz-kit/runtime/query.ts`: `history.replaceState`, batched, so the
router does not navigate and history gets no new entries. Fullscreen (`useFullscreen`, key `f`)
shows the stage area alone, with `FullscreenBar` for the steps.

The explanation pane renders the steps and the MDX explanation. MDX files can use `<StepLink step="id">`
to jump to a step and `<C c="blue">` to color a term like its counterpart in the visual.

## Drawing

`<Stage domain={...}>` measures its container and maps a domain to pixels with one uniform scale,
keeping the domain clear of the control dock through `insets`. Primitives take stage units and read
the mapping through `useCoords()`, so they work in any size. `yUp` selects math orientation; diagrams
use `yUp={false}` and a design-sized domain such as `x: [0, 1200]`.

A `zoomable` Stage adds a view (zoom and pan) on top of the fitted domain (`useStageView`). Every
primitive reads the zoomed mapping from `useCoords()`, so nothing else changes; `coords.zoom`
lets the grid and axes pick a coarser or finer step.

KaTeX labels are HTML, so `MathLabel` portals into an HTML layer above the SVG while still being
written inside SVG content.

`<Stage3D radius={...}>` draws 3D scenes in the same SVG. It holds an orbit camera (`azimuth`,
`elevation`, `zoom`, with $z$ up) and renders a plain `Stage` whose domain is the screen plane;
`useProjection()` maps a point of space to that plane orthographically (`camera.ts`, tested), and
each 3D primitive projects its points and draws with the 2D primitives. Dragging the background
orbits (with momentum), so 3D stages do not pan; the wheel and buttons zoom, and a focused stage
takes arrow keys (it marks them handled, so the page does not change step). A slow sway runs
while idle (`sway={false}` stops it for a step that needs an exact view; the learner's on/off
choice is in `stage3d/preferences.ts`). The views menu lists home, above, front, side and the
item's `views`. `Point3D` drags on a given plane (`dragPlane`) or parallel to the screen. Pass
`camera` and `onCameraChange` to drive the camera from steps.

Depth: `projection.cue(p)` fades far points (`DEPTH_CUE`). Lines carry it as a gradient along
the stroke, and `Line3D` and the axes also fade at their ends. `Plane3D` keeps its
parallelogram shape (the grid of weights) and fades over a narrow band at its edges (`fade`, 15%
of each side; the floor grid uses 40%) and toward the back, with SVG masks whose gradients are
drawn in the patch's own coordinates and mapped to the screen with `gradientTransform` (exact,
since the projection is affine). Shapes are drawn in tree order, without depth sorting.

Linked hover: `useHighlight()` in the item gives a `Highlight`; pass it to the stage
(`highlight`), give shapes a `hoverKey`, and spread `hl.bind(key)` on the matching `Readout`.
Hovering either side lights both and dims the other keyed shapes, except that hovering a plane
in the drawing only lights its readout row (`hint`), since planes are crossed all the time while
orbiting; its row highlights it fully (`useEmphasis`, `stage/highlight.ts`).
The 3D primitives take hover keys; the 2D ones do not yet.

Future renderers (a canvas layer for particles, WebGL for shaded surfaces) mount inside the
same Stage container and read the same coordinates. Audio would be a service in `viz-kit` with a hook,
lazily loaded like everything else.

## Animation

Visualization timing runs on the kit's own `tween` (requestAnimationFrame with cubic-bezier
easing), not on motion's `animate()`. Motion's frame loop is shared with layout animations in the
chrome, and a layout animation starting in the same tick made viz tweens finish instantly. motion is
still used for UI transitions.

- **Scripted sequences**: `useSequence().run(async ({ tween, wait }) => ...)`. Starting a new run or
  unmounting cancels the current one. Respects `prefers-reduced-motion`.
- **Eased targets**: `useAnimatedValue(target)` for numbers and number arrays.
- **Discrete style changes** (fills, widths, colors): set the new value and let the CSS transitions
  declared in the kit interpolate. This is how the neural network fades activations.
- **Playback in the page**: every `useSequence` run reports to the runtime's `activity`
  (`runtime/context.ts`). The steps header (and the fullscreen bar) shows bars while a run plays
  and a Replay button after the step's animation ran; Replay calls the step's `useStepEffect`
  handler again with `{ replay: true }`, so handlers must set up their own starting state; a
  handler that tweens from the current state takes its start from `useStepStart`.
- **Arrival and events**: `Vector` grows from its tail when it mounts (`grow={false}` to skip).
  `Pulse` and `Pulse3D` play one expanding ring when their `when` turns true.
- **Continuous loops**: `useAnimationFrame` from motion, writing to the DOM through refs when the
  loop runs constantly (see `LissajousMark`).

## Surfaces and overlays

Everything that floats over content (control dock, readout panels, the command palette, the floating
explanation pane, `VizSheet`) uses one glass surface: the `glass` class from
`src/styles/surfaces.module.css`, combined in TSX with `clsx(surfaces.glass, styles.panel)` and
driven by the `--glass` and `--glass-blur` tokens. Avoid `composes ... from` across files: Vite's
CSS modules plugin parses the referenced file without a source path and logs a warning.

`VizSheet` opens a large panel over the stage for an enlarged part of a visualization (usually a
second `<Stage>`), leaving the control dock usable. The RAG vector store view uses it.

Readout panels (`ReadoutPanel` with `Readout` rows in an `Overlay`) have three opt-in extras: a
`title` lets the panel collapse to it, `onExpand` adds an "Open larger" button (the item opens its
own `VizSheet`, as `backpropagation` does with a `SeriesPlot` of the cost), and a `hint` on a
`Readout` shows a one-line meaning as a tooltip on its label.

On zoomable stages a `Point` shows its coordinates on hover and while dragged. Points register
their pixel position with the stage (`src/viz-kit/stage/pointHover.ts`), which picks the nearest
visible one to the pointer, so nothing is added to the drawing. `coords` turns it off or on, or
formats the text.

The explanation pane can be resized (drag its left edge, double-click to reset) and switched between
docked and floating. Width and mode persist in the UI store.

## State

Global UI state (theme, open panes, palette, sidebar area) lives in a small zustand store persisted to
localStorage. Learner progress has its own store (see Progress). Visualization state is local React
state.

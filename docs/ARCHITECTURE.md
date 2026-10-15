# Architecture

## Layers

```
src/
  lib/             Pure TypeScript: math, neural networks. No React. Unit tested.
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
    math-plot/       Grid, Axes, FunctionPlot, Path, Segment, Vector, Point, Arc, MathLabel, TextLabel
    graph/           DiagramNode, DiagramEdge, Packet, connector geometry
    nn/              layoutNetwork, NeuralNet, weight and gradient edge encodings
    anim/            useSequence, useAnimatedValue, tween (requestAnimationFrame)
    interaction/     useDrag
    runtime/         VizControls, useVizStep, useStepEffect
  catalog/         Content types, the tree builder, registry, queries and redirects
  content/         Content only: areas.ts and the area/course/unit/item folders
  progress/        Learner progress: schema, derivations, ProgressStore, the progress store hook
  state/           UI preferences (theme, panes)
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
  <area>/<course>/<unit>/unit.ts             defineUnit({ title, description, order, skills })
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
`practice` and `checkpoint` (phase 2B). Skills are declared per unit and referenced by items.

One catch-all route renders any depth through `NodePage`. Paths that moved are listed in
`src/catalog/redirects.ts`; add an entry whenever content moves, because the site is public.

## Progress

`src/progress` keeps everything about the learner: visited steps, correct checks, manual
done/not-done overrides, skill statuses and the last item opened. Completion is derived
(`isItemComplete`) rather than stored, so changing an item's steps never leaves stale flags.
Learners can set every status in either direction; nothing is scheduled or due.

The data is saved through the `ProgressStore` interface (IndexedDB locally, memory as a fallback).
Components use the `useProgress` hook only. `migrate()` validates loaded and imported data and is the
place for future schema versions. Settings offer JSON export, import and reset.

## The item page

`ItemPage` creates a runtime context per item with the step list, the active step and the
DOM node of the control dock. Inside a visualization:

- `useVizStep()` returns the active step and navigation helpers.
- `useStepEffect({ stepId: () => ... })` runs a handler each time a step becomes active.
- `<VizControls>` portals its children into the dock.

The explanation pane renders the steps and the MDX explanation. MDX files can use `<StepLink step="id">`
to jump to a step and `<C c="blue">` to color a term like its counterpart in the visual.

## Drawing

`<Stage domain={...}>` measures its container and maps a domain to pixels with one uniform scale,
keeping the domain clear of the control dock through `insets`. Primitives take stage units and read
the mapping through `useCoords()`, so they work in any size. `yUp` selects math orientation; diagrams
use `yUp={false}` and a design-sized domain such as `x: [0, 1200]`.

KaTeX labels are HTML, so `MathLabel` portals into an HTML layer above the SVG while still being
written inside SVG content.

Future renderers (a canvas layer for particles, WebGL or react-three-fiber for 3D) mount inside the
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

The explanation pane can be resized (drag its left edge, double-click to reset) and switched between
docked and floating. Width and mode persist in the UI store.

## State

Global UI state (theme, open panes, palette, sidebar area) lives in a small zustand store persisted to
localStorage. Learner progress has its own store (see Progress). Visualization state is local React
state.

# Architecture

## Layers

```
src/
  lib/             Pure TypeScript: math, neural networks. No React. Unit tested.
  styles/          Design tokens (CSS), motion constants and the visualization palette.
  ui/              Application chrome, organized by atomic design:
    atoms/           Button, IconButton, Slider, Switch, Tooltip, Kbd, Badge, Tex, Divider
    molecules/       LabeledSlider, SegmentedControl, ToggleField, Readout, StepList, Sparkline, Breadcrumbs
    organisms/       Sidebar, TopBar, ExplanationPane, ControlDock, CommandPalette, VizCard, ...
    templates/       AppShell, VizLayout
  viz-kit/         Building blocks for visualizations (public API in viz-kit/index.ts)
    stage/           Stage, coordinate system, Overlay, HtmlBox, VizSheet
    math-plot/       Grid, Axes, FunctionPlot, Path, Segment, Vector, Point, Arc, MathLabel, TextLabel
    graph/           DiagramNode, DiagramEdge, Packet, connector geometry
    nn/              layoutNetwork, NeuralNet, weight and gradient edge encodings
    anim/            useSequence, useAnimatedValue, tween (requestAnimationFrame)
    interaction/     useDrag
    runtime/         VizControls, useVizStep, useStepEffect
  content/         Section taxonomy, visualization types and the registry
  visualizations/  One folder per visualization
  app/             Router, pages, global hotkeys, theme sync
```

Dependencies point downward: `visualizations` use `viz-kit`, `ui`, `lib` and `styles`; `viz-kit`
uses `lib`, `styles` and `ui/atoms`; `lib` depends on nothing.

## Content discovery

`src/content/registry.ts` uses `import.meta.glob` to find every `meta.ts` under
`src/visualizations/*/*/`. Section and slug come from the path. Each `index.tsx` and
`explanation.mdx` becomes its own lazily loaded chunk, so the initial bundle does not grow with the
number of visualizations. A folder with problems is logged and skipped instead of breaking the app.

`status: 'draft'` hides a visualization from production builds while keeping it in dev.

## The page

`VizPage` creates a runtime context per visualization with the step list, the active step and the
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

Global UI state (theme, open panes, palette) lives in a small zustand store persisted to
localStorage. Visualization state is local React state. Nothing else is global.

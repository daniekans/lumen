# Design

## Principles

- The visualization is the page. Chrome is quiet: neutral surfaces, thin borders, muted text.
- Color carries meaning inside visualizations. The UI itself is black, white and grays.
- Motion explains change. Anything that changes value should move there, not jump.
- One idea per visualization. If a second idea needs space, it gets its own visualization.

## Tokens

All values live in `src/styles/tokens.css`. Themes remap values; names never change.

| Group         | Tokens                                                                                                                                         |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces      | `--bg`, `--bg-elevated`, `--surface`, `--surface-hover`, `--surface-active`, `--glass`                                                         |
| Text          | `--fg`, `--fg-muted`, `--fg-subtle`                                                                                                            |
| Lines         | `--border`, `--border-strong`                                                                                                                  |
| Visualization | `--viz-fg`, `--viz-grid`, `--viz-axis`, `--viz-blue`, `--viz-yellow`, `--viz-teal`, `--viz-red`, `--viz-green`, `--viz-purple`, `--viz-orange` |
| Motion        | `--ease-out`, `--ease-in-out`, `--dur-fast`, `--dur-base`, `--dur-slow`                                                                        |

Fonts: Inter for UI, JetBrains Mono for numbers and code, KaTeX for math.

## Palette rules

Use `vc` and `role` from `src/styles/viz-colors.ts`; never a hex literal in a component.

- At most three hues in one visualization, plus `vc.fg` and neutrals.
- Keep meanings stable across the project:

| Meaning                                                                 | Color        |
| ----------------------------------------------------------------------- | ------------ |
| The main object (a function, a vector being studied)                    | blue         |
| A derived or comparison object (a secant, an approximation, a gradient) | yellow       |
| The "true" or limiting object (tangent, exact area, product)            | teal         |
| Negative values, errors, flipped orientation                            | red          |
| First basis direction, positive in pairs with red                       | green        |
| Positive and negative weights                                           | blue and red |

- Explanation text uses `<C c="...">` to color a term the same way as in the visual.

## Layout

- Sidebar on the left (collapsible), stage in the middle, explanation on the right (collapsible).
- Controls live in the floating dock at the bottom of the stage. Readouts live in an `Overlay`, usually
  top right. Keep both small; the stage is the focus.
- Stage content stays clear of the dock through the default `insets`.

## Overlays

All floating surfaces share the glass style (translucent background, blur, thin border, shadow).
Never style a floating panel by hand; combine the `glass` class from `src/styles/surfaces.module.css`
in TSX (`clsx(surfaces.glass, styles.panel)`).
When part of a visualization is too small to read at normal size, offer an expand button that opens
it in a `VizSheet` rather than shrinking the rest of the layout.

Write only the standard `backdrop-filter` property. The production CSS minifier adds the
`-webkit-` prefix itself, and when both are written by hand it keeps only the prefixed one, which
Chrome rejects for values with `var()`. That removed every blur on the deployed site once.

## Motion rules

- Default visualization transitions take 0.6 to 1.0 s with `ease.inOut`. UI transitions take
  0.14 to 0.48 s with `ease.out`. Panes use the `spring.pane` preset.
- Sequences pause briefly (0.2 to 0.4 s) between beats so each change can be read.
- Ambient motion (home figure, logo, dotted background) is slow and subtle and stops under
  `prefers-reduced-motion`.
- Never animate layout properties of many elements per frame; animate a parameter and derive the
  geometry, or change a style and let CSS transition it.

# Code views plan (Phase 6, first part)

Plan for showing real code inside items, read-only. Part of [ROADMAP.md](../ROADMAP.md) (Phase 6).
Drafted on 2026-11-01 and reviewed by the owner the same day (answers at the end).

## Status

| Batch | What                                                                | Status |
| ----- | ------------------------------------------------------------------- | ------ |
| 1     | Code model and highlighted blocks in every MDX file (build time)    | done   |
| 2     | Code on the stage: `CodeLabel`, `CodeBlock`, links to shapes        | done   |
| 3     | Code in the explanation pane: step peeks and the Code tab           | done   |
| 4     | Pilot content in three areas, then the owner's review               | done   |
| 5     | Snippet runner (Docker envs) and opt-in checks in a separate CI job | done   |
| 6     | The code panel: code beside the visual, step by step (replaces tab) | done   |
| 7     | Code that moves with the visual: per-step and animated line focus   | review |

One batch per session. Update this table and the "Suggested next session" in `ROADMAP.md` when a
batch ends.

## Scope

- **In:** read-only code tied to the visual it explains, in any area: NumPy and SymPy for
  mathematics, NumPy from scratch plus PyTorch for machine learning, SQL and PySpark (with
  `EXPLAIN` output) for data engineering, Python for AI engineering.
- **Kept for later, not discarded:** runnable cells (Pyodide, DuckDB-Wasm), a `code` item kind
  (notebook-style lessons with checked outputs). Both are described in `ROADMAP.md` (Phase 6).
  The code model below is built so they plug in without rework.
- **Any code can be shown.** Nothing requires a snippet to run anywhere. Checks (batch 5) are an
  opt-in safety net for the blocks that can run cheaply, never a gate on what is shown.
- **Not a Python course.** Code shows the "why": each line maps to a symbol, a step or a shape
  on the stage. It models good practice (type hints, small functions, names that follow the
  math: `A`, `v`, `x_hat`), since the owner values it.
- **Same look and feel.** Code features follow the rest of Lumen: clean, glass surfaces, smooth
  transitions (highlights glide and fade, never jump), interactive where it helps (hover a name
  to light its shape).

## What exists today

- **SQL on the stage.** `SqlLabel` (`src/viz-kit/math-plot/SqlLabel.tsx`) draws one line of SQL
  in SVG with the in-house tokenizer `src/lib/sql.ts` (keywords purple, functions teal, literals
  orange). Used by eight Data Engineering items.
- **Fenced code in MDX.** Explanations already allow fenced blocks (one in `outer-joins`), styled
  by `Prose.module.css` as plain monospace with no highlighting.
- **Places to put things.** The explanation pane (steps, then the MDX explanation; it can be
  resized and floated), `VizSheet`, readout panels, the control dock, `HtmlBox` for HTML on a
  stage, and hover links between shapes and readouts (`useHighlight`, `hoverKey`).

## Design

### The code model (batch 1, the seam for later ideas)

A snippet is data first, rendering second. One typed shape, in `src/lib/code/` (pure, tested):

```ts
interface CodeSnippet {
  lang: CodeLang // 'python' | 'sql' | 'scala' | 'text' | ...
  source: string // the exact code, always kept
  title?: string
  step?: string // linked step id
  highlight?: readonly number[] // highlighted lines
  colors?: Readonly<Record<string, VizColor>> // name -> stage color
  hoverKeys?: Readonly<Record<string, string>> // name -> hoverKey of a shape
  output?: string // printed output, shown after the code
  check?: { env: string } // opt-in snippet check, batch 5
}
```

- A remark plugin turns every MDX fence into a `<CodeView snippet={...} tokens={...} />` element:
  the source is kept as a prop, next to the tokens Shiki produced at build time. Nothing is
  flattened into HTML that a runner could not read back.
- `CodeView` (in `src/ui`) is the one renderer for blocks in MDX, step peeks and the Code tab.
  Runnable cells later add an optional action slot (Run, output area) and a `CodeRunner`
  interface (`run(snippet) => Promise<RunResult>`, one per language: Pyodide for Python,
  DuckDB-Wasm for SQL). No runner is built now; the interface is only written down here so
  the props and data leave room for it.
- The future `code` item kind reuses the same snippets and `CodeView`, in a notebook layout.
- On the stage, `CodeBlock` takes the same `CodeSnippet` (with tokens from the in-house
  tokenizers), so a snippet can move between pane and stage without changes.

### One code palette

Token kinds: keyword, function (or call), string, number, comment, name, operator. Colors come
from `vc` with the meaning `SqlLabel` already uses: keywords purple, calls teal, literals orange,
names in the foreground, operators and comments muted. Defined once as CSS variables
(`--code-keyword`, ...) for dark, light and paper, read by `SqlLabel`, `CodeLabel`, `CodeView`
and the Shiki theme (Shiki's CSS-variables theme, so one build serves all three themes).

### Surface 1: blocks in MDX (batch 1)

- Shiki at build time, no runtime JavaScript. Languages: `python`, `sql`, `scala`,
  `typescript`, `bash`, `json`, `yaml`, `text`. Watch the size of explanation chunks (about
  9 kB gzipped each today).
- Fence metadata maps to the model: `title="rotate.py"`, `{3-5}`, `step=shear`,
  `colors="A=blue v=orange"`, `hover="A=matrix v=vector"`, `check` or `check=numpy`. An output
  block is a following fence marked `output`.
- `<CodeTabs>`: the same idea in two libraries (NumPy | PyTorch, SQL | PySpark). The chosen
  tab is remembered per browser and shared across items (pattern of `readoutSize.ts`); the
  switch cross-fades.
- A copy button on hover; labels from `msg`.
- The SQL block in `outer-joins` gets highlighting for free.

### Surface 2: code on the stage (batch 2, the main tie to the visual)

For code that is part of the picture: `A @ v` beside the vector, a Spark plan node with its
PySpark line, a query whose clauses light up as rows move.

- `src/lib/code/`: `tokenizePython` beside the moved `tokenizeSql`, both returning the shared
  token kinds, with Vitest tests (joining tokens gives back the input).
- `CodeLabel` (SVG, one line, any language) generalizes `SqlLabel`; `SqlLabel` stays as a thin
  wrapper so the eight items do not change.
- `CodeBlock` (HTML in an `HtmlBox`, glass surface, several lines): the highlighted line follows
  the step or an animated value, with a highlight bar that glides between lines; per-name
  colors as in surface 1.
- **Two-way hover:** hovering `A` in the code lights the matrix on the stage, and hovering the
  matrix lights `A` in the code, through `useHighlight` and `hoverKeys`. Works in `CodeView` too.
- In-house tokenizers, not Shiki at runtime: its runtime costs hundreds of kB, while a stage
  needs one or two languages and a few lines.

### Surface 3: code in the explanation pane (batch 3)

- **Step peeks:** a step with linked code shows a small code button in the step list; it
  expands the snippet under the caption with a smooth height transition. Code stays next to
  the step it explains, without leaving the steps.
- **The Code tab:** an optional `code.mdx` in the item folder (loaded lazily, like the
  explanation; `Item.code` is the loader, `hasCode` derived) holds the item's full code
  walkthrough. The pane gets a segmented control with icons and labels, "Explanation | Code",
  shown only on items with code and styled so the two are clearly distinct (the Code tab in
  monospace headings, with the code mark). The steps list stays above both tabs. Blocks with
  `step=` are highlighted when their step is active (the others dim slightly) and scroll into
  view. The tab is in the URL (`?tab=code`) and has a hotkey (`c`).
- Step peeks read snippets from `code.mdx` by `step=`, so each snippet is written once.
- **Discovery:** a code mark on item rows (unit page) and in the item header, later a filter on
  the Explore page (Phase 3).
- `termUsesPlugin` scans `code.mdx` too.

### Content rules (added to `ADDING_CONTENT.md` in batch 3)

- Python 3.12 with type hints; imports at the top of the first block of an item; names that
  follow the item's notation; lines up to about 72 characters (the pane is narrow).
- Outputs come from real runs, never typed by hand. Run them locally when the block is not
  checked in CI.
- A block maps to one step or one idea, three to fifteen lines. Longer code belongs to the
  future `code` kind.
- Data engineering shows what the engine does with the code: SQL or PySpark next to its plan
  (`EXPLAIN` output as an output block), tied to the stage's partitions and shuffles.
- Deep learning: the NumPy version first (where the math shows), PyTorch in a `CodeTabs`.

### Batch 1 as built (2026-11-05)

- `src/lib/code/`: `snippet.ts` (`CodeSnippet`, `CodeLang`, `CodeTokenKind`, `CodeTokens`),
  `fence.ts` (`parseFence`: fence language and metadata to a snippet, or an error that fails the
  build), `classify.ts` (Shiki tokens to the shared kinds), `remarkCodeView.ts` (the build-time
  plugin, imported only by `vite.config.ts`), tests in `code.test.ts`.
- Tokens are stored as kinds, not colors: `{ kind, text }` per token, one list per line, the
  same shape the in-house tokenizers will return in batch 2. Shiki runs with its CSS-variables
  theme only to learn each token's kind; runs it leaves in the foreground are split again so
  every name is its own token (per-name colors and hover links need that). Shiki stays out of
  the client bundle.
- `colors` holds hue names (`'blue'`), resolved through `vc` by the renderer, since `src/lib`
  does not depend on styles. `tab=` was added for `CodeTabs` labels.
- Palette: `--code-keyword` ... `--code-operator` in `tokens.css` (one definition, read through
  `codeColor` in `viz-colors.ts`); `SqlLabel` uses it.
- `CodeView` and `CodeTabs` in `src/ui/molecules` (with `codeTab.ts` for the remembered tab),
  registered in `mdxComponents`. The copy button copies `snippet.source`. Highlighted lines use
  the highlight hue (yellow) as a tint and a left bar. Output blocks show under a dashed rule.
- Fence syntax is documented in `ADDING_CONTENT.md` (section 4).

### Batch 2 as built (2026-11-05)

- `src/lib/code/tokenize.ts`: `tokenizePython`, `tokenizeSql` (moved from `src/lib/sql.ts`, now
  returning the shared kinds, with `--` comments) and `tokenizeCode(lang, source)`, which gives
  one token list per line and plain text for languages without an in-house tokenizer. Python
  splits dotted names (`np`, `linalg`, `norm` are separate tokens), marks calls and the names
  after `def` and `class` as functions, and reads prefixed and triple-quoted strings. Tests in
  `tokenize.test.ts` (joining tokens gives back the input).
- `CodeTokenSpan` and `codeTokenStyle` in `src/ui/atoms`: one token in the palette, shared by
  `CodeView` and the stage. A name with a hover key has a dotted underline and a tint while its
  key is lit. `CodeView` takes `activeKey` and `onHoverKey`; nothing in the pane passes them yet,
  since the pane sits outside the stage's `HighlightContext` (batch 3 lifts the highlight to the
  item page so the Code tab and step peeks can link).
- `src/viz-kit/code/`: `CodeLabel` (one line in SVG, any language, `colors`, `hoverKeys`,
  `kindColors`) and `CodeBlock` (a glass panel in an `HtmlBox` hanging from `at`, with `align`;
  `line` places the highlight bar, fractional values allowed, `null` hides it; `glide={false}`
  when `line` is already animated; `dimOthers` fades the other lines; title and output as in
  `CodeView`). Both read `HighlightContext` for two-way hover. `SqlLabel` is now a thin wrapper
  over `CodeLabel`.
- The 2D `Vector` takes `hoverKey` (emphasis, dimming and a hit target as in the 3D primitives),
  so `A @ v` can link to its arrow. Other 2D primitives get keys when an item needs them.

### Batch 3 as built (2026-11-05)

- **Lifted highlight.** `HighlightScope` (`viz-kit/stage/highlight.ts`) wraps the item page;
  inside it `useHighlight()` returns the page's highlight instead of the item's own, so no item
  changes. The pane reads it with `useHighlightScope()` and provides `CodeLinksContext`
  (`ui/molecules/codeLinks.ts`); `CodeView` reads the context, so MDX blocks, `CodeTabs` and
  peeks link both ways without props. Only code views re-render on hover.
- **`code.mdx`.** Globbed lazily by the registry; `Item.Code`, `Item.loadCode`, `Item.hasCode`.
  `remarkCodeView` adds `export const snippets` (the blocks with `step=`, with tokens and a
  `group` number for blocks of one `CodeTabs`) to `code.mdx` files only. `termUsesPlugin`
  scans `code.mdx` after the explanation.
- **Code tab.** A `SegmentedControl` (now with icons) "Explanation | Code" under the steps, only
  on items with code; content cross-fades; headings in monospace. `?tab=code`, hotkey `c` (opens
  the pane when hidden). The block of the active step gets a yellow border and scrolls into view
  (after the step list settles, smooth unless reduced motion); the others fade to 0.6.
- **Step peeks.** Rows of steps with code get a code button (`StepList` props `codeSteps`,
  `peekOpen`, `renderPeek`). One switch for all steps, so the code follows as steps change; the
  peek opens under the caption with the caption's height transition. The pane loads `code.mdx`
  on mount for items with code.
- **Discovery.** A code icon after the title on unit page rows and a "Code" badge in the pane
  header. The Explore page filter waits for Phase 3.
- Fixed on the way: `CodeTabs` widened the block to its longest line (grid column now
  `minmax(0, 1fr)`).
- Checked with a temporary `code.mdx` on `vectors/basis-and-coordinates` (removed): hover from
  a pane name dims the other arrows and lights the readout row. No item has `code.mdx` yet; batch
  4 adds the first, and should add an e2e check of the Code tab and a peek.

### Batch 4 as built (2026-11-05)

- `code.mdx` in the three pilot items, every block tied to a step, outputs from real runs
  (Python 3.12, NumPy 2.5, PyTorch 2.15 CPU, PySpark 4.3 on Java 21, in a scratch environment).
- `matrix-vector-product`: columns, rows, food, shapes, identity, one row, a layer, homogeneous
  coordinates. `x`, `Ax`, `a1`, `a2`, `w`, `b` carry their stage colors and hover keys; the
  arrows got matching `hoverKey`s. On the stage, a `CodeLabel` under the plot shows the line of
  the step in the columns and rows steps.
- `forward-pass`: weights, one neuron, then the forward loop in NumPy and `nn.Sequential` in a
  PyTorch tab (the NumPy weights copied in, so both print the same output).
- `partitioning-by-key`: the item is about `partitionBy` on disk and pruning, not shuffles, so
  the code follows it: the folder listing, the path column, and the scan node of
  `explain("formatted")` (`PartitionFilters` for `day`, only `PushedFilters` for `city`, both
  levels), with a SQL tab. `repartition`, `DISTRIBUTE BY` and `Exchange hashpartitioning` belong
  to Hash partitioning instead.
- e2e: "code tab follows the step, and a step peek shows its code" in `smoke.spec.ts`.
- The owner's answer on heavy libraries (2026-11-05): local runs are fine if they take seconds;
  use Docker images, as in the owner's `de-workbench` repo. Batch 5 now includes the runner that
  makes this one command.

### Batch 5 as built (2026-11-05)

- `scripts/run-code.mjs` (`pnpm code <item path>`): each MDX file of an item runs as one script
  per environment, blocks in order in one namespace, inside the environment's Docker image
  (`docker run -i`, the script on stdin, no mounts). A small Python driver captures each block's
  printed output and returns JSON after a marker, so Spark's logs do not mix in. It prints each
  block's output and `same`, `DIFFERS` or `NO OUTPUT BLOCK`; `--write` rewrites differing output
  blocks; `--check` runs only `check` blocks and fails on a difference; `--env`, `--local` (the
  local `python3`, default environment only), `--all`. Fence parsing reuses `parseFence` (Node 24
  strips the types).
- Environments in `code-envs/<env>/` (build context `code-envs/`): `default` (Python 3.12.15,
  NumPy 2.5.4, SymPy 1.14.0, pinned in `default/requirements.txt`), `torch` (the default
  packages plus the CPU wheel of PyTorch 2.15.0; a `torch` run also runs the file's `default`
  blocks, so a PyTorch tab can reuse NumPy names), `spark`
  (`spark:4.0.4-scala2.13-java17-python3-ubuntu`, Python 3.10, `spark-submit` with the UI off).
  Images are tagged `lumen-code-<env>:<hash of the env files>` and built on first use, so a
  change to a requirements file rebuilds once.
- Fence options: `env=<env>` names the environment (validated against `CODE_ENVS`); `check`
  marks a block as checked and `check=<env>` does both; `raises=ValueError` for a block that
  raises on purpose (the shapes block). `output excerpt` shows some of the printed lines, in
  order (Spark plans without `Location` and the codegen nodes). SQL blocks with `env=spark` run
  through `spark.sql` (an `EXPLAIN` prints its plan), so the SQL tab of the partitioning pilot
  now runs too; `prune.py` registers the `sales` view for it. The model changed from
  `check?: { env }` to `env`, `check` and `raises`.
- CI: `.github/workflows/code-check.yml`, its own workflow, only when MDX, the runner, the fence
  parser or `code-envs/default` change. `setup-python` with the pip cache, then
  `run-code.mjs --all --check --env default --local`. Under `CI` a skipped run fails.
- Pilots re-run: every block of the three items is marked `check` (`check=torch`,
  `check=spark` for the heavy ones). NumPy and PyTorch outputs matched; the Spark plans changed
  only in attribute ids (`#8` instead of `#0`, since one session now runs all blocks), updated.
  Times after the images exist: default 0.2 to 0.7 s, torch 1.7 s, spark 10.4 s.
- Not done: SQL in the default environment (DuckDB would fit), Scala blocks.

## Code beside the visual (batches 6 and 7)

Planned on 2026-11-05 after the owner's review of batches 4 and 5. Supersedes the first idea for
batch 6 (a pinned step header in the Code tab), since the Code tab goes away.

### What the review found

- **The Code tab is read after the fact.** A learner goes through the steps on the stage, then
  would have to go through them again in the tab. The tab and the steps share one scroll area,
  so following a step scrolls the steps out of view and the learner scrolls back up for each
  step.
- **Code drawn inside the picture looks out of place** (the `CodeLabel` under the plot in
  `matrix-vector-product`). It moves with the drawing and competes with the shapes.
- **Step peeks** are the closest to the goal (code at the step, while on the step), but they
  live in the narrow pane, under captions, behind a toggle, and they push the step list down.
- The goal (the owner's words): code that is handy and blends with the visual, in a fixed, clean
  box of its own, available at each step, instead of a separate section that stays mostly hidden.
  Code is still not the main point (answer 1 below): it supports the visual and can be closed.

### The design

**One surface for code: the code panel.** A glass panel docked to the stage, not part of the
drawing, owned by the item page (like the pane), so items need no code to get it.

- **What it shows:** the snippet of the active step, read from `code.mdx` by `step=` (as peeks
  do today), with its lead (the paragraph right before the block in `code.mdx`, one or two
  sentences) and its output. `CodeTabs` stay tabs inside it. Two-way hover with the stage works
  as now (`CodeLinksContext`).
- **Where:** a fixed spot on the stage, bottom-left above the control dock by default; an item
  can pick another corner (`codeCorner` in its meta) when its readouts sit there. Width about
  26 rem, height fits the snippet up to a cap, then the code scrolls inside the panel. On a
  narrow screen it becomes a sheet at the bottom of the stage. In fullscreen it stays (it should
  look good in recorded lessons).
- **How it opens:** a "Code" button on the stage (with the code mark, hotkey `c`) and the code
  button on each step row that has code. Open or closed is remembered per browser across items
  (pattern of `codeTab.ts`). Collapsing leaves a small chip with the code mark. The panel is
  closed on a learner's first visit, and the step buttons and the stage button make code easy
  to find (to confirm with the owner, see the questions below).
- **Steps without code:** the panel stays where it is and shows a quiet "No code for this step"
  line, so it does not jump in and out while stepping. Blocks with no `step=` appear only in the
  whole-file view.
- **Motion:** when the step changes, the content cross-fades and the height glides (motion
  tokens); the stage does not move.
- **The whole file:** a "Whole file" button in the panel opens `code.mdx` in a `VizSheet`, in
  order with its prose, the active step's block marked. Clicking a block's step label goes to
  that step. This replaces the Code tab: the steps stay in the pane, untouched, so the scroll
  problem goes away.

**Removed:** the Code tab (segmented control, `?tab=code`, the pane's code loading), step peeks
(`StepList` props `codeSteps`, `peekOpen`, `renderPeek`) and the in-drawing `CodeLabel` of
`matrix-vector-product`. `?tab=code` in old links opens the panel instead. The code mark on unit
page rows and the pane header stays. `CodeLabel` and `CodeBlock` stay in the kit for code that
is itself part of the picture (rare); the eight Data Engineering items with `SqlLabel` are
reviewed only when Data Engineering resumes.

**Batch 7, code that moves with the visual** (the 3Blue1Brown part):

- **Per-step focus in one block:** a block can serve several steps with a different highlighted
  part each, `step="columns rows" focus="columns=6-7 rows=8"`, so stepping keeps the code in
  place and the highlight bar glides between lines, instead of swapping blocks.
- **Animated focus:** `useCodeFocus(line)` lets an item drive the highlight from its animation
  (fractional lines glide, as `CodeBlock` already allows): in the columns step the bar sits on
  `x[0] * a1` while the first column scales, then on `x[1] * a2`. Names in the focused line glow
  with their shapes for that moment (the hover link, driven by the item).
- Applied to the three pilots and written into `ADDING_CONTENT.md` (when to give a step focus,
  when an animation should drive it).

### Order of work

1. Batch 6: the panel (with the stage button, step buttons, `c`, memory, narrow and fullscreen
   layouts), the whole-file sheet, removal of the tab and peeks, `?tab=code` compatibility,
   the three pilots checked in both themes, e2e rewritten ("the code panel follows the step").
   Docs: this plan, `ARCHITECTURE.md` (surfaces), `ADDING_CONTENT.md` (leads, `codeCorner`).
2. Batch 7: `focus=` and `useCodeFocus`, applied to the pilots. If batch 6 runs short, its
   first part (per-step `focus=`) moves into batch 6.

After batch 7, code is added unit by unit as units are built (Linear Algebra first).

### The owner's answers (2026-11-05)

1. The panel is closed on the first visit to an item with code, and remembered once opened.
2. The Code tab goes; the whole-file sheet replaces it.

### Batch 6 as built (2026-11-05), approved by the owner on 2026-11-06

- **Leads.** `remarkCodeView` gives each step block of `code.mdx` the paragraph right before it
  (or before its `CodeTabs`) as `CodeEntry.lead`: plain text where inline code keeps its
  backticks and math its dollars, rendered with `RichText`. A heading in between means no lead.
- **`CodePanel`** (`ui/organisms`), rendered by `ItemPage` beside the control dock for items
  with `hasCode`. A glass panel, 24 rem wide, in `item.codeCorner` (default `bottom-left`), its
  bottom above the dock (the dock's height is measured, so a two-row dock pushes it up). Header:
  the code mark, "Whole file", collapse (`c`). Body: the step's leads and blocks (`CodeTabs`
  stay tabs); content cross-fades by block, so steps sharing code (batch 7) keep it in place;
  the height glides (`GlideHeight`, a measured height with a CSS transition) up to about half
  the stage, then the code scrolls. Steps without code: "No code for this step." Collapsed, it
  is a "Code" chip in the same corner. The panel hides while the sheet is open.
- **State.** `codePanelOpen` in the persisted UI store (closed by default). `c` toggles it; the
  step rows' code buttons (`StepList` `codeSteps`, `codeOpen`, `onCodeOpen`) select the step and
  open it, or close it from the active row. `?tab=code` opens it and is removed from the URL.
- **Whole file.** `code.mdx` in a `VizSheet` ("Code walkthrough"), headings in monospace. The
  active step's block is marked and scrolls into view; each step block has a "Step n" chip
  (`CodeLinks.onStep`, `stepInfo`) that goes to its step, with the sheet staying open.
- **Layouts.** `VizLayout`'s stage is a named inline-size container (`container: stage / inline-size`); under
  640 px the panel spans the bottom of the stage. Fullscreen keeps it (it is inside the stage).
- **Removed:** the Code tab (segmented control, pane code loading, `PaneTab`), step peeks, and
  the in-drawing `CodeLabel` of `matrix-vector-product`. `CodeLinksProvider` and `useItemCode`
  moved out of the pane into `ui/organisms`.
- `scripts/shoot.mjs` takes `UI='{"codePanelOpen":true}'` to shoot with stored UI state.
- e2e: "the code panel follows the step, and the whole file goes to a step" and "old links to
  the Code tab open the code panel".
- **For the review:** on a stage narrowed by the open pane, the panel covers part of the drawing
  (in `matrix-vector-product`, the lower-left quadrant). It is closable and the drawing does
  not move, as planned. If that is too much, two options: move the drawing aside while the
  panel is open (the stage gets an extra inset, so the drawing shrinks), or a smaller default
  panel that grows on hover.

The owner approved batch 6 as built (2026-11-06), including the panel covering part of the
drawing on a narrow stage; neither of the two options above is needed.

### Batch 7 as built (2026-11-06), waiting for the owner's review

- **Model.** `CodeSnippet.step` became `steps` (`step="columns rows"` in the fence), and `focus`
  holds lines per step (`focus="columns=7-9 rows=12-13"`); a focus on a step the block does not
  list fails the build. `focusLines(snippet, step)` gives the step's lines, else `highlight`.
- **The bar.** `CodeView` draws the highlight as one bar per run of lines (left rule and tint,
  placed in line heights), keyed by index, so a new focus glides (`--dur-slow`, none under
  reduced motion) instead of switching line tints. Focused lines carry `data-focus`. In the
  panel the bar scrolls into view when it moves (after its glide), never on the first render.
  The panel's content keeps its key across steps that share a block, so only the bar moves; the
  whole-file view gives such a block one step chip per step.
- **`useCodeFocus(line, { key })`** (`viz-kit/stage/codeFocus.ts`): an item drives the line of
  its step's first block; fractional values glide frame by frame (no CSS transition then), null
  hands back to the step's focus. The value lives in a store under `CodeFocusScope` (item page),
  read by the panel's `StepCode`. `key` sets the page highlight for that moment (code names and
  the shape glow, others dim) only when the learner is not hovering, and clears it after.
- **Pilots.** `matrix-vector-product`: the columns and rows blocks are one `product.py`
  (`Ax = x[0] * a1` then `Ax += x[1] * a2`); entering the columns step now builds the column
  picture term by term (x1 a1 grows, then x2 a2, then `Ax` appears), with the bar on the line of
  the term and `a1`, then `a2`, lit; the layer step's bar glides from `Wx = W @ x` to
  `out = Wx + b` as the plane moves, then slides (with `b` lit). `forward-pass`: during a pass
  the bar waits on `for` and slides into the loop body as each layer's signal travels.
  `partitioning-by-key`: the write and the read of the path are one `partition.py` over the
  `partition` and `path` steps. Outputs re-run (`layer.py` changed).
- e2e: the code panel test checks that the highlight moves inside the shared block.
- **For the review:** the new build-up animation in the columns step (the visual changed a
  little: the terms appear one after the other on entering the step, a drag shows the whole
  product at once), and the glow during driven focus, which dims the other shapes as a hover
  does. If the dimming is too strong, the glow can light only the code names and readout rows.

## Pilot content (batch 4)

One item per area, where the code says something the visual cannot:

1. **Linear algebra,** `linear-maps/matrix-vector-product`: `A @ v`, the column view
   `v[0] * A[:, 0] + v[1] * A[:, 1]` and the row view with `np.dot`, each linked to its step,
   `A` and `v` in their stage colors, on the stage and in the pane. Then
   `matrix-transformations` (a grid of points mapped as one product).
2. **Machine learning,** `neural-networks/foundations/forward-pass`: a layer as
   `sigma(W @ x + b)` in NumPy, PyTorch's `nn.Linear` in a tab. This item is a legacy pilot and
   may be rebuilt later, so its code stays small and is easy to move.
3. **Data engineering,** `partitioning-and-hashing/partitioning-by-key`: PySpark
   `repartition("key")` and `partitionBy`, SQL `DISTRIBUTE BY`, and the `Exchange hashpartitioning`
   line of the plan, linked to the shuffle step.

After the owner's review, code is added unit by unit as units are built or revised (Linear
Algebra first, where almost every item has a NumPy counterpart).

## Snippet runner and checks (batch 5)

- **One runner for writing and checking.** `scripts/run-code.mjs <item path> [--env spark]`
  collects an item's blocks of one environment, in order, as one script, runs it in that
  environment's Docker image, and prints each block's output (with a marker between blocks), so
  output blocks are pasted from a real run. With `--check` it compares the output blocks instead
  and fails on a difference (CI uses this). Target: seconds per item.
- **Environments as images** in `code-envs/<env>/`: `default` (Python 3.12, NumPy, SymPy; a
  `Dockerfile` or the local Python when Docker is missing), `torch` (CPU wheel baked into the
  image), `spark` (the official `spark` image, `spark-submit`). Images are built once and
  reused; nothing is installed per run. Fences name their environment with `env=spark` (new
  fence option) or by `check=<env>`; Python blocks default to `default`.
- **Measured (2026-11-05):** the local `spark:4.0.4-scala2.13-java17-python3-ubuntu` image runs
  the partitioning pilot's write and `explain` in about 10 s, JVM start included.

The parts below still hold:

- **Opt-in per block.** Only blocks marked `check` run; everything else (PySpark, PyTorch, Scala,
  pseudo-code, fragments) is shown and never run. Checking a block is a choice for code that can run
  cheaply, never a requirement for showing it.
- **Environments by name.** `check` means the default environment (Python 3.12, NumPy, SymPy,
  pinned in `code-envs/default.txt`). A heavier one (`check=torch`) can be added later as its
  own file and job, if it is ever worth it; until then such blocks are verified by hand.
- `scripts/check-code.mjs` collects the checked blocks of each item, in order, as one script per
  item and environment, runs it, and compares each output block with what was printed.
- **Separate, light CI job.** Its own workflow, triggered only when `code.mdx` files or the
  script change (`paths:` filter), with the pip cache. It does not block the Pages deploy. Cost:
  about 30 seconds to install NumPy and SymPy the first time (seconds once cached), then a few
  milliseconds per block. Locally the script skips with a note when Python is missing.
- The same checked blocks are the natural first candidates for runnable cells later.

## The owner's answers (2026-11-05, batch 5 review)

- The one added line in `prune.py` (registering the `sales` view for SQL) is fine.
- PyTorch and Spark checks stay local; CI checks only the `default` environment.
- `output excerpt` was explained with an example; no change asked.

## The owner's answers (2026-11-01)

1. The Code tab in the explanation pane is fine, provided it is visible and clearly distinct
   from the explanation. It must not be the main point: code should be tied to the
   visualizations, steps and lessons (hence the stage surface and step peeks come first).
2. Python 3.12, NumPy and SymPy for the default environment.
3. The three pilot items are fine; the ML item may be reworked later.
4. Snippet checks must not limit what can be shown, nor make CI heavy (hence opt-in blocks,
   named environments and a separate job).
5. Build it so runnable cells and the `code` kind fit later without much rework (hence the
   code model).

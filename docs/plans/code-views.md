# Code views plan (Phase 6, first part)

Plan for showing real code inside items, read-only. Part of [ROADMAP.md](../ROADMAP.md) (Phase 6).
Drafted on 2026-11-01 and reviewed by the owner the same day (answers at the end).

## Status

| Batch | What                                                                 | Status |
| ----- | -------------------------------------------------------------------- | ------ |
| 1     | Code model and highlighted blocks in every MDX file (build time)     | done   |
| 2     | Code on the stage: `CodeLabel`, `CodeBlock`, links to shapes         | done   |
| 3     | Code in the explanation pane: step peeks and the Code tab            | done   |
| 4     | Pilot content in three areas, then the owner's review                | review |
| 5     | Opt-in snippet checks: marked Python blocks run in a separate CI job | idea   |

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
- Open question for the owner: the rule "outputs come from real runs" means PySpark (with Java)
  and PyTorch must be installed locally whenever such content is written. Options to decide at
  review.

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

## Snippet checks (batch 5, opt-in)

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

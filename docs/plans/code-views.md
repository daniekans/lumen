# Code views plan (Phase 6, first part)

Plan for showing real code inside items, read-only. Part of [ROADMAP.md](../ROADMAP.md) (Phase 6).
Drafted on 2026-11-01; waits for the owner's review.

## Status

| Batch | What                                                          | Status |
| ----- | ------------------------------------------------------------- | ------ |
| 1     | Highlighted code blocks in every MDX file (Shiki, build time) | idea   |
| 2     | The Code tab: `code.mdx` per item, blocks linked to steps     | idea   |
| 3     | Code on the stage: `CodeLabel` and `CodeBlock` in the kit     | idea   |
| 4     | Pilot content in three areas, then the owner's review         | idea   |
| 5     | Snippet checks: Python blocks run in CI and outputs compared  | idea   |

One batch per session. Update this table and the "Suggested next session" in `ROADMAP.md` when a
batch ends.

## Scope

- **In:** read-only code next to the visual it explains, in any area: NumPy and SymPy for
  mathematics, NumPy from scratch plus PyTorch for machine learning, SQL and PySpark (with
  `EXPLAIN` output) for data engineering, Python for AI engineering.
- **Kept for later, not discarded:** runnable cells (Pyodide, DuckDB-Wasm), a `code` item kind
  (notebook-style lessons with checked outputs). Both are described in `ROADMAP.md` (Phase 6).
  Nothing in this plan should make them harder: code lives in plain fenced blocks with
  metadata, which a runner can later pick up.
- **Not a Python course.** Code shows the "why": each line maps to a symbol, a step or a shape
  on the stage. It models good practice (type hints, small functions, names that follow the
  math: `A`, `v`, `x_hat`), since the owner values it.

## What exists today

- **SQL on the stage.** `SqlLabel` (`src/viz-kit/math-plot/SqlLabel.tsx`) draws one line of SQL
  in SVG with the in-house tokenizer `src/lib/sql.ts` (keywords purple, functions teal, literals
  orange). Used by eight Data Engineering items.
- **Fenced code in MDX.** Explanations already allow fenced blocks (one in `outer-joins`), styled
  by `Prose.module.css` as plain monospace with no highlighting.
- **Places to put things.** The explanation pane (steps, then the MDX explanation; it can be
  resized and floated), `VizSheet` (a large glass panel over the stage), readout panels, the
  control dock, `HtmlBox` for HTML on a stage.

## Design

Three surfaces, one look. Every piece of code uses the same token colors, wherever it appears.

### One code palette

Token kinds: keyword, function (or call), string, number, comment, name, operator. Colors come
from `vc` with a fixed meaning, the one `SqlLabel` already uses: keywords purple, calls teal,
literals orange, names in the foreground, operators and comments muted. Define them once as CSS
variables (`--code-keyword`, ...) in the theme tokens, so dark, light and paper each get them,
and read the same values in `SqlLabel`, `CodeLabel` and the Shiki theme.

### Surface 1: code blocks in MDX (batch 1)

- **Highlighting at build time with Shiki** (`@shikijs/rehype` in the MDX pipeline of
  `vite.config.ts`), using Shiki's CSS-variables theme mapped to the code palette. The output is
  spans with classes or variables: no runtime JavaScript, all three themes from one build.
  Languages loaded: `python`, `sql`, `scala`, `typescript`, `bash`, `json`, `yaml`, `text`. Watch
  the size of explanation chunks (today about 9 kB gzipped each).
- **Fence metadata,** parsed by one small pure function (`src/lib/code/fenceMeta.ts`, tested):
  - `title="rotate.py"`: a caption bar.
  - `{3-5}`: highlighted lines; the others stay at full contrast (dimming is for step links).
  - `step=shear`: links the block to a step (used by the Code tab, batch 2).
  - `colors="A=blue v=orange"`: names drawn in the color of their counterpart on the stage, the
    code version of `<C c="blue">`. This ties `A @ v` to the blue matrix and the orange vector,
    which is the point of the whole phase.
  - `output`: a block that shows printed output (muted, no highlighting), placed after the
    code it belongs to.
- **`<CodeTabs>`** in MDX: the same idea in two libraries (NumPy | PyTorch, SQL | PySpark). The
  chosen tab is remembered per browser and shared across items (same pattern as
  `readoutSize.ts`).
- A copy button on hover, labels from `msg`.
- The existing SQL block in `outer-joins` gets highlighting for free.

### Surface 2: the Code tab (batch 2)

- **Content:** an optional `code.mdx` in the item folder, next to `explanation.mdx`. Prose between
  the blocks is short ("`np.linalg.solve` never forms the inverse"). Same MDX components, same
  Shiki pipeline. The registry globs it like the explanation and loads it lazily, so items
  without code cost nothing. `Item.code` is the loader; `hasCode` is derived from it.
- **Where it shows:** a second tab in the explanation pane, "Explanation | Code", only on items
  with a `code.mdx`. The steps list stays above both tabs, so stepping works while reading code.
  The pane's resize and float already give the code room. The open tab is in the URL like the
  step (`?tab=code`, through `query.ts`) so a link can open it. A hotkey (`c`) switches tabs.
- **Step links:** blocks with `step=` are highlighted when their step is active and the others
  dim slightly; the active block scrolls into view; clicking a block's step badge goes to that
  step. A block without `step=` is always at full contrast.
- **Discovery:** a small code mark on item rows (unit page), in the item header, and later as a
  filter on the Explore page (Phase 3).
- `termUsesPlugin` scans `code.mdx` too, so `<Term>` works there and the glossary lists it.
- Rejected alternatives: a `VizSheet` over the stage hides the visual the code explains; a split
  of the stage area squeezes visualizations that are designed for the full width.

### Surface 3: code on the stage (batch 3)

For code that is part of the picture: `A @ v` beside the vector, a Spark plan node with its
PySpark line, a query whose clauses light up as rows move.

- `src/lib/code/`: `tokenizePython` beside the moved `tokenizeSql`, both returning the shared
  token kinds, with Vitest tests (joining tokens gives back the input, as the SQL test does).
- `CodeLabel` (SVG, one line, any language) generalizes `SqlLabel`; `SqlLabel` stays as a thin
  wrapper so the eight items do not change.
- `CodeBlock` (HTML in an `HtmlBox`, several lines, glass surface): a highlighted line driven by
  the step or an animated value, per-name colors as in surface 1. Lines fade, never jump.
- In-house tokenizers, not Shiki at runtime: Shiki's runtime costs hundreds of kB, while a
  stage needs one or two languages and a few lines.

### Content rules (added to `ADDING_CONTENT.md` in batch 2)

- Python 3.12 with type hints; imports at the top of the first block of an item; names that
  follow the math notation of the item; no line over about 72 characters (the pane is narrow).
- Every output shown is real: computed, never typed by hand (batch 5 checks it).
- A block maps to one step or one idea. Three to fifteen lines. Longer code belongs to the
  future `code` kind.
- Data engineering shows what the engine does with the code: SQL or PySpark next to its plan
  (`EXPLAIN` output as an `output` block), tied to the stage's partitions and shuffles.
- Deep learning: the NumPy version first (where the math shows), PyTorch in a `CodeTabs` beside
  it.

## Pilot content (batch 4)

One item per area, chosen where the code says something the visual cannot:

1. **Linear algebra,** `linear-maps/matrix-vector-product`: `A @ v`, then the column view
   `v[0] * A[:, 0] + v[1] * A[:, 1]` and the row view with `np.dot`, each linked to its step,
   `A` and `v` in their stage colors. Then `matrix-transformations` (applying `A` to a grid of
   points as one product).
2. **Machine learning,** `neural-networks/foundations/forward-pass`: a layer as
   `sigma(W @ x + b)` in NumPy, PyTorch's `nn.Linear` in a tab beside it.
3. **Data engineering,** `partitioning-and-hashing/partitioning-by-key`: PySpark
   `repartition("key")` and `partitionBy`, SQL `DISTRIBUTE BY`, and the `Exchange hashpartitioning`
   line of the plan, linked to the shuffle step.

After the owner's review, code is added unit by unit as units are built or revised (Linear
Algebra first, where almost every item has a NumPy counterpart).

## Snippet checks (batch 5)

- `scripts/check-code.mjs` extracts the `python` blocks of every `code.mdx` (in order, per item,
  as one script), runs them with Python and NumPy, and compares each `output` block with what
  was printed. Blocks that cannot run here (PyTorch, PySpark) are marked `norun`.
- CI runs it with `actions/setup-python` and a pinned `requirements-code.txt`. Locally it runs
  when Python is available and skips with a note otherwise.
- This is the first step toward runnable cells: the same blocks, later run in the browser.

## Open questions for the owner

1. The Code tab inside the explanation pane (proposed) or another place?
2. Python version and libraries to pin for snippet checks (proposed: 3.12, NumPy, SymPy).
3. Pilot items: the three above, or others?

# Decisions

The rules in force, in short. Dates, reasons and history are in [DECISIONS-LOG.md](DECISIONS-LOG.md);
read it only when a reason matters. Do not reopen a rule without a reason. When something is
decided, add the full entry to the log and the rule here.

## Daniel

- Data engineer (once a senior software engineer) aiming for Senior Data Engineer and Data
  Architect. Values typing, decoupling and clean code. Knows React and TypeScript.
- Learns on demand, on an irregular schedule, in short Claude sessions. The repo docs carry all
  context.
- Main interest: intermediate and advanced Calculus, Linear Algebra, ML, Deep Learning, AI
  Engineering, Data Engineering and Architecture. Fundamentals are refreshers, not where his time goes.
- Likes 3Blue1Brown, Welch Labs, Mathologer. May record video lessons (possibly in pt-BR).

## Look and feel

- Clean, minimal, smooth, in the spirit of 3Blue1Brown. Palette, motion speed and glass panels
  approved as built. Themes: dark (default), light, paper; stop at three.
- Math notation follows English-language books: `\lim` with $x \to a$ underneath (shared KaTeX
  macro), prompts in display style, integrals with TeX's default bounds (never `\int\limits`),
  sums with limits underneath in display math. Stacked fractions everywhere, labels included
  ($\frac{\pi}{2}$, never "π/2").
- Visualizations show what the step is about: exact values (special angles, key points) are
  labeled on the stage, not only in readouts. A control shown in a step changes the drawing in that
  step. Checklist in `ADDING_CONTENT.md` (Check).
- Each hue means something; three is usual, more is fine when clearer (`DESIGN.md`).
- SQL on a stage uses `SqlLabel` (keywords purple and bold).
- 3D is SVG with an orthographic orbit camera (`Stage3D`), depth cues, idle sway on by default,
  planes as parallelogram patches. Surfaces are the next 3D priority. three.js only if shading needs it.
- Points show coordinates on hover on zoomable stages. Floating UI fades both ways.

## Learning model

- Area > course > unit > item; kinds: explore, lesson, practice, checkpoint.
- Progress (rings) and skill status (self-assessed) are separate; every status is settable both
  ways; "I already know this unit" can be undone. Undoing "Done" empties the ring.
- No spaced repetition, schedules, due queues, reminders or streaks. Prerequisites never lock.
- Practice: sessions of 8, first answer counts, done after 5 correct. Checkpoint passes at 80%.
  Sessions and sheets persist until finished or restarted; problems are generated per session.
- Answers in MathLive, checked by the in-house TeX evaluator. Progress in IndexedDB with JSON export.

## Content

- Every course is outlined and reviewed by Daniel before its first unit; outline steps go in the
  suggested order, which is extended before it runs out.
- Unit depth: refresher (about 5 items, one batch) for pre-calculus and prerequisites; core (around
  10 items, no upper limit) from Calculus 1 and the DE units on. Comprehensive depth from Calculus
  on, with threads across units (Leibniz notation, limits, linear approximation; `plans/calculus.md`).
- Focus is Mathematics and Machine Learning (2026-10-23). Data Engineering and Architecture
  continue only on request; when a DE step fits, the closing answer offers it as a second prompt.
- Introduce, then expand: never teach something a later item takes back. Early statements are
  correct, with their conditions.
- Content is mathematically correct: answers computed and tested, never from memory.
- Cross-area topics stay in the area they fit best, after their fundamentals.
- Legacy visualizations: keep the visuals when their unit is built; revise text, steps, placement.
- Wish list in `LEARNING_PLATFORM.md` (Topics Daniel asked for); place topics when outlining.

## Working

- Build content in batches; collect Daniel's feedback per batch. After a batch or adjustments,
  commit, push and deploy without asking; ask only when his judgment matters.
- One batch per session: start a clean session after each push, since every call resends the
  whole conversation.
- Save tokens: read only what the step needs; screenshots cropped to the stage, only the steps that
  changed, one theme while iterating.
- Every answer that ends a piece of work closes with a prompt for a clean session. Default:
  "Continue Lumen: take the next step in "Suggested order of units" (docs/LEARNING_PLATFORM.md)."
  A specific prompt only when the next session needs something the docs cannot hold (review notes
  as `<notes>`, an open question). DE alternative: "Continue Lumen: take the next Data Engineering
  step in "Suggested order of units" (docs/LEARNING_PLATFORM.md)."
- No Claude attribution in commits or PRs; only the GitHub noreply address.

## Engineering

- React + Vite + TypeScript, atomic UI, a reusable visualization kit, content as data. Simple, low
  maintenance, free services only. GitHub Pages at `/lumen/` from a public repo.
- Conventional Commits; writing rules in `WRITING.md`.
- UI copy in one typed object (`msg` from `@/i18n`); `src/lib` returns codes, not copy.
- Glossary "used in" comes from `<Term>` links; term ids are global. Clicking a term opens a popover.
- Course page is a map, unit page a workspace; items keep course order everywhere.
- Moved content gets a redirect, and progress follows it.
- Roadmap phases start when the curriculum needs them; their numbers are labels. Platform feature
  decisions (phases 2C to 9, 3D details) are in the log.

## Future (record, do not build)

- A product for other learners (`PRODUCT_VISION.md` seams only), pt-BR, presentation mode, an
  Explore page, code lessons (NumPy, SymPy, Spark plans; `ROADMAP.md`, Code lessons).

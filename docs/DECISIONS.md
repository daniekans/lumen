# Decisions

Preferences Daniel stated and decisions made with him, with the reason, so later sessions do not
reopen them. Newest last within each section. Add to this file whenever something is decided.

## About Daniel

- Data engineer aiming for Senior Data Engineer, later Data Architect. Loves math and data science but
  has not studied math in years. Knows React and TypeScript.
- Uses Lumen to learn: mathematics first (from pre-calculus), Data Engineering and Architecture
  interleaved with it, then Machine Learning and AI Engineering.
- Studies on an irregular schedule, so everything must work on demand.
- Plans to record video lessons with the visualizations, possibly in Brazilian Portuguese.
- Works in short Claude sessions to save tokens; the repo docs must carry all context.
- Senior software engineer before data engineering (once a "Python Expert" role); values typing,
  decoupling, clean code and design patterns. Used NumPy, pandas and a little SymPy while learning
  data science, but without the link to the math, so the "why" faded. Enjoys 3Blue1Brown, Welch
  Labs, Mathologer, Numberphile, Computerphile and Veritasium.
- Main interest is intermediate and advanced material: Calculus, Linear Algebra, Data Engineering
  and Architecture, Machine Learning, Deep Learning and AI Engineering. Fundamentals matter for a
  smooth curve and for a possible product, but they are not where his time should go.

## Look and feel

- Clean, minimal, smooth, in the spirit of 3Blue1Brown, Welch Labs, Mathologer. Approved as built.
- Dark theme by default, light theme available. Palette and motion speed approved as they are.
- A third theme, Paper (2026-10-18): a warm light theme for long reading (cream background,
  brown-gray ink, darker visualization hues, yellow as amber). The theme button and `t` cycle dark,
  light, paper. Stop at three themes: each one is a palette to check on every visualization.
- Explanation pane open by default; it can be resized and floated over the stage.
- All floating panels share one glass style (translucent background and blur).
- Home hero copy ("See the idea, then the formula.") approved, may change as the product evolves.
- Math notation follows books (2026-10-18). `\lim` sets $x \to a$ underneath everywhere, inline
  too, through one KaTeX macro shared by every renderer (`src/lib/texMacros.ts`); write
  `\lim\nolimits` where the side form reads better. Problem and check prompts render inline math in
  display style, so fractions and limits there are full size. Integrals use TeX's default, as
  English-language books do: in display math and prompts a tall sign with the bounds at its
  top-right and bottom-right tips; in running text a small sign with the bounds beside it. Bounds
  centered fully above and below (`\int\limits`, common in Russian books) are not used. Daniel
  confirmed this on 2026-10-18 after an earlier note ("bounds at the side") read as the cramped
  inline form. Sums and products: limits
  underneath in display math and prompts, at the side in running text, as books do.

## Learning model

- Structure: area > course > unit > item. Item kinds: explore, lesson, practice, checkpoint.
- Progress (content done) and skill status (self-assessment, new to mastered) are separate. Rings show
  only progress. Skill statuses never change the rings.
- Every status can be set by the learner in either direction, including marking things mastered
  upfront. "I already know this unit" marks content done and skills mastered, and can be undone.
- No spaced repetition, schedules, due queues, reminders or streaks. Practice is on demand.
- Undoing "Done" on an item returns it to not started (empty ring), and an item in progress has a
  reset button. Both clear the item's progress only; skill statuses and unfinished practice sessions
  or checkpoint sheets stay. (Before, "not done" kept a full ring without the check.)
- Prerequisites are suggestions; nothing is locked.
- A checkpoint passes at 80%. A practice item is done after 5 correct answers.
- Practice sessions are 8 problems. The first answer counts; retries, hints and solutions are for
  learning. Practice suggests skill statuses; the learner chooses whether to apply them.
- Practice sessions and checkpoint sheets persist until finished or restarted. Problems are generated
  from parameters (fresh numbers for each new session or sheet), and stay fixed within a session.
- Answers are typed in a MathLive field with an on-screen keyboard and checked by a small in-house TeX
  evaluator (Compute Engine was dropped: about 1.1 MB gzipped for unused features).
- Progress is stored in the browser (IndexedDB) with JSON export and import. No accounts for now.
- Skills stay visible on unit pages.

## Content plan

- Math track starts with pre-calculus. The first pilot unit is Pre-calculus / Functions, built end to
  end before scaling content. Algebra essentials comes right after.
- Two unit depths (decided 2026-10-16): refresher units (about 5 items, one batch) for pre-calculus
  and other prerequisites, core units (about 10 items or more, see below) from Calculus 1 and the DE units on. Functions
  and Algebra essentials keep their full depth; Algebra essentials batch 3 was trimmed to 3 items.
- Pre-calculus has five units: Linear and quadratic merged into Polynomial and rational functions,
  and Sequences and series moved to Calculus 2.
- Each area is its own track. Data Engineering is not gated by the math: links between tracks are
  suggested prerequisites only. Linear Algebra runs alongside or right after Calculus 1, since it
  does not need calculus and it unlocks Machine Learning.
- `LEARNING_PLATFORM.md` (Curriculum, Suggested order of units) rotates across tracks so advanced
  material arrives early. Daniel may pick any unit out of order.
- Content must be mathematically correct: answers are computed and tested, never written from memory.
- Cross-area topics (sampling, consistent hashing, probabilistic data structures) stay in the area
  they fit best and arrive after their fundamentals. Not openers, not early side units.
- Phase 2D (pilot content) closed on 2026-10-17 after Daniel reviewed its four units. New units
  continue as ongoing work in the suggested order, alongside the numbered phases.
- Core unit size has no upper limit (2026-10-17, replacing "8 to 10 items"). Around 10 items is
  typical, but the topic decides: a unit can have more. A cohesive larger unit is better than
  splitting a topic into many small units.
- From Calculus on, depth is comprehensive (2026-10-17). Pre-calculus was a refresher; from here
  Daniel wants to master the fundamentals and use them as the base for intermediate and highly
  advanced material, with a smooth curve. Ideas that span units are planned as threads, so each
  unit takes them a level further. The first one: Leibniz notation ($dx$, $\frac{dy}{dx}$,
  $\int f\,dx$, differentials), which Daniel wants to fully master across Calculus 1, 2 and
  multivariable. Details in `plans/calculus.md` (Depth from Calculus on).
- The first seven visualizations (for example `derivative-as-limit`, `riemann-sums`,
  `complex-multiplication`) predate the course plans (2026-10-17). When their unit is built, review
  them against the unit plan: keep the visuals mostly intact (Daniel likes them), and revise
  explanations, labels, titles, steps and placement as needed.
- Calculus outline approved (2026-10-17): Calculus 1 at about 47 items, Calculus 2 and
  Multivariable as outlined in `plans/calculus.md`. A third thread, linear approximation, runs
  from the tangent line to gradient descent. New courses: Differential Equations (after Linear
  Algebra and Multivariable), Discrete Math promoted to core (graph theory), Topology later.
- Every course is outlined (and reviewed by Daniel) before its first unit is built (2026-10-17).
  Daniel starts sessions with "continue" and expects Claude to bring up outline steps itself, so
  they are listed in the suggested order of units, which is extended before it runs out.
- Daniel keeps a wish list of topics for later (Euler's formula, topology, fractals and more). It
  lives in `LEARNING_PLATFORM.md` (Topics Daniel asked for); place each item in a unit when its
  course is outlined.
- Introduce, then expand; never teach something that is later taken back (2026-10-18). Daniel
  does not want a simplified first explanation that a later item reveals as wrong, even
  temporarily. Introducing an idea early in a correct but partial form and adding views later is
  welcome. Applies to every course: when an early item states a rule, it states it correctly
  (with its conditions), and later items extend it.
- Linear Algebra outline approved (2026-10-18), as drafted: eight units, about 90 items; the dot
  product in Vectors (unit 1), extended as duality in Orthogonality; 3D from Vectors 6 on, so
  phase 5 starts after the Vectors unit's first batch. Details in `plans/linear-algebra.md`.

## Engineering

- React + Vite + TypeScript, atomic design for UI, a reusable visualization kit, content as data.
- Conventional Commits. Writing rules in `WRITING.md` (no em dashes, no hype).
- Deployed to GitHub Pages from a public repository (free; Daniel accepted the visibility trade-off).
  The site lives at `/lumen/` so a future personal site can use the root `daniekans.github.io`.
- Keep things simple and low maintenance. Only free services.
- Content is built in batches of several items, with Daniel's feedback collected after a batch, not
  after every item.
- Saving tokens matters as much as batching: a new phase or batch should be startable from a fresh
  session using only the repo docs. Every final answer that ends a piece of work suggests a short
  prompt for continuing in a clean session (not needed for questions or small adjustments that
  belong to the current conversation). The default prompt is the generic one: "Continue Lumen:
  take the next step in "Suggested order of units" (docs/LEARNING_PLATFORM.md)." A specific
  prompt replaces it only when the next session needs something from Daniel that the docs cannot
  hold, such as his review notes (`<notes>` as a placeholder) or the answer to an open question.
  Everything else goes into the docs, not into the prompt.
- After a finished batch or a set of adjustments, commit, push and deploy without asking. Ask first
  only when a choice is not straightforward and Daniel's judgment would matter.

- Roadmap phases are not sequential (2026-10-17). Their numbers are labels; a phase starts when the
  curriculum needs it (3D when a visualization calls for it, code lessons when applicable items come
  up) or when it is worth doing before more content (pan, zoom and fullscreen).
- Phase 2C was kept small (2026-10-17): a "Mixed practice" button on the home page and a `/practice`
  page that mixes the practice of chosen units. Mixed answers do not move item progress. No
  prerequisite map. Daniel does not expect much value from it for now.
- Phase 4 also puts the step (and, opt-in, parameters) in the URL. Phase 7 (notation and glossary
  index) and phase 8 (UI strings in one module, no translation yet) were added on 2026-10-17.
  Bundle splitting waits until before a product (`PRODUCT_VISION.md`).
- Phase 4 includes a fullscreen mode (stage only, dock and step keys kept). It is not the
  presentation mode yet.
- Phase 8 (2026-10-17): UI copy is one typed object read as a plain import (`msg` from `@/i18n`),
  not a hook or a library such as i18next. A locale switch can swap the object and reload the page.
  Copy with values is a function in the messages; plurals go through `Intl.PluralRules`.
  `src/lib` stays free of copy: it returns codes (the checker's `CheckIssue`) that the UI words.
  Content (MDX, captions, problem prompts, labels inside visualizations) is not covered yet.

- Phase 4 (2026-10-17): zoom is opt-in per stage and on for every stage with axes. The view
  resets on each step. A link with parameters skips the opening step's handler. Fullscreen
  shows the stage area with a small step bar, not the explanation.

- Phase 7 (2026-10-17): a glossary entry's "used in" list is inferred from `<Term id="...">`
  links in explanations (scanned at build time), not declared per item. Term ids are global, not
  unit-local like skills, so `<Term id="domain">` works from any unit; a clash gets a qualified id
  (`attribute-domain`). Step captions and visualization labels do not count as uses.
- Clicking a `<Term>` opens a popover with the summary and an "Open in glossary" link; the word
  itself never navigates (2026-10-17), so a curious click does not leave the lesson. Terms have a
  faint dashed underline, step links a dotted one, so the two read differently.

- Phase 9 (2026-10-17): course and unit pages stay separate routes with different jobs. The course
  page is a map (path of units, next unit with "Continue"); the unit page is a workspace (up next,
  items, terms, skills). "Next" is always the first item in order that is not done.
  Readout panel extras (collapse, expand, hints) are opt-in props, not a new component.
- Unit page items stay in course order, the same as the sidebar (2026-10-17): grouping them by
  role broke the natural sequence. Kinds are told apart by badge style instead (outlined for
  explorations and lessons, filled for practice, solid with a tinted row for the checkpoint).
- Points show their coordinates on hover on coordinate planes (zoomable stages), and while dragged
  (2026-10-17). The stage finds the nearest visible point, so no hit areas are added and dragging
  and panning are unaffected. Diagrams stay without it; an item can format the text (complex
  numbers show `a + bi`) or turn it off with `coords`.
- Floating UI animates both ways (2026-10-17): tooltips, the term popover, menus and dialogs fade
  out as well as in; hints, solutions, answer feedback and expanded readout panels fade in.

- Docs layout (2026-10-18): `LEARNING_PLATFORM.md` opens with the suggested order; course
  outlines and unit plans live in `docs/plans/<course>.md`; finished trackers in `HISTORY.md`.
  Sessions read only what the next step needs, so the start-up cost stays flat as content grows.
  The scaling watchlist is in `ROADMAP.md` (Platform notes).
- Progress follows moved content (2026-10-18): on load and import, item and skill ids go through
  the redirects, so a move never loses progress.

- Commits carry no Claude attribution (2026-10-17): no Co-Authored-By trailer, so Claude is not
  listed as a contributor on the public repo. History was rewritten once to remove the old
  trailers. Only the GitHub noreply address appears as author and committer.

- Phase 5 (2026-10-18): 3D is drawn in SVG with an orthographic orbit camera (`Stage3D`), not
  three.js. It keeps the 2D look (same strokes, palette, KaTeX labels) and costs no bundle size.
  Orthographic, so parallel lines stay parallel and equal steps stay equal, which matters for
  linear algebra. The camera keeps the learner's orbit across steps; a step that moves the camera
  returns it home when the next step starts. three.js only if a shaded surface needs it.
- 3D polish (2026-10-18): Daniel noticed the far edge of a plane looks wider than the near one.
  It is the illusion of orthographic drawings (the eye expects far things to shrink), so the fix
  keeps the projection and adds depth cues: far parts fade, and the stage sways slowly while
  idle. The sway starts on (Daniel's choice); a button switches it off and the choice is
  remembered. Hover highlight links shapes and readouts. Pulses mark single events, never loop.
  Every item shows when its step is playing and offers Replay.
- Planes (2026-10-18, Daniel's second review): the radial fade made planes look like a glow or
  a vignette, so a plane is again a parallelogram patch with its grid, fading only over a
  narrow band at its edges. Hovering a plane in the drawing only lights its readout row; the
  full highlight comes from hovering that row.
- SQL in visualizations is highlighted with `SqlLabel` (2026-10-19, Daniel asked for simple,
  cheap highlighting): a small in-house tokenizer (`src/lib/sql.ts`), no library. Keywords
  purple and bold, names in the foreground, operators muted, literals orange or the item's
  filter color. Daniel asked for the keywords to stand out more than a muted first version.
- Hues per visualization (2026-10-19): three was a guideline, not a limit. Daniel is fine with
  four or more when they make a visualization clearer or prettier, within the same clean,
  minimal look. What matters is that each color means something. Rule in `DESIGN.md`.
- Surfaces are the most important next 3D feature (2026-10-18): Multivariable Calculus and many
  later units need them, in the same look and feel as the current visualizations.

## Future direction (record, do not build yet)

- Possibly a product for other learners: backend, accounts, premium tier. Keep the seams listed in
  `PRODUCT_VISION.md`, build none of it now.
- Internationalization, Brazilian Portuguese first.
- Presentation mode for recording lessons.
- An Explore page to browse visualizations without the course structure.
- 3D visualizations when multivariable calculus and linear algebra need them, in the same aesthetic.
- Code lessons: tie the math to the code that applies it (NumPy, SymPy, scikit-learn,
  PyTorch-style models), and data engineering ideas to the engines that apply them (Spark
  DataFrames and plans first, SQL; pandas matters less). Not a Python course: the goal is the "why" behind real code. Feasibility
  and options are in `ROADMAP.md` (Code lessons).

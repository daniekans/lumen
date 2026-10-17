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
- Explanation pane open by default; it can be resized and floated over the stage.
- All floating panels share one glass style (translucent background and blur).
- Home hero copy ("See the idea, then the formula.") approved, may change as the product evolves.

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
  and other prerequisites, core units (8 to 10 items) from Calculus 1 and the DE units on. Functions
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
  belong to the current conversation).
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

- Commits carry no Claude attribution (2026-10-17): no Co-Authored-By trailer, so Claude is not
  listed as a contributor on the public repo. History was rewritten once to remove the old
  trailers. Only the GitHub noreply address appears as author and committer.

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

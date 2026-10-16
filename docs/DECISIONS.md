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
- Data Engineering units are interleaved with the math, roughly one after every two math units, at
  points where the math supports them (see `LEARNING_PLATFORM.md`, Curriculum).
- Content must be mathematically correct: answers are computed and tested, never written from memory.

## Engineering

- React + Vite + TypeScript, atomic design for UI, a reusable visualization kit, content as data.
- Conventional Commits. Writing rules in `WRITING.md` (no em dashes, no hype).
- Deployed to GitHub Pages from a public repository (free; Daniel accepted the visibility trade-off).
  The site lives at `/lumen/` so a future personal site can use the root `daniekans.github.io`.
- Keep things simple and low maintenance. Only free services.
- Content is built in batches of several items, with Daniel's feedback collected after a batch, not
  after every item.
- After a finished batch or a set of adjustments, commit, push and deploy without asking. Ask first
  only when a choice is not straightforward and Daniel's judgment would matter.

## Future direction (record, do not build yet)

- Possibly a product for other learners: backend, accounts, premium tier. Keep the seams listed in
  `PRODUCT_VISION.md`, build none of it now.
- Internationalization, Brazilian Portuguese first.
- Presentation mode for recording lessons.
- An Explore page to browse visualizations without the course structure.
- Pan and zoom on stages, especially those with axes.
- 3D visualizations when multivariable calculus and linear algebra need them, in the same aesthetic.

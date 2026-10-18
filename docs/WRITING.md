# Writing

These rules apply to everything a reader sees and to everything a contributor reads: step captions,
explanations, UI labels, docs and code comments.

## Rules

- No em dashes. Use a comma, a colon, parentheses or a new sentence.
- Be objective and specific. State the idea, give the formula, then point at what the visual shows.
- No hype or filler: "powerful", "fascinating", "seamless", "dive into", "let's explore",
  "in essence", "it's worth noting", "at the end of the day".
- No "not only X but also Y", no groups of three adjectives for rhythm, no closing paragraph that
  repeats the previous ones.
- Short paragraphs. Plain verbs. Concrete numbers where they help ("about three decimal places",
  not "very close").
- Use the same symbols as the labels in the visualization. If the visual says $h$, the text says $h$.
- Address the reader directly when giving an instruction ("Drag $P$"), otherwise write in the third
  person about the math.
- Captions are one or two sentences. They describe what changes in that step.

- Notation: write `\lim_{x \to a}`; the limit lands underneath on its own. Display math (`$$`)
  for key formulas. See `DECISIONS.md` (Look and feel) for integrals and sums.

`pnpm lint` runs `scripts/lint-prose.mjs`, which fails on em dashes and the phrases above. Extend the
list in that script when a new pattern shows up.

## Structure of an explanation

1. One paragraph stating the question the concept answers.
2. Sections with `##` headings, each with the key formula in display math.
3. References to the visualization where they help (`<StepLink>`, `<C>`).
4. Stop when the idea is covered. Link to the next concept if there is one.

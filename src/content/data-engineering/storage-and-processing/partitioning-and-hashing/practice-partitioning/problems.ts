import { defineProblems, inlineCode } from '@/lib/practice'
import { filesFor, partitionCount } from '@/lib/partitioning'

/** A whole number with thin spaces between groups of three digits, for TeX. */
const big = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\\,')

/** Columns a table could be partitioned by, with their distinct counts. */
const COLUMNS = [
  { name: 'year', d: 5 },
  { name: 'month', d: 12 },
  { name: 'day', d: 365 },
  { name: 'hour', d: 24 },
  { name: 'country', d: 50 },
  { name: 'region', d: 8 },
  { name: 'device', d: 4 },
  { name: 'status', d: 6 },
] as const

const PRUNES = ['Prunes partitions', 'Reads every partition'] as const

/** WHERE clauses on a table partitioned by day and then country. */
const PRUNE_CASES = [
  {
    where: "WHERE day = '2026-04-14'",
    prunes: true,
    why: 'day is the first partition column, so only the folder day=2026-04-14 is read.',
  },
  {
    where: "WHERE country = 'PT'",
    prunes: true,
    why: 'country is a partition column too. The engine keeps the folder country=PT inside every day folder and skips the other countries.',
  },
  {
    where: 'WHERE amount > 100',
    prunes: false,
    why: 'amount is not in the path, so no folder can be ruled out by its name. Every file is opened (footer statistics may still skip row groups inside).',
  },
  {
    where: "WHERE day = '2026-04-14' OR amount > 100",
    prunes: false,
    why: 'A row from any day can satisfy amount > 100, so no folder can be ruled out.',
  },
  {
    where: "WHERE day = '2026-04-14' AND amount > 100",
    prunes: true,
    why: 'Every matching row has that day, so the other days are skipped; amount is then checked inside the files that remain.',
  },
  {
    where: 'WHERE user_id = 42',
    prunes: false,
    why: 'user_id is not a partition column, so every folder is read.',
  },
  {
    where: "WHERE country IN ('PT', 'BR')",
    prunes: true,
    why: 'The engine keeps two country folders inside each day and skips the rest.',
  },
] as const

/** Layouts from coarse to fine, with the partitions they make per day. */
const LAYOUTS = [
  { name: 'month', perDay: 1 / 30 },
  { name: 'day', perDay: 1 },
  { name: 'day and hour', perDay: 24 },
  { name: 'day and country', perDay: 50 },
] as const

export const problems = defineProblems([
  {
    id: 'partition-count',
    title: 'Number of partitions',
    skills: ['partition-design'],
    difficulty: 1,
    generate: (rng) => {
      const picked = rng.shuffle([...COLUMNS.keys()]).slice(0, rng.int(2, 3))
      const cols = picked.map((k) => COLUMNS[k]!)
      const value = partitionCount(cols.map((c) => c.d))
      const path = cols.map((c) => `${c.name}=…`).join('/')
      return {
        prompt: `A table is partitioned as ${inlineCode(path)}. The columns have ${cols.map((c) => `$${c.d}$ (${inlineCode(c.name)})`).join(', ')} distinct values, and every combination occurs. How many partitions does the table have?`,
        answer: { kind: 'number', value },
        hints: [
          'Each partition is one combination of values, one value per column.',
          'Count the combinations: multiply.',
        ],
        solution: [`$${cols.map((c) => c.d).join(' \\cdot ')} = ${big(value)}$ partitions.`],
        data: Object.fromEntries(picked.map((k, i) => [`c${i}`, k])),
      }
    },
  },
  {
    id: 'file-count',
    title: 'Files in a partitioned table',
    skills: ['partition-design'],
    difficulty: 2,
    generate: (rng) => {
      const days = rng.pick([30, 90, 365])
      const perDayMb = rng.pick([1200, 2400, 4800, 6000, 12000, 24000])
      const split = rng.pick([1, 4, 10, 24, 50])
      const target = rng.pick([128, 256, 512, 1000])
      const size = perDayMb / split
      const files = filesFor(size, target)
      const parts = days * split
      const value = parts * files
      const layout = split === 1 ? 'day' : `day and a column with $${split}$ values`
      return {
        prompt: `A table holds $${days}$ days of data, $${big(perDayMb)}$ MB per day. It is partitioned by ${layout}, with the data spread evenly over the partitions, and every partition is written as files of at most $${target}$ MB. How many files does the table have?`,
        answer: { kind: 'number', value },
        hints: [
          'Find the size of one partition first.',
          'A partition of $S$ MB is written as $\\lceil S / T \\rceil$ files: at least one, even when $S < T$.',
        ],
        solution: [
          `Partitions: $${days} \\cdot ${split} = ${big(parts)}$, each $${big(perDayMb)} / ${split} = ${big(size)}$ MB.`,
          `Files per partition: $\\lceil ${size} / ${target} \\rceil = ${files}$.`,
          `Total: $${big(parts)} \\cdot ${files} = ${big(value)}$ files.`,
        ],
        data: { days, perDayMb, split, target },
      }
    },
  },
  {
    id: 'pruned-read',
    title: 'Data read after pruning',
    skills: ['partitioning'],
    difficulty: 2,
    generate: (rng) => {
      const countries = rng.pick([10, 20, 40])
      const mb = rng.int(2, 25) * 10
      const byCountry = rng.bool()
      const withCountry = rng.bool()
      const d1 = rng.int(1, 25)
      const d2 = d1 + rng.int(0, 5)
      const k = rng.int(1, 3)
      const days = d2 - d1 + 1
      const kept = byCountry && withCountry ? k : countries
      const value = days * kept * mb
      const layout = byCountry ? 'day=…/country=…' : 'day=…'
      const where =
        `WHERE day BETWEEN ${d1} AND ${d2}` +
        (withCountry
          ? ` AND country IN (${['PT', 'BR', 'JP']
              .slice(0, k)
              .map((c) => `'${c}'`)
              .join(', ')})`
          : '')
      return {
        prompt: `A table holds $${countries}$ countries and $${mb}$ MB per country per day. It is partitioned as ${inlineCode(layout)}. How many MB does a query with ${inlineCode(where)} read after partition pruning, before any statistics inside the files?`,
        answer: { kind: 'number', value },
        hints: [
          'Which filters are on partition columns? Only those can rule out folders.',
          `Count the days in the range, both ends included, and the countries kept.`,
        ],
        solution: [
          `Days: $${d2} - ${d1} + 1 = ${days}$.`,
          byCountry && withCountry
            ? `country is a partition column, so $${k}$ of the $${countries}$ country folders are kept in each day.`
            : byCountry
              ? `There is no filter on country, so every country folder is read.`
              : withCountry
                ? `country is not a partition column, so the filter on it prunes nothing: all $${countries}$ countries are read.`
                : `Each day folder holds all $${countries}$ countries.`,
          `$${days} \\cdot ${kept} \\cdot ${mb} = ${big(value)}$ MB.`,
        ],
        data: {
          countries,
          mb,
          byCountry: Number(byCountry),
          withCountry: Number(withCountry),
          d1,
          d2,
          k,
        },
      }
    },
  },
  {
    id: 'can-prune',
    title: 'Can it prune?',
    skills: ['partitioning'],
    difficulty: 1,
    generate: (rng) => {
      const kind = rng.int(0, PRUNE_CASES.length - 1)
      const c = PRUNE_CASES[kind]!
      return {
        prompt: `A table is partitioned as ${inlineCode('day=…/country=…')}. Does a query with ${inlineCode(c.where)} prune partitions, or read every partition?`,
        answer: { kind: 'choice', options: PRUNES, correct: c.prunes ? 0 : 1 },
        hints: [
          'Pruning uses only folder names. Can the filter rule out a folder from its day and country alone?',
        ],
        solution: [`${PRUNES[c.prunes ? 0 : 1]}. ${c.why}`],
        data: { kind },
      }
    },
  },
  {
    id: 'finest-layout',
    title: 'The finest layout that fits',
    skills: ['partition-design'],
    difficulty: 3,
    generate: (rng) => {
      const daily = rng.pick([0.5, 2, 8, 40, 150])
      const sizes = LAYOUTS.map((l) => daily / l.perDay)
      const best = sizes.reduce((b, s, k) => (s >= 1 ? k : b), 0)
      return {
        prompt: `A table gains $${daily}$ GB a day, spread evenly over hours and over its $50$ countries. The writers aim for files of $T = 1$ GB, and queries filter on day and often on hour or country. Which is the finest layout whose partitions are all at least $T$?`,
        answer: { kind: 'choice', options: LAYOUTS.map((l) => l.name), correct: best },
        hints: [
          'Find the size of one partition in each layout: a month holds $30$ days, a day $24$ hours or $50$ countries.',
          'Keep the layouts whose partition size is at least $1$ GB, and take the finest.',
        ],
        solution: [
          `Partition sizes: month $${Number((daily * 30).toFixed(2))}$ GB, day $${daily}$ GB, day and hour $${Number((daily / 24).toFixed(3))}$ GB, day and country $${Number((daily / 50).toFixed(3))}$ GB.`,
          `The finest with at least $1$ GB is ${LAYOUTS[best]!.name}. Finer layouts make files below the target; sort the files by the other columns instead.`,
        ],
        data: { daily },
      }
    },
  },
])

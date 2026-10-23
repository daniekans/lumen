# Data Engineering plan

Unit plans for the Data Engineering track. The track's unit table is in
[LEARNING_PLATFORM.md](../LEARNING_PLATFORM.md) (Tracks). Part of that plan.

## Relational model and joins unit plan

Folder `src/content/data-engineering/relational-foundations/relational-model-and-joins/`. Same
process as the Functions unit. The math link: a table is a relation (a subset of a Cartesian
product), a key makes it a function, and every join is a filtered product. Join logic lives in
`src/lib/relational` (tested), and tables are drawn with `RelationTable` from the kit. Practice
prompts show tables as KaTeX arrays and SQL in `\texttt`.

Skills: `relations` (a table as a set of tuples, products, degree and cardinality), `keys` (primary
and candidate keys, foreign keys, referential integrity), `inner-join` (cross, inner and theta joins),
`outer-join` (left, right, full and anti joins, NULL padding), `row-counts` (predict how many rows a
join returns).

| #   | Item                        | Kind       | Skills                             | Content                                                                                                                    | Status |
| --- | --------------------------- | ---------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | tables-as-relations         | explore    | relations                          | Two domains, their product as a grid, a relation as lit cells that fly into a table; order; a key as a function            | done   |
| 2   | keys-and-references         | explore    | keys                               | Primary key, foreign key arrows from orders to customers (many to one), customers with no orders, an orphan                | done   |
| 3   | joins-as-products           | explore    | inner-join                         | Grid of row pairs: cross join, the ON condition lights matching cells, the result table, fan-out, NULL keys                | done   |
| 4   | outer-joins                 | explore    | outer-join                         | Same grid: unmatched rows padded with NULLs for left, right and full joins; anti join; why Venn diagrams mislead           | done   |
| 5   | join-row-counts             | lesson     | row-counts, inner-join, outer-join | Join size as a sum of rectangles $a_k \times b_k$ per key; one to many, many to many, left join, NULLs, ON vs WHERE        | done   |
| 6   | practice-relations-and-keys | practice   | relations, keys                    | Product sizes, number of relations, candidate keys, functional dependencies, orphan rows                                   | done   |
| 7   | practice-joins              | practice   | inner-join, outer-join, row-counts | Row counts of cross, inner, left and full joins on small tables, anti joins, fan-out, ON vs WHERE                          | done   |
| 8   | checkpoint                  | checkpoint | all                                | Mix of the practice generators plus a self-graded proof (an inner join on a key of $A$ has at most $\lvert B \rvert$ rows) | done   |

Built in three batches; all eight items are published and reviewed. The checkpoint uses
`problemCount: 10`: nine practice generators plus the proof. Practice prompts draw tables with
`tex.table` and `tex.tables` (side by side, padded to equal height) from `@/lib/practice`, and store
key columns in problem data with `encodeColumn` from `@/lib/relational`.

## Storage and file formats unit plan

Folder `src/content/data-engineering/storage-and-processing/storage-and-file-formats/`. Core depth,
three batches. The course `storage-and-processing` also lists the next two DE units (partitioning,
distributed processing) as planned. The thread through the unit: storage is a sequence of bytes
read in pages, so the cost of a query is the pages it touches. A layout decides which pages that
is, an encoding decides how many bytes a column needs, and file metadata decides which pages can be
skipped without reading them. The math link is logarithms: $\lceil \log_2 d \rceil$ bits for $d$
distinct values, information and entropy as the floor for compression, plus ceilings and offsets
(row-major and column-major order, as with arrays). Logic lives in `src/lib/storage` (tested).

Skills: `layouts` (row and column layouts, where a value lives, which layout fits a workload),
`scan-cost` (bytes and pages a query reads), `encoding` (dictionary, bit packing, run-length,
delta), `compression` (entropy, and why order and cardinality drive compression), `parquet` (row
groups, column chunks, pages, footer statistics, predicate pushdown, choosing a file format).

| #   | Item                              | Kind       | Skills                | Content                                                                                                                               | Status |
| --- | --------------------------------- | ---------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | row-vs-columnar                   | explore    | layouts               | One table written to pages row by row and column by column; a column sum, a point lookup and an insert touch different pages          | done   |
| 2   | scan-cost                         | lesson     | layouts, scan-cost    | The table as an area $N \times W$; a layout cuts it into pages, a query is a region, its cost the pages it touches; wide tables       | done   |
| 3   | practice-layouts                  | practice   | layouts, scan-cost    | Table sizes, bytes and pages scanned in both layouts, value offsets, choosing a layout for a workload                                 | done   |
| 4   | encodings                         | explore    | encoding              | Dictionary codes, bit packing with $\lceil \log_2 d \rceil$ bits, run-length on a sorted column, delta for timestamps                 | done   |
| 5   | entropy-and-compression           | lesson     | compression, encoding | Information $\log_2 (1/p)$, entropy as the floor for symbol codes, sorting to lengthen runs, codecs layered on encodings              | done   |
| 6   | practice-encoding-and-compression | practice   | encoding, compression | Bit widths, dictionary and run-length sizes, delta ranges, entropy of small distributions, compression ratios                         | done   |
| 7   | parquet-anatomy                   | explore    | parquet, scan-cost    | File, row groups, column chunks, pages, footer; min and max statistics skip row groups; sorting tightens the ranges                   | done   |
| 8   | practice-parquet                  | practice   | parquet, scan-cost    | Row groups skipped by a predicate, bytes read with projection and pushdown, choosing among CSV, JSON, Avro and Parquet                | done   |
| 9   | checkpoint                        | checkpoint | all                   | Mix of the practice generators plus a self-graded proof (a column with $d$ distinct values has at least $d$ runs, sorted exactly $d$) | done   |

Batches: 1 = items 1 to 3 (layouts and scan cost), 2 = items 4 to 6 (encoding and compression),
3 = items 7 to 9 (Parquet and the checkpoint). All nine items are published and reviewed. The cost model: a table of $N$ rows with column
widths $w_j$ (row width $W = \sum_j w_j$) and pages of $P$ bytes. A row layout stores rows back to
back, so any full scan reads $\lceil NW/P \rceil$ pages; a column layout gives each column its own
pages, so a scan of the columns $S$ reads $\sum_{j \in S} \lceil N w_j / P \rceil$. A point lookup
whose position is known reads one page in a row layout and one page per selected column in a column
layout. Encodings and entropy live in `src/lib/storage/encoding.ts` (`codeBits`,
`bitsFor`, `dictionaryEncode`, `runLengths`, `deltaEncode`, `entropy`); the city column of
`encodings` (counts $6, 4, 4, 2$, $86$ bytes as text, $25$ encoded) is reused by the lesson.
Row groups and footer statistics live in `src/lib/storage/parquet.ts` (`rowGroups`,
`groupRanges`, `mayMatch`, `groupsRead`, `groupsSpanned`). The exploration's file has $24$ rows in
$4$ row groups of $6$, pages of $3$ values; its days are chosen so every unsorted range contains
$12$ and the sorted file reads one row group for day $12$ and none for day $7$. The checkpoint takes
nine generators from the three practice sets plus the proof.

## Partitioning, bucketing and hashing unit plan

Folder `src/content/data-engineering/storage-and-processing/partitioning-and-hashing/`. Core
depth, three batches. The thread: a table is split by a function of a key, a query costs the parts
it touches, and a good split is balanced and stable. Partitions by value come first (pruning and
how fine to cut), then hashing (buckets, skew, joins without moving data), then what happens when
the number of buckets changes (consistent hashing). The math link: a partition of a set (the
preimages of a function), products of distinct counts, sizes on a log scale, sums of key
frequencies per bucket, modular arithmetic, and arcs of a circle. Logic lives in
`src/lib/partitioning` (tested).

Skills: `partitioning` (place rows in a partitioned layout, predict pruning), `partition-design`
(partition and file counts, choosing columns), `hashing` (hash then modulo, hash versus range),
`skew` (bucket loads, the max-to-mean ratio, salting), `bucketing` (bucketed tables and joins
without a shuffle), `consistent-hashing` (keys moved when nodes join or leave).

| #   | Item                        | Kind       | Skills                         | Content                                                                                                                          | Status |
| --- | --------------------------- | ---------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | partitioning-by-key         | explore    | partitioning                   | 24 sales rows split into day folders (a set partition), the column moves into the path, pruning, a filter on city, day/city      | done   |
| 2   | sizing-partitions           | lesson     | partition-design, partitioning | 730 GB of events by day, month, day and country, day and user; partition size on a log scale against $T$; budget $P \leq B/T$    | done   |
| 3   | practice-partitioning       | practice   | partitioning, partition-design | Partition counts, file counts, MB read after pruning, whether a filter prunes, the finest layout that fits                       | done   |
| 4   | hash-partitioning           | explore    | hashing                        | A hash maps keys to large numbers, modulo $n$ picks a bucket; same key, same bucket; spread versus range partitioning            | done   |
| 5   | skew                        | lesson     | skew, hashing                  | Bucket load as a sum of key frequencies, mean $N/n$, the max-to-mean ratio, a hot key no hash can split, salting                 | done   |
| 6   | bucketed-joins              | explore    | bucketing                      | Two tables bucketed on the join key: bucket $k$ meets bucket $k$; pairs compared $\sum a_k b_k$ versus $ab$; $4$ and $8$ buckets | done   |
| 7   | practice-hashing-and-skew   | practice   | hashing, skew, bucketing       | Buckets of keys, bucket loads and skew ratios, salted keys, which buckets meet in a join                                         | done   |
| 8   | rehashing                   | explore    | consistent-hashing             | From $n$ to $n + 1$ buckets with modulo: a key stays only if $h \bmod n(n+1) < n$, so $\frac{n}{n+1}$ of the keys move           | todo   |
| 9   | consistent-hashing          | explore    | consistent-hashing             | Nodes and keys on a ring, each key to the next node clockwise; a new node takes one arc; virtual nodes even the arcs out         | todo   |
| 10  | practice-consistent-hashing | practice   | consistent-hashing, hashing    | Owner of a key on a ring, keys moved when a node joins or leaves, modulo versus ring                                             | todo   |
| 11  | checkpoint                  | checkpoint | all                            | Mix of the practice generators plus a self-graded proof (adding a node to a ring moves keys only onto the new node)              | todo   |

Batches: 1 = items 1 to 3 (partitioning by value), 2 = items 4 to 7 (hashing, skew, bucketing),
3 = items 8 to 11 (consistent hashing and the checkpoint). Batch 1 was built on 2026-10-19 and
batch 2 on 2026-10-23; Daniel approved both on 2026-10-23. Batch 3 waits until Daniel asks
for Data Engineering again (see `DECISIONS.md`, Content plan).

Batch 1 notes: the exploration's 24 rows (days 1 to 4 with $7, 5, 6, 6$ rows, every
(day, city) pair present, $8$ rows in OSL) are inline in `partitioning-by-key/index.tsx`; folders
come from `partitionBy` and `prunedPaths`. The lesson uses decimal units ($1$ GB $= 1000$ MB),
$2$ GB a day, $T = 1$ GB, $50$ countries and $10^7$ users, so the budget is $730$ partitions;
`formatBytes` words sizes. New terms: `table-partition` (qualified, since `partition` will be
wanted by Riemann sums), `partition-column`, `partition-pruning`, `small-files`,
`target-file-size`.

Batch 2 notes: hashes are Murmur3 x86 32-bit with Spark's seed $42$, read as unsigned
(`src/lib/partitioning/hashing.ts`, tested against published vectors and Spark's `hash(1)`);
buckets are `h mod n`, which matches Spark's `pmod` for powers of two. The exploration uses
customer ids $1001$ to $1012$ (buckets $2, 3, 2, 5$ at $n = 4$; $10$ of $12$ move at $n = 5$) and
six new ids $1013$ to $1018$ for range partitioning. The skew lesson uses $N = 10\,000$ rows,
$n = 8$, and a hot key $9999$ with $3000$ rows; salts are `key#s`, and their collisions are shown
as they fall ($S = 8$ gives $1.67$, $S = 4$ gives $1.37$). The bucketed join uses $16$ orders and
$8$ customers ($32$ pairs at $n = 4$, $20$ at $n = 8$). `Chip` (a key or cell box) is in the
kit for batch 3. New terms: `hash-function`, `hash-partitioning`, `range-partitioning`,
`data-skew`, `hot-key`, `salting`, `shuffle`, `bucketing`. The shuffle is introduced here;
Distributed processing should link it rather than define it again.

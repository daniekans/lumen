# Probability and Statistics plan

Outline, threads and unit plans for Probability and Statistics. Part of
[LEARNING_PLATFORM.md](../LEARNING_PLATFORM.md).

## Status

Outline drafted and reviewed on 2026-11-17; approved with the review decisions at the end of the
outline. No unit is built. The course starts after Calculus 1 Integrals (owner's decision), with
the unit plan and first batch of Probability foundations.

## Depth and threads

Core depth, as in Calculus and Linear Algebra. The reference syllabi are MIT 18.05 (Introduction to
Probability and Statistics) and Harvard Stat 110 (Blitzstein), carried to the level Machine
Learning needs: likelihood, Bayesian updating, the multivariate normal, entropy and Markov chains.
The picture comes first (probability as mass spread over outcomes, sampled thousands of times on
the stage), then the computation, then proofs. Folder `src/content/mathematics/probability/`,
course title "Probability and Statistics". Threads:

- **Mass (D).** A distribution is a unit of mass spread over outcomes: bars for a discrete
  variable, a density for a continuous one, a cloud in the plane for two variables. Expectation
  is the balance point (center of mass), variance the spread around it. Every unit adds a view;
  none replaces the picture.
- **Updating (B).** Conditioning restricts the sample space and rescales; Bayes' theorem turns
  $P(B \mid A)$ into $P(A \mid B)$; Bayesian inference applies the same update to a parameter;
  naive Bayes and regularization as a prior carry it into Machine Learning.
- **Sampling (S).** Simulation from the first unit (a long-run frequency on the stage), then the
  law of large numbers and the central limit theorem, then estimators, intervals, tests and the
  bootstrap. Monte Carlo is the bridge to ML and to sampling in Data Engineering.
- **Toward ML (ML).** Likelihood as the quantity a model maximizes; negative log-likelihood as the
  loss (cross-entropy for classifiers, squared error from Gaussian noise, a link to regression as
  a projection in Linear Algebra 7); a prior as regularization; softmax as a distribution;
  entropy and KL divergence; covariance matrices and PCA (Linear Algebra 8); Markov chains.
- **Leibniz notation (Lz, from [calculus.md](calculus.md)).** What this course adds: $f(x)\,dx$
  as the probability of a small interval $[x, x + dx]$; the CDF as an accumulation function whose
  derivative in $x$ is the density (FTC); a change of variable for densities,
  $f_Y(y)\,\lvert dy\rvert = f_X(x)\,\lvert dx\rvert$, as the substitution rule read as mass
  conservation.

### Statements that must stay true (introduce, then expand)

The places where a simple first version is usually taken back later. Each is stated in its
correct form from the start:

- Probability is a number assigned to events that satisfies the axioms, drawn as area in a unit
  square. "Favorable over total" is the special case of equally likely outcomes, stated with that
  condition. The area picture already covers continuous outcomes, so densities extend it.
- A random variable is a function from outcomes to numbers, not "a number that varies".
- Expectation is defined for discrete variables first, with an explicit note that Continuous
  random variables extends it to integrals; linearity is stated without an independence
  condition (it needs none).
- Zero correlation does not imply independence: said in the item that introduces correlation.
- The law of large numbers previewed by simulation in unit 1 is labeled as a preview proved in
  unit 4.
- A 95% confidence interval is a procedure that covers the true value in 95% of repetitions, and a
  p-value is $P(\text{data at least this extreme} \mid H_0)$; neither is the probability that the
  hypothesis or the parameter is in a range. Bayesian credible intervals arrive in unit 6 as a
  different object, not a correction.
- The Poisson pmf sums to 1 because $\sum \frac{\lambda^k}{k!} = e^{\lambda}$; unit 2 says that
  Power and Taylor series (Calculus 2) proves it, and uses the limit $(1 - \frac{\lambda}{n})^n \to
  e^{-\lambda}$ from Limits now. The normal density's constant $\frac{1}{\sqrt{2\pi}}$ is checked
  numerically in unit 3 and proved by the Gaussian integral in Multivariable 4, said there.

### Prerequisites and order

The course starts after Calculus 1 Integrals (decided 2026-11-17), so every unit can use
integrals where they help, and unit 3 (densities) needs them. Units 1 and 2 stay discrete (sums,
not integrals) because that is the clearest first picture, not because integrals are missing.
Unit 7 (multivariate) leans on Linear Algebra Eigenvalues and SVD. Machine Learning is outlined
once Probability foundations is built.

Cross-area links: the birthday problem and hash collisions (DE Partitioning and hashing), entropy
(DE `entropy-and-compression`, revisited, not repeated), sampling and percentiles (DE Distributed
processing), and DE unit 7 (Bloom filters, HyperLogLog, reservoir sampling), which comes after
units 2 and 4 here.

### Code and visualization needs

Code views fit almost every item: NumPy's `default_rng` for simulation, `scipy.stats` for named
distributions, plain Python for counting. The `default` image needs SciPy (check at the start of
the first batch). New kit pieces, built when the first item needs them: a `Bars` (pmf, histogram)
primitive with animated heights, a sample stream (dots falling into bins, a Galton board), and a
point cloud for scatter plots. Joint densities as surfaces wait for `Surface3D` (phase 5, item 1);
until then they are contour plots and heat maps in 2D.

### Real scenarios

Medical tests and base rates (Bayes), spam filtering (naive Bayes), A/B tests on a conversion
rate, requests per second and time between arrivals (Poisson, exponential), retries until success
(geometric), latency percentiles and heavy tails (p95, p99), hash collisions (birthday), sensor
noise (normal), polling and sampling a large table, Galton's heights (regression to the mean).
Dice and coins stay where they make the mechanism clearest.

## Probability and Statistics outline

Nine units, about 90 items. Kinds: E explore, L lesson, P practice, C checkpoint.

**1. Probability foundations** (11 items)

| #   | Item                       | Kind | Content                                                                                                                                        | Threads |
| --- | -------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | outcomes-and-events        | E    | Sample space, events as sets (union, intersection, complement); probability as area in a unit square; a simulated long-run frequency (preview) | D, S    |
| 2   | axioms-and-rules           | L    | The three axioms; complement, monotonicity, inclusion-exclusion; equally likely outcomes as a special case, with its condition                 | D       |
| 3   | counting                   | E    | Multiplication principle, permutations, combinations, $\binom{n}{k}$ from Pascal's triangle; ordered against unordered                         |         |
| 4   | practice-counting          | P    | Counting arrangements, committees, poker-style hands, probabilities with equally likely outcomes                                               |         |
| 5   | birthday-problem           | E    | Collisions grow like $\frac{n^2}{2N}$; hash collisions in a table of $N$ buckets (link to DE hashing)                                          | S       |
| 6   | conditional-probability    | E    | Restricting the square to $B$ and rescaling; $P(A \mid B)$; multiplication rule; tree diagrams                                                 | B       |
| 7   | independence               | L    | $P(A \cap B) = P(A)P(B)$; independent is not disjoint; pairwise against mutual; conditional independence                                       | B       |
| 8   | bayes-theorem              | E    | Law of total probability; Bayes as flipping the condition; a medical test with a rare condition (natural frequencies, the area picture)        | B       |
| 9   | practice-conditional-bayes | P    | Conditional probabilities from tables and trees, independence checks, Bayes in context (tests, spam, defects)                                  |         |
| 10  | simulation                 | L    | Estimating a probability by simulation (Monty Hall, the birthday problem); how the estimate's error shrinks, as a preview of unit 4            | S       |
| 11  | checkpoint                 | C    | All of the above plus a proof (inclusion-exclusion for two events from the axioms)                                                             |         |

**2. Discrete random variables** (13 items)

| #   | Item                          | Kind | Content                                                                                                                                    | Threads |
| --- | ----------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| 1   | random-variables              | E    | A function from outcomes to numbers; the pmf as bars of mass; the CDF as a staircase                                                       | D       |
| 2   | expectation                   | E    | The balance point of the bars; weighted average; $E[g(X)]$ without the distribution of $g(X)$                                              | D       |
| 3   | linearity-of-expectation      | L    | $E[X + Y] = E[X] + E[Y]$ with no independence needed; indicators (expected matches, expected collisions, expected distinct keys)           | D       |
| 4   | variance                      | E    | Spread around the mean; $\mathrm{Var}(X) = E[X^2] - E[X]^2$; standard deviation in the variable's units; $\mathrm{Var}(aX + b)$            | D       |
| 5   | practice-expectation-variance | P    | Means and variances from pmfs, indicators, games and their fair price                                                                      |         |
| 6   | bernoulli-and-binomial        | E    | Sum of independent trials; a Galton board filling the binomial bars; mean $np$ and variance $np(1 - p)$ from linearity                     | D, S    |
| 7   | geometric                     | E    | Trials until the first success (retries); memorylessness; $E = \frac{1}{p}$ by the first-step argument                                     | D       |
| 8   | poisson                       | E    | Rare events as the limit of binomials, $(1 - \frac{\lambda}{n})^n \to e^{-\lambda}$; requests per second                                   | D       |
| 9   | practice-named-distributions  | P    | Choosing the distribution for a described situation, probabilities, means and variances                                                    |         |
| 10  | joint-distributions           | E    | A joint table; marginals and conditionals; independent variables; covariance and correlation (zero correlation without independence shown) | D, B    |
| 11  | sums-of-random-variables      | L    | Convolution of pmfs (two dice); $\mathrm{Var}(X + Y)$ with the covariance term; variance of a sum of independent variables                 | D       |
| 12  | practice-joint-and-sums       | P    | Marginals, conditionals, covariance, variance of sums and averages                                                                         |         |
| 13  | checkpoint                    | C    | All of the above plus a proof (linearity of expectation from the definition)                                                               |         |

**3. Continuous random variables** (11 items; suggested prerequisite: Calculus 1 Integrals)

| #   | Item                      | Kind | Content                                                                                                                                | Threads |
| --- | ------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | densities                 | E    | A histogram whose bins shrink becomes a density; $f(x)\,dx$ as the mass of a small interval; $P(X = a) = 0$; area as probability       | D, Lz   |
| 2   | cdf-and-density           | L    | $F(x) = \int_{-\infty}^x f$, $F' = f$ (FTC); probabilities of intervals; the discrete and continuous cases side by side                | D, Lz   |
| 3   | uniform-and-exponential   | E    | Uniform on an interval; time between arrivals; exponential as the continuous geometric, memoryless                                     | D       |
| 4   | continuous-expectation    | L    | $E[X] = \int x f(x)\,dx$ extending unit 2, $E[g(X)]$, variance; a density with no mean (Cauchy)                                        | D       |
| 5   | practice-densities        | P    | Normalizing constants, interval probabilities, CDFs, means and variances                                                               |         |
| 6   | normal-distribution       | E    | $\mu$ and $\sigma$ sliders; standardizing to $Z$; 68, 95, 99.7; sensor noise; the constant $\frac{1}{\sqrt{2\pi}}$ checked numerically | D       |
| 7   | quantiles-and-tails       | E    | Inverse CDF, median against mean, p95 and p99 latency; heavy tails (log-normal, Pareto) where the mean misleads                        | D       |
| 8   | practice-normal-quantiles | P    | Normal probabilities through $Z$, quantiles, percentiles in context                                                                    |         |
| 9   | transformations           | L    | Density of $Y = g(X)$ by $f_Y(y)\,\lvert dy\rvert = f_X(x)\,\lvert dx\rvert$; inverse-transform sampling                               | Lz, S   |
| 10  | practice-transformations  | P    | Densities of transformed variables, sampling recipes                                                                                   |         |
| 11  | checkpoint                | C    | All of the above plus a proof (memorylessness of the exponential)                                                                      |         |

**4. Limit theorems** (9 items)

| #   | Item                    | Kind | Content                                                                                                                      | Threads |
| --- | ----------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------- | ------- |
| 1   | markov-and-chebyshev    | L    | Bounds from the mean and the variance alone, with proofs; how loose they are                                                 |         |
| 2   | law-of-large-numbers    | E    | Running averages settle; the variance of the mean is $\frac{\sigma^2}{n}$; the weak law proved with Chebyshev                | S       |
| 3   | central-limit-theorem   | E    | Sums of any finite-variance distribution become bell-shaped, scaled by $\sqrt{n}$; where it fails (Cauchy)                   | S       |
| 4   | normal-approximation    | L    | Binomial and Poisson through the normal, the continuity correction, when the approximation is poor (skew, small $n$)         | S       |
| 5   | practice-limit-theorems | P    | Bounds, probabilities for sums and averages, sample sizes                                                                    |         |
| 6   | monte-carlo             | E    | Estimating $\pi$ and an integral by sampling; error like $\frac{1}{\sqrt{n}}$ in any dimension                               | S, ML   |
| 7   | sampling-data           | L    | Population and sample; simple random and stratified samples of a large table; why a biased sample does not improve with size | S       |
| 8   | practice-sampling       | P    | Monte Carlo error, sample sizes, stratified estimates                                                                        |         |
| 9   | checkpoint              | C    | All of the above plus a proof (Chebyshev's inequality from Markov's)                                                         |         |

**5. Estimation and testing** (12 items; focused, see review decision 3): estimators, bias and
variance, the sampling distribution and the standard error, with the $n - 1$ in the sample
variance; maximum likelihood as the unit's centerpiece (the likelihood as a function of the
parameter, the log-likelihood, MLE for a coin and a normal) and the link to loss functions
(squared error from Gaussian noise, cross-entropy from Bernoulli labels); confidence intervals (a
hundred intervals, about 95 cover), with the $t$ distribution inside that item for small samples
rather than as its own topic; hypothesis tests, p-values, type I and II errors and power; an A/B
test on conversion rates with sample size, the peeking problem and multiple comparisons as one
lesson; the bootstrap. Not covered: the catalog of named tests (chi-squared, ANOVA, nonparametric
tests); they can be added on request. S, ML.

**6. Bayesian inference** (8 items): prior to posterior for a coin's bias, one flip at a time (the
Beta distribution); conjugate priors and the posterior mean as a weighted average of prior and
data; MAP estimates and regularization (a Gaussian prior is L2, a Laplace prior is L1); credible
intervals beside confidence intervals, as different objects; naive Bayes as a spam filter;
the posterior predictive. B, ML.

**7. Multivariate distributions** (10 items; suggested prerequisites: Linear Algebra Eigenvalues
and SVD): covariance matrices as ellipses over a point cloud; correlation measures only linear
dependence (Anscombe's quartet); $\mathrm{Cov}(A\mathbf{X}) = A\Sigma A^T$ and whitening; the
multivariate normal, its contours and their axes as eigenvectors; Mahalanobis distance;
conditioning a bivariate normal is a regression line (Galton's heights, regression to the mean);
PCA revisited from the covariance side (Linear Algebra 8). D, ML.

**8. Information theory** (7 items): surprise $-\log p$ and entropy (revisiting the DE lesson
`entropy-and-compression`, from the probability side); cross-entropy and KL divergence, with
$D_{KL} \ge 0$ proved and its asymmetry shown; log-loss as cross-entropy as negative
log-likelihood (one quantity, three names); softmax as a distribution over classes; mutual
information. ML.

**9. Random processes** (8 items): Markov chains as a matrix acting on distributions; stationary
distributions as an eigenvector (Linear Algebra Eigen, PageRank); random walks and gambler's ruin;
the Poisson process (arrivals in time, linking Poisson and exponential); a first look at Markov
chain Monte Carlo (Metropolis), for Bayesian ML later. B, S, ML.

### Wish list and placement

- Probabilistic data structures (Bloom filters, HyperLogLog, reservoir sampling) stay in DE unit
  7, after units 2 and 4 here, as decided (cross-area topics in the area they fit best).
- Probability densities in Calculus 2 (Applications of integration) and the Gaussian integral in
  Multivariable 4 link here as applications; they do not repeat this course.
- Measure theory is out of scope. The axioms are stated so that it would extend them, not replace
  them.

### Review decisions (2026-11-17)

1. **Scope** (left to Claude). Nine units, about 90 items, as drafted. Information theory and
   Random processes stay here: they are mathematics, and Machine Learning applies them without
   teaching them again, as it does with Linear Algebra.
2. **Order** (owner). The course starts after Calculus 1 Integrals, not before. The suggested
   order puts Applications of derivatives and Integrals first.
3. **Classical statistics** (left to Claude, with the owner's goals: what later topics need,
   nothing more). Unit 5 keeps what Machine Learning, A/B testing and data work rely on (standard
   error, MLE, intervals, tests and p-values, power, the bootstrap); the $t$ distribution and
   multiple comparisons fold into other items, and the catalog of named tests is left out.
4. **Simulation on the stage** (owner: yes). An exploration draws random samples while the
   learner watches: dots fall through a Galton board into bins, a histogram grows toward the
   pmf, a running average settles. A "resample" button draws new samples; a seed keeps a run
   reproducible (and shareable in the URL). New kit pieces (`Bars`, a sample stream, a point
   cloud) are expected and built in the first batch that needs them.

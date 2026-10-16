import { defineItem } from '@/catalog/types'

export const meta = defineItem({
  kind: 'explore',
  title: 'Radicals',
  summary:
    'A square root is the side of a square with a given area. Splitting that square into a grid simplifies roots, and two squares side by side show why roots do not split over sums.',
  tags: ['square root', 'radical', 'cube root', 'rational exponent', 'simplest form'],
  level: 'intro',
  order: 2,
  skills: ['radicals'],
  steps: [
    {
      id: 'side',
      title: 'A side from an area',
      caption:
        '$\\sqrt{A}$ is the nonnegative number whose square is $A$: the side of a square with area $A$. Each grid cell has area $1$. Only perfect squares give whole-number sides.',
    },
    {
      id: 'simplify',
      title: 'Simplest radical form',
      caption:
        'A square of area $k^2 r$ splits into $k \\times k$ small squares of area $r$, so its side is $k$ small sides: $\\sqrt{k^2 r} = k\\sqrt{r}$. Simplest form takes out the largest square factor.',
    },
    {
      id: 'sum',
      title: 'Roots do not split over sums',
      caption:
        'Two squares side by side have total side $\\sqrt{a} + \\sqrt{b}$, but the square with their combined area has a shorter side, $\\sqrt{a + b}$. Roots split over products, never over sums.',
    },
    {
      id: 'cube',
      title: 'Cube roots and rational exponents',
      caption:
        '$\\sqrt[3]{V}$ is the edge of a cube with volume $V$. Since $(V^{1/3})^3 = V^1$ by the power rule, $\\sqrt[3]{V} = V^{1/3}$, and in general $a^{m/n} = (\\sqrt[n]{a})^m$.',
    },
  ],
})

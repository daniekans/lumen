import type { CodeHue, CodeToken } from '@/lib/code'
import { codeColor, vc } from '@/styles/viz-colors'

/** The color, weight and style of a token in the shared code palette. */
export const codeTokenStyle = (token: CodeToken, colors?: Readonly<Record<string, CodeHue>>) => {
  const hue = token.kind === 'name' ? colors?.[token.text] : undefined
  if (hue) return { color: vc[hue], fontWeight: 600 }
  return {
    color: codeColor[token.kind],
    fontWeight: token.kind === 'keyword' ? 600 : undefined,
    fontStyle: token.kind === 'comment' ? ('italic' as const) : undefined,
  }
}

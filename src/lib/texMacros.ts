/**
 * KaTeX macros shared by every renderer (the `Tex` atom, MDX through rehype-katex, and the
 * practice tests), so math looks the same everywhere.
 *
 * `\lim` always sets its subscript underneath, as in books, also inside text. Write
 * `\lim\nolimits` for the rare place where the side form reads better.
 */
export const TEX_MACROS: Readonly<Record<string, string>> = {
  '\\lim': '\\mathop{\\mathrm{lim}}\\limits',
}

/** A fresh copy for KaTeX, which writes `\gdef` definitions into the object it gets. */
export const texMacros = () => ({ ...TEX_MACROS })

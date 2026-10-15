import type { MDXComponents } from 'mdx/types'
import { Link } from 'react-router'
import { C, StepLink } from './MdxWidgets'

/** Components available in every explanation.mdx, plus overrides for standard elements. */
export const mdxComponents: MDXComponents = {
  a: ({ href = '', children }) =>
    href.startsWith('/') ? (
      <Link to={href}>{children}</Link>
    ) : (
      <a href={href} target="_blank" rel="noreferrer">
        {children}
      </a>
    ),
  StepLink,
  C,
}

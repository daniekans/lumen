declare module 'virtual:lumen/term-uses' {
  /** Term ids linked by each item's explanation, keyed by item folder. See termUsesPlugin.ts. */
  const uses: Record<string, readonly string[]>
  export default uses
}

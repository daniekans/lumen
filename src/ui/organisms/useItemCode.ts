import { useEffect, useMemo, useState } from 'react'
import type { Item } from '@/catalog'
import type { CodeEntry } from '@/lib/code'

/**
 * The snippets of an item's `code.mdx` linked to steps, once its chunk has loaded (undefined
 * before, and for items without code), and the ids of the steps that have one.
 */
export function useItemCode(item: Item) {
  const [loaded, setLoaded] = useState<{ id: string; entries: readonly CodeEntry[] }>()
  useEffect(() => {
    let live = true
    item
      .loadCode?.()
      .then((m) => live && setLoaded({ id: item.id, entries: m.snippets ?? [] }))
      .catch(() => {})
    return () => {
      live = false
    }
  }, [item])
  const entries = loaded?.id === item.id ? loaded.entries : undefined
  const codeSteps = useMemo(
    () => new Set(entries?.flatMap((e) => (e.snippet.step ? [e.snippet.step] : []))),
    [entries],
  )
  return { entries, codeSteps }
}

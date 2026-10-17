import clsx from 'clsx'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { catalog, getItem, getUnit, type Term } from '@/catalog'
import { msg } from '@/i18n'
import { RichText, Tex } from '@/ui/atoms'
import { Breadcrumbs } from '@/ui/molecules'
import { TopBar } from '@/ui/organisms'
import { DocumentLayout, DocumentSection } from '@/ui/templates'
import { usePageTitle } from '../usePageTitle'
import styles from './GlossaryPage.module.css'

const matches = (term: Term, words: readonly string[]) => {
  const hay = [term.title, term.summary, term.tex ?? '', getUnit(term.unitId)?.title ?? '']
    .join(' ')
    .toLowerCase()
  return words.every((w) => hay.includes(w))
}

/** Every term and symbol in the catalog, grouped by area, each linked to where it is taught. */
export function GlossaryPage() {
  usePageTitle(msg.glossary.title)
  const { hash } = useLocation()
  const target = decodeURIComponent(hash.slice(1))
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
    const shown = catalog.terms.filter((t) => matches(t, words))
    return catalog.areas
      .map((area) => ({ area, terms: shown.filter((t) => t.unitId.startsWith(`${area.id}/`)) }))
      .filter((g) => g.terms.length > 0)
  }, [query])

  useEffect(() => {
    if (target) document.getElementById(target)?.scrollIntoView({ block: 'center' })
  }, [target])

  return (
    <DocumentLayout
      topBar={
        <TopBar>
          <Breadcrumbs
            items={[{ label: msg.pages.home.crumb, to: '/' }, { label: msg.glossary.link }]}
          />
        </TopBar>
      }
      title={msg.glossary.title}
      description={msg.glossary.description}
      actions={
        <label className={styles.filter}>
          <Search size={14} />
          <input
            className={styles.input}
            type="search"
            placeholder={msg.glossary.filter}
            aria-label={msg.glossary.filter}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <span className={styles.count}>{msg.glossary.count(catalog.terms.length)}</span>
        </label>
      }
    >
      {groups.length === 0 && <p className={styles.note}>{msg.glossary.noMatches(query)}</p>}
      {groups.map(({ area, terms }) => (
        <DocumentSection key={area.id} title={area.title}>
          <dl className={styles.list}>
            {terms.map((t) => (
              <TermEntry key={t.id} term={t} active={t.id === target} />
            ))}
          </dl>
        </DocumentSection>
      ))}
    </DocumentLayout>
  )
}

function TermEntry({ term, active }: { term: Term; active: boolean }) {
  const introducedIn = getItem(term.introducedIn)
  const usedIn = term.usedIn.map(getItem).filter((i) => !!i)
  return (
    <div id={term.id} className={clsx(styles.entry, active && styles.active)}>
      <dt className={styles.head}>
        <span className={styles.title}>{term.title}</span>
        {term.tex && <Tex className={styles.symbol}>{term.tex}</Tex>}
      </dt>
      <dd className={styles.body}>
        <span className={styles.summary}>
          <RichText>{term.summary}</RichText>
        </span>
        <span className={styles.links}>
          {introducedIn && (
            <span>
              {msg.glossary.introducedIn}{' '}
              <Link to={introducedIn.path} className={styles.link}>
                {introducedIn.title}
              </Link>
            </span>
          )}
          {usedIn.length > 0 && (
            <span>
              {msg.glossary.usedIn}{' '}
              {usedIn.map((item, i) => (
                <span key={item.id}>
                  {i > 0 && ', '}
                  <Link to={item.path} className={styles.link}>
                    {item.title}
                  </Link>
                </span>
              ))}
            </span>
          )}
        </span>
      </dd>
    </div>
  )
}

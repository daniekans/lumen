import { lazy, Suspense, useMemo, useState } from 'react'
import { Breadcrumbs } from '@/ui/molecules'
import { ControlDock, ErrorBoundary, LissajousMark, TopBar } from '@/ui/organisms'
import { VizLayout } from '@/ui/templates'
import { createUrlParams, VizRuntimeContext, type VizRuntimeValue } from '@/viz-kit/runtime'
import { usePageTitle } from '../usePageTitle'
import styles from './ItemPage.module.css'
import { msg } from '@/i18n'

// Lazy, like practice items, so the math field stays out of the main bundle.
const MixedPractice = lazy(() => import('@/practice/MixedPractice'))

/** Mixed practice across units, in the same shell as a practice item but without explanations. */
export function MixedPracticePage() {
  const [dock, setDock] = useState<HTMLDivElement | null>(null)
  usePageTitle(msg.mixed.title)
  const runtime = useMemo<VizRuntimeValue>(
    () => ({ steps: [], stepIndex: 0, goToStep: () => {}, dock, urlParams: createUrlParams() }),
    [dock],
  )
  return (
    <VizRuntimeContext.Provider value={runtime}>
      <VizLayout
        topBar={
          <TopBar>
            <Breadcrumbs
              items={[{ label: msg.pages.home.crumb, to: '/' }, { label: msg.mixed.title }]}
            />
          </TopBar>
        }
        stage={
          <div className={styles.fill}>
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className={styles.loading}>
                    <LissajousMark size={40} />
                  </div>
                }
              >
                <MixedPractice />
              </Suspense>
            </ErrorBoundary>
          </div>
        }
        floating={<ControlDock ref={setDock} />}
      />
    </VizRuntimeContext.Provider>
  )
}

import type { Area } from '@/catalog'
import { AreaIcon } from '@/ui/atoms'
import { Breadcrumbs } from '@/ui/molecules'
import { CourseCard, CourseGrid, TopBar } from '@/ui/organisms'
import { DocumentLayout, DocumentSection } from '@/ui/templates'
import { crumbsFor } from '../crumbs'
import { usePageTitle } from '../usePageTitle'
import { msg } from '@/i18n'

export function AreaPage({ area }: { area: Area }) {
  usePageTitle(area.title)
  return (
    <DocumentLayout
      topBar={
        <TopBar>
          <Breadcrumbs items={crumbsFor(area)} />
        </TopBar>
      }
      eyebrow={
        <>
          <AreaIcon icon={area.icon} size={13} /> {msg.pages.area.eyebrow}
        </>
      }
      title={area.title}
      description={area.description}
    >
      <DocumentSection title={msg.pages.area.courses}>
        <CourseGrid>
          {area.courses.map((c, i) => (
            <CourseCard key={c.id} course={c} index={i} />
          ))}
        </CourseGrid>
      </DocumentSection>
    </DocumentLayout>
  )
}

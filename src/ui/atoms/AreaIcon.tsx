import { Database, Network, Sigma, Sparkles, type LucideProps } from 'lucide-react'
import type { AreaIcon as AreaIconName } from '@/catalog/types'

const icons = { sigma: Sigma, database: Database, network: Network, sparkles: Sparkles }

export function AreaIcon({ icon, ...props }: { icon: AreaIconName } & LucideProps) {
  const Icon = icons[icon]
  return <Icon size={16} aria-hidden {...props} />
}

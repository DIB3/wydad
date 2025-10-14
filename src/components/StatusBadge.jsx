import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig = {
  APTE: {
    label: 'Apte',
    className: 'bg-success text-success-foreground hover:bg-success/90',
  },
  APTE_RESTRICTIONS: {
    label: 'Apte avec restrictions',
    className: 'bg-warning text-warning-foreground hover:bg-warning/90',
  },
  TEMP_INAPTE: {
    label: 'Temporairement inapte',
    className: 'bg-orange text-orange-foreground hover:bg-orange/90',
  },
  INAPTE: {
    label: 'Inapte',
    className: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
}

export function StatusBadge({ status, className }) {
  const config = statusConfig[status]

  if (!config) return null

  return <Badge className={cn(config.className, className)}>{config.label}</Badge>
}


import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral'

/**
 * Maps common status strings (across invoices, payments, orders, quotations,
 * sale orders...) to a visual tone. Status values are matched
 * case-insensitively - several bugs in this app came from comparing a
 * lowercase form value against Prisma's uppercase enum, so this component
 * normalizes internally rather than assuming a casing.
 */
const DEFAULT_TONE_MAP: Record<string, StatusTone> = {
    paid: 'success',
    completed: 'success',
    converted: 'success',
    received: 'success',
    active: 'success',
    generated: 'info',
    new: 'info',
    open: 'info',
    sent: 'info',
    partial: 'warning',
    processing: 'warning',
    pending: 'warning',
    draft: 'neutral',
    unpaid: 'danger',
    overdue: 'danger',
    cancelled: 'danger',
    payable: 'danger',
}

const TONE_CLASSES: Record<StatusTone, string> = {
    success: 'bg-green-50 text-green-700 border-green-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-600 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
}

export interface StatusBadgeProps {
    status: string | null | undefined
    /** Override or extend the default status -> tone mapping for a domain-specific status set. */
    toneMap?: Record<string, StatusTone>
    className?: string
}

export function StatusBadge({ status, toneMap, className }: StatusBadgeProps) {
    const key = (status || '').toLowerCase()
    const tone = toneMap?.[key] ?? DEFAULT_TONE_MAP[key] ?? 'neutral'

    return (
        <Badge variant="outline" className={cn(TONE_CLASSES[tone], 'capitalize font-medium', className)}>
            {key.replace(/_/g, ' ') || 'Unknown'}
        </Badge>
    )
}

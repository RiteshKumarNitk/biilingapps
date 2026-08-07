import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react"

export type StatsCardColor = 'blue' | 'green' | 'red' | 'purple' | 'orange' | 'slate' | 'indigo'

const COLOR_CLASSES: Record<StatsCardColor, { icon: string; iconBg: string; gradient: string }> = {
    blue: { icon: 'text-blue-600', iconBg: 'bg-blue-100/50', gradient: 'from-blue-50' },
    green: { icon: 'text-green-600', iconBg: 'bg-green-100/50', gradient: 'from-green-50' },
    red: { icon: 'text-red-600', iconBg: 'bg-red-100/50', gradient: 'from-red-50' },
    purple: { icon: 'text-purple-600', iconBg: 'bg-purple-100/50', gradient: 'from-purple-50' },
    orange: { icon: 'text-orange-600', iconBg: 'bg-orange-100/50', gradient: 'from-orange-50' },
    slate: { icon: 'text-slate-600', iconBg: 'bg-slate-100/50', gradient: 'from-slate-50' },
    indigo: { icon: 'text-indigo-600', iconBg: 'bg-indigo-100/50', gradient: 'from-indigo-50' },
}

export interface StatsCardProps {
    label: string
    value: React.ReactNode
    icon?: LucideIcon
    color?: StatsCardColor
    /** Percentage change to show as a trend chip, e.g. 12.5 or -4.2 */
    trend?: number
    /** Small text under the trend, e.g. "vs last month" */
    trendLabel?: string
    /** Extra content under the value (e.g. a party count chip) */
    footer?: React.ReactNode
    /** 'gradient' matches the richer card style used on list-page toolbars; 'plain' matches report pages. */
    variant?: 'plain' | 'gradient'
    className?: string
}

/**
 * A single KPI/stat card. Consolidates the ~20 files that previously
 * hand-rolled this markup (dashboard, reports, quotations, purchase bills,
 * payment-in...) with small inconsistent variations.
 */
export function StatsCard({
    label,
    value,
    icon: Icon,
    color = 'blue',
    trend,
    trendLabel,
    footer,
    variant = 'plain',
    className,
}: StatsCardProps) {
    const colors = COLOR_CLASSES[color]

    if (variant === 'gradient') {
        return (
            <Card className={cn("rounded-xl border-none shadow-sm bg-gradient-to-br to-white relative overflow-hidden", colors.gradient, className)}>
                {Icon && (
                    <div className="absolute top-0 right-0 p-3 opacity-5">
                        <Icon className={cn("h-24 w-24", colors.icon)} />
                    </div>
                )}
                <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                        {Icon && (
                            <div className={cn("p-3 rounded-lg", colors.iconBg, colors.icon)}>
                                <Icon className="h-6 w-6" />
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-slate-500">{label}</p>
                            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{value}</h3>
                            {footer}
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className={cn("rounded-xl border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden", className)}>
            {Icon && (
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Icon className={cn("h-16 w-16", colors.icon)} />
                </div>
            )}
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-500">{label}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
                {(trend !== undefined || footer) && (
                    <div className="flex items-center text-xs text-muted-foreground mt-1 gap-2">
                        {trend !== undefined && (
                            trend >= 0 ? (
                                <span className="text-emerald-600 flex items-center font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                                    <TrendingUp className="h-3 w-3 mr-1" />{trend.toFixed(1)}%
                                </span>
                            ) : (
                                <span className="text-red-600 flex items-center font-medium bg-red-50 px-1.5 py-0.5 rounded">
                                    <TrendingDown className="h-3 w-3 mr-1" />{Math.abs(trend).toFixed(1)}%
                                </span>
                            )
                        )}
                        {trendLabel && <span className="opacity-70">{trendLabel}</span>}
                        {footer}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

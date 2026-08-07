import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface SummaryCardProps {
    title: string
    description?: string
    children: React.ReactNode
    className?: string
}

/**
 * A titled card for freeform summary content (a breakdown, a small list, a
 * mixed group of stats) - distinct from StatsCard, which is a single KPI
 * number. Use this for things like a ledger summary panel or a GST
 * breakdown block that doesn't fit the single-value card shape.
 */
export function SummaryCard({ title, description, children, className }: SummaryCardProps) {
    return (
        <Card className={cn("rounded-xl border-none shadow-sm", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    )
}

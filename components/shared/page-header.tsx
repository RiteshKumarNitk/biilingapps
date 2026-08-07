import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageHeaderProps {
    title: string
    description?: string
    /** Buttons/actions rendered on the right, e.g. an "Add X" button. */
    actions?: React.ReactNode
    className?: string
}

/**
 * The "title + subtitle on the left, action button(s) on the right" header
 * that tops nearly every list page. Previously hand-rolled per page with
 * minor inconsistencies in spacing/classes.
 */
export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
    return (
        <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4", className)}>
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
                {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
    )
}

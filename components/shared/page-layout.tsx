import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageLayoutProps {
    children: React.ReactNode
    className?: string
}

/**
 * The standard page padding/spacing wrapper (`min-h-screen bg-slate-50/50
 * p-6 space-y-6`) repeated at the top of most dashboard list pages.
 * Combine with PageHeader for the common page skeleton:
 *
 *   <PageLayout>
 *     <PageHeader title="..." actions={...} />
 *     ...
 *   </PageLayout>
 */
export function PageLayout({ children, className }: PageLayoutProps) {
    return (
        <div className={cn("min-h-screen bg-slate-50/50 p-6 space-y-6", className)}>
            {children}
        </div>
    )
}

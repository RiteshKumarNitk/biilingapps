import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ErrorStateProps {
    icon?: LucideIcon
    title?: string
    description?: string
    /** Label + handler for a retry/primary action. */
    action?: { label: string; onClick: () => void }
    className?: string
}

/**
 * Standard error placeholder. Used by the app/ and app/dashboard/ error.tsx
 * boundaries, and available for any component-level try/catch fallback.
 */
export function ErrorState({
    icon: Icon = AlertTriangle,
    title = "Something went wrong",
    description = "An unexpected error occurred. Please try again.",
    action,
    className,
}: ErrorStateProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center gap-4 p-8 text-center", className)}>
            <div className="rounded-full bg-red-50 p-4">
                <Icon className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
                <p className="text-sm text-slate-500 max-w-md">{description}</p>
            </div>
            {action && <Button onClick={action.onClick}>{action.label}</Button>}
        </div>
    )
}

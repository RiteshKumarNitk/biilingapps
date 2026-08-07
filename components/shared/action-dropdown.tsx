"use client"

import * as React from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ActionDropdownItem {
    label: string
    icon?: LucideIcon
    onClick: () => void
    destructive?: boolean
    /** Renders a separator above this item. */
    separatorBefore?: boolean
    disabled?: boolean
}

export interface ActionDropdownProps {
    items: ActionDropdownItem[]
    triggerIcon?: LucideIcon
    align?: "start" | "end" | "center"
    className?: string
}

/**
 * A "..." row-actions menu. Consolidates the many tables that hand-rolled
 * a DropdownMenu with the same Edit/View/Print/Delete item shape.
 */
export function ActionDropdown({ items, triggerIcon: TriggerIcon = MoreVertical, align = "end", className }: ActionDropdownProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn("h-8 w-8", className)}>
                    <TriggerIcon className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align}>
                {items.map((item, i) => (
                    <React.Fragment key={item.label}>
                        {item.separatorBefore && i > 0 && <DropdownMenuSeparator />}
                        <DropdownMenuItem
                            onClick={item.onClick}
                            disabled={item.disabled}
                            className={item.destructive ? "text-red-600 focus:text-red-600" : undefined}
                        >
                            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                            {item.label}
                        </DropdownMenuItem>
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

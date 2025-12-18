'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { dashboardNavItems, NavItem } from '@/lib/dashboard-nav-items'
import { ChevronDown, ChevronRight } from 'lucide-react'


interface MainNavProps extends React.HTMLAttributes<HTMLElement> {
    collapsed?: boolean
}

export function MainNav({
    className,
    collapsed = false,
    ...props
}: MainNavProps) {
    const pathname = usePathname()
    const [expandedItem, setExpandedItem] = useState<string | null>(null)

    // Automatically expand the group that contains the current path
    useEffect(() => {
        if (collapsed) return // Don't auto-expand if collapsed logic is tricky, or maybe clear it

        const activeGroup = dashboardNavItems.find(item =>
            item.items?.some(sub => sub.href === pathname || pathname.startsWith(sub.href))
        )
        if (activeGroup) {
            setExpandedItem(activeGroup.title)
        }
    }, [pathname, collapsed])

    const handleExpand = (title: string, hasChildren: boolean) => {
        if (!hasChildren || collapsed) return
        setExpandedItem(expandedItem === title ? null : title)
    }

    // Helper to determine if an item is active
    const isItemActive = (item: NavItem) => {
        if (item.href === pathname) return true
        if (item.items?.some(sub => sub.href === pathname)) return true
        return false
    }

    return (
        <nav
            className={cn(
                'flex flex-col space-y-1',
                className
            )}
            {...props}
        >
            {dashboardNavItems.map((item) => {
                const isActive = isItemActive(item)
                const isExpanded = expandedItem === item.title && !collapsed
                const hasChildren = item.items && item.items.length > 0

                // Parent Item
                const ParentContent = (
                    <div
                        className={cn(
                            'group flex items-center justify-between rounded-none px-4 py-3 text-sm font-medium transition-all duration-200 ease-in-out cursor-pointer relative',
                            isActive
                                ? 'text-[#1677FF] bg-[#1E293B]'
                                : 'text-[#E5E7EB] hover:bg-[#1E293B]',
                            // Red Indicator for active state
                            isActive && "border-l-4 border-[#EF4444] pl-3"
                        )}
                        onClick={(e) => {
                            if (hasChildren) {
                                e.preventDefault()
                                handleExpand(item.title, true)
                            }
                        }}
                    >
                        <div className={cn("flex items-center flex-1", collapsed && "justify-center")}>
                            {item.icon && (
                                <item.icon className={cn(
                                    "h-5 w-5 transition-transform",
                                    isActive ? "text-[#1677FF]" : "text-slate-400 group-hover:text-white",
                                    collapsed ? "mr-0" : "mr-3"
                                )} />
                            )}
                            {!collapsed && (
                                <span className="truncate">{item.title}</span>
                            )}
                        </div>

                        {/* Arrow Icon */}
                        {!collapsed && hasChildren && (
                            <div className="text-slate-500">
                                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </div>
                        )}
                    </div>
                )

                return (
                    <div key={item.title} className="flex flex-col">
                        <Link
                            href={hasChildren ? '#' : item.href}
                            onClick={(e) => { if (hasChildren) e.preventDefault() }}
                            title={collapsed ? item.title : undefined}
                        >
                            {ParentContent}
                        </Link>

                        {/* Submenus */}
                        {!collapsed && isExpanded && hasChildren && (
                            <div className="bg-[#0b1120] animate-in slide-in-from-top-2 duration-200">
                                {item.items!.map((sub) => (
                                    <Link
                                        key={sub.title}
                                        href={sub.href}
                                        className={cn(
                                            "flex items-center py-2 pl-12 pr-4 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors border-l-2 border-transparent hover:border-slate-600",
                                            pathname === sub.href && "text-blue-400 font-medium"
                                        )}
                                    >
                                        <div className="w-1 h-1 rounded-full bg-current mr-2 opacity-50" />
                                        {sub.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}

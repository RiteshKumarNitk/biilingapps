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
                            // Blue Indicator for active state
                            isActive && "border-l-4 border-blue-600 pl-3 bg-blue-900/20 text-blue-400"
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
                                    isActive ? "text-blue-500" : "text-slate-400 group-hover:text-white",
                                    collapsed ? "mr-0" : "mr-3"
                                )} />
                            )}
                            {!collapsed && (
                                <span className={cn("truncate", isActive && "font-semibold")}>{item.title}</span>
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
                            <div className="bg-[#0f172a] animate-in slide-in-from-top-2 duration-200 border-l border-slate-800 ml-4 my-1 rounded-l-md">
                                {item.items!.map((sub) => (
                                    <Link
                                        key={sub.title}
                                        href={sub.href}
                                        className={cn(
                                            "flex items-center py-2 pl-4 pr-4 text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors rounded-r-md",
                                            pathname === sub.href && "text-blue-400 font-medium bg-blue-900/10 border-l-2 border-blue-500"
                                        )}
                                    >
                                        {pathname !== sub.href && <div className="w-1 h-1 rounded-full bg-slate-600 mr-3 opacity-50" />}
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

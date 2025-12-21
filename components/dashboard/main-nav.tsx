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

                        <div className="flex items-center gap-2">
                            {/* Quick Add Button Parent */}
                            {!collapsed && item.quickAddLink && (
                                <Link
                                    href={item.quickAddLink}
                                    className="p-1 px-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                                    title={`Add new ${item.title}`}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <span className="text-lg font-light leading-none">+</span>
                                </Link>
                            )}

                            {/* Arrow Icon */}
                            {!collapsed && hasChildren && (
                                <div className="text-slate-500">
                                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                </div>
                            )}
                        </div>
                    </div>
                )

                return (
                    <div key={item.title} className="flex flex-col">
                        {hasChildren ? (
                            <div title={collapsed ? item.title : undefined}>
                                {ParentContent}
                            </div>
                        ) : (
                            <Link
                                href={item.href}
                                title={collapsed ? item.title : undefined}
                            >
                                {ParentContent}
                            </Link>
                        )}

                        {/* Submenus */}
                        {!collapsed && isExpanded && hasChildren && (
                            <div className="bg-[#0f172a] animate-in slide-in-from-top-2 duration-200">
                                {item.items!.map((sub) => {
                                    const isSubActive = pathname === sub.href

                                    return (
                                        <div
                                            key={sub.title}
                                            className={cn(
                                                "relative flex items-center justify-between group/sub",
                                                isSubActive ? "bg-[#1E293B]" : "hover:bg-white/5"
                                            )}
                                        >
                                            {/* Main Link */}
                                            <Link
                                                href={sub.href}
                                                className={cn(
                                                    "flex-1 flex items-center py-2.5 pl-8 pr-2 text-sm transition-colors",
                                                    isSubActive
                                                        ? "text-white font-medium border-l-[3px] border-[#EF4444]"
                                                        : "text-slate-400 border-l-[3px] border-transparent hover:text-white"
                                                )}
                                            >
                                                {sub.title}
                                            </Link>

                                            {/* Quick Add Button */}
                                            {sub.quickAddLink && (
                                                <Link
                                                    href={sub.quickAddLink}
                                                    className="pr-4 pl-2 py-2 text-slate-500 hover:text-white transition-colors opacity-0 group-hover/sub:opacity-100 focus:opacity-100"
                                                    title={`Add new ${sub.title}`}
                                                >
                                                    <span className="text-lg font-light leading-none">+</span>
                                                </Link>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )
            })}
        </nav>
    )
}

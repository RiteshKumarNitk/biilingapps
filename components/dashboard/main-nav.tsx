'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { dashboardNavItems, NavItem } from '@/lib/dashboard-nav-items'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'


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
        if (collapsed) return

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

    const isItemActive = (item: NavItem) => {
        if (item.href === pathname) return true
        if (item.items?.some(sub => sub.href === pathname)) return true
        return false
    }

    return (
        <nav
            className={cn(
                'flex flex-col gap-1 pb-6',
                className
            )}
            {...props}
        >
            {dashboardNavItems.map((item) => {
                const isActive = isItemActive(item)
                const isExpanded = expandedItem === item.title && !collapsed
                const hasChildren = item.items && item.items.length > 0

                // Parent Item Logic
                const content = (
                    <div
                        className={cn(
                            'group flex items-center justify-between mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer select-none',
                            isActive
                                ? 'bg-blue-50 text-blue-700'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                            collapsed && 'justify-center px-2'
                        )}
                        onClick={(e) => {
                            if (hasChildren) {
                                e.preventDefault()
                                handleExpand(item.title, true)
                            }
                        }}
                    >
                        <div className="flex items-center gap-3">
                            {item.icon && (
                                <item.icon className={cn(
                                    "h-5 w-5 shrink-0 transition-colors",
                                    isActive ? "text-blue-600" : "text-slate-500 group-hover:text-slate-700"
                                )} />
                            )}
                            {!collapsed && (
                                <span className={cn("truncate", isActive && "font-semibold")}>
                                    {item.title}
                                </span>
                            )}
                        </div>

                        {!collapsed && (
                            <div className="flex items-center gap-1">
                                {item.quickAddLink && (
                                    <Link
                                        href={item.quickAddLink}
                                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded-md hover:bg-slate-200 text-slate-500 transition-all"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Link>
                                )}
                                {hasChildren && (
                                    <div className="text-slate-400">
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )

                return (
                    <div key={item.title} className="flex flex-col">
                        {collapsed ? (
                            <div title={item.title}>
                                {hasChildren ? (
                                    <div>{content}</div>
                                ) : (
                                    <Link href={item.href}>{content}</Link>
                                )}
                            </div>
                        ) : (
                            hasChildren ? <div>{content}</div> : <Link href={item.href}>{content}</Link>
                        )}

                        {/* Submenus */}
                        {!collapsed && isExpanded && hasChildren && (
                            <div className="ml-5 pl-2 border-l border-slate-200 my-1 space-y-0.5 animate-in slide-in-from-top-1 fade-in duration-200">
                                {item.items!.map((sub) => {
                                    const isSubActive = pathname === sub.href
                                    return (
                                        <div key={sub.title} className="flex items-center group/sub pr-2">
                                            <Link
                                                href={sub.href}
                                                className={cn(
                                                    "flex-1 flex items-center py-2 pl-3 pr-2 rounded-md text-sm transition-colors",
                                                    isSubActive
                                                        ? "text-blue-700 bg-blue-50/50 font-medium"
                                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                                )}
                                            >
                                                {sub.title}
                                            </Link>

                                            {sub.quickAddLink && (
                                                <Link
                                                    href={sub.quickAddLink}
                                                    className="opacity-0 group-hover/sub:opacity-100 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-all ml-1"
                                                >
                                                    <Plus className="h-3 w-3" />
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

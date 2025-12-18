'use client'

import React, { useState } from 'react'
import { MainNav } from '@/components/dashboard/main-nav'
import { UserNav } from '@/components/dashboard/user-nav'
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface DashboardShellProps {
    children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden flex-col bg-[#0F172A] md:flex text-white shadow-xl z-50 transition-all duration-300 ease-in-out relative",
                    isCollapsed ? "w-[70px]" : "w-64"
                )}
            >
                <div className={cn(
                    "flex h-16 items-center border-b border-white/10 transition-all duration-300",
                    isCollapsed ? "justify-center px-0" : "px-6"
                )}>
                    {isCollapsed ? (
                        <span className="text-xl font-bold tracking-tight text-blue-400">⚡</span>
                    ) : (
                        <span className="text-xl font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                            <span className="text-blue-400">⚡</span> Vyapar App
                        </span>
                    )}
                </div>

                {/* Sidebar Toggle Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-white/10 bg-[#0F172A] text-white hover:bg-slate-800 hidden md:flex shadow-md"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                    ) : (
                        <ChevronLeft className="h-3 w-3" />
                    )}
                </Button>

                <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-hide">
                    <MainNav collapsed={isCollapsed} />
                </div>

                {!isCollapsed && (
                    <div className="p-4 border-t border-white/10 text-xs text-slate-400 text-center whitespace-nowrap overflow-hidden">
                        v1.0.0
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                {/* Top Header */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-4 border-b bg-white px-4 shadow-sm md:px-8">
                    <div className="flex items-center gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] bg-[#0F172A] text-white border-r-white/10 p-0">
                                <SheetHeader className="h-16 flex items-center justify-center border-b border-white/10 px-6">
                                    <SheetTitle className="text-white flex items-center gap-2">
                                        <span className="text-blue-400">⚡</span> Vyapar App
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="py-6 px-4">
                                    <MainNav />
                                </div>
                            </SheetContent>
                        </Sheet>
                        <h1 className="text-lg font-semibold text-slate-800 hidden sm:block">Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <UserNav />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8">
                    <div className="mx-auto max-w-7xl space-y-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

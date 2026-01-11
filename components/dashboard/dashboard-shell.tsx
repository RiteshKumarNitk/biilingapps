'use client'

import React, { useState } from 'react'
import { MainNav } from '@/components/dashboard/main-nav'
import { UserNav } from '@/components/dashboard/user-nav'
import { Menu, ChevronLeft, ChevronRight, Plus, Search, Bell, HelpCircle, Phone, PanelsTopLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface DashboardShellProps {
    children: React.ReactNode
    user?: any
    profile?: any
}

export function DashboardShell({ children, user, profile }: DashboardShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden flex-col bg-white border-r border-slate-200 md:flex transition-all duration-300 ease-in-out relative z-30",
                    isCollapsed ? "w-[72px]" : "w-[260px]"
                )}
            >
                {/* Sidebar Header */}
                <div className="flex h-16 items-center border-b border-slate-100 px-4 shrink-0">
                    <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
                        <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm">
                            <PanelsTopLeft className="h-5 w-5 text-white" />
                        </div>
                        <div className={cn("flex flex-col transition-opacity duration-300", isCollapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                            <span className="font-bold text-slate-900 tracking-tight whitespace-nowrap">Vyapar App</span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Business OS</span>
                        </div>
                    </Link>
                </div>

                {/* Sidebar Toggle Button */}
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-3 top-[3.75rem] z-40 h-6 w-6 rounded-full border border-slate-200 bg-white text-slate-400 hover:text-slate-700 hover:bg-slate-50 shadow-sm hidden md:flex"
                >
                    {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                    ) : (
                        <ChevronLeft className="h-3 w-3" />
                    )}
                </Button>

                {/* Main Navigation */}
                <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300">
                    <MainNav collapsed={isCollapsed} />
                </div>

                {/* Sidebar Footer */}
                <div className="mt-auto border-t border-slate-100 bg-slate-50/50 p-4 shrink-0">
                    {!isCollapsed ? (
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center border border-white shadow-sm shrink-0">
                                <span className="text-sm font-semibold text-slate-600">
                                    {(user?.email?.[0] || 'U').toUpperCase()}
                                </span>
                            </div>
                            <div className="flex flex-col overflow-hidden min-w-0">
                                <span className="text-sm font-medium text-slate-900 truncate">
                                    {(Array.isArray(profile?.tenants) ? profile.tenants[0]?.name : profile?.tenants?.name) || "My Business"}
                                </span>
                                <span className="text-xs text-slate-500 truncate">Premium Plan</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center border border-white shadow-sm">
                                <span className="text-xs font-semibold text-slate-600">
                                    {(user?.email?.[0] || 'U').toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden min-w-0">
                {/* Top Header */}
                <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-white/80 backdrop-blur-sm px-4 md:px-6 shadow-sm">
                    {/* Left Section: Mobile Menu & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-slate-500">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] p-0 border-r border-slate-200">
                                <SheetHeader className="h-16 flex items-center justify-start border-b border-slate-100 px-6">
                                    <SheetTitle className="flex items-center gap-2">
                                        <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <PanelsTopLeft className="h-5 w-5 text-white" />
                                        </div>
                                        <div className="flex flex-col items-start">
                                            <span className="font-bold text-slate-900">Vyapar App</span>
                                            <span className="text-[10px] text-slate-500 uppercase">Business OS</span>
                                        </div>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="py-4 px-2">
                                    <MainNav />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Search Bar */}
                        <div className="hidden md:flex relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search invoices, parties, items... (Ctrl + /)"
                                className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-blue-500/20 focus-visible:border-blue-500 rounded-lg h-10 w-full transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        {/* Quick Action Buttons */}
                        <div className="hidden lg:flex items-center gap-2">
                            <Link href="/dashboard/invoices/new">
                                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white rounded-lg h-9 shadow-sm shadow-red-200">
                                    <Plus className="h-4 w-4 mr-1.5" /> Sale
                                </Button>
                            </Link>
                            <Link href="/dashboard/purchase/bills/new">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg h-9 shadow-sm shadow-blue-200">
                                    <Plus className="h-4 w-4 mr-1.5" /> Purchase
                                </Button>
                            </Link>
                        </div>

                        <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

                        {/* Icons */}
                        <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" className="rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                                <Bell className="h-5 w-5" />
                            </Button>
                            <Button size="icon" variant="ghost" className="rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50">
                                <HelpCircle className="h-5 w-5" />
                            </Button>
                        </div>

                        <UserNav user={user} profile={profile} />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-8 bg-[#F8FAFC]">
                    <div className="mx-auto max-w-7xl animate-in fade-in duration-500">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

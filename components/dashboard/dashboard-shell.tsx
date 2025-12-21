'use client'

import React, { useState } from 'react'
import { MainNav } from '@/components/dashboard/main-nav'
import { UserNav } from '@/components/dashboard/user-nav'
import { Menu, ChevronLeft, ChevronRight, Plus, Phone, MoreVertical, Search, Bell, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'

interface DashboardShellProps {
    children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex h-screen overflow-hidden bg-[#F1F3F6]">
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden flex-col bg-[#0F172A] md:flex text-white shadow-xl z-50 transition-all duration-300 ease-in-out relative",
                    isCollapsed ? "w-[70px]" : "w-64"
                )}
            >
                <div className="flex h-16 items-center border-b border-white/10 px-6">
                    <span className="text-xl font-bold tracking-tight flex items-center gap-2 whitespace-nowrap">
                        <span className="text-blue-400">⚡</span>
                        {!isCollapsed && "Vyapar App"}
                    </span>
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

                <div className="flex-1 overflow-y-auto py-4 px-2 scrollbar-hide">
                    <MainNav collapsed={isCollapsed} />
                </div>

                {/* Sidebar Footer (Trial/Premium) */}
                {!isCollapsed && (
                    <div className="p-4 border-t border-white/10 bg-[#1E293B]">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold">M</span>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-semibold whitespace-nowrap">My Business</span>
                                <span className="text-[10px] text-slate-400 truncate">Owner</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[10px] text-slate-400">
                                <span>Trial: 14 days left</span>
                            </div>
                            <Progress value={80} className="h-1 bg-slate-700" indicatorClassName='bg-green-500' />
                            <Button size="sm" className="w-full bg-[#ECBA16] hover:bg-[#D4A713] text-black font-semibold text-xs h-8">
                                Get Vyapar Premium
                            </Button>
                        </div>
                    </div>
                )}
                {isCollapsed && (
                    <div className="p-2 border-t border-white/10 flex flex-col items-center gap-4">
                        <span className="h-8 w-8 rounded bg-blue-500 flex items-center justify-center text-white font-bold">M</span>
                        <Button size="icon" variant="ghost" className="text-[#ECBA16]">
                            <span className="font-bold">P</span>
                        </Button>
                    </div>
                )}
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                {/* Top Header */}
                <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4 shadow-sm">
                    {/* Left Section: Mobile Menu & Search */}
                    <div className="flex items-center gap-4 flex-1">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[280px] bg-[#0F172A] text-white border-r-white/10 p-0">
                                <SheetHeader className="h-16 flex items-center justify-start border-b border-white/10 px-6">
                                    <SheetTitle className="text-white flex items-center gap-2">
                                        <span className="text-blue-400">⚡</span> Vyapar App
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="py-6 px-4">
                                    <MainNav />
                                </div>
                            </SheetContent>
                        </Sheet>

                        {/* Search Bar */}
                        <div className="hidden md:flex relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Open Anything (Ctrl + F)"
                                className="pl-9 bg-slate-100 border-none focus-visible:ring-1 focus-visible:ring-blue-500 rounded-full h-9"
                            />
                        </div>
                    </div>

                    {/* Center Section: Welcome (Hidden on small mobile) */}
                    {/* <div className="hidden lg:flex items-center justify-center flex-1">
                        <h1 className="text-lg font-semibold text-slate-800">Welcome to Vyapar</h1>
                    </div> */}

                    {/* Right Section: Actions */}
                    <div className="flex items-center gap-2 md:gap-3 justify-end flex-1">

                        {/* Quick Action Buttons */}
                        <div className="hidden lg:flex items-center gap-2">
                            <Link href="/dashboard/invoices/new">
                                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-4 h-8">
                                    <Plus className="h-4 w-4 mr-1" /> Add Sale
                                </Button>
                            </Link>
                            <Link href="/dashboard/purchase/bills/new">
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 h-8">
                                    <Plus className="h-4 w-4 mr-1" /> Add Purchase
                                </Button>
                            </Link>
                        </div>

                        {/* Icons */}
                        <Button size="icon" variant="ghost" className="rounded-full text-slate-600 hover:bg-slate-100">
                            <Plus className="h-5 w-5" />
                        </Button>
                        <div className="hidden md:flex items-center gap-1 text-xs text-slate-500 border rounded-full px-3 py-1 bg-slate-50">
                            <Phone className="h-3 w-3" />
                            <span>Support</span>
                        </div>
                        <Button size="icon" variant="ghost" className="rounded-full text-slate-600 hover:bg-slate-100">
                            <MoreVertical className="h-5 w-5" />
                        </Button>
                        <UserNav />
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 bg-[#F1F3F6]">
                    <div className="mx-auto max-w-[1600px] space-y-4">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

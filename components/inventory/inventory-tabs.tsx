"use client"

import { cn } from "@/lib/utils"

interface InventoryTabsProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function InventoryTabs({ activeTab, onTabChange }: InventoryTabsProps) {
    const tabs = [
        { id: "products", label: "PRODUCTS" },
        { id: "services", label: "SERVICES" },
        { id: "category", label: "CATEGORY" },
        { id: "units", label: "UNITS" },
    ]

    return (
        <div className="grid grid-cols-4 bg-white border-b px-6 shrink-0 z-10">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                        "py-3 text-sm font-bold border-b-2 transition-all text-center hover:bg-slate-50",
                        activeTab === tab.id
                            ? "border-blue-600 text-blue-600"
                            : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    )
}

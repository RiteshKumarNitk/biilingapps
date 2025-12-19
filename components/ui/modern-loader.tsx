
"use client"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ModernLoaderProps {
    className?: string
    text?: string
}

export function ModernLoader({ className, text = "Loading..." }: ModernLoaderProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center py-10 space-y-3 animate-in fade-in duration-300", className)}>
            <div className="relative">
                <div className="h-10 w-10 border-4 border-blue-100 rounded-full"></div>
                <div className="absolute top-0 left-0 h-10 w-10 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                {/* Inner dot */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-2 w-2 bg-blue-600 rounded-full"></div>
            </div>
            <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>
        </div>
    )
}

export function FullPageLoader() {
    return (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <ModernLoader text="Processing..." />
        </div>
    )
}

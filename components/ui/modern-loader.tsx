"use client"

import { cn } from "@/lib/utils"

interface ModernLoaderProps {
    className?: string
    text?: string
    size?: "sm" | "md" | "lg"
}

export function ModernLoader({ className, text = "Loading...", size = "md" }: ModernLoaderProps) {
    const sizeClasses = {
        sm: "h-8 w-8",
        md: "h-12 w-12",
        lg: "h-16 w-16"
    }

    const containerSize = {
        sm: "h-4 w-4",
        md: "h-6 w-6",
        lg: "h-8 w-8"
    }

    return (
        <div className={cn("flex flex-col items-center justify-center p-4 space-y-4 animate-in fade-in zoom-in-95 duration-300", className)}>
            <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
                {/* Outer Ring - Soft Background */}
                <div className="absolute inset-0 rounded-full border-[3px] border-slate-200/50 dark:border-slate-800/50"></div>

                {/* Middle Ring - Spinning Gradient (Slow) */}
                <div className="absolute inset-0 rounded-full border-[3px] border-t-blue-500 border-r-indigo-500 border-b-purple-500 border-l-transparent animate-spin duration-[3s]"></div>

                {/* Inner Ring - Spinning Reverse (Fast) */}
                <div className="absolute inset-1 rounded-full border-[3px] border-t-transparent border-r-cyan-400 border-b-transparent border-l-transparent animate-spin [animation-direction:reverse] duration-1000"></div>

                {/* Central Core - Pulsing */}
                <div className={cn("bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 animate-pulse", containerSize[size])}></div>
            </div>

            {text && (
                <div className="flex flex-col items-center space-y-1">
                    <p className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse">
                        {text}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                        Please Wait
                    </p>
                </div>
            )}
        </div>
    )
}

export function FullPageLoader() {
    return (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center">
            {/* Glass Card Container */}
            <div className="bg-white/80 dark:bg-slate-900/80 p-8 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md flex flex-col items-center gap-2 max-w-sm mx-4">
                <ModernLoader size="lg" text="Processing" />
            </div>
        </div>
    )
}

"use client"

import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface ModernLoaderProps {
    className?: string
    text?: string
    size?: "sm" | "md" | "lg"
}

export function ModernLoader({ className, text = "Loading...", size = "md" }: ModernLoaderProps) {
    const sizeMap = {
        sm: { container: "h-16 w-16", core: "h-4 w-4", ring1: "h-12 w-12", ring2: "h-16 w-16" },
        md: { container: "h-24 w-24", core: "h-6 w-6", ring1: "h-16 w-16", ring2: "h-24 w-24" },
        lg: { container: "h-32 w-32", core: "h-8 w-8", ring1: "h-24 w-24", ring2: "h-32 w-32" }
    }

    const { container, core, ring1, ring2 } = sizeMap[size]

    return (
        <div className={cn("flex flex-col items-center justify-center p-6 space-y-6", className)}>
            <div className={cn("relative flex items-center justify-center", container)}>
                {/* Outer Glow */}
                <motion.div
                    className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Animated Rings */}
                <motion.div
                    className={cn("absolute rounded-full border-[1.5px] border-blue-500/20 border-t-blue-500", ring2)}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                <motion.div
                    className={cn("absolute rounded-full border-[1.5px] border-indigo-500/20 border-r-indigo-500", ring1)}
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Morphing Core */}
                <motion.div
                    className={cn("bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-full shadow-lg shadow-blue-500/40 relative z-10", core)}
                    animate={{
                        scale: [1, 1.15, 1],
                        borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 50% 60% 40% 60%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    {/* Interior Pulse */}
                    <motion.div
                        className="absolute inset-0 rounded-full bg-white/30"
                        animate={{
                            scale: [0.8, 1.2, 0.8],
                            opacity: [0, 0.5, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                </motion.div>

                {/* Orbiting Particles */}
                {[0, 90, 180, 270].map((angle, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                        animate={{
                            rotate: [angle, angle + 360],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            originX: "50%",
                            originY: "50%",
                            width: "100%",
                            height: "1px",
                            background: "transparent"
                        }}
                    >
                        <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_8px_#22d3ee]" style={{ marginLeft: "100%" }} />
                    </motion.div>
                ))}
            </div>

            {text && (
                <div className="flex flex-col items-center space-y-2">
                    <motion.p
                        className="text-base font-medium tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        {text}
                    </motion.p>
                    <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: Infinity,
                                    delay: i * 0.2
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

export function FullPageLoader() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/20 backdrop-blur-xl z-[100] flex flex-col items-center justify-center p-6 overflow-hidden"
        >
            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
            </div>

            {/* Grain/Noise Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                    <filter id="noiseFilter">
                        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
                    </filter>
                    <rect width="100%" height="100%" filter="url(#noiseFilter)" />
                </svg>
            </div>

            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white/10 dark:bg-slate-950/40 p-12 rounded-[3.5rem] shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-white/20 dark:border-white/10 backdrop-blur-2xl flex flex-col items-center gap-2 max-w-sm w-full mx-4 relative overflow-hidden group"
            >
                {/* Internal Card Glow */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-[60px] group-hover:bg-blue-500/30 transition-colors duration-1000" />

                <ModernLoader size="lg" text="Perfecting your view" />

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-[0.2em] mt-2"
                >
                    System Processing
                </motion.p>
            </motion.div>
        </motion.div>
    )
}

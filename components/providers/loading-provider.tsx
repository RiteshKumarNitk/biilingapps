"use client"

import * as React from "react"
import { FullPageLoader } from "@/components/ui/modern-loader"
import { AnimatePresence } from "framer-motion"

import { usePathname, useSearchParams } from "next/navigation"

interface LoadingContextType {
    isLoading: boolean
    setIsLoading: (loading: boolean) => void
    showLoader: () => void
    hideLoader: () => void
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = React.useState(false)
    const pathname = usePathname()
    const searchParams = useSearchParams()

    React.useEffect(() => {
        setIsLoading(false)
    }, [pathname, searchParams])

    const showLoader = React.useCallback(() => setIsLoading(true), [])
    const hideLoader = React.useCallback(() => setIsLoading(false), [])

    const value = React.useMemo(
        () => ({
            isLoading,
            setIsLoading,
            showLoader,
            hideLoader,
        }),
        [isLoading, showLoader, hideLoader]
    )

    return (
        <LoadingContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {isLoading && <FullPageLoader />}
            </AnimatePresence>
        </LoadingContext.Provider>
    )
}

export function useLoading() {
    const context = React.useContext(LoadingContext)
    if (context === undefined) {
        throw new Error("useLoading must be used within a LoadingProvider")
    }
    return context
}

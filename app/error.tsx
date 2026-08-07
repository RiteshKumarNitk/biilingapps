'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function RootError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-red-50 p-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-800">Something went wrong</h2>
                <p className="text-sm text-slate-500 max-w-md">
                    An unexpected error occurred. Please try again.
                </p>
            </div>
            <Button onClick={() => reset()}>Try Again</Button>
        </div>
    )
}

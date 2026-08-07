'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function DashboardError({
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
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-red-50 p-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-800">Something went wrong</h2>
                <p className="text-sm text-slate-500 max-w-md">
                    An unexpected error occurred while loading this page. You can try again, or head back to the dashboard.
                </p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={() => reset()}>Try Again</Button>
                <Button onClick={() => window.location.assign('/dashboard')}>Go to Dashboard</Button>
            </div>
        </div>
    )
}

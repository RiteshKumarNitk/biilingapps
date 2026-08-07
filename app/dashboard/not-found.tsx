import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function DashboardNotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
            <div className="rounded-full bg-slate-100 p-4">
                <FileQuestion className="h-8 w-8 text-slate-500" />
            </div>
            <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-800">Page not found</h2>
                <p className="text-sm text-slate-500 max-w-md">
                    The page you&apos;re looking for doesn&apos;t exist or may have been moved.
                </p>
            </div>
            <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
            </Link>
        </div>
    )
}

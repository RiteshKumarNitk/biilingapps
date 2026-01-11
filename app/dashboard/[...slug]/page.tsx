import { Button } from '@/components/ui/button'
import { MoveLeft, Construction } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardCatchAll({
    params
}: {
    params: Promise<{ slug: string[] }>
}) {
    const { slug } = await params
    const pageName = slug[slug.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    return (
        <div className="flex h-[80vh] flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col items-center space-y-3 text-center">
                <div className="rounded-full bg-blue-50 p-6 shadow-sm border border-blue-100">
                    <Construction className="h-12 w-12 text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">{pageName}</h1>
                <p className="text-slate-500 max-w-md text-lg">
                    We are working hard to build this feature. It will be available in a future update.
                </p>
                <code className="px-3 py-1 bg-slate-100 rounded text-xs text-slate-400 mt-4 font-mono">
                    /dashboard/{slug.join('/')}
                </code>
            </div>
            <Link href="/dashboard">
                <Button className="gap-2 rounded-full px-6" size="lg">
                    <MoveLeft className="h-4 w-4" />
                    Back to Dashboard
                </Button>
            </Link>
        </div>
    )
}

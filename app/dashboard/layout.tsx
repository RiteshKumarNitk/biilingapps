
import { MainNav } from '@/components/dashboard/main-nav'
import { UserNav } from '@/components/dashboard/user-nav'
import { Separator } from '@/components/ui/separator'
import Image from 'next/image'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col space-y-6">
            <header className="sticky top-0 z-40 border-b bg-background">
                <div className="container flex h-16 items-center justify-between py-4">
                    <div className="flex items-center font-bold text-xl tracking-tight">
                        <span className="mr-2 text-primary">⚡</span> Vyapar App
                    </div>
                    <UserNav />
                </div>
            </header>
            <div className="grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr] container mx-auto">
                <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
                    <MainNav />
                </aside>
                <main className="flex w-full flex-1 flex-col overflow-hidden">
                    {children}
                </main>
            </div>
        </div>
    )
}


'use client'

import { StoreProvider } from '@/components/store/store-context'
import { StoreHeader } from '@/components/store/store-header'

export default function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <StoreProvider>
            <div className="min-h-screen bg-gray-50">
                <StoreHeader />
                <main className="container mx-auto px-4 py-8">
                    {children}
                </main>
            </div>
        </StoreProvider>
    )
}

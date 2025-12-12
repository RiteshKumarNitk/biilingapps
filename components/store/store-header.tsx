
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { StoreCart } from '@/components/store/cart'
import { useStore } from '@/components/store/store-context'

export function StoreHeader() {
    const { cart, setCart } = useStore()

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background">
            <div className="container flex h-16 items-center justify-between mx-auto px-4">
                <Link href="/store" className="flex items-center space-x-2 font-bold text-xl">
                    <span className="text-primary">⚡</span> Vyapar Store
                </Link>
                <div className="flex items-center space-x-4">
                    <Link href="/dashboard">
                        <Button variant="ghost">Admin Login</Button>
                    </Link>
                    <StoreCart cart={cart} setCart={setCart} />
                </div>
            </div>
        </header>
    )
}


'use client'

import { createContext, useContext, useState } from 'react'

const StoreContext = createContext<any>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<any[]>([])

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(p => p.productId === product.id)
            if (existing) {
                return prev.map(p => p.productId === product.id ? { ...p, quantity: p.quantity + 1 } : p)
            }
            return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]
        })
    }

    return (
        <StoreContext.Provider value={{ cart, setCart, addToCart }}>
            {children}
        </StoreContext.Provider>
    )
}

export const useStore = () => useContext(StoreContext)

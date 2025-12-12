
'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from '@/components/ui/sheet'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitOrder } from '@/actions/store'
import { toast } from 'sonner'
import { useState } from 'react'

export function StoreCart({ cart, setCart }: { cart: any[], setCart: (c: any[]) => void }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' })

    const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    const handleRemove = (index: number) => {
        const newCart = [...cart]
        newCart.splice(index, 1)
        setCart(newCart)
    }

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone || !formData.address) {
            toast.error('Please fill in all details')
            return
        }
        try {
            setLoading(true)
            await submitOrder({
                customerName: formData.name,
                customerPhone: formData.phone,
                customerAddress: formData.address,
                items: cart,
                totalAmount: total
            })
            toast.success('Order placed successfully!')
            setCart([])
            setOpen(false)
        } catch (e) {
            toast.error('Failed to place order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white">
                            {cart.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Your Cart</SheetTitle>
                    <SheetDescription>
                        Review your items and checkout.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                    {cart.length === 0 ? (
                        <p className="text-center text-muted-foreground">Cart is empty</p>
                    ) : (
                        cart.map((item, i) => (
                            <div key={i} className="flex justify-between items-center bg-muted/50 p-2 rounded">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity} x ₹{item.price}</p>
                                </div>
                                <div className="flex items-center">
                                    <p className="font-semibold mr-2">₹{item.quantity * item.price}</p>
                                    <Button variant="ghost" size="icon" onClick={() => handleRemove(i)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="mt-8 space-y-4 border-t pt-4">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <Label>Name</Label>
                                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Phone</Label>
                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div className="space-y-1">
                                <Label>Address</Label>
                                <Input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            </div>
                        </div>

                        <Button className="w-full" disabled={loading} onClick={handleSubmit}>
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

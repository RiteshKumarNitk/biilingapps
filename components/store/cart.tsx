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
import { ShoppingCart, Trash2, CreditCard, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { submitOrder } from '@/actions/store'
import { toast } from 'sonner'
import { useState } from 'react'
import { Separator } from '@/components/ui/separator'

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
                <Button size="icon" variant="outline" className="relative h-11 w-11 rounded-full border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                    {cart.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-sm animate-in zoom-in duration-300">
                            {cart.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col h-full w-full sm:max-w-md border-l border-border/50 shadow-2xl bg-background/95 backdrop-blur-xl p-0">
                <SheetHeader className="p-6 border-b border-border/40 bg-muted/20">
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-6 w-6 text-primary" />
                        Your Cart
                    </SheetTitle>
                    <SheetDescription className="text-base text-muted-foreground/80">
                        Review your items and complete checkout.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[50vh] text-muted-foreground space-y-4">
                                <ShoppingCart className="h-16 w-16 opacity-20" />
                                <p className="text-lg font-medium">Your cart is empty</p>
                                <Button variant="ghost" onClick={() => setOpen(false)} className="mt-4">Continue Shopping</Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item, i) => (
                                    <div key={i} className="flex justify-between items-start p-4 rounded-xl bg-card border border-border/50 shadow-sm transition-all hover:shadow-md hover:border-primary/20 group">
                                        <div className="space-y-1">
                                            <p className="font-semibold text-base line-clamp-1">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity} × <span className="font-mono text-foreground font-medium">₹{item.price}</span></p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <p className="font-bold text-lg text-primary">₹{item.quantity * item.price}</p>
                                            <Button variant="ghost" size="icon" onClick={() => handleRemove(i)} className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mr-2">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {cart.length > 0 && (
                    <div className="p-6 bg-muted/30 border-t border-border/50 space-y-6 slide-in-from-bottom-5 animate-in">
                        <div className="flex justify-between items-end">
                            <span className="text-sm text-muted-foreground font-medium">Total Amount</span>
                            <span className="text-3xl font-bold text-primary tracking-tight">₹{total}</span>
                        </div>

                        <Separator className="bg-border/60" />

                        <div className="space-y-4">
                            <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Delivery Details</h4>
                            <div className="space-y-3">
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground ml-1">Full Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="h-11 bg-background border-input/60 focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground ml-1">Phone Number</Label>
                                    <Input
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="h-11 bg-background border-input/60 focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Enter phone number"
                                        type="tel"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-medium text-muted-foreground ml-1">Address</Label>
                                    <Input
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="h-11 bg-background border-input/60 focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Enter delivery address"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:scale-[1.01] active:scale-[0.99] transition-all bg-primary hover:bg-primary/90" disabled={loading} onClick={handleSubmit}>
                            {loading ? (
                                <span className="flex items-center gap-2">Processing...</span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Confirm Order <ChevronRight className="h-4 w-4" />
                                </span>
                            )}
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    )
}

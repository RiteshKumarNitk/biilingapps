'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/components/store/store-context'
import { toast } from 'sonner'
import { ShoppingBag, Package, Plus } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface ProductCardProps {
    product: any
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useStore()

    const handleAdd = () => {
        addToCart(product)
        toast.success('Added to cart', {
            description: `${product.name} added to your cart.`
        })
    }

    return (
        <Card className="overflow-hidden flex flex-col group border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm hover:-translate-y-1 ring-1 ring-black/5 dark:ring-white/10 h-full">
            <div className="aspect-square relative bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center overflow-hidden">
                {product.image_url ? (
                    <div className="relative w-full h-full">
                        <Image
                            src={product.image_url}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground/50 group-hover:text-primary/50 transition-colors">
                        <Package className="h-12 w-12" />
                        <span className="text-xs font-medium uppercase tracking-widest">No Image</span>
                    </div>
                )}

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-x-2 group-hover:translate-x-0">
                    <Button size="icon" className="h-9 w-9 rounded-full shadow-lg bg-white text-black hover:bg-white/90" onClick={handleAdd}>
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            <CardHeader className="p-4 pb-2 space-y-1">
                <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors cursor-default" title={product.name}>
                        {product.name}
                    </CardTitle>
                    <Badge variant="secondary" className="font-mono font-medium shrink-0 bg-primary/10 text-primary hover:bg-primary/20">
                        ₹{product.price}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1 px-4 py-2">
                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {product.description || <span className="italic opacity-50">No description available for this item.</span>}
                </p>
            </CardContent>

            <CardFooter className="p-4 pt-2">
                <Button className="w-full h-10 shadow-sm bg-primary/90 hover:bg-primary transition-all active:scale-[0.98] group-hover:shadow-primary/25" onClick={handleAdd}>
                    <ShoppingBag className="mr-2 h-4 w-4" /> Add to Cart
                </Button>
            </CardFooter>
        </Card>
    )
}

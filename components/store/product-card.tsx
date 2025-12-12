
'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useStore } from '@/components/store/store-context'
import { toast } from 'sonner'

interface ProductCardProps {
    product: any
}

export function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useStore()

    const handleAdd = () => {
        addToCart(product)
        toast.success('Added to cart')
    }

    return (
        <Card className="overflow-hidden flex flex-col">
            <div className="aspect-square relative bg-muted flex items-center justify-center">
                {/* Placeholder image logic */}
                <span className="text-muted-foreground">No Image</span>
            </div>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-1">{product.name}</CardTitle>
                    <Badge variant="secondary">₹{product.price}</Badge>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2">
                    {product.description || 'No description available'}
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" onClick={handleAdd}>Add to Cart</Button>
            </CardFooter>
        </Card>
    )
}

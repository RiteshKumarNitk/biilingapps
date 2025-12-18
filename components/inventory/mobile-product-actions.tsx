'use client'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { DeleteProductDialog } from './delete-product-dialog'

export function MobileDeleteButton({ productId }: { productId: string }) {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-destructive hover:text-destructive"
                onClick={() => setOpen(true)}
            >
                Delete
            </Button>
            <DeleteProductDialog productId={productId} open={open} onOpenChange={setOpen} />
        </>
    )
}

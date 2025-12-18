'use client'

import { useState } from 'react'
import { deleteProduct } from '@/actions/inventory'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface DeleteProductDialogProps {
    productId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteProductDialog({ productId, open, onOpenChange }: DeleteProductDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        try {
            setLoading(true)
            await deleteProduct(productId)
            toast.success('Item deleted successfully')
            onOpenChange(false)
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete item')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Item</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this item? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

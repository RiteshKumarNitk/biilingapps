"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { ConfirmationDialog } from "./confirmation-dialog"

export interface DeleteButtonProps {
    /** The server action (or any async function) that performs the delete. */
    onDelete: () => Promise<unknown>
    title?: string
    description?: string
    successMessage?: string
    errorMessage?: string
    className?: string
    /** Called after a successful delete, in addition to router.refresh(). */
    onDeleted?: () => void
}

/**
 * A trash-icon button with a styled confirm dialog, toast feedback, and a
 * router refresh on success. Consolidates delete-invoice-button.tsx,
 * delete-payment-button.tsx, and delete-purchase-button.tsx, which were
 * near-identical copies of this same flow around a plain `window.confirm`.
 */
export function DeleteButton({
    onDelete,
    title = "Delete this item?",
    description = "This action cannot be undone.",
    successMessage = "Deleted successfully",
    errorMessage = "Failed to delete",
    className,
    onDeleted,
}: DeleteButtonProps) {
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const router = useRouter()

    const handleConfirm = async () => {
        setLoading(true)
        try {
            await onDelete()
            toast.success(successMessage)
            setOpen(false)
            onDeleted?.()
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                title="Delete"
                className={cn("hover:text-red-600 text-slate-400 transition-colors", className)}
            >
                <Trash2 className="h-4 w-4" />
            </button>
            <ConfirmationDialog
                open={open}
                onOpenChange={setOpen}
                title={title}
                description={description}
                confirmLabel="Delete"
                destructive
                loading={loading}
                onConfirm={handleConfirm}
            />
        </>
    )
}

"use client"

import { Trash2 } from "lucide-react"
import { deletePaymentIn } from "@/actions/payment-in"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeletePaymentButton({ id }: { id: string }) {
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this payment? This will update the party's balance.")) return

        const toastId = toast.loading("Deleting payment...")
        try {
            await deletePaymentIn(id)
            toast.success("Payment deleted successfully", { id: toastId })
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete payment", { id: toastId })
        }
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            title="Delete Payment"
            className="hover:text-red-600 text-slate-400 transition-colors"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    )
}

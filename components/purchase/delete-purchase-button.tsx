"use client"

import { Trash2 } from "lucide-react"
import { deletePurchaseBill } from "@/actions/purchase"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeletePurchaseButton({ id }: { id: string }) {
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this purchase bill? This will decrease stock and adjust balance.")) return

        const toastId = toast.loading("Deleting bill...")
        try {
            await deletePurchaseBill(id)
            toast.success("Purchase bill deleted", { id: toastId })
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete bill", { id: toastId })
        }
    }

    return (
        <Trash2
            className="h-4 w-4 hover:text-red-600 cursor-pointer text-slate-400 transition-colors"
            onClick={handleDelete}
            title="Delete Bill"
        />
    )
}

"use client"

import { Trash2 } from "lucide-react"
import { deleteInvoice } from "@/actions/invoices"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export function DeleteInvoiceButton({ id }: { id: string }) {
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this invoice? This will reverse stock and payments.")) return

        const toastId = toast.loading("Deleting invoice...")
        try {
            await deleteInvoice(id)
            toast.success("Invoice deleted successfully", { id: toastId })
            router.refresh()
        } catch (error: any) {
            toast.error(error.message || "Failed to delete invoice", { id: toastId })
        }
    }

    return (
        <Trash2
            className="h-4 w-4 hover:text-red-600 cursor-pointer text-slate-400 transition-colors"
            onClick={handleDelete}
            title="Delete Invoice"
        />
    )
}

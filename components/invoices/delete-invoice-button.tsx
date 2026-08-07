"use client"

import { deleteInvoice } from "@/actions/invoices"
import { DeleteButton } from "@/components/shared"

export function DeleteInvoiceButton({ id }: { id: string }) {
    return (
        <DeleteButton
            onDelete={() => deleteInvoice(id)}
            title="Delete this invoice?"
            description="This will reverse stock and payments. This action cannot be undone."
            successMessage="Invoice deleted successfully"
            errorMessage="Failed to delete invoice"
        />
    )
}

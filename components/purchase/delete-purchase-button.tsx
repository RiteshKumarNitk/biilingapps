"use client"

import { deletePurchaseBill } from "@/actions/purchase"
import { DeleteButton } from "@/components/shared"

export function DeletePurchaseButton({ id }: { id: string }) {
    return (
        <DeleteButton
            onDelete={() => deletePurchaseBill(id)}
            title="Delete this purchase bill?"
            description="This will decrease stock and adjust the supplier's balance. This action cannot be undone."
            successMessage="Purchase bill deleted"
            errorMessage="Failed to delete bill"
        />
    )
}

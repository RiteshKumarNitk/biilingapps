"use client"

import { deletePaymentIn } from "@/actions/payment-in"
import { DeleteButton } from "@/components/shared"

export function DeletePaymentButton({ id }: { id: string }) {
    return (
        <DeleteButton
            onDelete={() => deletePaymentIn(id)}
            title="Delete this payment?"
            description="This will update the party's balance. This action cannot be undone."
            successMessage="Payment deleted successfully"
            errorMessage="Failed to delete payment"
        />
    )
}

"use client"

import { Button } from "@/components/ui/button"
import { Printer, ShoppingBag } from "lucide-react"
import { convertOrdersToInvoice } from "@/actions/sale-orders"
import { useLoading } from "@/components/providers/loading-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface SaleOrderActionsProps {
    orderId: string
    orderNumber: string
    status: string
}

export function SaleOrderActions({ orderId, orderNumber, status }: SaleOrderActionsProps) {
    const { showLoader, hideLoader } = useLoading()
    const router = useRouter()

    const handlePrint = () => {
        // Redirect to customizable print page
        router.push(`/print/sale-orders/${orderId}`)
    }

    const handleConvert = async () => {
        if (!confirm(`Are you sure you want to convert Order ${orderNumber} to an Invoice?`)) return

        try {
            showLoader()
            await convertOrdersToInvoice([orderId])
            toast.success(`Order ${orderNumber} converted to Invoice successfully!`)
            router.refresh() // Refresh to update status
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            hideLoader()
        }
    }

    return (
        <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" onClick={handlePrint} className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700">
                <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            {status !== 'converted' && (
                <Button onClick={handleConvert} className="bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200">
                    <ShoppingBag className="h-4 w-4 mr-2" /> Convert to Invoice
                </Button>
            )}
        </div>
    )
}

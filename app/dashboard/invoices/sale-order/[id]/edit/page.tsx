
import { getSaleOrder } from '@/actions/sale-orders'
import { SaleOrderForm } from '@/components/sale-order/sale-order-form'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EditSaleOrderPage({ params }: PageProps) {
    const { id } = await params
    const { order, items } = await getSaleOrder(id)

    if (!order) notFound()
    if (order.status === 'converted') {
        // Option: Redirect or show message?
        // Usually we shouldn't edit converted orders. 
        // But for now let's just render. Form might need read-only or handled in submit.
        // Actually, let's keep it editable but maybe warn? Or restrict? 
        // Vyapar allows edit but warns it will affect invoice? OR it locks it. 
        // Let's assume we can edit for now but it won't auto-update the generated invoice.
    }

    const initialData = {
        order_number: order.orderNumber,
        party_id: order.partyId,
        date: order.date,
        due_date: order.dueDate,
        notes: order.notes,
        items: items.map((item: any) => ({
            product_id: item.productId || undefined,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            gst_rate: item.gstRate,
            tax_amount: item.taxAmount,
            total_amount: item.totalAmount
        }))
    }

    return (
        <div className="min-h-screen bg-[#F5F7FA] p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard/invoices/sale-order">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-200">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-800">Edit Sale Order</h1>
                </div>

                <SaleOrderForm initialData={initialData as any} orderId={id} />
            </div>
        </div>
    )
}

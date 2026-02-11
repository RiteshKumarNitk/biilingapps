
import { getSaleOrder } from '@/actions/sale-orders'
import { PrintableSaleOrder } from '@/components/sale-order/printable-sale-order'
import { notFound } from 'next/navigation'

export default async function SaleOrderPrintPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    try {
        const { order, items, tenant } = await getSaleOrder(id)

        if (!order) {
            return notFound()
        }

        return (
            <div className="bg-slate-100 min-h-screen py-8 print:bg-white print:py-0">
                <PrintableSaleOrder
                    order={order}
                    items={items || []}
                    tenant={tenant}
                />
            </div>
        )
    } catch (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Order</h1>
                    <p className="text-slate-600">{(error as Error).message}</p>
                </div>
            </div>
        )
    }
}

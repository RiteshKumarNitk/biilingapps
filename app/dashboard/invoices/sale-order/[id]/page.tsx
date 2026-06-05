
import { getSaleOrder } from '@/actions/sale-orders'
import { SaleOrderView } from '@/components/sale-order/sale-order-view'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SaleOrderActions } from '@/components/sale-order/sale-order-actions'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function SaleOrderDetailsPage({ params }: PageProps) {
    const { id } = await params
    const { order, items, tenant } = await getSaleOrder(id)

    if (!order) notFound()

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 space-y-6 print:bg-white print:p-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/invoices/sale-order">
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:text-slate-700 hover:bg-slate-100">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            Sale Order <span className="text-slate-400 font-normal text-lg">#{order.orderNumber}</span>
                        </h1>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <SaleOrderActions orderId={order.id} orderNumber={order.orderNumber} status={order.status} />
                </div>
            </div>

            {/* View Component */}
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none">
                <SaleOrderView order={order} items={items || []} tenant={tenant} />
            </div>
        </div>
    )
}

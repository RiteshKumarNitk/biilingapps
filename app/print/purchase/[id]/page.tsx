
import { PurchaseBillView } from '@/components/purchase/purchase-bill-view'
import { getPurchaseBillDetails } from '@/actions/purchase'
import { notFound } from 'next/navigation'

export default async function PrintPurchasePage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    try {
        const { bill, items, tenant } = await getPurchaseBillDetails(id)
        if (!bill) notFound()

        return (
            <div className="bg-white min-h-screen p-8 print:p-0">
                <style type="text/css" media="print">
                    {`
                        @page { size: auto; margin: 0mm; }
                        body { margin: 10mm; }
                    `}
                </style>
                <PurchaseBillView bill={bill} items={items || []} tenant={tenant} />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `window.print();`
                    }}
                />
            </div>
        )
    } catch (e) {
        return <div>Error loading bill</div>
    }
}


import { PurchaseBillView } from '@/components/purchase/purchase-bill-view'
import { getPurchaseBillDetails } from '@/actions/purchase'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'
import Link from 'next/link'

export default async function PurchaseBillPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { bill, items, tenant } = await getPurchaseBillDetails(id)
    if (!bill) notFound()

    return (
        <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Purchase Bill Details</h2>
                <div className="flex items-center space-x-2">
                    <Link href={`/print/purchase/${id}`} target="_blank">
                        <Button variant="outline">
                            <Printer className="mr-2 h-4 w-4" /> Print
                        </Button>
                    </Link>
                </div>
            </div>
            <div className="rounded-md border p-4">
                <PurchaseBillView bill={bill} items={items || []} tenant={tenant} />
            </div>
        </div>
    )
}

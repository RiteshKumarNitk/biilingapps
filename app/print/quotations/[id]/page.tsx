import { getQuotation } from '@/actions/quotations'
import { PrintableQuotation } from '@/components/quotations/printable-quotation'
import { notFound } from 'next/navigation'
import React from 'react'

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function QuotationPrintPage({ params }: PageProps) {
    const { id } = await params

    try {
        const { quotation, items, tenant } = await getQuotation(id)

        if (!quotation) return notFound()

        return (
            <PrintableQuotation
                quotation={quotation}
                items={items || []}
                tenant={tenant}
            />
        )
    } catch (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-slate-500">
                Failed to load quotation details.
            </div>
        )
    }
}

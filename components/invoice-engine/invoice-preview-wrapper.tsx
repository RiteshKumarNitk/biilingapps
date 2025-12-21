
"use client"

import { InvoicePreview } from '@/components/invoice-engine/invoice-preview'
import { useRouter } from 'next/navigation'

export function InvoicePreviewWrapper({ data }: { data: any }) {
    const router = useRouter()
    return <InvoicePreview data={data} onClose={() => router.back()} />
}

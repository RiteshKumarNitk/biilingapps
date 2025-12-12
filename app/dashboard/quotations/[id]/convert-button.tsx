
'use client'

import { Button } from '@/components/ui/button'
import { convertQuotationToInvoice } from '@/actions/quotations'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'

interface ConvertButtonProps {
    quotationId: string
    status: string
}

export function ConvertButton({ quotationId, status }: ConvertButtonProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleConvert = async () => {
        try {
            setLoading(true)
            await convertQuotationToInvoice(quotationId)
            toast.success('Converted to Invoice successfully!')
            router.push('/dashboard/invoices')
        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    if (status === 'converted') {
        return <Button disabled variant="secondary"><CheckCircle className="mr-2 h-4 w-4" /> Converted</Button>
    }

    return (
        <Button onClick={handleConvert} disabled={loading}>
            {loading ? 'Converting...' : 'Convert to Invoice'}
        </Button>
    )
}

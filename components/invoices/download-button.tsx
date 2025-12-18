
'use client'

import { Button } from '@/components/ui/button'
import { Download, Printer } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { InvoiceView } from './invoice-view'
import { useReactToPrint } from 'react-to-print'

interface DownloadButtonProps {
    invoice: any
    items: any[]
    tenant: any
}

export function DownloadButton({ invoice, items, tenant }: DownloadButtonProps) {
    const componentRef = useRef<HTMLDivElement>(null)
    const [isPrinting, setIsPrinting] = useState(false)

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Invoice-${invoice.invoice_number}`,
        onBeforeGetContent: () => {
            setIsPrinting(true)
            return Promise.resolve()
        },
        onAfterPrint: () => {
            setIsPrinting(false)
            toast.success('Print dialog opened')
        },
        onPrintError: (error: any) => {
            setIsPrinting(false)
            console.error('Print Error:', error)
            toast.error('Failed to print')
        }
    } as any)

    return (
        <>
            <div style={{ display: 'none' }}>
                <div ref={componentRef}>
                    <InvoiceView invoice={invoice} items={items} tenant={tenant} />
                </div>
            </div>

            <Button variant="outline" onClick={() => handlePrint()} disabled={isPrinting}>
                <Printer className="mr-2 h-4 w-4" />
                {isPrinting ? 'Preparing...' : 'Print / Download PDF'}
            </Button>
        </>
    )
}

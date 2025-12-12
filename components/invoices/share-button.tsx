
'use client'

import { Button } from '@/components/ui/button'
import { Share2, Smartphone, Copy } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface ShareInvoiceButtonProps {
    token: string
    invoiceNumber: string
    customerPhone?: string
}

export function ShareInvoiceButton({ token, invoiceNumber, customerPhone }: ShareInvoiceButtonProps) {

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/invoice/${token}` : ''

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl)
        toast.success('Invoice link copied!')
    }

    const handleWhatsApp = () => {
        const text = `Here is your invoice ${invoiceNumber} from our business: ${shareUrl}`
        const url = customerPhone
            ? `https://wa.me/${customerPhone}?text=${encodeURIComponent(text)}`
            : `https://wa.me/?text=${encodeURIComponent(text)}`

        window.open(url, '_blank')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleWhatsApp}>
                    <Smartphone className="mr-2 h-4 w-4" />
                    Share on WhatsApp
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

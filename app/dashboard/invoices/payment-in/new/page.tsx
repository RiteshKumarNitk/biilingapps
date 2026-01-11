import React from 'react'
import { PaymentInForm } from '@/components/payment-in/payment-in-form'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NewPaymentInPage() {
    return (
        <div className="min-h-screen bg-[#F5F7FA] p-6">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/dashboard/invoices/payment-in">
                        <Button variant="ghost" size="icon" className="hover:bg-slate-200">
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Button>
                    </Link>
                    <h1 className="text-2xl font-semibold text-slate-800">Payment-In</h1>
                </div>

                <PaymentInForm />
            </div>
        </div>
    )
}

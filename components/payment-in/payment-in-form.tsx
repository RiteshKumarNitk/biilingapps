'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Camera, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { getParties } from '@/actions/parties' // existing action
import { createPaymentIn, getNextPaymentRef } from '@/actions/payment-in'
import { toast } from 'sonner'
import { useLoading } from '@/components/providers/loading-provider'

const paymentInSchema = z.object({
    party_id: z.string().min(1, "Party is required"),
    payment_number: z.string().optional(),
    date: z.date(),
    payment_type: z.enum(['cash', 'bank_transfer', 'upi', 'online', 'cheque']),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    notes: z.string().optional(),
    receipt_image: z.any().optional()
})

type PaymentInFormValues = z.infer<typeof paymentInSchema>

export function PaymentInForm() {
    const router = useRouter()
    const { showLoader, hideLoader, isLoading } = useLoading()
    const [parties, setParties] = useState<any[]>([])
    const [selectedParty, setSelectedParty] = useState<any>(null)
    const [balance, setBalance] = useState<number | null>(null)

    // Fetch parties and next Ref No
    useEffect(() => {
        const loadData = async () => {
            const [partiesRes, refRes] = await Promise.all([
                getParties(), // We might need to filter 'customer'? Vyapar usually shows all.
                getNextPaymentRef()
            ])
            setParties(partiesRes || [])
            form.setValue('payment_number', refRes)
        }
        loadData()
    }, [])

    const form = useForm<PaymentInFormValues>({
        resolver: zodResolver(paymentInSchema),
        defaultValues: {
            date: new Date(),
            payment_type: 'cash',
            amount: 0,
            notes: ''
        }
    })

    const handlePartySelect = (partyId: string) => {
        const party = parties.find(p => p.id === partyId)
        if (party) {
            setSelectedParty(party)
            setBalance(party.current_balance)
            form.setValue('party_id', partyId)
        }
    }

    const onSubmit = async (data: PaymentInFormValues) => {
        try {
            showLoader()
            await createPaymentIn({
                party_id: data.party_id,
                amount: data.amount,
                date: data.date,
                mode: data.payment_type,
                payment_number: data.payment_number,
                notes: data.notes
                // image logic skipped for MVP
            })
            toast.success('Payment In recorded successfully')
            router.push('/dashboard/invoices/payment-in')
        } catch (error: any) {
            toast.error(error.message)
            hideLoader()
        }
    }

    const onSaveAndNew = async () => {
        const data = form.getValues()
        const result = await form.trigger()
        if (!result) return

        try {
            showLoader()
            await createPaymentIn({
                party_id: data.party_id,
                amount: data.amount,
                date: data.date,
                mode: data.payment_type,
                payment_number: data.payment_number,
                notes: data.notes
            })
            toast.success('Payment Saved')

            // Reset form for new entry
            form.reset({
                party_id: '',
                date: new Date(),
                payment_type: 'cash',
                amount: 0,
                notes: ''
            })
            setSelectedParty(null)
            setBalance(null)

            // Get new Ref
            const newRef = await getNextPaymentRef()
            form.setValue('payment_number', newRef)

            hideLoader()
        } catch (error: any) {
            toast.error(error.message)
            hideLoader()
        }
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Form Container */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Top Section: Party & Details */}
                <Card className="rounded-xl shadow-sm border-slate-200">
                    <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* LEFT: Party Selection */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">Party <span className="text-red-500">*</span></Label>
                                <Select onValueChange={handlePartySelect}>
                                    <SelectTrigger className="h-11 bg-slate-50 border-slate-200 focus:ring-blue-500">
                                        <SelectValue placeholder="Select Party" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.map(party => (
                                            <SelectItem key={party.id} value={party.id}>
                                                {party.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Current Balance Display */}
                            {selectedParty && (
                                <div className="p-3 bg-blue-50 rounded-lg flex justify-between items-center animate-in fade-in">
                                    <span className="text-sm font-medium text-slate-600">Current Balance</span>
                                    <span className={cn(
                                        "text-lg font-bold",
                                        (balance || 0) >= 0 ? "text-green-600" : "text-red-500"
                                    )}>
                                        ₹ {Math.abs(balance || 0).toLocaleString()} {(balance || 0) >= 0 ? 'Receivable' : 'Payable'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Payment Details */}
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label className="text-slate-600 font-medium">Ref No.</Label>
                                    <Input
                                        {...form.register('payment_number')}
                                        className="h-11 bg-slate-50 border-slate-200"
                                        readOnly
                                    />
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label className="text-slate-600 font-medium">Date</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full h-11 justify-start text-left font-normal bg-white border-slate-200",
                                                    !form.watch('date') && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                                                {form.watch('date') ? format(form.watch('date'), "PPP") : <span>Pick a date</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={form.watch('date')}
                                                onSelect={(date) => form.setValue('date', date || new Date())}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-600 font-medium">Payment Type</Label>
                                <Select
                                    defaultValue="cash"
                                    onValueChange={(val: any) => form.setValue('payment_type', val)}
                                >
                                    <SelectTrigger className="h-11 bg-white border-slate-200">
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="online">Online</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Amount Section */}
                <Card className="rounded-xl shadow-sm border-slate-200">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-1/2 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Received Amount <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                                        <Input
                                            type="number"
                                            {...form.register('amount')}
                                            className="h-14 pl-8 text-xl font-bold border-green-200 focus:border-green-500 focus:ring-green-500 bg-green-50/30"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                {/* Outstanding Balance Preview */}
                                {selectedParty && (
                                    <div className="text-sm text-slate-500 flex justify-between">
                                        <span>Balance after payment:</span>
                                        <span className="font-medium text-slate-700">
                                            ₹ {((balance || 0) - (Number(form.watch('amount')) || 0)).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-1/2 space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-600 font-medium">Description</Label>
                                    <Textarea
                                        {...form.register('notes')}
                                        placeholder="Add notes..."
                                        className="resize-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2 text-blue-600 cursor-pointer hover:text-blue-700">
                                    <Camera className="h-4 w-4" />
                                    <span className="text-sm font-medium">Attach Image</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="h-11 px-6 border-slate-300 text-slate-600"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onSaveAndNew}
                        disabled={isLoading}
                        className="h-11 px-6 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                        Save & New
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="h-11 px-8 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200"
                    >
                        {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                </div>

            </form>
        </div>
    )
}

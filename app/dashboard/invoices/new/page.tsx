
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Save, Share2, Settings, Plus, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionItem, STATES } from '@/components/transactions/shared'
import { getProducts } from '@/actions/inventory'
import { getParties, createParty } from '@/actions/parties'
import { createInvoice } from '@/actions/invoices'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { ModernLoader, FullPageLoader } from '@/components/ui/modern-loader'

export default function AddSalePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Data Lists
    const [products, setProducts] = useState<any[]>([])
    const [parties, setParties] = useState<any[]>([])

    // Form State
    const [transactionType, setTransactionType] = useState<'credit' | 'cash'>('credit')
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(Math.random() * 10000)}`) // Mock autogen
    const [invoiceDate, setInvoiceDate] = useState<Date>(new Date())
    const [stateOfSupply, setStateOfSupply] = useState('Karnataka') // Default

    // Party Details
    const [selectedPartyId, setSelectedPartyId] = useState<string>('')
    const [billingName, setBillingName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [billingAddress, setBillingAddress] = useState('')
    const [shippingAddress, setShippingAddress] = useState('') // Sync with billing by default?

    // Items
    const [items, setItems] = useState<TransactionItem[]>([
        {
            rowId: '1',
            productId: '',
            description: '',
            quantity: 1,
            unit: 'PCS',
            price: 0,
            taxType: 'exclusive',
            discountValue: 0,
            discountType: 'percentage',
            gstRate: 0,
            taxAmount: 0,
            amount: 0
        }
    ])

    // Payment
    const [paymentType, setPaymentType] = useState('cash')
    const [roundOff, setRoundOff] = useState(0)
    const [paidAmount, setPaidAmount] = useState(0)

    // Derived Totals
    const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 0), 0)
    // Note: To get precise total Tax and Discount, we sum from rows
    // Row Amount is (Taxable + Tax) usually.
    // Let's recalculate accurately
    const totalTax = items.reduce((acc, item) => acc + (item.taxAmount || 0), 0)
    const subTotal = items.reduce((acc, item) => acc + (item.amount - item.taxAmount), 0) // Roughly

    const itemsTotal = items.reduce((acc, item) => acc + (item.amount || 0), 0)
    const grandTotal = Math.round((itemsTotal + roundOff) * 100) / 100
    const balanceDue = Math.max(0, grandTotal - paidAmount)

    // Load Data
    useEffect(() => {
        const load = async () => {
            try {
                const [pData, partyData] = await Promise.all([
                    getProducts(1, 1000),
                    getParties('customer')
                ])
                setProducts(pData.data || [])
                setParties(partyData || [])
            } catch (e) {
                toast.error("Failed to load data")
            } finally {
                setInitialLoading(false)
            }
        }
        load()
    }, [])

    // Handle Party Selection
    const handlePartySelect = (id: string) => {
        const party = parties.find(p => p.id === id)
        if (party) {
            setSelectedPartyId(id)
            setBillingName(party.name)
            setPhoneNumber(party.phone || '')
            setBillingAddress(party.address || '')
            // setShippingAddress(party.address || '') 
        }
    }

    // Submit
    const handleSave = async () => {
        if (!selectedPartyId && transactionType === 'credit') {
            toast.error("Please select a party for Credit Sale")
            return
        }

        if (items.length === 0 || !items[0].productId) {
            toast.error("Please add at least one item")
            return
        }

        try {
            setLoading(true)

            // Map to existing API structure
            // We need to match InvoiceFormValues from schema
            const payload: any = {
                invoice_number: invoiceNumber,
                party_name: billingName || "Cash Sale", // Or Party Name
                date: invoiceDate,
                status: 'generated',
                payment_status: balanceDue <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid'),
                items: items.map(item => ({
                    product_id: item.productId,
                    description: item.description,
                    quantity: item.quantity,
                    unit_price: item.price,
                    gst_rate: item.gstRate,
                    total_amount: item.amount
                }))
            }

            await createInvoice(payload)
            toast.success("Sale Saved Successfully!")
            router.push('/dashboard/invoices')

        } catch (e: any) {
            toast.error(e.message)
        } finally {
            setLoading(false)
        }
    }

    if (initialLoading) {
        return <FullPageLoader />
    }

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#F5F7FA]">
            {/* 1. TOP HEADER */}
            <header className="bg-white border-b px-4 py-2 flex items-center justify-between shadow-sm z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-slate-800">Sale</h1>
                    <div className="flex items-center bg-slate-100 rounded-full p-1 border">
                        <button
                            onClick={() => setTransactionType('credit')}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                                transactionType === 'credit' ? "bg-red-500 text-white shadow" : "text-slate-500 hover:text-slate-700"
                            )}>
                            Credit
                        </button>
                        <button
                            onClick={() => setTransactionType('cash')}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                                transactionType === 'cash' ? "bg-green-500 text-white shadow" : "text-slate-500 hover:text-slate-700"
                            )}>
                            Cash
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Invoice #</span>
                        <Input
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            className="h-8 w-32 border-slate-300 font-semibold text-slate-700"
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-8 w-[140px] justify-start text-left font-normal border-slate-300">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(invoiceDate, "dd/MM/yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={invoiceDate} onSelect={(d) => d && setInvoiceDate(d)} initialFocus />
                        </PopoverContent>
                    </Popover>

                    <Select value={stateOfSupply} onValueChange={setStateOfSupply}>
                        <SelectTrigger className="h-8 w-[160px] border-slate-300 text-xs">
                            <SelectValue placeholder="State of Supply" />
                        </SelectTrigger>
                        <SelectContent className="h-60">
                            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Button variant="ghost" size="icon" className="h-8 w-8"><Settings className="h-4 w-4" /></Button>
                </div>
            </header>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {/* 2. CUSTOMER DETAILS */}
                <Card className="p-4 border shadow-sm rounded-lg bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Billing Details */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Bill To</label>
                                <Button variant="link" className="h-auto p-0 text-blue-600 text-xs">+ Add Party</Button>
                            </div>

                            <div className="relative">
                                <Select value={selectedPartyId} onValueChange={handlePartySelect}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-10">
                                        <SelectValue placeholder="Search Customer Name..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {parties.map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Input
                                    placeholder="Phone Number"
                                    value={phoneNumber}
                                    onChange={e => setPhoneNumber(e.target.value)}
                                    className="bg-slate-50 border-slate-200 h-9"
                                />
                                {transactionType === 'credit' && (
                                    <div className="border bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs flex items-center justify-between">
                                        <span>Balance:</span>
                                        <span className="font-bold">₹ 0.00</span>
                                    </div>
                                )}
                            </div>

                            <Textarea
                                placeholder="Billing Address"
                                value={billingAddress}
                                onChange={e => setBillingAddress(e.target.value)}
                                className="min-h-[60px] bg-slate-50 border-slate-200 text-xs resize-none"
                            />
                        </div>

                        {/* Shipping Details */}
                        <div className="space-y-3 relative">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Ship To</label>
                                <div className="flex items-center gap-2">
                                    <Switch id="same-addr" onCheckedChange={(c) => { if (c) setShippingAddress(billingAddress) }} />
                                    <label htmlFor="same-addr" className="text-xs text-slate-500 cursor-pointer">Same as billing</label>
                                </div>
                            </div>
                            <Textarea
                                placeholder="Shipping Address"
                                value={shippingAddress}
                                onChange={e => setShippingAddress(e.target.value)}
                                className="min-h-[100px] bg-slate-50 border-slate-200 text-xs resize-none"
                            />
                        </div>
                    </div>
                </Card>

                {/* 3. ITEM TABLE */}
                <div className="min-h-[300px]">
                    <TransactionTable
                        items={items}
                        setItems={setItems}
                        products={products}
                    />
                </div>

                {/* 4. BOTTOM SUMMARY */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-20">
                    <div className="md:col-span-6 space-y-4">
                        {/* Notes / T&C */}
                        <Textarea placeholder="Private Note" className="h-20 text-xs bg-white" />
                    </div>

                    <div className="md:col-span-6 bg-white rounded-lg border shadow-sm p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-800">{itemsTotal.toFixed(2)}</span>
                        </div>
                        {/* Breakdown could go here */}
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Round Off</span>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    value={roundOff}
                                    onChange={e => setRoundOff(parseFloat(e.target.value) || 0)}
                                    className="h-6 w-16 text-right text-xs"
                                />
                            </div>
                        </div>

                        <div className="border-t pt-3 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-800">Total</span>
                            <span className="text-lg font-bold text-slate-800">₹ {grandTotal.toFixed(2)}</span>
                        </div>

                        {/* Payment Section */}
                        <div className="bg-slate-50 p-3 rounded border space-y-3 mt-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold uppercase text-slate-500">Received</label>
                                <div className="flex items-center gap-2">
                                    <Select value={paymentType} onValueChange={setPaymentType}>
                                        <SelectTrigger className="h-7 w-24 text-xs bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="bank">Bank</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                                <Input
                                    type="number"
                                    value={paidAmount}
                                    onChange={e => setPaidAmount(parseFloat(e.target.value))}
                                    className="h-10 text-right font-bold text-green-600"
                                />
                            </div>
                            <div className="flex justify-between text-xs pt-1">
                                <span className="text-slate-500">Balance Due</span>
                                <span className={cn("font-bold", balanceDue > 0 ? "text-red-500" : "text-green-500")}>
                                    ₹ {balanceDue.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. FIXED FOOTER */}
            <footer className="bg-white border-t p-3 px-6 flex items-center justify-between z-30">
                <div className="flex items-center gap-4">
                    <Select defaultValue="none">
                        <SelectTrigger className="h-9 w-40 border-slate-300">
                            <SelectValue placeholder="E-Invoice" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="generate">Generate</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="lg" className="h-11">
                        <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                    <Button onClick={handleSave} disabled={loading} size="lg" className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-200">
                        {loading ? "Saving..." : "Save"}
                    </Button>
                </div>
            </footer>
        </div>
    )
}

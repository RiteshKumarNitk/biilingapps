
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
import { getParties, createParty, getParty } from '@/actions/parties'
import { createInvoice, getLastInvoiceNumber } from '@/actions/invoices'
import { getQuotation } from '@/actions/quotations'
import { getSaleOrder } from '@/actions/sale-orders'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { ModernLoader, FullPageLoader } from '@/components/ui/modern-loader'

export default function AddSalePage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Check for sources
    const fromEstimateId = searchParams.get('from_estimate')
    const fromProformaId = searchParams.get('from_proforma')
    const fromSaleOrderId = searchParams.get('from_sale_order')
    // We treat proforma & estimate effectively the same way since they are both from 'quotations' table
    const quotationId = fromEstimateId || fromProformaId || undefined

    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Data Lists
    const [products, setProducts] = useState<any[]>([])
    const [parties, setParties] = useState<any[]>([])

    // Form State
    const [transactionType, setTransactionType] = useState<'credit' | 'cash'>('credit') // Default will change if source data implies
    const [invoiceNumber, setInvoiceNumber] = useState(`INV-${Math.floor(Math.random() * 10000)}`) // Mock autogen
    const [invoiceDate, setInvoiceDate] = useState<Date>(new Date())
    const [stateOfSupply, setStateOfSupply] = useState('Karnataka') // Default

    // Party Details
    const [selectedPartyId, setSelectedPartyId] = useState<string>('')
    const [billingName, setBillingName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [billingAddress, setBillingAddress] = useState('')
    const [shippingAddress, setShippingAddress] = useState('') // Sync with billing by default?
    const [selectedPartyBalance, setSelectedPartyBalance] = useState(0)

    // Items
    const [items, setItems] = useState<TransactionItem[]>([
        {
            rowId: '1',
            productId: '',
            description: '',
            quantity: 1,
            unit: 'PCS',
            price: 0,
            taxType: 'inclusive',
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
    const [isFullPayment, setIsFullPayment] = useState(false) // Default to false or maybe true logic in effect
    const [notes, setNotes] = useState('') // Private Note

    // Derived Totals
    const totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 0), 0)
    const itemsTotal = items.reduce((acc, item) => acc + (item.amount || 0), 0)
    const grandTotal = Math.round((itemsTotal + roundOff) * 100) / 100
    const balanceDue = Math.max(0, grandTotal - paidAmount)

    // Sync full payment
    useEffect(() => {
        if (isFullPayment) {
            setPaidAmount(grandTotal)
        }
    }, [grandTotal, isFullPayment])

    // Load Data
    useEffect(() => {
        const load = async () => {
            try {
                const [pData, partyData, nextInv] = await Promise.all([
                    getProducts(1, 1000),
                    getParties('customer', '', Date.now()),
                    getLastInvoiceNumber()
                ])
                setProducts(pData.data || [])
                setParties(partyData || [])
                if (nextInv) {
                    setInvoiceNumber(nextInv)
                }

                // If coming from Quotation
                if (quotationId) {
                    try {
                        const { quotation, items: qItems, tenant } = await getQuotation(quotationId)
                        if (quotation) {
                            // Populate party info? 
                            // We need full party object to be clean, but for now we trust ID if in list
                            if (quotation.party_id) {
                                // Find party in list to get balance etc
                                const p = partyData?.find(pd => pd.id === quotation.party_id)
                                if (p) {
                                    setSelectedPartyId(p.id)
                                    setBillingName(p.name)
                                    setPhoneNumber(p.phone || '')
                                    setBillingAddress(p.address || '')
                                    // shipping
                                    setSelectedPartyBalance(p.current_balance || 0)
                                } else {
                                    // Party loaded explicitly if needed, but assuming list covers active ones
                                    setSelectedPartyId(quotation.party_id)
                                    setBillingName(quotation.party_name || '')
                                }
                            }

                            // Items
                            if (qItems && qItems.length > 0) {
                                const newItems: TransactionItem[] = qItems.map((qi: any, idx: number) => ({
                                    rowId: idx.toString(),
                                    productId: qi.product_id,
                                    description: qi.description,
                                    quantity: qi.quantity,
                                    unit: 'PCS',
                                    price: qi.unit_price,
                                    taxType: 'exclusive',
                                    discountValue: 0,
                                    discountType: 'percentage',
                                    gstRate: qi.gst_rate || 0,
                                    taxAmount: qi.tax_amount || 0,
                                    amount: qi.total_amount
                                }))
                                setItems(newItems)

                                // Set notes if any
                                if (quotation.notes) setNotes(quotation.notes)
                            }
                        }
                    } catch (err) {
                        toast.error("Failed to load source quotation")
                    }
                }
                // If coming from Sale Order
                else if (fromSaleOrderId) {
                    try {
                        const { order, items: oItems } = await getSaleOrder(fromSaleOrderId)
                        if (order) {
                            if (order.party_id) {
                                const p = partyData?.find(pd => pd.id === order.party_id)
                                if (p) {
                                    setSelectedPartyId(p.id)
                                    setBillingName(p.name)
                                    setPhoneNumber(p.phone || '')
                                    setBillingAddress(p.address || '')
                                    setSelectedPartyBalance(p.current_balance || 0)
                                } else {
                                    setSelectedPartyId(order.party_id)
                                    setBillingName(order.party_name || '')
                                }
                            }

                            if (oItems && oItems.length > 0) {
                                const newItems: TransactionItem[] = oItems.map((oi: any, idx: number) => ({
                                    rowId: idx.toString(),
                                    productId: oi.product_id,
                                    description: oi.description,
                                    quantity: oi.quantity,
                                    unit: 'PCS',
                                    price: oi.unit_price,
                                    taxType: 'exclusive',
                                    discountValue: 0,
                                    discountType: 'percentage',
                                    gstRate: oi.gst_rate || 0,
                                    taxAmount: oi.tax_amount || 0,
                                    amount: oi.total_amount
                                }))
                                setItems(newItems)
                            }
                        }
                    } catch (err) {
                        toast.error("Failed to load source sale order")
                    }
                }

            } catch (e) {
                toast.error("Failed to load initial data")
            } finally {
                setInitialLoading(false)
            }
        }
        load()
    }, [quotationId, fromSaleOrderId])

    // Handle Party Selection
    const handlePartySelect = async (id: string) => {
        const party = parties.find(p => p.id === id)
        if (party) {
            setSelectedPartyId(id)
            setBillingName(party.name)
            setPhoneNumber(party.phone || '')
            setBillingAddress(party.address || '')
            setSelectedPartyBalance(party.current_balance || 0)

            try {
                // Fetch fresh balance in background to ensure accuracy
                const freshParty = await getParty(id)
                if (freshParty) {
                    setParties(prev => prev.map(p => p.id === id ? freshParty : p))
                    setSelectedPartyBalance(freshParty.current_balance || 0)
                }
            } catch (e) {
                console.error("Failed to refresh party balance", e)
            }
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
                party_id: selectedPartyId, // Include Party ID
                party_name: billingName || "Cash Sale", // Or Party Name
                party_address: billingAddress,
                shipping_address: shippingAddress,
                party_phone: phoneNumber,
                date: invoiceDate,
                status: 'generated',
                payment_status: balanceDue <= 0 ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid'),
                received_amount: paidAmount,
                notes: notes,
                items: items.map(item => {
                    // 1. Calculate Discount Amount
                    const baseAmount = (item.quantity || 0) * (item.price || 0)
                    let discountAmt = 0
                    if (item.discountType === 'percentage') {
                        discountAmt = baseAmount * ((item.discountValue || 0) / 100)
                    } else {
                        discountAmt = item.discountValue || 0
                    }

                    // 2. Normalize to Exclusive if Inclusive
                    let finalUnitPrice = item.price
                    let finalDiscount = discountAmt
                    let finalTaxAmount = item.taxAmount
                    let finalAmount = item.amount

                    // Note: item.taxAmount is already calculated correctly by the table logic
                    // We just need to adjust unit_price and discount to be ex-tax for consistent DB storage
                    if (item.taxType === 'inclusive') {
                        // Logic: Inclusive Price = Unit Price * (1 + GST)
                        const gstFactor = 1 + ((item.gstRate || 0) / 100)

                        // We store unit_price as EXCLUSIVE in DB usually (practice varies, but let's assume exclusive)
                        finalUnitPrice = item.price / gstFactor
                        finalDiscount = discountAmt / gstFactor

                        // Recalculate tax if strict precision needed, but using table value is safer for "what you see is what you get"
                    }

                    return {
                        product_id: item.productId,
                        description: item.description,
                        quantity: item.quantity,
                        unit: item.unit,
                        unit_price: finalUnitPrice,
                        gst_rate: item.gstRate,
                        discount: finalDiscount,
                        tax_amount: finalTaxAmount,
                        total_amount: finalAmount
                    }
                })
            }

            // Important: Mark Source as "converted" if applicable? 
            // The actions createInvoice doesn't do this automatically.
            // We should do it here separately OR update createInvoice action to accept 'source_id' and 'source_type'.
            // For now, let's keep it simple as user asked for "fill details".
            // Automatic status update on source is handled by the "Convert" buttons in backend usually (direct conversion).
            // But if they use this form flow, the source IS NOT getting updated. 
            // This is a known gap. To fix "Convert To Invoice" flows correctly it should ideally happen purely backend OR call a specific "convert" action.
            // However, filling this form gives them chance to edit.
            // We ideally need to pass `from_estimate` ID to the backend createInvoice to link them?
            // createInvoice action doesn't support it yet.

            await createInvoice(payload)

            // Should we update the quotation status manually here?
            // If we have quotationId, we probably should mark it converted?
            // That's risky if the user cancels or partial conversion. 
            // Usually "Convert to Invoice" implies full conversion.
            // Let's stick to saving invoice first.

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
                    <h1 className="text-xl font-bold text-slate-800">
                        {quotationId ? 'Convert from Estimate' : (fromSaleOrderId ? 'Convert from Order' : 'Sale')}
                    </h1>
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

            <div className="flex-1 overflow-auto mt-2 space-y-4">
                {/* 2. CUSTOMER DETAILS */}
                <Card className="p-4 border shadow-sm rounded-lg bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Billing Details */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">Bill To</label>
                                <Button
                                    variant="link"
                                    className="h-auto p-0 text-blue-600 text-xs"
                                    onClick={() => router.push('/dashboard/parties/create')}
                                >
                                    + Add Party
                                </Button>
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
                                {transactionType === 'credit' && selectedPartyId && (
                                    <div className="border bg-red-50 text-red-600 px-3 py-1.5 rounded text-xs flex items-center justify-between">
                                        <span>Balance:</span>
                                        <span className={cn("font-bold", (selectedPartyBalance || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                                            ₹ {Math.abs(selectedPartyBalance || 0).toLocaleString()} {(selectedPartyBalance || 0) >= 0 ? ' (Rec)' : ' (Pay)'}
                                        </span>
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
                        <Card className="p-4 border shadow-sm rounded-lg bg-white h-full">
                            <label className="text-sm font-semibold text-slate-700 block mb-2">Notes / Terms</label>
                            <Textarea
                                placeholder="Add private notes or specific terms for this invoice..."
                                className="min-h-[120px] text-sm bg-slate-50 resize-y border-slate-200 focus:bg-white transition-colors"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                        </Card>
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
                        {/* Payment Section - Modernized */}
                        <div className="bg-slate-50 p-4 rounded-lg border space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Received</label>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="full-pay"
                                        checked={isFullPayment}
                                        onCheckedChange={(c) => {
                                            setIsFullPayment(c)
                                            if (c) setPaidAmount(grandTotal)
                                        }}
                                    />
                                    <label htmlFor="full-pay" className="text-xs font-semibold text-slate-600 cursor-pointer">
                                        Received Full {transactionType === 'cash' ? '(Cash)' : ''}
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <Select value={paymentType} onValueChange={setPaymentType}>
                                    <SelectTrigger className="h-10 w-28 bg-white text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="bank">Bank</SelectItem>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                    </SelectContent>
                                </Select>

                                <div className="relative flex-1">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <Input
                                        type="number"
                                        value={paidAmount}
                                        onChange={e => {
                                            setPaidAmount(parseFloat(e.target.value) || 0)
                                            if (isFullPayment) setIsFullPayment(false) // Uncheck if manually edited
                                        }}
                                        className={cn(
                                            "h-10 pl-8 text-right font-bold text-lg",
                                            paidAmount > 0 ? "text-green-600 border-green-200 focus-visible:ring-green-500" : "text-slate-600"
                                        )}
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                <span className="text-xs text-slate-500 font-medium">Balance Due</span>
                                <span className={cn("text-lg font-bold", balanceDue > 0 ? "text-red-500" : "text-slate-400")}>
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

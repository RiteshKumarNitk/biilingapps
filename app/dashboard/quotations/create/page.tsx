'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Save, Share2, Settings, FileText } from 'lucide-react'
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
import { getParties, getParty } from '@/actions/parties'
import { createQuotation, getLastQuotationNumber } from '@/actions/quotations'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { FullPageLoader } from '@/components/ui/modern-loader'

export default function CreateQuotationPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [initialLoading, setInitialLoading] = useState(true)

    // Data Lists
    const [products, setProducts] = useState<any[]>([])
    const [parties, setParties] = useState<any[]>([])

    // Form State
    const [quotationNumber, setQuotationNumber] = useState('')
    const [quotationDate, setQuotationDate] = useState<Date>(new Date())
    const [validUntil, setValidUntil] = useState<Date>(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)) // +30 days
    const [stateOfSupply, setStateOfSupply] = useState('Karnataka')

    // Party Details
    const [selectedPartyId, setSelectedPartyId] = useState<string>('')
    const [billingName, setBillingName] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [billingAddress, setBillingAddress] = useState('')
    const [shippingAddress, setShippingAddress] = useState('')
    const [selectedPartyBalance, setSelectedPartyBalance] = useState(0)
    const [notes, setNotes] = useState('')

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

    // Derived Totals
    const itemsTotal = items.reduce((acc, item) => acc + (item.amount || 0), 0)
    // Basic rounding logic similar to invoices
    const grandTotal = Math.round(itemsTotal * 100) / 100

    // Load Data
    useEffect(() => {
        const load = async () => {
            try {
                const [pData, partyData, nextNum] = await Promise.all([
                    getProducts(1, 1000),
                    getParties('customer', '', Date.now()),
                    getLastQuotationNumber('estimate')
                ])
                setProducts(pData.data || [])
                setParties(partyData || [])
                if (nextNum) {
                    setQuotationNumber(nextNum)
                } else {
                    setQuotationNumber(`EST-${Math.floor(Math.random() * 10000)}`)
                }
            } catch (e) {
                toast.error("Failed to load data")
            } finally {
                setInitialLoading(false)
            }
        }
        load()
    }, [])

    // Handle Party Selection
    const handlePartySelect = async (id: string) => {
        const party = parties.find(p => p.id === id)
        if (party) {
            setSelectedPartyId(id)
            setBillingName(party.name)
            setPhoneNumber(party.phone || '')
            setBillingAddress(party.address || '')
            setSelectedPartyBalance(party.currentBalance || 0)

            try {
                const freshParty = await getParty(id)
                if (freshParty) {
                    setParties(prev => prev.map(p => p.id === id ? freshParty : p))
                    setSelectedPartyBalance(freshParty.currentBalance || 0)
                }
            } catch (e) {
                console.error("Failed to refresh party balance", e)
            }
        }
    }

    // Submit
    const handleSave = async () => {
        if (!selectedPartyId) {
            toast.error("Please select a party")
            return
        }

        if (items.length === 0 || !items[0].productId) {
            toast.error("Please add at least one item")
            return
        }

        try {
            setLoading(true)

            // Prepare Payload
            const payload: any = {
                quotation_number: quotationNumber,
                party_id: selectedPartyId,
                party_name: billingName,
                party_address: billingAddress,
                shipping_address: shippingAddress,
                party_phone: phoneNumber,
                date: quotationDate,
                valid_until: validUntil,
                type: 'estimate',
                status: 'open',
                items: items.map(item => {
                    // Normalize Logic (Exclusive storage)
                    const baseAmount = (item.quantity || 0) * (item.price || 0)
                    let discountAmt = 0
                    if (item.discountType === 'percentage') {
                        discountAmt = baseAmount * ((item.discountValue || 0) / 100)
                    } else {
                        discountAmt = item.discountValue || 0
                    }

                    let finalUnitPrice = item.price
                    let finalDiscount = discountAmt
                    const finalTaxAmount = item.taxAmount
                    const finalAmount = item.amount

                    if (item.taxType === 'inclusive') {
                        const gstFactor = 1 + ((item.gstRate || 0) / 100)
                        finalUnitPrice = item.price / gstFactor
                        finalDiscount = discountAmt / gstFactor
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
                }),
                // Top Level Totals
                subtotal: items.reduce((acc, item) => acc + ((item.quantity * item.price) - (item.discountValue || 0)), 0), // Approx
                // Better subtotal: Sum of (qty * unit_price) - discount
                // Actually let's just sum based on normalization:
                // Actually the API expects 'subtotal', 'total_gst', 'grand_total', 'discount_amount' (global)
                // We should calculate carefully.
                // Current UI doesn't have Global Discount field, only line items.
                // So Global Discount = Sum of Line Discounts
                discount_amount: items.reduce((acc, item) => {
                    const base = item.quantity * item.price
                    const disc = item.discountType === 'percentage' ? base * (item.discountValue / 100) : item.discountValue
                    return acc + (disc || 0)
                }, 0),
                total_gst: items.reduce((acc, item) => acc + (item.taxAmount || 0), 0),
                grand_total: grandTotal,
                notes: notes // Pass notes state
            }
            // Recalculate Subtotal properly: GrandTotal - GST (+ Discount? No, Subtotal usually implies Taxable Value)
            payload.subtotal = grandTotal - payload.total_gst

            await createQuotation(payload)
            toast.success("Estimate Created Successfully!")
            router.push('/dashboard/quotations')

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
                    <h1 className="text-xl font-bold text-slate-800">New Estimate</h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Estimate #</span>
                        <Input
                            value={quotationNumber}
                            onChange={(e) => setQuotationNumber(e.target.value)}
                            className="h-8 w-32 border-slate-300 font-semibold text-slate-700"
                        />
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-8 w-[140px] justify-start text-left font-normal border-slate-300">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(quotationDate, "dd/MM/yyyy")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={quotationDate} onSelect={(d) => d && setQuotationDate(d)} initialFocus />
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
                                {selectedPartyId && (
                                    <div className="border bg-slate-50 text-slate-600 px-3 py-1.5 rounded text-xs flex items-center justify-between">
                                        <span>Balance:</span>
                                        <span className={cn("font-bold", (selectedPartyBalance || 0) >= 0 ? "text-green-600" : "text-red-600")}>
                                            ₹ {Math.abs(selectedPartyBalance || 0).toLocaleString()}
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
                        <Textarea
                            placeholder="Terms & Conditions / Notes"
                            className="h-24 text-xs bg-white"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>

                    <div className="md:col-span-6 bg-white rounded-lg border shadow-sm p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="font-medium text-slate-800">
                                {Number(grandTotal - items.reduce((acc, item) => acc + (item.taxAmount || 0), 0)).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Total GST</span>
                            <span className="font-medium text-slate-800">
                                {items.reduce((acc, item) => acc + (item.taxAmount || 0), 0).toFixed(2)}
                            </span>
                        </div>

                        <div className="border-t pt-3 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-800">Total Estimate</span>
                            <span className="text-lg font-bold text-slate-800">₹ {grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 6. FIXED FOOTER */}
            <footer className="bg-white border-t p-3 px-6 flex items-center justify-between z-30">
                <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Create clear and professional estimates</span>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" size="lg" className="h-11">
                        <Share2 className="h-4 w-4 mr-2" /> Share
                    </Button>
                    <Button onClick={handleSave} disabled={loading} size="lg" className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-lg shadow-blue-200">
                        {loading ? "Saving..." : "Save Estimate"}
                    </Button>
                </div>
            </footer>
        </div>
    )
}

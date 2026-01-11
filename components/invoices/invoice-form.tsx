'use client'

import * as React from 'react'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { invoiceSchema, InvoiceFormValues } from '@/lib/schemas/invoice'
import { createInvoice } from '@/actions/invoices'
import { getProducts, getUnits } from '@/actions/inventory'
import { getParties } from '@/actions/parties'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'

import { useLoading } from '@/components/providers/loading-provider'

import { createInvoice, getLastInvoiceNumber } from '@/actions/invoices'

export function InvoiceForm() {
    const router = useRouter()
    const { showLoader, hideLoader, isLoading } = useLoading()
    const [loading, setLoading] = React.useState(false)
    const [products, setProducts] = React.useState<any[]>([])
    const [parties, setParties] = React.useState<any[]>([])
    const [units, setUnits] = React.useState<any[]>([])
    const [selectedParty, setSelectedParty] = React.useState<any>(null)

    React.useEffect(() => {
        const loadData = async () => {
            const [prods, parts, unitList, nextInvNum] = await Promise.all([
                getProducts(),
                getParties(),
                getUnits(),
                getLastInvoiceNumber()
            ])

            setProducts(prods || [])
            setParties(parts || [])
            setUnits(unitList || [])

            // Set next invoice number if available
            if (nextInvNum) {
                form.setValue('invoice_number', nextInvNum)
            }
        }
        loadData()
    }, [])

    const form = useForm<InvoiceFormValues>({
        resolver: zodResolver(invoiceSchema),
        defaultValues: {
            invoice_number: '',
            date: new Date(),
            items: [{ product_id: '', description: '', quantity: 1, unit_price: 0, gst_rate: 0, total_amount: 0, unit: 'pcs', discount: 0 }]
        }
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: 'items',
    })

    const watchItems = useWatch({
        control: form.control,
        name: 'items',
    })

    // Calculate totals
    const subtotal = watchItems.reduce((acc, item) => acc + ((item.quantity * item.unit_price) - (item.discount || 0)), 0)
    const totalTax = watchItems.reduce((acc, item) => {
        const taxable = (item.quantity * item.unit_price) - (item.discount || 0)
        return acc + (taxable * (item.gst_rate / 100))
    }, 0)
    const grandTotal = subtotal + totalTax

    async function onSubmit(data: InvoiceFormValues) {
        try {
            showLoader()
            const itemsWithTotals = data.items.map(item => {
                const taxable = (item.quantity * item.unit_price) - (item.discount || 0)
                const tax = taxable * (item.gst_rate / 100)
                return {
                    ...item,
                    tax_amount: tax, // Save this
                    total_amount: taxable + tax
                }
            })

            const grandTotal = itemsWithTotals.reduce((acc, item) => acc + item.total_amount, 0)
            const received = data.payment_status === 'paid' ? grandTotal : 0

            await createInvoice({
                ...data,
                items: itemsWithTotals,
                received_amount: received
            })
            toast.success('Invoice created successfully')
            router.push('/dashboard/invoices')
        } catch (error: any) {
            toast.error(error.message)
            hideLoader()
        }
    }

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            form.setValue(`items.${index}.product_id`, product.id)
            form.setValue(`items.${index}.description`, product.name)
            form.setValue(`items.${index}.unit_price`, product.price)
            form.setValue(`items.${index}.gst_rate`, product.gst_rate)
            form.setValue(`items.${index}.discount`, 0)
            if (product.unit) {
                form.setValue(`items.${index}.unit`, product.unit)
            }
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500 pb-20">
                <div className="grid gap-6 md:grid-cols-3">
                    <div className="md:col-span-1 space-y-2">
                        <FormLabel className="text-foreground/90 font-medium">Customer Name</FormLabel>
                        <div className="relative">
                            <FormField
                                control={form.control}
                                name="party_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val)
                                                const party = parties.find(p => p.id === val)
                                                if (party) {
                                                    form.setValue('party_name', party.name)
                                                    setSelectedParty(party)
                                                }
                                            }}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="h-12 bg-background/50 backdrop-blur-sm focus:ring-primary/20 font-medium">
                                                    <SelectValue placeholder="Select Client" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <div className="p-2">
                                                    <Input
                                                        placeholder="Search..."
                                                        className="h-8 mb-2"
                                                        onChange={(e) => {
                                                            // Basic client-side filtering logic could be added here or fetch server-side
                                                            // For now relying on simple list
                                                        }}
                                                    />
                                                </div>
                                                {parties.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Hidden field to store name */}
                            <FormField
                                control={form.control}
                                name="party_name"
                                render={({ field }) => (
                                    <Input type="hidden" {...field} />
                                )}
                            />
                        </div>

                        {/* Balance Display */}
                        {selectedParty && (
                            <div className="flex items-center justify-between text-xs px-1 animate-in fade-in slide-in-from-top-1">
                                <span className="text-slate-500">Current Balance:</span>
                                <span className={cn(
                                    "font-bold",
                                    (selectedParty.current_balance || 0) >= 0 ? "text-green-600" : "text-red-500"
                                )}>
                                    ₹ {Math.abs(selectedParty.current_balance || 0).toLocaleString()} {(selectedParty.current_balance || 0) >= 0 ? 'Rec' : 'Pay'}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="md:col-span-1 space-y-2">
                        <div className="flex items-center justify-between">
                            <FormLabel className="text-foreground/90 font-medium">Invoice Type</FormLabel>
                            <FormField
                                control={form.control}
                                name="payment_status"
                                render={({ field }) => (
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => field.onChange('paid')}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-sm font-medium transition-all",
                                                field.value === 'paid' ? "bg-green-500 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            Cash
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => field.onChange('unpaid')}
                                            className={cn(
                                                "px-3 py-1 rounded-md text-sm font-medium transition-all",
                                                field.value !== 'paid' ? "bg-blue-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700"
                                            )}
                                        >
                                            Credit
                                        </button>
                                    </div>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="invoice_number"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Input {...field} placeholder="Invoice No." className="h-12 bg-background/50 backdrop-blur-sm focus:ring-primary/20 font-medium" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel className="text-foreground/90 font-medium">Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full h-12 pl-3 text-left font-normal bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-5 w-5 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            disabled={(date) =>
                                                date > new Date() || date < new Date("1900-01-01")
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <Separator className="my-6 opacity-30" />

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold tracking-tight text-foreground">Items</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unit_price: 0, gst_rate: 0, total_amount: 0 })} className="h-10 hover:bg-primary/10 hover:text-primary transition-all border-primary/20">
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <div key={field.id} className="relative group animate-in slide-in-from-bottom-2 duration-300">
                            <Card className="border-0 shadow-lg bg-card/60 backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10 overflow-hidden hover:shadow-xl transition-all">
                                <CardContent className="p-4 sm:p-6 grid gap-6 md:grid-cols-12 items-start md:items-center">
                                    <div className="md:col-span-4 space-y-2">
                                        <FormLabel className="text-sm font-medium text-muted-foreground">Product</FormLabel>
                                        <Select onValueChange={(val) => handleProductSelect(index, val)}>
                                            <SelectTrigger className="h-11 bg-background/60 border-input/50 focus:ring-primary/20">
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="mt-2">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.description`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input placeholder="Description" {...field} className="h-11 bg-background/60 border-input/50 focus:ring-primary/20" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-muted-foreground">Qty</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-11 bg-background/60 border-input/50 focus:ring-primary/20" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unit`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-muted-foreground">Unit</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-11 bg-background/60 border-input/50 focus:ring-primary/20">
                                                                <SelectValue placeholder="Unit" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {units.map((u: any) => (
                                                                <SelectItem key={u.name} value={u.name}>{u.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unit_price`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-muted-foreground">Price</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-11 bg-background/60 border-input/50 focus:ring-primary/20" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-2 space-y-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.discount`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-muted-foreground">Disc.</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-11 bg-background/60 border-input/50 focus:ring-primary/20" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="md:col-span-2 text-right md:text-center mt-6 md:mt-0 flex flex-row md:flex-col justify-between items-center md:items-end w-full px-1">
                                        <div className="text-sm text-muted-foreground md:hidden">Line Total</div>
                                        <div className="font-bold text-lg text-primary">
                                            ₹{((watchItems[index]?.quantity || 0) * (watchItems[index]?.unit_price || 0) - (watchItems[index]?.discount || 0)).toFixed(2)}
                                        </div>
                                    </div>

                                    <div className="md:col-span-1 flex justify-end md:justify-center mt-4 md:mt-0">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-10 w-10 transition-colors">
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row justify-end items-center gap-6 p-6 rounded-xl bg-gradient-to-br from-background to-secondary/50 border border-border/50 shadow-sm mt-8">
                    <div className="space-y-3 w-full md:w-80">
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span className="font-medium text-foreground">₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                            <span>GST</span>
                            <span className="font-medium text-foreground">₹{totalTax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between items-center text-2xl font-bold text-primary">
                            <span>Total</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                    <Button variant="outline" size="lg" onClick={() => router.back()} className="h-12 px-8 text-base">Cancel</Button>
                    <Button type="submit" size="lg" disabled={isLoading} className="h-12 px-8 text-base bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                        {isLoading ? 'Generating...' : 'Create Invoice'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

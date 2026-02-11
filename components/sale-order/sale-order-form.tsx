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
import { createSaleOrder, getNextSaleOrderRef, updateSaleOrder } from '@/actions/sale-orders'
import { getProducts } from '@/actions/inventory'
import { getParties } from '@/actions/parties'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, Plus, CalendarIcon, Camera } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { useLoading } from '@/components/providers/loading-provider'
import { Textarea } from '@/components/ui/textarea'

const saleOrderSchema = z.object({
    party_id: z.string().min(1, "Party is required"),
    order_number: z.string().min(1, "Order Number is required"),
    date: z.date(),
    due_date: z.date().optional(),
    items: z.array(z.object({
        product_id: z.string().optional(),
        description: z.string().min(1, "Description is required"),
        quantity: z.number().min(1),
        unit_price: z.number().min(0),
        gst_rate: z.number().min(0),
        tax_amount: z.number().min(0),
        total_amount: z.number().min(0)
    })).min(1, "At least one item is required"),
    notes: z.string().optional()
})

type SaleOrderFormValues = z.infer<typeof saleOrderSchema>

interface SaleOrderFormProps {
    initialData?: SaleOrderFormValues & { id?: string }
    orderId?: string
}

export function SaleOrderForm({ initialData, orderId }: SaleOrderFormProps) {
    const router = useRouter()
    const { showLoader, hideLoader, isLoading } = useLoading()
    const [products, setProducts] = React.useState<any[]>([])
    const [parties, setParties] = React.useState<any[]>([])

    // Load Data
    React.useEffect(() => {
        const load = async () => {
            const [prods, parts] = await Promise.all([
                getProducts(1, 100),
                getParties()
            ])
            setProducts(prods.data || [])
            setParties(parts || [])

            // Only fetch next ref if creating new
            if (!initialData && !orderId) {
                const nextRef = await getNextSaleOrderRef()
                form.setValue('order_number', nextRef)
            }
        }
        load()
    }, [])

    const form = useForm<SaleOrderFormValues>({
        resolver: zodResolver(saleOrderSchema) as any,
        defaultValues: {
            order_number: initialData?.order_number || '',
            party_id: initialData?.party_id || '',
            notes: initialData?.notes || '',
            date: initialData?.date ? new Date(initialData.date) : new Date(),
            due_date: initialData?.due_date ? new Date(initialData.due_date) : undefined,
            items: initialData?.items || [{ description: '', quantity: 1, unit_price: 0, gst_rate: 0, tax_amount: 0, total_amount: 0 }],
        },
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
    const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const totalTax = watchItems.reduce((acc, item) => acc + ((item.quantity * item.unit_price) * (item.gst_rate / 100)), 0)
    const grandTotal = subtotal + totalTax

    async function onSubmit(data: SaleOrderFormValues) {
        try {
            showLoader()
            // Recalculate precisely before send
            const itemsWithTotals = data.items.map(item => {
                const base = item.quantity * item.unit_price
                const tax = base * (item.gst_rate / 100)
                return {
                    ...item,
                    product_id: item.product_id || null,
                    tax_amount: tax,
                    total_amount: base + tax
                }
            })

            if (orderId) {
                await updateSaleOrder(orderId, {
                    ...data,
                    items: itemsWithTotals
                })
                toast.success('Sale Order updated successfully')
            } else {
                await createSaleOrder({
                    ...data,
                    items: itemsWithTotals
                })
                toast.success('Sale Order created successfully')
            }

            router.push('/dashboard/invoices/sale-order')
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
            form.setValue(`items.${index}.unit_price`, Number(product.price))
            form.setValue(`items.${index}.gst_rate`, Number(product.gst_rate || 0))
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">

                {/* Header Card */}
                <Card className="rounded-xl shadow-sm border-slate-200">
                    <CardContent className="p-6 grid gap-6 md:grid-cols-4">

                        {/* Party */}
                        <div className="md:col-span-1 space-y-2">
                            <Label>Party <span className="text-red-500">*</span></Label>
                            <FormField
                                control={form.control}
                                name="party_id"
                                render={({ field }) => {
                                    const selectedParty = parties.find(p => p.id === field.value)
                                    return (
                                        <FormItem>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-11 bg-slate-50">
                                                        <SelectValue placeholder="Select Party" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {parties.map(p => (
                                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                            {selectedParty && (
                                                <div className="flex justify-between items-center text-xs mt-1 px-1">
                                                    <span className="text-slate-500">Balance:</span>
                                                    <span className={cn(
                                                        "font-bold",
                                                        (selectedParty.current_balance || 0) >= 0 ? "text-green-600" : "text-red-600"
                                                    )}>
                                                        ₹ {Math.abs(selectedParty.current_balance || 0).toLocaleString()} {(selectedParty.current_balance || 0) >= 0 ? ' (Rec)' : ' (Pay)'}
                                                    </span>
                                                </div>
                                            )}
                                        </FormItem>
                                    )
                                }}
                            />
                        </div>

                        {/* Order No */}
                        <div className="md:col-span-1 space-y-2">
                            <Label>Order No <span className="text-red-500">*</span></Label>
                            <FormField
                                control={form.control}
                                name="order_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input {...field} className="h-11 bg-slate-50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Date */}
                        <div className="md:col-span-1 space-y-2">
                            <Label>Order Date</Label>
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-11 pl-3 text-left font-normal bg-slate-50 border-input",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Due Date */}
                        <div className="md:col-span-1 space-y-2">
                            <Label>Due Date</Label>
                            <FormField
                                control={form.control}
                                name="due_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full h-11 pl-3 text-left font-normal bg-slate-50 border-input",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </CardContent>
                </Card>

                {/* Items Table */}
                <Card className="rounded-xl shadow-sm border-slate-200 overflow-hidden">
                    <CardContent className="p-0">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                            <div className="col-span-4">Item</div>
                            <div className="col-span-2">Qty</div>
                            <div className="col-span-2">Price</div>
                            <div className="col-span-2">Tax %</div>
                            <div className="col-span-2 text-right">Amount</div>
                        </div>

                        {/* Items */}
                        <div className="p-4 space-y-3">
                            {fields.map((field, index) => (
                                <div key={field.id} className="grid grid-cols-12 gap-4 items-center">
                                    {/* Item/Product */}
                                    <div className="col-span-4 space-y-2">
                                        <Select onValueChange={(val) => handleProductSelect(index, val)}>
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select Product" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {products.map(p => (
                                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.description`}
                                            render={({ field }) => (
                                                <Input {...field} placeholder="Description" className="h-9" />
                                            )}
                                        />
                                    </div>

                                    {/* Qty */}
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-9" />
                                            )}
                                        />
                                    </div>

                                    {/* Price */}
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.unit_price`}
                                            render={({ field }) => (
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-9" />
                                            )}
                                        />
                                    </div>

                                    {/* Tax */}
                                    <div className="col-span-2">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.gst_rate`}
                                            render={({ field }) => (
                                                // Read-only logic as per Vyapar? Or editable? 
                                                // Editable usually or fixed per product. I'll make it editable.
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} className="h-9 bg-slate-50" />
                                            )}
                                        />
                                    </div>

                                    {/* Amount */}
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <span className="font-semibold text-slate-700">
                                            ₹{((watchItems[index]?.quantity || 0) * (watchItems[index]?.unit_price || 0) * (1 + ((watchItems[index]?.gst_rate || 0) / 100))).toFixed(2)}
                                        </span>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-red-500 hover:bg-red-50">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Item Button */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <Button type="button" variant="outline" onClick={() => append({ description: '', quantity: 1, unit_price: 0, gst_rate: 0, tax_amount: 0, total_amount: 0 })} className="border-blue-200 text-blue-600 bg-white">
                                <Plus className="h-4 w-4 mr-2" /> Add Row
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer Totals & Actions */}
                <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="w-full md:w-1/2">
                        <Label className="mb-2 block">Notes</Label>
                        <Textarea
                            {...form.register('notes')}
                            placeholder="Terms & Conditions or Notes..."
                            className="bg-white"
                        />
                    </div>

                    <div className="w-full md:w-80 space-y-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-slate-500">
                            <span>Tax</span>
                            <span>₹{totalTax.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-xl font-bold text-slate-800">
                            <span>Total Amount</span>
                            <span>₹{grandTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" size="lg" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                        {isLoading ? 'Saving...' : 'Save Sale Order'}
                    </Button>
                </div>

            </form>
        </Form>
    )
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
    return <p className={cn("text-sm font-medium text-slate-700", className)}>{children}</p>
}

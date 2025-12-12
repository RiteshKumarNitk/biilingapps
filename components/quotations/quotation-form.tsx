
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
import { createQuotation } from '@/actions/quotations'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { Trash2, Plus, CalendarIcon } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'

const quotationSchema = z.object({
    quotation_number: z.string().min(1, 'Required'),
    date: z.date(),
    party_id: z.string().optional(),
    party_name: z.string().min(1, 'Required'),
    items: z.array(z.object({
        product_id: z.string().optional(),
        description: z.string().min(1, 'Required'),
        quantity: z.number().min(1),
        unit_price: z.number().min(0),
        gst_rate: z.number().min(0),
        total_amount: z.number()
    })).min(1, 'Add at least one item')
})

type QuotationFormValues = z.infer<typeof quotationSchema>

interface QuotationFormProps {
    products: any[]
    parties: any[]
}

export function QuotationForm({ products, parties }: QuotationFormProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)

    const form = useForm<QuotationFormValues>({
        resolver: zodResolver(quotationSchema),
        defaultValues: {
            quotation_number: `QTN-${Math.floor(Math.random() * 10000)}`,
            date: new Date(),
            items: [{ description: '', quantity: 1, unit_price: 0, gst_rate: 0, total_amount: 0 }],
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

    const subtotal = watchItems.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0)
    const totalTax = watchItems.reduce((acc, item) => acc + ((item.quantity * item.unit_price) * ((item.gst_rate || 0) / 100)), 0)
    const grandTotal = subtotal + totalTax

    async function onSubmit(data: QuotationFormValues) {
        try {
            setLoading(true)
            const itemsWithTotals = data.items.map(item => ({
                ...item,
                total_amount: (item.quantity * item.unit_price) * (1 + ((item.gst_rate || 0) / 100))
            }))

            await createQuotation({
                ...data,
                items: itemsWithTotals,
                subtotal,
                total_gst: totalTax,
                discount_amount: 0,
                grand_total: grandTotal
            })
            toast.success('Quotation created')
            router.push('/dashboard/quotations')
        } catch (error: any) {
            toast.error(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleProductSelect = (index: number, productId: string) => {
        const product = products.find(p => p.id === productId)
        if (product) {
            form.setValue(`items.${index}.product_id`, product.id)
            form.setValue(`items.${index}.description`, product.name)
            form.setValue(`items.${index}.unit_price`, product.price)
            form.setValue(`items.${index}.gst_rate`, product.gst_rate)
        }
    }

    const handlePartySelect = (partyId: string) => {
        const party = parties.find(p => p.id === partyId)
        if (party) {
            form.setValue('party_id', party.id)
            form.setValue('party_name', party.name)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="party_name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Customer Name</FormLabel>
                                <div className="flex gap-2">
                                    <Select onValueChange={handlePartySelect}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder={field.value || "Select Customer"} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {parties.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button type="button" variant="outline" size="icon" onClick={() => router.push('/dashboard/parties/new')}>
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="quotation_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quotation No.</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem className="flex flex-col mt-2">
                                <FormLabel>Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
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

                <Separator />

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Items</h3>
                        <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unit_price: 0, gst_rate: 0, total_amount: 0 })}>
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </div>

                    {fields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                            <div className="grid gap-4 md:grid-cols-6 items-end">
                                <div className="col-span-2">
                                    <FormLabel className="text-xs">Product</FormLabel>
                                    <Select onValueChange={(val) => handleProductSelect(index, val)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Product" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products.map(p => (
                                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Description</FormLabel>
                                                <FormControl>
                                                    <Input {...field} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-2 flex gap-2">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Qty</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unit_price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">Price</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.gst_rate`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs">GST %</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="flex justify-end p-4 bg-muted/50 rounded-lg">
                    <div className="text-right space-y-2">
                        <div className="text-sm">Subtotal: <span className="font-medium">₹{subtotal.toFixed(2)}</span></div>
                        <div className="text-sm">GST: <span className="font-medium">₹{totalTax.toFixed(2)}</span></div>
                        <div className="text-xl font-bold">Total: ₹{grandTotal.toFixed(2)}</div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
                    <Button type="submit" disabled={loading}>{loading ? 'Creation...' : 'Create Quotation'}</Button>
                </div>
            </form>
        </Form>
    )
}

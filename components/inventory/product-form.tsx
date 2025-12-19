'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useFieldArray } from 'react-hook-form'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
    Package,
    Wrench,
    Info,
    IndianRupee,
    BarChart3,
    Save,
    Camera,
    Hash,
    Settings,
    X,
    ChevronDown,
    Calendar as CalendarIcon,
    Plus,
    RefreshCw,
    Trash2
} from 'lucide-react'



import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

import { productSchema, ProductFormValues } from '@/lib/schemas/product'
import { createProduct, updateProduct } from '@/actions/inventory'

const UNITS = ["pcs", "box", "kg", "ltr", "mtr", "g", "ml", "dz"]
const CATEGORIES = ["General", "Electronics", "Groceries", "Services", "Hardware"]
const GST_SLABS = [0, 5, 12, 18, 28]

interface ProductFormProps {
    initialData?: any
    productId?: string
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("pricing")

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || '',
            sku: initialData?.sku || '',
            hsn_code: initialData?.hsn_code || '',
            price: initialData?.price || 0,
            cost_price: initialData?.cost_price || 0,
            gst_rate: initialData?.gst_rate || 0,
            unit: initialData?.unit || 'pcs',
            stock_quantity: initialData?.stock_quantity || 0,
            low_stock_threshold: initialData?.low_stock_threshold || 5,

            // New Fields
            category: initialData?.category || 'General',
            tax_mode: initialData?.tax_mode || 'exclusive',
            discount_value: initialData?.discount_value || 0,
            discount_type: initialData?.discount_type || 'percentage',
            wholesale_price: initialData?.wholesale_price || 0,
            as_of_date: initialData?.as_of_date ? new Date(initialData.as_of_date) : new Date(),

            type: initialData?.type || 'product',
            image_url: initialData?.image_url || '',
        }
    })

    const { watch, setValue, control, handleSubmit, formState: { errors } } = form
    const itemType = watch('type')

    const { fields, append, remove } = useFieldArray({
        control,
        name: "wholesale_prices"
    })


    const generateSku = () => {
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
        const prefix = itemType === 'product' ? 'PRD' : 'SRV'
        setValue('sku', `${prefix}-${random}`)
    }

    async function handleSave(data: ProductFormValues, shouldRedirect: boolean = true) {
        try {
            setLoading(true)

            // Clean payload if needed (e.g. service shouldn't have stock)
            const submissionData = { ...data }
            if (itemType === 'service') {
                submissionData.stock_quantity = 0
                submissionData.low_stock_threshold = 0
            }

            if (productId) {
                await updateProduct(productId, submissionData)
                toast.success('Item updated successfully')
            } else {
                await createProduct(submissionData)
                toast.success('Item created successfully')
            }

            if (shouldRedirect) {
                router.push('/dashboard/inventory')
            } else {
                form.reset({
                    ...data,
                    name: '',
                    sku: '',
                    price: 0,
                    stock_quantity: 0
                })
                // Re-generate SKU for next item if auto-generating
                generateSku()
                router.refresh()
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save item')
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = (data: ProductFormValues) => handleSave(data, true)
    const onSaveAndNew = (data: ProductFormValues) => handleSave(data, false)

    return (
        <Form {...form}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-6xl mx-auto pb-20">

                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <X className="h-6 w-6 text-slate-500" />
                        </Button>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-800">
                            {productId ? 'Edit Item' : 'Add Item'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setValue('type', 'product')}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    itemType === 'product' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Product
                            </button>
                            <button
                                type="button"
                                onClick={() => setValue('type', 'service')}
                                className={cn(
                                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                                    itemType === 'service' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                )}
                            >
                                Service
                            </button>
                        </div>
                        <Button variant="ghost" size="icon" type="button">
                            <Settings className="h-5 w-5 text-slate-500" />
                        </Button>
                    </div>
                </div>

                {/* Basic Details Card */}
                <Card className="border-slate-200 shadow-sm">
                    <CardContent className="p-6 space-y-6">
                        {/* Row 1 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                            <div className="md:col-span-4">
                                <FormField
                                    control={control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Item Name <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter Item Name" {...field} className="h-10 border-slate-300 focus:border-blue-500" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <FormField
                                    control={control}
                                    name="hsn_code"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Item HSN</FormLabel>
                                            <div className="relative">
                                                <FormControl>
                                                    <Input placeholder="Search HSN" {...field} className="h-10 border-slate-300 pr-8" />
                                                </FormControl>
                                                <Info className="absolute right-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="md:col-span-3">
                                <FormField
                                    control={control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Select Unit</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 border-slate-300">
                                                        <SelectValue placeholder="Select Unit" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {UNITS.map(u => (
                                                        <SelectItem key={u} value={u}>{u.toUpperCase()}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="md:col-span-2 flex justify-center">
                                <div className="border-2 border-dashed border-slate-300 rounded-lg w-full h-[72px] flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 cursor-pointer transition-colors bg-slate-50">
                                    <Camera className="h-5 w-5 mb-1" />
                                    <span className="text-xs font-medium">Add Image</span>
                                </div>
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                            <div className="md:col-span-4">
                                <FormField
                                    control={control}
                                    name="category"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Category</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="h-10 border-slate-300">
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {CATEGORIES.map(c => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="md:col-span-4">
                                <FormField
                                    control={control}
                                    name="sku"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Item Code</FormLabel>
                                            <div className="flex gap-2">
                                                <FormControl>
                                                    <Input placeholder="Item Code" {...field} className="h-10 border-slate-300" />
                                                </FormControl>
                                                <Button type="button" variant="outline" size="icon" onClick={generateSku} title="Generate Code">
                                                    <RefreshCw className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full justify-start border-b border-slate-200 bg-transparent h-auto p-0 gap-8 rounded-none">
                        <TabsTrigger
                            value="pricing"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:text-red-500 data-[state=active]:bg-transparent px-2 py-3 text-slate-600 font-medium text-base"
                        >
                            Pricing
                        </TabsTrigger>
                        {itemType === 'product' && (
                            <TabsTrigger
                                value="stock"
                                className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:text-red-500 data-[state=active]:bg-transparent px-2 py-3 text-slate-600 font-medium text-base"
                            >
                                Stock
                            </TabsTrigger>
                        )}
                    </TabsList>

                    {/* Pricing Content */}
                    <TabsContent value="pricing" className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Sale Price Card */}
                            <Card className="border-slate-200 shadow-sm h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-slate-700">Sale Price</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4">
                                        <FormField
                                            control={control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className="text-xs text-slate-500 uppercase">Sale Price</FormLabel>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                            className="pl-8 h-10 border-slate-300"
                                                        />
                                                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                                                    </div>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="tax_mode"
                                            render={({ field }) => (
                                                <FormItem className="w-[140px]">
                                                    <FormLabel className="text-xs text-slate-500 uppercase">Tax Mode</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 border-slate-300">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="exclusive">Without Tax</SelectItem>
                                                            <SelectItem value="inclusive">With Tax</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <FormField
                                            control={control}
                                            name="discount_value"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className="text-xs text-slate-500 uppercase">Discount On Sale Price</FormLabel>
                                                    <Input
                                                        type="number"
                                                        {...field}
                                                        onChange={e => field.onChange(e.target.valueAsNumber)}
                                                        className="h-10 border-slate-300"
                                                    />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={control}
                                            name="discount_type"
                                            render={({ field }) => (
                                                <FormItem className="w-[140px]">
                                                    <FormLabel className="text-xs text-slate-500 uppercase">Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="h-10 border-slate-300">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="percentage">Percentage</SelectItem>
                                                            <SelectItem value="amount">Amount</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    {/* Wholesale Price Section */}
                                    <div className="pt-4 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-4">
                                            <FormLabel className="text-sm font-semibold text-slate-700">Wholesale Prices</FormLabel>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
                                                onClick={() => append({ min_quantity: 1, price: 0, tax_mode: 'exclusive' })}
                                            >
                                                <Plus className="h-3 w-3 mr-1" /> Add Slab
                                            </Button>
                                        </div>

                                        {fields.length > 0 && (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-10 gap-2 text-xs font-semibold text-slate-500 uppercase px-1">
                                                    <div className="col-span-3">Min Qty</div>
                                                    <div className="col-span-3">Price (₹)</div>
                                                    <div className="col-span-3">Tax Mode</div>
                                                    <div className="col-span-1"></div>
                                                </div>
                                                {fields.map((field, index) => (
                                                    <div key={field.id} className="grid grid-cols-10 gap-2 items-start">
                                                        <FormField
                                                            control={control}
                                                            name={`wholesale_prices.${index}.min_quantity`}
                                                            render={({ field }) => (
                                                                <FormItem className="col-span-3 space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Qty"
                                                                            {...field}
                                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                                            className="h-9 text-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={control}
                                                            name={`wholesale_prices.${index}.price`}
                                                            render={({ field }) => (
                                                                <FormItem className="col-span-3 space-y-0">
                                                                    <FormControl>
                                                                        <Input
                                                                            type="number"
                                                                            placeholder="Price"
                                                                            {...field}
                                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                                            className="h-9 text-sm"
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <FormField
                                                            control={control}
                                                            name={`wholesale_prices.${index}.tax_mode`}
                                                            render={({ field }) => (
                                                                <FormItem className="col-span-3 space-y-0">
                                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="h-9 text-sm">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="exclusive">Without Tax</SelectItem>
                                                                            <SelectItem value="inclusive">With Tax</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <div className="col-span-1 flex justify-center pt-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => remove(index)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {fields.length === 0 && (
                                            <div className="text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                                <p className="text-xs text-slate-400">No wholesale prices added yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Purchase Price Card */}
                            <Card className="border-slate-200 shadow-sm h-full">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base text-slate-700">Purchase Price</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-4">
                                        <FormField
                                            control={control}
                                            name="cost_price"
                                            render={({ field }) => (
                                                <FormItem className="flex-1">
                                                    <FormLabel className="text-xs text-slate-500 uppercase">Purchase Price</FormLabel>
                                                    <div className="relative">
                                                        <Input
                                                            type="number"
                                                            {...field}
                                                            onChange={e => field.onChange(e.target.valueAsNumber)}
                                                            className="pl-8 h-10 border-slate-300"
                                                        />
                                                        <span className="absolute left-3 top-2.5 text-slate-400 text-sm">₹</span>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                        <div className="w-[140px] opacity-50 pointer-events-none">
                                            <div className="space-y-2">
                                                <FormLabel className="text-xs text-slate-500 uppercase">Tax Mode</FormLabel>
                                                <Input disabled value="Without Tax" className="h-10 bg-slate-50" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Taxes Card */}
                            <div className="md:col-span-2">
                                <Card className="border-slate-200 shadow-sm">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base text-slate-700">Taxes</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={control}
                                                name="gst_rate"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-slate-600">Tax Rate</FormLabel>
                                                        <Select onValueChange={(val) => field.onChange(Number(val))} value={String(field.value)}>
                                                            <FormControl>
                                                                <SelectTrigger className="h-10 border-slate-300">
                                                                    <SelectValue placeholder="Select GST Rate" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {GST_SLABS.map(rate => (
                                                                    <SelectItem key={rate} value={String(rate)}>GST @ {rate}%</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Stock Content */}
                    <TabsContent value="stock" className="mt-6 space-y-6">
                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base text-slate-700">Stock Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormField
                                    control={control}
                                    name="stock_quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Opening Stock</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="h-10 border-slate-300" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={control}
                                    name="as_of_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col pt-2">
                                            <FormLabel className="text-slate-600 mb-1">As of Date</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "h-10 pl-3 text-left font-normal border-slate-300",
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
                                <FormField
                                    control={control}
                                    name="low_stock_threshold"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-slate-600">Minimum Stock Alert</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="h-10 border-slate-300" />
                                            </FormControl>
                                            <FormDescription className="text-xs">Alert when stock falls below this level</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Footer */}
                <div className="fixed bottom-0 right-0 left-0 md:left-64 z-10 bg-white border-t border-slate-200 p-4 shadow-up flex justify-end gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 px-8 h-11"
                        onClick={handleSubmit(onSaveAndNew)}
                        disabled={loading}
                    >
                        Save & New
                    </Button>
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-10 h-11"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </Form>
    )
}

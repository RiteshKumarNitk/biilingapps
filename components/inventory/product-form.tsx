'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
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
import { productSchema, ProductFormValues } from '@/lib/schemas/product'
import { createProduct, updateProduct } from '@/actions/inventory'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription as CardDesc } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Wrench, Info, IndianRupee, BarChart3, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

interface ProductFormProps {
    initialData?: any
    productId?: string
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)
    const [itemType, setItemType] = React.useState<'product' | 'service'>(initialData?.type || 'product')

    const defaultValues: ProductFormValues = {
        name: initialData?.name || '',
        description: initialData?.description || '',
        sku: initialData?.sku || '',
        hsn_code: initialData?.hsn_code || '',
        price: initialData?.price || 0,
        cost_price: initialData?.cost_price || 0,
        stock_quantity: initialData?.stock_quantity || 0,
        gst_rate: initialData?.gst_rate || 0,
        unit: initialData?.unit || 'pcs',
        low_stock_threshold: initialData?.low_stock_threshold || 5,
        type: initialData?.type || 'product',
        image_url: initialData?.image_url || '',
        barcode: initialData?.barcode || '',
    }

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues,
    })

    async function handleSave(data: ProductFormValues, shouldRedirect: boolean = true) {
        try {
            setLoading(true)
            const submissionData = { ...data, type: itemType }

            if (productId) {
                await updateProduct(productId, submissionData)
                toast.success('Item updated successfully')
            } else {
                await createProduct(submissionData)
                toast.success('Item created successfully')
            }

            router.refresh()

            if (shouldRedirect) {
                router.push('/dashboard/inventory')
            } else {
                // Reset form for new entry but keep current type
                form.reset({
                    ...defaultValues,
                    type: itemType,
                    // keep other useful defaults if needed?
                })
                // Ensure type state stays in sync
                handleTypeChange(itemType)
            }
        } catch (error: any) {
            toast.error(error.message || 'Something went wrong')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = (data: ProductFormValues) => handleSave(data, true)
    const onSaveAndNew = (data: ProductFormValues) => handleSave(data, false)

    const handleTypeChange = (type: 'product' | 'service') => {
        setItemType(type)
        form.setValue('type', type)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">
                            {productId ? 'Edit Item' : 'Add New Item'}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Configure your product or service details.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex p-1 bg-muted rounded-lg border border-border/50">
                            <Button
                                type="button"
                                variant={itemType === 'product' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleTypeChange('product')}
                                className={cn("rounded-md transition-all", itemType === 'product' && "shadow-sm")}
                            >
                                <Package className="mr-2 h-4 w-4" /> Product
                            </Button>
                            <Button
                                type="button"
                                variant={itemType === 'service' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => handleTypeChange('service')}
                                className={cn("rounded-md transition-all", itemType === 'service' && "shadow-sm")}
                            >
                                <Wrench className="mr-2 h-4 w-4" /> Service
                            </Button>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="grid gap-6">
                    <Tabs defaultValue="general" className="w-full">
                        <TabsList className="flex flex-col md:flex-row w-full h-auto p-0 bg-transparent border-b-0 md:border-b rounded-none gap-2 md:gap-0">
                            <TabsTrigger
                                value="general"
                                className="w-full md:w-auto justify-start md:justify-center rounded-md md:rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 md:data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-6 py-3 transition-all"
                            >
                                <Info className="mr-2 h-4 w-4" /> General
                            </TabsTrigger>
                            <TabsTrigger
                                value="pricing"
                                className="w-full md:w-auto justify-start md:justify-center rounded-md md:rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 md:data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-6 py-3 transition-all"
                            >
                                <IndianRupee className="mr-2 h-4 w-4" /> Pricing
                            </TabsTrigger>
                            {itemType === 'product' && (
                                <TabsTrigger
                                    value="stock"
                                    className="w-full md:w-auto justify-start md:justify-center rounded-md md:rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 md:data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none px-6 py-3 transition-all"
                                >
                                    <BarChart3 className="mr-2 h-4 w-4" /> Stock
                                </TabsTrigger>
                            )}
                        </TabsList>

                        {/* General Tab */}
                        <TabsContent value="general" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                            <Card className="border shadow-sm">
                                <CardHeader className="bg-muted/20 pb-4">
                                    <CardTitle className="text-base font-semibold">Basic Details</CardTitle>
                                    <CardDesc>Essential product information</CardDesc>
                                </CardHeader>
                                <CardContent className="p-6 space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Item Name <span className="text-destructive">*</span></FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g. Paracetamol 500mg or AC Repair" {...field} className="h-11" />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="hsn_code"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{itemType === 'product' ? 'HSN Code' : 'SAC Code'}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={itemType === 'product' ? "HSN" : "SAC"} {...field} className="h-11" />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                        {itemType === 'product' && (
                                            <FormField
                                                control={form.control}
                                                name="sku"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Item Code / SKU</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="e.g. PROD-001" {...field} className="h-11" />
                                                        </FormControl>
                                                    </FormItem>
                                                )}
                                            />
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description</FormLabel>
                                                <FormControl>
                                                    <Textarea placeholder="Add details about this item..." className="min-h-[100px] resize-none" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Pricing Tab */}
                        <TabsContent value="pricing" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                            <Card className="border shadow-sm">
                                <CardHeader className="bg-muted/20 pb-4">
                                    <CardTitle className="text-base font-semibold">Pricing & Tax</CardTitle>
                                    <CardDesc>Set your rates and taxes</CardDesc>
                                </CardHeader>
                                <CardContent className="p-6 grid gap-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sale Price (₹) <span className="text-destructive">*</span></FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="h-11 text-lg font-medium" />
                                                    </FormControl>
                                                    <FormDescription>Price excluding tax</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="cost_price"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Purchase Price (₹)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="h-11" />
                                                    </FormControl>
                                                    <FormDescription>Your buying price (optional)</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <FormField
                                            control={form.control}
                                            name="gst_rate"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>GST Rate (%)</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" placeholder="e.g. 18" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="h-11" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="unit"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Unit of Measure</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g. Pcs, Box, Kg" {...field} className="h-11" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Stock Tab */}
                        {itemType === 'product' && (
                            <TabsContent value="stock" className="mt-6 space-y-6 animate-in fade-in-50 duration-300">
                                <Card className="border shadow-sm">
                                    <CardHeader className="bg-muted/20 pb-4">
                                        <CardTitle className="text-base font-semibold">Stock Details</CardTitle>
                                        <CardDesc>Manage inventory levels</CardDesc>
                                    </CardHeader>
                                    <CardContent className="p-6 grid gap-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="stock_quantity"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Opening Stock</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="h-11" />
                                                        </FormControl>
                                                        <FormDescription>Current quantity</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="low_stock_threshold"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Low Stock Warning</FormLabel>
                                                        <FormControl>
                                                            <Input type="number" {...field} onChange={e => field.onChange(e.target.valueAsNumber)} className="h-11" />
                                                        </FormControl>
                                                        <FormDescription>Notify when below this</FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        )}
                    </Tabs>

                    {/* Actions Footer */}
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-8 pt-6 border-t">
                        <Button
                            variant="outline"
                            type="button"
                            onClick={() => router.back()}
                            className="w-full sm:w-auto min-w-[120px]"
                        >
                            Cancel
                        </Button>
                        <div className="flex w-full sm:w-auto gap-4">
                            {!productId && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 sm:flex-none min-w-[140px] border-primary text-primary hover:bg-primary/5"
                                    disabled={loading || !form.formState.isValid}
                                    onClick={form.handleSubmit(onSaveAndNew)}
                                >
                                    Save & New
                                </Button>
                            )}
                            <Button
                                type="submit"
                                className="flex-1 sm:flex-none min-w-[140px] shadow-lg shadow-primary/20"
                                disabled={loading || !form.formState.isValid}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? 'Saving...' : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            </form>
        </Form>
    )
}

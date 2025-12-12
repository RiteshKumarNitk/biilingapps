
'use client'

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { productSchema, ProductFormValues } from '@/lib/schemas/product'
import { createProduct, updateProduct } from '@/actions/inventory'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

interface ProductFormProps {
    initialData?: any
    productId?: string
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
    const router = useRouter()
    const [loading, setLoading] = React.useState(false)

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema),
        defaultValues: initialData || {
            name: '',
            sku: '',
            price: 0,
            stock_quantity: 0,
            gst_rate: 0,
            unit: 'pcs',
            low_stock_threshold: 5,
        },
    })

    async function onSubmit(data: ProductFormValues) {
        try {
            setLoading(true)
            if (productId) {
                await updateProduct(productId, data)
                toast.success('Product updated successfully')
            } else {
                await createProduct(data)
                toast.success('Product created successfully')
            }
            router.refresh()
            router.push('/dashboard/inventory')
        } catch (error: any) {
            toast.error('Something went wrong')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Product name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="sku"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>SKU</FormLabel>
                                <FormControl>
                                    <Input placeholder="SKU123" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Selling Price (₹)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0.00" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="stock_quantity"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Opening Stock</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="0" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gst_rate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>GST Rate (%)</FormLabel>
                                <FormControl>
                                    <Input type="number" placeholder="18" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="hsn_code"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>HSN Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="HSN" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button disabled={loading} type="submit">
                    {loading ? 'Saving...' : productId ? 'Save Changes' : 'Create Product'}
                </Button>
            </form>
        </Form>
    )
}

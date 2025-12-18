
import { getProducts } from '@/actions/inventory'
import { Button } from '@/components/ui/button'
import { Plus, Package, Wrench } from 'lucide-react'
import Link from 'next/link'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProductActions } from '@/components/inventory/product-actions'
import { MobileDeleteButton } from '@/components/inventory/mobile-product-actions'
import { SearchInput } from '@/components/dashboard/search-input'

export default async function InventoryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; search?: string }>
}) {
    const params = await searchParams;
    const page = Number(params?.page) || 1
    const search = params?.search || ''

    const { data: products, count } = await getProducts(page, 10, search)

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-primary">Inventory</h2>
                    <p className="text-sm text-muted-foreground">Manage your products and services</p>
                </div>
                <Link href="/dashboard/inventory/new">
                    <Button className="shadow-lg shadow-primary/20 transition-all hover:scale-105">
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </Link>
            </div>

            <SearchInput placeholder="Search by name or code..." />

            {/* Mobile Card View */}
            <div className="grid gap-4 md:hidden">
                {products?.length === 0 ? (
                    <Card className="bg-muted/50 border-dashed">
                        <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <p>No items found</p>
                        </CardContent>
                    </Card>
                ) : (
                    products?.map((product: any) => (
                        <Card key={product.id} className="overflow-hidden border-none shadow-sm ring-1 ring-black/5 dark:ring-white/10 active:scale-[0.99] transition-all">
                            <CardHeader className="p-4 bg-muted/30 pb-2 flex flex-row items-center justify-between space-y-0">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        {product.type === 'service' ?
                                            <Wrench className="h-4 w-4 text-blue-500" /> :
                                            <Package className="h-4 w-4 text-purple-500" />
                                        }
                                        <CardTitle className="text-base font-semibold line-clamp-1">{product.name}</CardTitle>
                                    </div>
                                    <CardDescription className="text-xs">{product.sku || 'No SKU'}</CardDescription>
                                </div>
                                <Badge variant="outline" className="bg-background">
                                    {product.type === 'service' ? 'Service' : 'Product'}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-4 pt-3 grid grid-cols-2 gap-y-2 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Sales Price</p>
                                    <p className="font-semibold text-primary">₹{product.price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground">Stock</p>
                                    {product.type === 'service' ? (
                                        <span className="text-muted-foreground italic">N/A</span>
                                    ) : (
                                        <span className={product.stock_quantity <= product.low_stock_threshold ? "text-destructive font-bold" : "font-medium"}>
                                            {product.stock_quantity} {product.unit}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 col-span-2 flex justify-end gap-2 border-t pt-2">
                                    <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                                        <Link href={`/dashboard/inventory/${product.id}`}>Edit</Link>
                                    </Button>
                                    <MobileDeleteButton productId={product.id} />
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Item Name</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Code/SKU</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Sale Price</TableHead>
                            <TableHead className="text-right">GST %</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center h-32 text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Package className="h-8 w-8 opacity-20" />
                                        <p>No items found. Add one to get started.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            products?.map((product: any) => (
                                <TableRow key={product.id} className="group hover:bg-muted/30 transition-colors">
                                    <TableCell>
                                        {product.type === 'service' ?
                                            <Wrench className="h-4 w-4 text-muted-foreground" /> :
                                            <Package className="h-4 w-4 text-muted-foreground" />
                                        }
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize text-[10px] h-5 px-1.5 font-normal">
                                            {product.type || 'product'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs font-mono">{product.sku || '-'}</TableCell>
                                    <TableCell className="text-right">
                                        {product.type === 'service' ? (
                                            <span className="text-muted-foreground text-xs italic">-</span>
                                        ) : (
                                            <Badge variant={product.stock_quantity <= product.low_stock_threshold ? "destructive" : "secondary"} className="font-mono">
                                                {product.stock_quantity}
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">₹{product.price}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">{product.gst_rate}%</TableCell>
                                    <TableCell>
                                        <ProductActions productId={product.id} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

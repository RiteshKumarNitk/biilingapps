import prisma from '@/lib/prisma'
import { ProductCard } from '@/components/store/product-card'

export const revalidate = 60 // ISR

export default async function StorePage() {
    // For this demo, assuming we want to show products from the first tenant
    const tenant = await prisma.tenant.findFirst()
    
    let products: any[] = []
    
    if (tenant) {
        products = await prisma.product.findMany({
            where: { tenantId: tenant.id },
            take: 20
        })
    }

    return (
        <div className="space-y-8">
            <section className="text-center space-y-4">
                <h1 className="text-4xl font-bold tracking-tight">Featured Products</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Explore our collection of premium items available for purchase directly from our inventory.
                </p>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products?.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {(!products || products.length === 0) && (
                <div className="text-center py-20 text-muted-foreground">
                    <p>No products found or access restricted.</p>
                </div>
            )}
        </div>
    )
}

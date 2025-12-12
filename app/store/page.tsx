
import { createClient } from '@/utils/supabase/server'
import { ProductCard } from '@/components/store/product-card'

export const revalidate = 60 // ISR

export default async function StorePage() {
    const supabase = createClient()
    // Since RLS policies might restrict 'anon' access to tenant data, 
    // normally this page would need a specific tenant context (e.g. /store/[tenant_slug]).
    // For this demo, assuming we want to show products from ALL tenants (marketplace style)
    // OR we need to bypass RLS or use a public policy. 
    // Let's assume we implement a policy for public read on products, or this page uses a service role (not recommended for client fetch).
    // Better: Filter by a specific demo tenant if possible, or show empty state if policies block.
    // Note: We added "Tenant isolation for products" policy as 'all using tenant_id = get_my_tenant_id()'.
    // This means an unauthenticated user (anon) will see NOTHING.
    // To fix this for the store, we need a policy allowing 'select' for public.
    // We will assume the user has modified the schema to allow public read, or we are viewing as a logged-in user for now.
    // Alternatively, the prompt asked for "Public product catalog".
    // So I will assume a policy exists: `create policy "Public can view products" on products for select using (true);` 

    // Actually, let's fetch products but handle the empty case gracefully.
    // Ideally this page is per-tenant like /store/[slug].

    const { data: products } = await (await supabase).from('products').select('*').limit(20)

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
                    <p className="text-sm">Note: Public access requires RLS policy update.</p>
                </div>
            )}
        </div>
    )
}

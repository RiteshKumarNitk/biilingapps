
"use client"

import { useState, useEffect } from 'react'
import { getProducts, getCategories, getUnits } from '@/actions/inventory'
import { Button } from '@/components/ui/button'
import { Plus, Settings, MoreVertical, Search } from 'lucide-react'
import Link from 'next/link'
import { FullPageLoader } from '@/components/ui/modern-loader'
import { InventoryTabs } from '@/components/inventory/inventory-tabs'
import { ProductManager } from '@/components/inventory/product-manager'
import { ServiceManager } from '@/components/inventory/service-manager'
import { CategoryManager } from '@/components/inventory/category-manager'
import { UnitManager } from '@/components/inventory/unit-manager'
import { toast } from 'sonner'

export default function InventoryPage() {
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('products')

    // Data
    const [products, setProducts] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [units, setUnits] = useState<any[]>([])

    // Selection State
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
    const [selectedService, setSelectedService] = useState<any | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [pData, cData, uData] = await Promise.all([
                getProducts(1, 2000), // Fetch larger batch for client-side feel
                getCategories(),
                getUnits()
            ])

            const allProducts = pData.data || []
            setProducts(allProducts)
            setCategories(cData || [])
            setUnits(uData || [])

            // Auto Select First Product
            const firstProd = allProducts.find(p => p.type !== 'service')
            if (firstProd) setSelectedProduct(firstProd)

            // Auto Select First Service
            const firstServ = allProducts.find(p => p.type === 'service')
            if (firstServ) setSelectedService(firstServ)

        } catch (error) {
            toast.error("Failed to load inventory data")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <FullPageLoader />

    // Derived Lists
    const productList = products.filter(p => p.type !== 'service')
    const serviceList = products.filter(p => p.type === 'service')

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#F5F7FA]">
            {/* 1. TOP HEADER (INVENTORY) */}
            {/* <header className="bg-white px-4 h-14 flex items-center justify-between shadow-sm z-20 shrink-0 border-b relative">

                <div className="w-1/3 max-w-sm relative">
                    <Search className="text-slate-400 absolute left-3 top-2.5 h-4 w-4" />
                    <input
                        placeholder="Search Transactions (Ctrl + F)"
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border-transparent rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <Link href="/dashboard/invoices/new">
                        <Button className="bg-red-500 hover:bg-red-600 text-white font-semibold h-9 rounded-full px-5 shadow-sm border border-red-600">
                            <Plus className="h-4 w-4 mr-1" /> Add Sale
                        </Button>
                    </Link>
                    <Link href="/dashboard/purchase/bills/new">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 rounded-full px-5 shadow-sm border border-blue-600">
                            <Plus className="h-4 w-4 mr-1" /> Add Purchase
                        </Button>
                    </Link>

                    <div className="h-6 w-px bg-slate-200 mx-1"></div>

                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100 rounded-full">
                        <Plus className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100 rounded-full">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-500 hover:bg-slate-100 rounded-full">
                        <MoreVertical className="h-5 w-5" />
                    </Button>
                </div>
            </header> */}

            {/* 2. TABS */}
            <InventoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {/* 3. MAIN CONTENT AREA */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'products' && (
                    <ProductManager
                        items={productList}
                        selectedItem={selectedProduct}
                        onSelect={setSelectedProduct}
                        onRefresh={loadData}
                    />
                )}

                {activeTab === 'services' && (
                    <ServiceManager
                        items={serviceList}
                        selectedItem={selectedService}
                        onSelect={setSelectedService}
                        onRefresh={loadData}
                    />
                )}

                {activeTab === 'category' && (
                    <CategoryManager
                        categories={categories}
                        products={products}
                        onRefresh={loadData}
                    />
                )}

                {activeTab === 'units' && (
                    <UnitManager units={units} onRefresh={loadData} />
                )}
            </div>
        </div>
    )
}

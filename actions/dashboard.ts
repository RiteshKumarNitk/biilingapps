'use server'

import { createClient } from '@/utils/supabase/server'
import { startOfMonth, endOfMonth, subMonths, format, setYear, setMonth, startOfYear, endOfYear } from 'date-fns'

export async function getDashboardStats(month?: number, year?: number) {
    const supabase = await createClient()
    const now = new Date()

    // Determine date range
    let startDate: Date, endDate: Date

    if (month !== undefined && year !== undefined) {
        const date = setMonth(setYear(now, year), month)
        startDate = startOfMonth(date)
        endDate = endOfMonth(date)
    } else {
        // Default to current month if no filter
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    const startIso = startDate.toISOString()
    const endIso = endDate.toISOString()

    // 1. Total Revenue (Sum of grand_total from Invoices in Range)
    const { data: revenueData } = await supabase
        .from('invoices')
        .select('paid_amount, grand_total, created_at')
        .gte('created_at', startIso)
        .lte('created_at', endIso)

    const totalRevenue = revenueData?.reduce((acc, curr) => acc + (curr.grand_total || 0), 0) || 0

    // Compare with Previous Month independent of filter for "Growth" (or previous period)
    const prevStart = startOfMonth(subMonths(startDate, 1)).toISOString()
    const prevEnd = endOfMonth(subMonths(startDate, 1)).toISOString()

    const { data: prevRevenueData } = await supabase
        .from('invoices')
        .select('grand_total')
        .gte('created_at', prevStart)
        .lte('created_at', prevEnd)

    const lastMonthRevenue = prevRevenueData?.reduce((acc, curr) => acc + (curr.grand_total || 0), 0) || 0

    // Growth Calculation
    let growthPercentage = 0
    if (lastMonthRevenue > 0) {
        growthPercentage = ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
    } else if (totalRevenue > 0) {
        growthPercentage = 100 // 100% growth if started from 0
    }

    // 2. Sales Count (Filtered)
    const { count: salesCount } = await supabase
        .from('invoices')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startIso)
        .lte('created_at', endIso)

    // 3. Parties Count (Global)
    const { count: partiesCount } = await supabase
        .from('parties')
        .select('*', { count: 'exact', head: true })

    // 4. Products Count (Global)
    const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

    // 5. Receivable & Payable (Global state)
    const { data: partiesData } = await supabase
        .from('parties')
        .select('current_balance')

    let totalReceivable = 0
    let totalPayable = 0
    let receivablePartiesCount = 0
    let payablePartiesCount = 0

    if (partiesData) {
        partiesData.forEach(p => {
            const balance = p.current_balance || 0
            if (balance > 0) {
                totalReceivable += balance
                receivablePartiesCount++
            } else if (balance < 0) {
                totalPayable += Math.abs(balance)
                payablePartiesCount++
            }
        })
    }

    return {
        totalRevenue,
        growthPercentage,
        salesCount: salesCount || 0,
        partiesCount: partiesCount || 0,
        productsCount: productsCount || 0,
        totalReceivable,
        totalPayable,
        receivablePartiesCount,
        payablePartiesCount
    }
}

export async function getInventoryStats() {
    const supabase = await createClient()

    // Fetch products to check stock
    const { data: products } = await supabase
        .from('products')
        .select('id, name, stock_quantity, category')
        .order('stock_quantity', { ascending: true }) // Low stock first
        .limit(10)

    const lowStockItems = products?.filter(p => (p.stock_quantity || 0) < 10) || []

    // Top Selling (Approximate by invoice frequency)
    const { data: items } = await supabase.from('invoice_items').select('product_id, products(name), quantity')

    const productSales: Record<string, { name: string, count: number }> = {}
    if (items) {
        items.forEach((item: any) => {
            if (item.products?.name) {
                const name = item.products.name
                if (!productSales[name]) productSales[name] = { name, count: 0 }
                productSales[name].count += (item.quantity || 0)
            }
        })
    }

    const topProducts = Object.values(productSales)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return {
        lowStockItems,
        topProducts
    }
}

export async function getFinancialStats(month?: number, year?: number) {
    // Basic Cash Flow mock or simple aggregation
    // For now, returning mock/empty as 'expenses' or 'cash_adjustments' tables might be empty or missing
    return {
        cashInHand: 0,
        bankBalance: 0
    }
}

export async function getCustomerStats() {
    // Top Customer by Revenue
    const supabase = await createClient()
    const { data: invoices } = await supabase.from('invoices').select('party_name, grand_total, status')

    // Only count unpaid invoices for aging/receivables? Or total revenue?
    // User asked for "Top Customers" (Revenue) and "Outstanding Aging" (Receivables)
    // Here implementing Top Customers by Revenue

    const customerRevenue: Record<string, number> = {}
    if (invoices) {
        invoices.forEach(inv => {
            const name = inv.party_name || 'Unknown'
            customerRevenue[name] = (customerRevenue[name] || 0) + (inv.grand_total || 0)
        })
    }

    const topCustomers = Object.keys(customerRevenue)
        .map(name => ({ name, value: customerRevenue[name] }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5)

    return { topCustomers }
}

export async function getOperationsStats() {
    const supabase = await createClient()

    // Pending Quotations
    const { count: pendingQuotes } = await supabase
        .from('quotations')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft')

    // Pending Orders (if POs exist)
    const { count: pendingPO } = await supabase
        .from('purchase_orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    return {
        pendingQuotes: pendingQuotes || 0,
        pendingPO: pendingPO || 0
    }
}


export async function getRecentSales() {
    const supabase = await createClient()

    // Fetch last 5 invoices with party details
    const { data } = await supabase
        .from('invoices')
        .select('id, invoice_number, grand_total, party_name, status, created_at, party:parties(email)')
        .order('created_at', { ascending: false })
        .limit(5)

    return data || []
}

export async function getOverviewChartData(year?: number) {
    const supabase = await createClient()

    // Filter by Year (default current)
    const targetYear = year || new Date().getFullYear()
    const startDate = startOfYear(setYear(new Date(), targetYear)).toISOString()
    const endDate = endOfYear(setYear(new Date(), targetYear)).toISOString()

    const { data } = await supabase
        .from('invoices')
        .select('grand_total, created_at')
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true })

    const monthlyData: { [key: string]: number } = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize
    months.forEach(m => monthlyData[m] = 0)

    if (data) {
        data.forEach(inv => {
            const date = new Date(inv.created_at)
            const month = date.toLocaleString('default', { month: 'short' })
            if (monthlyData[month] !== undefined) {
                monthlyData[month] += (inv.grand_total || 0)
            }
        })
    }

    return months.map(m => ({
        name: m,
        total: monthlyData[m]
    }))
}

export async function getSalesByCategory() {
    const supabase = await createClient()

    // We need to fetch invoice items and their products' categories
    const { data: items } = await supabase
        .from('invoice_items')
        .select(`
            total_amount,
            products (
                category
            )
        `)

    const categorySales: { [key: string]: number } = {}

    if (items) {
        items.forEach((item: any) => {
            const cat = item.products?.category || 'Uncategorized'
            categorySales[cat] = (categorySales[cat] || 0) + (item.total_amount || 0)
        })
    }

    // Convert to array and sort
    const chartData = Object.keys(categorySales).map(cat => ({
        name: cat,
        value: categorySales[cat]
    })).sort((a, b) => b.value - a.value).slice(0, 5) // Top 5

    return chartData
}

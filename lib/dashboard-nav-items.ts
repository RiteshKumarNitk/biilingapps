
import {
    LayoutDashboard,
    Users,
    Package,
    ShoppingCart,
    Receipt,
    BookOpen,
    BarChart3,
    Settings,
    Store,
    FileText,
    CreditCard,
    Zap
} from 'lucide-react'

export type NavItem = {
    title: string
    href: string
    icon?: any
    items?: NavItem[]
    external?: boolean
}

export const dashboardNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Parties',
        href: '/dashboard/parties',
        icon: Users,
        items: [
            { title: 'Party Details', href: '/dashboard/parties' },
            { title: 'Whatsapp Connect', href: '/dashboard/parties/whatsapp' },
            { title: 'Vyapar Network', href: '/dashboard/parties/network' },
        ],
    },
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
        icon: Package,
        items: [
            { title: 'Items', href: '/dashboard/inventory' },
            { title: 'Stock Summary', href: '/dashboard/inventory/stock-summary' },
            { title: 'Stock Adjustment', href: '/dashboard/inventory/adjustments' },
            { title: 'Units', href: '/dashboard/inventory/units' },
        ],
    },
    {
        title: 'Sales & Invoices',
        href: '/dashboard/invoices',
        icon: Receipt,
        items: [
            { title: 'Sales Invoice', href: '/dashboard/invoices' },
            { title: 'Credit Note', href: '/dashboard/invoices/credit-note' },
            { title: 'Delivery Challan', href: '/dashboard/invoices/delivery-challan' },
            { title: 'Payment In', href: '/dashboard/invoices/payment-in' },
            { title: 'E-Way Bill', href: '/dashboard/invoices/eway-bill' },
        ],
    },
    {
        title: 'Quotations',
        href: '/dashboard/quotations',
        icon: FileText,
        items: [
            { title: 'Create Quotation', href: '/dashboard/quotations/create' },
            { title: 'Quotation List', href: '/dashboard/quotations' },
        ],
    },
    {
        title: 'Online Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
        items: [
            { title: 'Order List', href: '/dashboard/orders' },
            { title: 'Order Settings', href: '/dashboard/orders/settings' },
        ],
    },
    {
        title: 'Purchase & Expense',
        href: '/dashboard/purchase',
        icon: CreditCard,
        items: [
            { title: 'Purchase Bill', href: '/dashboard/purchase/bills' },
            { title: 'Payment Out', href: '/dashboard/purchase/payment-out' },
            { title: 'Expense', href: '/dashboard/accounting/expenses' }, // Linked to existing accounting? Or new?
            { title: 'Debit Note', href: '/dashboard/purchase/debit-note' },
        ],
    },
    {
        title: 'Accounting',
        href: '/dashboard/accounting',
        icon: BookOpen,
        items: [
            { title: 'Cash & Bank', href: '/dashboard/accounting/cash-bank' },
            { title: 'Day Book', href: '/dashboard/accounting/day-book' },
            { title: 'Ledger', href: '/dashboard/accounting/ledger' },
            { title: 'Trial Balance', href: '/dashboard/accounting/trial-balance' },
        ],
    },
    {
        title: 'Reports',
        href: '/dashboard/reports',
        icon: BarChart3,
        items: [
            { title: 'Sales Report', href: '/dashboard/reports/sales' },
            { title: 'Purchase Report', href: '/dashboard/reports/purchase' },
            { title: 'Stock Report', href: '/dashboard/reports/stock' },
            { title: 'Party Report', href: '/dashboard/reports/party' },
            { title: 'GST Report', href: '/dashboard/reports/gst' },
        ],
    },
    {
        title: 'Storefront',
        href: '/store', // external? or dashboard management of store?
        icon: Store,
        items: [
            { title: 'Products', href: '/dashboard/store/products' },
            { title: 'Orders', href: '/dashboard/store/orders' },
            { title: 'Website Settings', href: '/dashboard/store/settings' },
        ]
    },
    {
        title: 'Utilities',
        href: '/dashboard/utilities',
        icon: Zap,
        items: [
            { title: 'Bulk GST Update', href: '/dashboard/utilities/bulk-gst' },
            { title: 'Import / Export', href: '/dashboard/utilities/import-export' },
            { title: 'Sync, Share & Backup', href: '/dashboard/utilities/backup' },
        ],
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
        items: [
            { title: 'Company Profile', href: '/dashboard/settings/profile' },
            { title: 'Taxes & GST', href: '/dashboard/settings/taxes' },
            { title: 'Invoice Settings', href: '/dashboard/settings/invoice' },
            { title: 'User Management', href: '/dashboard/settings/users' },
            { title: 'Subscription', href: '/dashboard/settings/subscription' },
        ],
    },
]

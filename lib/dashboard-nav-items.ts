
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
    Zap,
    TrendingUp,
    RefreshCw,
    Share2,
    Database
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
        title: 'Home',
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
        title: 'Items',
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
        title: 'Sale',
        href: '/dashboard/invoices',
        icon: Receipt,
        items: [
            { title: 'Sales Invoice', href: '/dashboard/invoices' },
            { title: 'Credit Note', href: '/dashboard/invoices/credit-note' },
            { title: 'Delivery Challan', href: '/dashboard/invoices/delivery-challan' },
            { title: 'Payment In', href: '/dashboard/invoices/payment-in' },
            { title: 'E-Way Bill', href: '/dashboard/invoices/eway-bill' },
            { title: 'Create Quotation', href: '/dashboard/quotations/create' }, // Moved quotations here as part of sales usually
        ],
    },
    {
        title: 'Purchase & Expense',
        href: '/dashboard/purchase',
        icon: CreditCard,
        items: [
            { title: 'Purchase Bill', href: '/dashboard/purchase/bills' },
            { title: 'Payment Out', href: '/dashboard/purchase/payment-out' },
            { title: 'Expense', href: '/dashboard/accounting/expenses' },
            { title: 'Debit Note', href: '/dashboard/purchase/debit-note' },
            { title: 'Purchase Order', href: '/dashboard/purchase/orders' }, // Hypothetical route
        ],
    },
    {
        title: 'Grow Your Business',
        href: '/dashboard/grow',
        icon: TrendingUp,
        items: [
            { title: 'Online Store', href: '/store' },
            { title: 'Marketing', href: '/dashboard/marketing' },
        ]
    },
    {
        title: 'Cash & Bank',
        href: '/dashboard/accounting/cash-bank',
        icon: BookOpen,
        items: [
            { title: 'Cash In Hand', href: '/dashboard/accounting/cash-bank' },
            { title: 'Bank Accounts', href: '/dashboard/accounting/bank' },
            { title: 'Loan Accounts', href: '/dashboard/accounting/loan' },
        ]
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
        title: 'Sync, Share & Backup',
        href: '/dashboard/utilities/backup',
        icon: Share2,
    },
    {
        title: 'Bulk GST Update',
        href: '/dashboard/utilities/bulk-gst',
        icon: RefreshCw,
    },
    {
        title: 'Utilities',
        href: '/dashboard/utilities',
        icon: Zap,
        items: [
            { title: 'Import / Export', href: '/dashboard/utilities/import-export' },
            { title: 'Recycle Bin', href: '/dashboard/utilities/recycle-bin' },
        ],
    },
    // Keep Settings at bottom or hidden if not requested? 
    // User request didn't explicitly forbid others, but list was specific.
    // I will add Settings because it's essential, but maybe after Utilities as per list implicit order?
    // Actually, user list: "Utilities" was last. I'll stick to their list.
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
    }
]

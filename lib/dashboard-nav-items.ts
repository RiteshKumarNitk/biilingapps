
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
    quickAddLink?: string
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
        quickAddLink: '/dashboard/parties/new',
        items: [
            { title: 'Party Details', href: '/dashboard/parties', quickAddLink: '/dashboard/parties/new' },
            { title: 'Whatsapp Connect', href: '/dashboard/parties/whatsapp' },
            // ...
        ],
    },
    {
        title: 'Items',
        href: '/dashboard/inventory',
        icon: Package,
        quickAddLink: '/dashboard/inventory/new',
        items: [
            { title: 'Items', href: '/dashboard/inventory', quickAddLink: '/dashboard/inventory/new' },
            { title: 'Stock Summary', href: '/dashboard/inventory/stock-summary' },
            { title: 'Stock Adjustment', href: '/dashboard/inventory/adjustments', quickAddLink: '/dashboard/inventory/adjustments/new' },
            { title: 'Units', href: '/dashboard/inventory/units', quickAddLink: '/dashboard/inventory/units/new' },
        ],
    },
    {
        title: 'Sale',
        href: '/dashboard/invoices',
        icon: Receipt,
        items: [
            { title: 'Sale Invoices', href: '/dashboard/invoices', quickAddLink: '/dashboard/invoices/new' },
            { title: 'Estimate/ Quotation', href: '/dashboard/quotations', quickAddLink: '/dashboard/quotations/create' },
            { title: 'Proforma Invoice', href: '/dashboard/invoices/proforma', quickAddLink: '/dashboard/invoices/proforma/new' },
            { title: 'Payment-In', href: '/dashboard/invoices/payment-in', quickAddLink: '/dashboard/invoices/payment-in/new' },
            { title: 'Sale Order', href: '/dashboard/invoices/sale-order', quickAddLink: '/dashboard/invoices/sale-order/new' },
            { title: 'Delivery Challan', href: '/dashboard/invoices/delivery-challan', quickAddLink: '/dashboard/invoices/delivery-challan/new' },
            { title: 'Sale Return/ Credit Note', href: '/dashboard/invoices/credit-note', quickAddLink: '/dashboard/invoices/credit-note/new' },
            { title: 'Vyapar POS', href: '/dashboard/pos' },
        ],
    },

    {
        title: 'Purchase & Expense',
        href: '/dashboard/purchase',
        icon: CreditCard,
        items: [
            { title: 'Purchase Bills', href: '/dashboard/purchase/bills', quickAddLink: '/dashboard/purchase/bills/new' },
            { title: 'Payment-Out', href: '/dashboard/purchase/payment-out', quickAddLink: '/dashboard/purchase/payment-out/new' },
            { title: 'Expenses', href: '/dashboard/accounting/expenses', quickAddLink: '/dashboard/accounting/expenses/new' },
            { title: 'Purchase Order', href: '/dashboard/purchase/orders', quickAddLink: '/dashboard/purchase/orders/new' },
            { title: 'Purchase Return/ Dr. Note', href: '/dashboard/purchase/debit-note', quickAddLink: '/dashboard/purchase/debit-note/new' },
        ],
    },
    {
        title: 'Grow Your Business',
        href: '/dashboard/grow',
        icon: TrendingUp,
        items: [
            { title: 'Google Profile Manager', href: '/dashboard/grow/google' },
            { title: 'Marketing Tools', href: '/dashboard/marketing' },
            { title: 'WhatsApp Marketing', href: '/dashboard/marketing/whatsapp' },
            { title: 'Online Store', href: '/store' },
            { title: 'Get New Customers', href: '/dashboard/grow/new-customers' },
            { title: 'Smart Ads', href: '/dashboard/grow/smart-ads' },
            { title: 'Business Horoscope', href: '/dashboard/grow/horoscope' },
        ]
    },
    {
        title: 'Cash & Bank',
        href: '/dashboard/accounting/cash-bank',
        icon: BookOpen,
        items: [
            { title: 'Bank Accounts', href: '/dashboard/accounting/bank', quickAddLink: '/dashboard/accounting/bank/new' },
            { title: 'Cash In Hand', href: '/dashboard/accounting/cash-bank', quickAddLink: '/dashboard/accounting/cash-bank/adjust' },
            { title: 'Cheques', href: '/dashboard/accounting/cheques' },
            { title: 'Loan Accounts', href: '/dashboard/accounting/loan', quickAddLink: '/dashboard/accounting/loan/new' },
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
        items: [
            { title: 'Sync & Share', href: '/dashboard/utilities/backup/sync' },
            { title: 'Auto Backup', href: '/dashboard/utilities/backup/auto' },
            { title: 'Backup To Computer', href: '/dashboard/utilities/backup/computer' },
            { title: 'Backup To Drive', href: '/dashboard/utilities/backup/drive' },
            { title: 'Restore Backup', href: '/dashboard/utilities/backup/restore' },
        ]
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

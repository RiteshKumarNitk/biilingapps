
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Receipt,
    BookOpen,
    BarChart3,
    Settings,
    Store,
    FileText
} from 'lucide-react'

const items = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Inventory',
        href: '/dashboard/inventory',
        icon: Package,
    },
    {
        title: 'Sales & Invoices',
        href: '/dashboard/invoices',
        icon: Receipt,
    },
    {
        title: 'Quotations',
        href: '/dashboard/quotations',
        icon: FileText,
    },
    {
        title: 'Online Orders',
        href: '/dashboard/orders',
        icon: ShoppingCart,
    },
    {
        title: 'Accounting',
        href: '/dashboard/accounting',
        icon: BookOpen,
    },
    {
        title: 'Reports',
        href: '/dashboard/reports',
        icon: BarChart3,
    },
    {
        title: 'Storefront',
        href: '/store',
        icon: Store,
        external: true
    },
    {
        title: 'Settings',
        href: '/dashboard/settings',
        icon: Settings,
    },
]

export function MainNav({
    className,
    ...props
}: React.HTMLAttributes<HTMLElement>) {
    const pathname = usePathname()

    return (
        <nav
            className={cn(
                'flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1',
                className
            )}
            {...props}
        >
            {items.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    target={item.external ? '_blank' : undefined}
                    className={cn(
                        'flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground',
                        pathname === item.href
                            ? 'bg-accent text-accent-foreground'
                            : 'transparent'
                    )}
                >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.title}
                </Link>
            ))}
        </nav>
    )
}

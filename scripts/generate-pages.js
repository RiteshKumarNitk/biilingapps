
const fs = require('fs');
const path = require('path');

const baseDir = path.join(process.cwd(), 'app/dashboard');

const pages = [
    { path: 'parties/whatsapp', title: 'Whatsapp Connect' },
    { path: 'parties/network', title: 'Vyapar Network' },
    { path: 'inventory/stock-summary', title: 'Stock Summary' },
    { path: 'inventory/adjustments', title: 'Stock Adjustment' },
    { path: 'inventory/units', title: 'Units' },
    { path: 'invoices/credit-note', title: 'Credit Note' },
    { path: 'invoices/delivery-challan', title: 'Delivery Challan' },
    { path: 'invoices/payment-in', title: 'Payment In' },
    { path: 'invoices/eway-bill', title: 'E-Way Bill' },
    { path: 'orders/settings', title: 'Order Settings' },
    { path: 'purchase/bills', title: 'Purchase Bill' },
    { path: 'purchase/payment-out', title: 'Payment Out' },
    { path: 'purchase/debit-note', title: 'Debit Note' },
    { path: 'accounting/cash-bank', title: 'Cash & Bank' },
    { path: 'accounting/day-book', title: 'Day Book' },
    { path: 'accounting/ledger', title: 'Ledger' },
    { path: 'accounting/trial-balance', title: 'Trial Balance' },
    { path: 'reports/sales', title: 'Sales Report' },
    { path: 'reports/purchase', title: 'Purchase Report' },
    { path: 'reports/stock', title: 'Stock Report' },
    { path: 'reports/party', title: 'Party Report' },
    { path: 'reports/gst', title: 'GST Report' },
    { path: 'store/products', title: 'Store Products' },
    { path: 'store/orders', title: 'Store Orders' },
    { path: 'store/settings', title: 'Store Settings' },
    { path: 'utilities/bulk-gst', title: 'Bulk GST Update' },
    { path: 'utilities/import-export', title: 'Import / Export' },
    { path: 'utilities/backup', title: 'Sync, Share & Backup' },
    { path: 'settings/profile', title: 'Company Profile' },
    { path: 'settings/taxes', title: 'Taxes & GST' },
    { path: 'settings/invoice', title: 'Invoice Settings' },
    { path: 'settings/users', title: 'User Management' },
    { path: 'settings/subscription', title: 'Subscription' },
];

const template = (title) => `
import { PagePlaceholder } from '@/components/dashboard/page-placeholder'

export default function Page() {
    return <PagePlaceholder title="${title}" />
}
`;

pages.forEach(page => {
    const fullDir = path.join(baseDir, page.path);
    if (!fs.existsSync(fullDir)) {
        fs.mkdirSync(fullDir, { recursive: true });
    }

    const filePath = path.join(fullDir, 'page.tsx');
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, template(page.title));
        console.log(`Created ${filePath}`);
    } else {
        console.log(`Skipped ${filePath} (already exists)`);
    }
});

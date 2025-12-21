
import { InvoiceTheme } from './types'

export const INVOICE_THEMES: InvoiceTheme[] = [
    // --- Classic Themes ---
    {
        id: 'classic-1',
        name: 'Standard Classic',
        group: 'Classic',
        colors: {
            primary: '#1a1a1a',
            secondary: '#666666',
            text: '#1a1a1a',
            border: '#e5e7eb',
            background: '#ffffff',
            tableHeaderBg: '#f3f4f6',
            tableHeaderText: '#111827',
            accent: '#3b82f6',
        },
        typography: {
            fontFamily: 'Inter, sans-serif',
            headingSize: '24px',
            textSize: '12px',
        },
        layout: {
            headerStyle: 'standard',
            tableStyle: 'clean',
            borderStyle: 'thin',
            compactMode: false,
        }
    },
    {
        id: 'tally-theme',
        name: 'Tally Theme',
        group: 'Tally',
        colors: {
            primary: '#000000',
            secondary: '#000000',
            text: '#000000',
            border: '#000000',
            background: '#ffffff',
            tableHeaderBg: '#ffffff',
            tableHeaderText: '#000000',
            accent: '#000000',
        },
        typography: {
            fontFamily: '"Times New Roman", serif',
            headingSize: '20px',
            textSize: '11px', // Tally usually has dense text
        },
        layout: {
            headerStyle: 'left-aligned',
            tableStyle: 'grid', // Heavy borders
            borderStyle: 'thick', // Double borders often
            compactMode: true,
        }
    },
    {
        id: 'gst-1',
        name: 'GST Theme 1',
        group: 'GST',
        colors: {
            primary: '#312e81', // Indigo
            secondary: '#4f46e5',
            text: '#1e1b4b',
            border: '#c7d2fe',
            background: '#ffffff',
            tableHeaderBg: '#e0e7ff',
            tableHeaderText: '#312e81',
            accent: '#4338ca',
        },
        typography: {
            fontFamily: 'Roboto, sans-serif',
            headingSize: '28px',
            textSize: '13px',
        },
        layout: {
            headerStyle: 'centered',
            tableStyle: 'striped',
            borderStyle: 'thin',
            compactMode: false,
        }
    },
    {
        id: 'gst-3',
        name: 'GST Theme 3',
        group: 'GST',
        colors: {
            primary: '#065f46', // Emerald
            secondary: '#047857',
            text: '#064e3b',
            border: '#a7f3d0',
            background: '#ffffff',
            tableHeaderBg: '#d1fae5',
            tableHeaderText: '#065f46',
            accent: '#059669',
        },
        typography: {
            fontFamily: 'Open Sans, sans-serif',
            headingSize: '22px',
            textSize: '12px',
        },
        layout: {
            headerStyle: 'standard',
            tableStyle: 'grid',
            borderStyle: 'thin',
            compactMode: false,
        }
    },
    {
        id: 'vintage-1',
        name: 'Vintage Royale',
        group: 'Vintage',
        colors: {
            primary: '#78350f', // Amber/Brown
            secondary: '#92400e',
            text: '#451a03',
            border: '#d6d3d1',
            background: '#fffbf0', // non-pure white
            tableHeaderBg: '#f5f5f4',
            tableHeaderText: '#78350f',
            accent: '#b45309',
        },
        typography: {
            fontFamily: 'Georgia, serif',
            headingSize: '26px',
            textSize: '13px',
        },
        layout: {
            headerStyle: 'centered',
            tableStyle: 'clean',
            borderStyle: 'double',
            compactMode: false,
        }
    },
]

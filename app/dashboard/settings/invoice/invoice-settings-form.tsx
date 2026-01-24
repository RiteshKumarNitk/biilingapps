"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { updateInvoiceSettings } from "@/actions/invoice-settings"
import { Loader2 } from "lucide-react"

// Must match keys in printable-invoice.tsx
const AVAILABLE_THEMES = [
    { id: 'bahikhata_black', name: 'Bahikhata (Black)' },
    { id: 'bahikhata_orange', name: 'Bahikhata (Orange)' },
    { id: 'bahikhata_blue', name: 'Bahikhata (Blue)' },
    { id: 'bahikhata_custom', name: 'Bahikhata (Custom Color)' },
    { id: 'modern', name: 'Modern (Teal)' },
    { id: 'professional', name: 'Professional (Orange)' },
    { id: 'classic', name: 'Legacy Classic' },
    { id: 'tally', name: 'Legacy Tally' },
    { id: 'gst', name: 'Legacy GST' },
    { id: 'minimal', name: 'Legacy Minimal' }
]

export function InvoiceSettingsForm({ settings }: { settings: any }) {
    const [loading, setLoading] = useState(false)
    const [allowedThemes, setAllowedThemes] = useState<string[]>(
        Array.isArray(settings?.allowed_themes)
            ? settings.allowed_themes
            : AVAILABLE_THEMES.map(t => t.id) // Default to all if not set
    )
    const [defaultTheme, setDefaultTheme] = useState<string>(settings?.default_theme || 'bahikhata_black')
    const [brandColor, setBrandColor] = useState<string>(settings?.brand_color || '#000000')

    // Toggles
    const [showWatermark, setShowWatermark] = useState<boolean>(settings?.show_watermark ?? true)
    const [showHSN, setShowHSN] = useState<boolean>(settings?.show_hsn ?? true)
    const [showGST, setShowGST] = useState<boolean>(settings?.show_gst ?? true)
    const [showDiscount, setShowDiscount] = useState<boolean>(settings?.show_discount ?? true)

    const handleThemeToggle = (themeId: string) => {
        setAllowedThemes(current => {
            if (current.includes(themeId)) {
                // Don't allow unchecking the last one
                if (current.length === 1) {
                    toast.error("At least one theme must be enabled")
                    return current
                }
                return current.filter(id => id !== themeId)
            } else {
                return [...current, themeId]
            }
        })
    }

    const onSave = async () => {
        setLoading(true)
        try {
            await updateInvoiceSettings({
                allowed_themes: allowedThemes,
                default_theme: defaultTheme,
                brand_color: brandColor,
                show_watermark: showWatermark,
                show_hsn: showHSN,
                show_gst: showGST,
                show_discount: showDiscount
            })
            toast.success("Invoice settings updated")
        } catch (error: any) {
            toast.error("Failed to update settings")
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-8">
            {/* 1. Defaults Section */}
            <div className="grid gap-6 md:grid-cols-2 p-6 border rounded-lg bg-white shadow-sm">
                <div className="space-y-2">
                    <Label>Default Theme</Label>
                    <select
                        value={defaultTheme}
                        onChange={(e) => setDefaultTheme(e.target.value)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {AVAILABLE_THEMES.filter(t => allowedThemes.includes(t.id)).map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <p className="text-[10px] text-muted-foreground">This theme will be selected automatically when you open an invoice.</p>
                </div>

                <div className="space-y-2">
                    <Label>Custom Brand Color</Label>
                    <div className="flex items-center gap-3">
                        <input
                            type="color"
                            value={brandColor}
                            onChange={(e) => setBrandColor(e.target.value)}
                            className="h-10 w-20 p-1 rounded border cursor-pointer"
                        />
                        <span className="text-sm font-mono text-slate-500">{brandColor}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">Used only for "Bahikhata (Custom Color)" theme.</p>
                </div>
            </div>

            {/* 2. Content Toggles */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Content Options</h3>
                <div className="grid gap-4 sm:grid-cols-2 p-6 border rounded-lg bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="watermark">Show Watermark (Logo in BG)</Label>
                        <Checkbox id="watermark" checked={showWatermark} onCheckedChange={(c) => setShowWatermark(!!c)} />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="hsn">Show HSN Code Column</Label>
                        <Checkbox id="hsn" checked={showHSN} onCheckedChange={(c) => setShowHSN(!!c)} />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="gst">Show GST % Column</Label>
                        <Checkbox id="gst" checked={showGST} onCheckedChange={(c) => setShowGST(!!c)} />
                    </div>
                    <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="discount">Show Discount Column</Label>
                        <Checkbox id="discount" checked={showDiscount} onCheckedChange={(c) => setShowDiscount(!!c)} />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-medium">Theme Management</h3>
                    <p className="text-sm text-slate-500">Select which invoice themes should be available in the detailed dropdown menu.</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {AVAILABLE_THEMES.map((theme) => (
                        <div key={theme.id} className="flex items-start space-x-3 p-4 border rounded-lg bg-slate-50">
                            <Checkbox
                                id={theme.id}
                                checked={allowedThemes.includes(theme.id)}
                                onCheckedChange={() => handleThemeToggle(theme.id)}
                            />
                            <div className="grid gap-1.5 leading-none">
                                <Label
                                    htmlFor={theme.id}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                                >
                                    {theme.name}
                                </Label>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Button onClick={onSave} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
            </Button>
        </div>
    )
}

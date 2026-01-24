"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Need TextArea
import { toast } from "sonner"
import { updateTenantSettings } from "@/actions/user"
import { Loader2 } from "lucide-react"
import { createClient } from "@/utils/supabase/client"

export function SettingsForm({ profile }: { profile: any }) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadingSignature, setUploadingSignature] = useState(false)
    const tenant = profile?.tenants || {}

    const [formData, setFormData] = useState({
        company_name: tenant.name || "",
        address: tenant.address || "",
        phone: tenant.phone || "",
        email: tenant.email || "",
        gst_no: tenant.gst_no || "",
        cin_no: tenant.cin_no || "",
        logo_url: tenant.logo_url || "",
        signature_url: tenant.signature_url || "",
        terms: tenant.settings?.terms || "",
    })

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `logos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('company-assets')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data: { publicUrl } } = supabase.storage
                .from('company-assets')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, logo_url: publicUrl }))
            toast.success("Logo uploaded successfully")
        } catch (error: any) {
            toast.error("Error uploading logo")
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const handleSignatureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploadingSignature(true)
            const supabase = createClient()
            const fileExt = file.name.split('.').pop()
            const fileName = `sig-${Date.now()}.${fileExt}`
            const filePath = `logos/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('company-assets')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('company-assets')
                .getPublicUrl(filePath)

            setFormData(prev => ({ ...prev, signature_url: publicUrl }))
            toast.success("Signature uploaded")
        } catch (error: any) {
            toast.error("Error uploading signature")
            console.error(error)
        } finally {
            setUploadingSignature(false)
        }
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateTenantSettings(formData)
            toast.success("Business settings updated")
        } catch (error: any) {
            toast.error(error.message || "Failed to update settings")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Logo Section */}
                <div className="md:col-span-2 flex flex-col items-center sm:items-start gap-4">
                    <Label>Company Logo</Label>
                    <div className="flex items-center gap-4">
                        <div className="relative h-24 w-24 rounded-lg border border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                            {formData.logo_url ? (
                                <img src={formData.logo_url} alt="Logo" className="h-full w-full object-contain" />
                            ) : (
                                <span className="text-xs text-slate-400">No Logo</span>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Input
                                id="logo"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={uploading || loading}
                                className="w-full max-w-xs"
                            />
                            <p className="text-[10px] text-muted-foreground">Recommended size: 200x200px. Max 2MB.</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="company_name">Company Name</Label>
                    <Input
                        id="company_name"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        placeholder="e.g. Acme Corp"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Business Email</Label>
                    <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="gst_no">GSTIN (Optional)</Label>
                    <Input
                        id="gst_no"
                        value={formData.gst_no}
                        onChange={(e) => setFormData({ ...formData, gst_no: e.target.value })}
                        placeholder="29ABCDE1234F1Z5"
                        className="uppercase"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="cin_no">CIN No. (Optional)</Label>
                    <Input
                        id="cin_no"
                        value={formData.cin_no}
                        onChange={(e) => setFormData({ ...formData, cin_no: e.target.value })}
                        placeholder="U12345KA2024PTC123456"
                        className="uppercase"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        placeholder="Full business address..."
                        className="min-h-[80px]"
                    />
                </div>
            </div>

            {/* Signature Section */}
            <div className="md:col-span-2 flex flex-col items-center sm:items-start gap-4 border-t pt-6 mt-2">
                <Label>Authorised Signatory (Seal & Sign)</Label>
                <div className="flex items-center gap-4">
                    <div className="relative h-24 w-40 rounded-lg border border-dashed border-slate-300 flex items-center justify-center bg-slate-50 overflow-hidden">
                        {formData.signature_url ? (
                            <img src={formData.signature_url} alt="Signature" className="h-full w-full object-contain" />
                        ) : (
                            <span className="text-xs text-slate-400">No Signature</span>
                        )}
                        {uploadingSignature && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Loader2 className="h-6 w-6 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            disabled={uploadingSignature || loading}
                            className="w-full max-w-xs"
                        />
                        <p className="text-[10px] text-muted-foreground">Upload scanned seal & signature. PNG/JPG.</p>
                    </div>
                </div>
            </div>

            <div className="space-y-2 md:col-span-2 border-t pt-6">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                    id="terms"
                    value={formData.terms}
                    onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                    placeholder="Enter default terms and conditions for your invoices..."
                    className="min-h-[120px]"
                />
                <p className="text-[10px] text-muted-foreground">These terms will appear on all new invoices by default.</p>
            </div>

            <Button type="submit" disabled={loading || uploading} className="w-full sm:w-auto">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
            </Button>
        </form>
    )
}

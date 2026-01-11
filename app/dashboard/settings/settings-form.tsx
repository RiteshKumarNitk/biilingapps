"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea" // Need TextArea
import { toast } from "sonner"
import { updateTenantSettings } from "@/actions/user"
import { Loader2 } from "lucide-react"

export function SettingsForm({ profile }: { profile: any }) {
    const [loading, setLoading] = useState(false)
    const tenant = profile?.tenants || {}

    const [formData, setFormData] = useState({
        company_name: tenant.name || "",
        address: tenant.address || "",
        phone: tenant.phone || "",
        email: tenant.email || "",
    })

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
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Business Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input // Or Textarea if available, I'll stick to Input for simplicity unless I check if textarea component exists.
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
            </div>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Settings
            </Button>
        </form>
    )
}

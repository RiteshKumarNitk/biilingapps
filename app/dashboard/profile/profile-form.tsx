"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { updateUserProfile } from "@/actions/user"
import { Loader2 } from "lucide-react"

export function ProfileForm({ user, profile }: { user: any, profile: any }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
    })

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateUserProfile(formData)
            toast.success("Profile updated successfully")
        } catch (error: any) {
            toast.error(error.message || "Failed to update profile")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First name</Label>
                    <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="John"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Last name</Label>
                    <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Doe"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email} disabled readOnly className="bg-slate-50" />
            </div>
            <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    )
}

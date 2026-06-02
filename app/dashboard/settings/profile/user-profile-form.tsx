"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { updateUserProfile } from "@/actions/user"
import { Loader2, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserProfileForm({ user, profile }: { user: any, profile: any }) {
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)

    const [formData, setFormData] = useState({
        first_name: profile?.first_name || "",
        last_name: profile?.last_name || "",
        phone: profile?.phone || "",
        avatar_url: profile?.avatar_url || "",
    })

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setUploading(true)
            const formData = new FormData()
            formData.append('file', file)

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const errorData = await res.json()
                throw new Error(errorData.error || 'Upload failed')
            }

            const data = await res.json()
            setFormData(prev => ({ ...prev, avatar_url: data.url }))
            toast.success("Avatar uploaded successfully")
        } catch (error: any) {
            toast.error("Error uploading avatar")
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

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

    const initials = `${formData.first_name?.[0] || ""}${formData.last_name?.[0] || ""}`.toUpperCase() || "U"

    return (
        <form onSubmit={onSubmit} className="space-y-8 max-w-xl">
            <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border">
                    <AvatarImage src={formData.avatar_url} />
                    <AvatarFallback className="text-lg bg-slate-100">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                    <Label htmlFor="avatar" className="cursor-pointer">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700">
                            Upload New Picture
                        </div>
                    </Label>
                    <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        className="hidden" // Hidden input, triggered by Label
                        onChange={handleFileChange}
                        disabled={uploading || loading}
                    />
                    <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="John"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name</Label>
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
                <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-slate-50"
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

            <Button type="submit" disabled={loading || uploading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </form>
    )
}

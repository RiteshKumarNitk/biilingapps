import { getUserProfile } from "@/actions/user"
import { InvoiceSettingsForm } from "./invoice-settings-form"
import { redirect } from "next/navigation"

export default async function Page() {
    const data = await getUserProfile()

    if (!data) {
        redirect("/login")
    }

    const { profile } = data
    // profile.tenants is an array due to relation, but usually .single() usage in action suggests object
    // Checking previous user.ts action logic: "tenants ( ... ) single()" -> so it's an object. 
    // Wait, in `getUserProfile` it selects `tenants(...)` but usually Supabase returns array depending on relation type (one-to-many vs one-to-one).
    // Let's assume safely it might be an object given `single()` was called on profile query which includes the join.
    // Actually, let's verify `user.ts` query again:
    // .select('*, tenants(...)').eq('id', ...).single() 
    // If tenants is a foreign key on users_profile (tenant_id), it will be an object.

    // Safer to just pass settings directly if it exists.
    const settings = profile?.tenants?.settings || {}

    return (
        <div className="max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">Invoice Settings</h1>
                <p className="text-muted-foreground">Manage your invoice preferences and themes.</p>
            </div>

            <InvoiceSettingsForm settings={settings} />
        </div>
    )
}

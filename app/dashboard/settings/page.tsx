
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { updateTenantProfile } from '@/actions/settings'
// We will create settings actions in next block
import { SettingsForm } from '@/components/settings/settings-form'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: tenant } = await supabase.from('tenants').select('*').single()
    // Note: RLS ensures we get OUR tenant if logic is "users_profile -> tenant_id". 
    // However, the 'tenants' table policy usually is "select using (id = get_my_tenant_id())".
    // Or "select using (id in (select tenant_id from users_profile where user_id = auth.uid()))"

    // If 'tenant' is null, check RLS or connection.

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Business Profile</CardTitle>
                        <CardDescription>Update your business details shown on invoices.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <SettingsForm initialData={tenant} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

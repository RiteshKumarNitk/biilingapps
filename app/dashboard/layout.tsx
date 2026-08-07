
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getUserProfile } from '@/actions/user'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const data = await getUserProfile()

    if (!data?.user) {
        redirect('/login')
    }

    return (
        <DashboardShell user={data.user} profile={data.profile}>
            {children}
        </DashboardShell>
    )
}

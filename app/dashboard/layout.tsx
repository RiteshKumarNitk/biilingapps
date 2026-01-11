
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { getUserProfile } from '@/actions/user'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const data = await getUserProfile()

    return (
        <DashboardShell user={data?.user} profile={data?.profile}>
            {children}
        </DashboardShell>
    )
}

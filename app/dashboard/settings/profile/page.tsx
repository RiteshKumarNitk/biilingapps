import { getUserProfile } from "@/actions/user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserProfileForm } from "./user-profile-form"

export default async function Page() {
    const data = await getUserProfile()

    if (!data) return <div>Access Denied</div>

    return (
        <Card className="border-none shadow-none p-0">
            <CardHeader className="px-0 pt-0">
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <UserProfileForm user={data.user} profile={data.profile} />
            </CardContent>
        </Card>
    )
}

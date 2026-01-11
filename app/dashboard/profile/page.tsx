
import { getUserProfile } from "@/actions/user"
import { Separator } from "@/components/ui/separator"
import { ProfileForm } from "./profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ProfilePage() {
    const data = await getUserProfile()

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium text-slate-800">Profile</h3>
                <p className="text-sm text-slate-500">
                    This is how others will see you on the site.
                </p>
            </div>
            <Separator />
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your personal details here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProfileForm user={data?.user} profile={data?.profile} />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

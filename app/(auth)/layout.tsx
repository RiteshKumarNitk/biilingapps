
export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-muted/40">
            <div className="w-full max-w-md space-y-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <span className="text-4xl">⚡</span>
                    <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                        Vyapar App
                    </h2>
                </div>
                {children}
            </div>
        </div>
    )
}

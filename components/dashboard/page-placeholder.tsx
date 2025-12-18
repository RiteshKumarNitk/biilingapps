'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Construction } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PagePlaceholderProps {
    title: string
    description?: string
}

export function PagePlaceholder({ title, description = "This feature is currently under development." }: PagePlaceholderProps) {
    const router = useRouter()
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            </div>
            <Card className="border-dashed shadow-sm">
                <CardHeader className="text-center py-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-4 bg-primary/10 rounded-full animate-pulse">
                            <Construction className="h-10 w-10 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-xl mb-2">{title}</CardTitle>
                    <CardDescription className="text-base max-w-md mx-auto">{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-12">
                    <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
                </CardContent>
            </Card>
        </div>
    )
}

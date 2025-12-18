'use client'

import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useRouter, useSearchParams } from 'next/navigation'

export function SearchInput({ placeholder }: { placeholder?: string }) {
    const searchParams = useSearchParams()
    const { replace } = useRouter()

    const handleSearch = (term: string) => {
        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        params.delete('page')
        replace(`?${params.toString()}`)
    }

    // Debounce implementation
    const debounce = (func: Function, wait: number) => {
        let timeout: NodeJS.Timeout
        return (...args: any[]) => {
            clearTimeout(timeout)
            timeout = setTimeout(() => func(...args), wait)
        }
    }

    const debouncedSearch = debounce(handleSearch, 300)

    return (
        <div className="flex items-center gap-2 bg-background/50 p-1 rounded-lg border w-full md:w-[300px]">
            <Search className="h-4 w-4 text-muted-foreground ml-2" />
            <Input
                placeholder={placeholder || "Search..."}
                className="border-0 focus-visible:ring-0 bg-transparent h-9"
                onChange={(e) => debouncedSearch(e.target.value)}
                defaultValue={searchParams.get('search')?.toString()}
            />
        </div>
    )
}

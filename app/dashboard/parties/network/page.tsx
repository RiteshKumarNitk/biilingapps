
"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search, MapPin, Store, UserPlus, Share2 } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

export default function VyaparNetworkPage() {
    return (
        <div className="flex-1 p-6 space-y-6 bg-[#F5F7FA] h-full overflow-hidden flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Vyapar Network</h1>
                    <p className="text-slate-500 text-sm mt-1">Connect with businesses near you and grow your network.</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Share2 className="h-4 w-4 mr-2" /> Share My Card
                </Button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border shrink-0">
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <Input
                        placeholder="Search for businesses, suppliers, or customers..."
                        className="pl-10 h-11 bg-slate-50 border-slate-200 text-base"
                    />
                </div>
            </div>

            <Tabs defaultValue="nearby" className="flex-1 flex flex-col overflow-hidden">
                <TabsList className="w-full justify-start bg-transparent border-b border-slate-200 h-10 p-0 rounded-none shrink-0 mb-4">
                    <TabsTrigger
                        value="nearby"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-6 h-10"
                    >
                        Nearby
                    </TabsTrigger>
                    <TabsTrigger
                        value="connections"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-6 h-10"
                    >
                        My Connections
                    </TabsTrigger>
                    <TabsTrigger
                        value="invites"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 px-6 h-10"
                    >
                        Invites
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="nearby" className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Card key={i} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-4 flex gap-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold shrink-0">
                                        TR
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-slate-800 truncate">Tech Retailers Pvt Ltd</h3>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                            <Store className="h-3 w-3" />
                                            <span>Electronics • Wholesale</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                                            <MapPin className="h-3 w-3" />
                                            <span>2.5 km away</span>
                                        </div>
                                        <div className="mt-3 flex gap-2">
                                            <Button size="sm" variant="outline" className="h-7 text-xs flex-1 border-blue-200 text-blue-600 hover:bg-blue-50">
                                                <UserPlus className="h-3 w-3 mr-1" /> Connect
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="connections" className="flex-1 flex items-center justify-center text-slate-400">
                    <div className="text-center">
                        <UserPlus className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p>No connections yet. Start exploring nearby!</p>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}


"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Link as LinkIcon, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function WhatsappConnectPage() {
    return (
        <div className="flex-1 p-8 space-y-8 bg-[#F5F7FA] h-full overflow-y-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">WhatsApp Connect</h1>
                    <p className="text-slate-500 text-sm mt-1">Send invoices, reminders, and notifications directly to your customers.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-green-200 text-green-700 bg-green-50">
                        <MessageSquare className="h-4 w-4 mr-2" /> Support
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Connection Card */}
                <Card className="border-l-4 border-l-green-500 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <LinkIcon className="h-5 w-5 text-green-600" />
                            Connection Status
                        </CardTitle>
                        <CardDescription>Link your business WhatsApp number</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="h-16 w-16 bg-slate-200 rounded-full flex items-center justify-center">
                                <MessageSquare className="h-8 w-8 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-700">Not Connected</h3>
                                <p className="text-sm text-slate-500 max-w-[250px] mx-auto mt-1">Scan QR code to link your WhatsApp and start sending automated messages.</p>
                            </div>
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                Connect WhatsApp
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-semibold text-slate-700 uppercase">Features Enabled</h4>
                            <div className="grid gap-3">
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Send Invoice PDF automatically
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Payment Reminders
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Greetings & Custom Messages
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Card */}
                <Card className="bg-[#E5DDD5] border-transparent shadow-sm overflow-hidden relative">
                    {/* WhatsApp Background Pattern Mock */}
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")' }}></div>

                    <CardHeader className="relative z-10 bg-[#075E54] text-white p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
                            <div>
                                <p className="font-semibold text-sm">Your Business</p>
                                <p className="text-[10px] opacity-80">Online</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10 p-4 space-y-4 min-h-[400px] flex flex-col justify-end">
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow max-w-[85%] self-start text-sm text-slate-800">
                            Hello Customer, your invoice #INV-2024-001 for <span className="font-bold">₹ 1,250.00</span> has been generated.
                            <div className="text-[10px] text-slate-400 text-right mt-1">10:30 AM</div>
                        </div>
                        <div className="bg-white p-3 rounded-lg rounded-tl-none shadow max-w-[85%] self-start text-sm text-slate-800 flex items-center gap-3">
                            <div className="bg-red-100 p-2 rounded h-10 w-10 flex items-center justify-center">
                                <FileIcon />
                            </div>
                            <div>
                                <p className="font-medium">INV-2024-001.pdf</p>
                                <p className="text-xs text-slate-500">PDF • 120 KB</p>
                            </div>
                            <div className="text-[10px] text-slate-400 text-right mt-1 self-end ml-auto">10:30 AM</div>
                        </div>
                        <div className="bg-[#DCF8C6] p-3 rounded-lg rounded-tr-none shadow max-w-[85%] self-end text-sm text-slate-800">
                            Thank you! Payment received.
                            <div className="text-[10px] text-slate-400 text-right mt-1">10:32 AM</div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function FileIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-red-500">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
        </svg>
    )
}

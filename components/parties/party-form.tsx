'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
    Settings,
    X,
    Info,
    Calendar as CalendarIcon,
    Plus,
    ChevronDown,
    MapPin,
    CreditCard,
    FileText
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { createParty, updateParty } from '@/actions/parties'
import { partySchema, PartyFormValues } from '@/lib/schemas/party'

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
]

const GST_TYPES = [
    "Registered Business - Regular",
    "Registered Business - Composition",
    "Unregistered/Consumer",
    "Overseas",
    "SEZ"
]

interface PartyFormProps {
    initialData?: any
    partyId?: string
}

export function PartyForm({ initialData, partyId }: PartyFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("gst-address")

    // Determine default balance type from initial data or default to 'to_receive'
    // If it's a customer, we usually receive money (Debit balance in traditional accounting, but here 'to_receive' is simpler term)
    // Actually simplicity: if type is supplier => to_pay, else to_receive
    const defaultBalanceType = initialData?.type === 'supplier' ? 'to_pay' : 'to_receive'

    const form = useForm<PartyFormValues>({
        resolver: zodResolver(partySchema) as any,
        defaultValues: {
            name: initialData?.name || '',
            gstin: initialData?.gstin || '',
            phone: initialData?.phone || '',
            gst_type: initialData?.gst_type || "Unregistered/Consumer",
            state: initialData?.state || '',
            email: initialData?.email || '',
            billing_address: initialData?.billing_address || '',
            shipping_address: initialData?.shipping_address || '',
            is_shipping_same: initialData ? (initialData.billing_address === initialData.shipping_address) : true,
            opening_balance: initialData?.opening_balance || 0,
            balance_type: defaultBalanceType,
            as_of_date: initialData?.as_of_date ? new Date(initialData.as_of_date) : new Date(),
            credit_limit: initialData?.credit_limit || 0,
            is_custom_credit_limit: (initialData?.credit_limit || 0) > 0,
        }
    })

    const { register, handleSubmit, formState: { errors }, watch, setValue } = form

    // Watchers for conditional rendering
    const isShippingSame = watch('is_shipping_same')
    const isCustomCreditLimit = watch('is_custom_credit_limit')
    const gstType = watch('gst_type')

    async function handleSave(data: PartyFormValues, shouldRedirect: boolean = true) {
        try {
            setLoading(true)
            // Transform data for DB if needed (e.g., separating shipping address if same)
            const submissionData = {
                ...data,
                shipping_address: data.is_shipping_same ? data.billing_address : data.shipping_address
            }

            if (partyId) {
                await updateParty(partyId, submissionData)
                toast.success('Party updated successfully')
            } else {
                await createParty(submissionData)
                toast.success('Party created successfully')
            }

            if (shouldRedirect) {
                router.push('/dashboard/parties')
            } else {
                if (!partyId) {
                    // Reset only if creating new
                    form.reset({
                        name: '',
                        gstin: '',
                        phone: '',
                        email: '',
                        opening_balance: 0,
                        billing_address: '',
                        shipping_address: ''
                    })
                    router.refresh()
                }
            }
        } catch (error: any) {
            console.error(error)
            toast.error(error.message || 'Failed to save party')
        } finally {
            setLoading(false)
        }
    }

    const onSubmit = (data: PartyFormValues) => handleSave(data, true)
    const onSaveAndNew = (data: PartyFormValues) => handleSave(data, false)

    return (
        <div className="mx-auto max-w-5xl bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
                <span className="text-xl font-bold text-slate-800">Add Party</span>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-700">
                        <Settings className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-slate-500 hover:text-red-500" onClick={() => router.back()}>
                        <X className="h-6 w-6" />
                    </Button>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">

                {/* Top Input Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-6 pb-2">
                    <div className="md:col-span-4 space-y-2">
                        <div className="relative">
                            <Input
                                {...register('name')}
                                placeholder="Party Name *"
                                className={cn(
                                    "h-12 text-lg font-medium border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg pl-3",
                                    errors.name && "border-red-500"
                                )}
                            />
                            {errors.name && <span className="text-xs text-red-500 absolute -bottom-5 left-1">{errors.name.message}</span>}
                        </div>
                    </div>

                    <div className="md:col-span-4 space-y-2">
                        <div className="relative">
                            <Input
                                {...register('gstin')}
                                placeholder="GSTIN"
                                className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            />
                            <div className="absolute right-3 top-3.5 text-slate-400 group">
                                <Info className="h-5 w-5 cursor-help" />
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-4 space-y-2">
                        <Input
                            {...register('phone')}
                            placeholder="Phone Number"
                            className="h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 border-b border-slate-100">
                        <TabsList className="h-auto p-0 bg-transparent gap-6">
                            <TabsTrigger
                                value="gst-address"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-2 text-slate-500 font-medium px-1"
                            >
                                GST & Address
                            </TabsTrigger>
                            <TabsTrigger
                                value="credit-balance"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-2 text-slate-500 font-medium px-1 relative"
                            >
                                Credit & Balance
                                <span className="absolute -top-1 -right-3 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">New</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="additional"
                                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 rounded-none pb-3 pt-2 text-slate-500 font-medium px-1"
                            >
                                Additional Fields
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Tab Consents */}
                    <div className="p-6 min-h-[400px]">

                        {/* GST & ADDRESS TAB */}
                        <TabsContent value="gst-address" className="m-0 space-y-8 animate-in fade-in-50 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {/* Left Column: GST & Contact */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-slate-500 font-normal">GST Type</Label>
                                        <Select
                                            value={gstType}
                                            onValueChange={(val) => setValue('gst_type', val)}
                                        >
                                            <SelectTrigger className="h-11 border-slate-200">
                                                <SelectValue placeholder="Select GST Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {GST_TYPES.map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-slate-500 font-normal">State</Label>
                                        <Select
                                            value={watch('state')}
                                            onValueChange={(val) => setValue('state', val)}
                                        >
                                            <SelectTrigger className="h-11 border-slate-200">
                                                <SelectValue placeholder="Select State" />
                                            </SelectTrigger>
                                            <SelectContent className="h-[200px]">
                                                {INDIAN_STATES.map(state => (
                                                    <SelectItem key={state} value={state}>{state}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-slate-500 font-normal">Email ID</Label>
                                        <Input
                                            {...register('email')}
                                            placeholder="Enter Email Address"
                                            className="h-11 border-slate-200"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Addresses */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-slate-700 font-semibold">Billing Address</Label>
                                        </div>
                                        <Textarea
                                            {...register('billing_address')}
                                            placeholder="Enter full address here..."
                                            className="min-h-[100px] resize-none border-slate-200 focus:border-blue-500"
                                        />
                                        <Button variant="link" className="h-auto p-0 text-blue-600 text-xs font-normal" type="button">
                                            <MapPin className="h-3 w-3 mr-1" /> Show Detailed Address
                                        </Button>
                                    </div>

                                    <div className="space-y-3 pt-2">
                                        {!isShippingSame ? (
                                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-slate-700 font-semibold">Shipping Address</Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => setValue('is_shipping_same', true)}
                                                        type="button"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                                <Textarea
                                                    {...register('shipping_address')}
                                                    placeholder="Enter shipping address..."
                                                    className="min-h-[100px] resize-none border-slate-200 focus:border-blue-500"
                                                />
                                            </div>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                className="w-full border-dashed border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                                onClick={() => setValue('is_shipping_same', false)}
                                                type="button"
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Enable Shipping Address
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* CREDIT & BALANCE TAB */}
                        <TabsContent value="credit-balance" className="m-0 space-y-8 animate-in fade-in-50 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-slate-500 font-normal">Opening Balance</Label>
                                        <div className="flex flex-col gap-4">
                                            <div className="relative">
                                                <Input
                                                    type="number"
                                                    {...register('opening_balance')}
                                                    className="h-11 border-slate-200 pl-4"
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Balance Type:</Label>
                                                <RadioGroup
                                                    value={watch('balance_type')}
                                                    onValueChange={(val) => setValue('balance_type', val as 'to_pay' | 'to_receive')}
                                                    className="flex items-center gap-4"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="to_pay" id="to_pay" className="text-red-500 border-red-200" />
                                                        <Label htmlFor="to_pay" className="cursor-pointer font-medium text-slate-700">To Pay</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="to_receive" id="to_receive" className="text-green-500 border-green-200" />
                                                        <Label htmlFor="to_receive" className="cursor-pointer font-medium text-slate-700">To Receive</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-slate-500 font-normal">As Of Date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full h-11 justify-start text-left font-normal border-slate-200",
                                                        !watch('as_of_date') && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {watch('as_of_date') ? format(watch('as_of_date') || new Date(), "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={watch('as_of_date')}
                                                    onSelect={(date) => setValue('as_of_date', date || new Date())}
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Label className="text-slate-700 font-semibold">Credit Limit</Label>
                                            <Info className="h-4 w-4 text-slate-400" />
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id="custom-limit"
                                                    checked={isCustomCreditLimit}
                                                    onCheckedChange={(checked) => setValue('is_custom_credit_limit', checked)}
                                                />
                                                <Label htmlFor="custom-limit" className="font-normal text-slate-600">
                                                    {isCustomCreditLimit ? 'Custom Limit' : 'No Limit'}
                                                </Label>
                                            </div>
                                        </div>

                                        {isCustomCreditLimit && (
                                            <Input
                                                type="number"
                                                {...register('credit_limit')}
                                                placeholder="Enter Credit Limit Amount"
                                                className="h-11 border-slate-200 animate-in fade-in slide-in-from-top-1"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* ADDITIONAL FIELDS TAB */}
                        <TabsContent value="additional" className="m-0 space-y-8 animate-in fade-in-50 duration-300">
                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                                <FileText className="h-12 w-12 mb-3 opacity-20" />
                                <p className="text-sm">Additional custom fields can be configured here.</p>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleSubmit(onSaveAndNew)}
                        disabled={loading || !form.formState.isValid}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 h-11 px-6"
                    >
                        Save & New
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !form.formState.isValid}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-11 px-8 shadow-md shadow-blue-200"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </form>
        </div>
    )
}

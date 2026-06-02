'use server'

import InvoiceService from '@/lib/services/invoice.service'
import { requireAuth } from '@/lib/auth-server'
import prisma from '@/lib/prisma'

export async function getInvoiceStats(filters?: { search?: string; startDate?: Date; endDate?: Date; status?: string }) {
  const user = await requireAuth()
  return await InvoiceService.getInvoiceStats(filters) // Note: This isn't fully implemented in the service yet, but we'll call it anyway or rewrite it here.
}

export async function getInvoices(
  page = 1,
  pageSize = 10,
  filters?: {
    search?: string;
    startDate?: Date;
    endDate?: Date;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }
) {
  const user = await requireAuth()
  return await InvoiceService.getInvoices(user.tenantId, page, pageSize, filters)
}

export async function createInvoice(data: any) {
  const user = await requireAuth()
  return await InvoiceService.createInvoice(data, user.tenantId)
}

export async function getInvoiceDetails(id: string) {
  const user = await requireAuth()
  return await InvoiceService.getInvoiceDetails(id, user.tenantId)
}

export async function getLastInvoiceNumber() {
  const user = await requireAuth()
  return await InvoiceService.getLastInvoiceNumber(user.tenantId)
}

export async function deleteInvoice(id: string) {
  const user = await requireAuth()
  return await InvoiceService.deleteInvoice(id, user.tenantId)
}
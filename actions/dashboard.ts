'use server'

import DashboardService from '@/lib/services/dashboard.service'
import { requireAuth } from '@/lib/auth-server'

export async function getDashboardStats(month?: number, year?: number) {
  const user = await requireAuth()
  return DashboardService.getDashboardStats(user.tenantId, month, year)
}

export async function getInventoryStats() {
  const user = await requireAuth()
  return DashboardService.getInventoryStats(user.tenantId)
}

export async function getFinancialStats(month?: number, year?: number) {
  const user = await requireAuth()
  return DashboardService.getFinancialStats(user.tenantId, month, year)
}

export async function getCustomerStats() {
  const user = await requireAuth()
  return DashboardService.getCustomerStats(user.tenantId)
}

export async function getOperationsStats() {
  const user = await requireAuth()
  return DashboardService.getOperationsStats(user.tenantId)
}

export async function getRecentSales() {
  const user = await requireAuth()
  return DashboardService.getRecentSales(user.tenantId)
}

export async function getOverviewChartData(year?: number) {
  const user = await requireAuth()
  return DashboardService.getOverviewChartData(user.tenantId, year)
}

export async function getSalesByCategory() {
  const user = await requireAuth()
  return DashboardService.getSalesByCategory(user.tenantId)
}

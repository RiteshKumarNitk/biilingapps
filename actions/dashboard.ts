'use server'

import DashboardService from '@/lib/services/dashboard.service'

export async function getDashboardStats(month?: number, year?: number) {
  return DashboardService.getDashboardStats(month, year)
}

export async function getInventoryStats() {
  return DashboardService.getInventoryStats()
}

export async function getFinancialStats(month?: number, year?: number) {
  return DashboardService.getFinancialStats(month, year)
}

export async function getCustomerStats() {
  return DashboardService.getCustomerStats()
}

export async function getOperationsStats() {
  return DashboardService.getOperationsStats()
}

export async function getRecentSales() {
  return DashboardService.getRecentSales()
}

export async function getOverviewChartData(year?: number) {
  return DashboardService.getOverviewChartData(year)
}

export async function getSalesByCategory() {
  return DashboardService.getSalesByCategory()
}
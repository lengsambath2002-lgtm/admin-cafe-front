/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Product, Order, Transaction } from '../types';

// Backend base URL — configurable per environment, falls back to the deployed Render service.
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://admin-cafe-back-1.onrender.com'
).replace(/\/+$/, '');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });

  if (!res.ok) {
    let detail = '';
    try {
      detail = await res.text();
    } catch {
      // ignore — best-effort error detail
    }
    throw new Error(
      `API ${options?.method || 'GET'} ${path} failed (${res.status})${detail ? `: ${detail}` : ''}`
    );
  }

  // 204 No Content, or empty body
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : (undefined as T);
}

// Build a query string from defined, non-empty params.
function qs(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`).join('&');
}

// ---- Request payload shapes (mirror the backend OpenAPI schemas) ----

export interface ProductRequest {
  name: string;
  category: string;
  price: number;
  stock?: number;
  description?: string;
  image?: string;
}

export interface CategoryRequest {
  name: string;
  image?: string;
}

export interface PlaceOrderItemRequest {
  productName: string;
  quantity?: number;
  size?: string;
  notes?: string[];
  priceOrder: number;
}

export interface PlaceOrderRequest {
  tableNumber?: string;
  customerName?: string;
  isTakeout?: boolean;
  items: PlaceOrderItemRequest[];
  kitchenNote?: string;
}

export interface UpdateStatusResponse {
  order: Order;
  transaction?: Transaction;
}

// ---- Analytics / reports response shapes ----

export interface NamedCount {
  name: string;
  unitsSold: number;
}

export interface CategoryShare {
  name: string;
  sharePct: number;
}

export interface ReportSummary {
  range: string;
  totalRevenue: number;
  revenueGrowthPct: number;
  totalOrders: number;
  ordersGrowthPct: number;
  activeOrders: number;
  topSellingProduct: NamedCount;
  topCategory: CategoryShare;
}

export interface RevenuePoint {
  label: string;
  date: string;
  revenue: number;
  isPeak: boolean;
}

export interface RevenueSeries {
  range: string;
  points: RevenuePoint[];
}

export interface TopProduct {
  productName: string;
  category: string;
  unitsSold: number;
  revenue: number;
}

export interface ReportKpis {
  range: string;
  avgOrderValue: number;
  avgOrderValueGrowthPct: number;
  newCustomers: number;
  newCustomersGrowthPct: number;
  topCategory: string;
  topCategorySharePct: number;
  staffEfficiencyMinutes: number;
}

export type ReportRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

// ---- Typed endpoint client (the 11 backend endpoints) ----

export const api = {
  // Categories
  listCategories: () => request<Category[]>('/api/categories'),
  createCategory: (body: CategoryRequest) =>
    request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
  deleteCategory: (id: string) =>
    request<void>(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Products
  listProducts: () => request<Product[]>('/api/products'),
  createProduct: (body: ProductRequest) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: ProductRequest) =>
    request<Product>(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteProduct: (id: string) =>
    request<void>(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Orders
  listOrders: () => request<Order[]>('/api/orders'),
  placeOrder: (body: PlaceOrderRequest) =>
    request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrderStatus: (id: string, status: string) =>
    request<UpdateStatusResponse>(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Transactions
  listTransactions: () => request<Transaction[]>('/api/transactions'),

  // Reports / analytics
  reportSummary: (range?: ReportRange) =>
    request<ReportSummary>(`/api/reports/summary${qs({ range })}`),
  revenueSeries: (range?: ReportRange) =>
    request<RevenueSeries>(`/api/reports/revenue-series${qs({ range })}`),
  topProducts: (range?: ReportRange, limit?: number) =>
    request<TopProduct[]>(`/api/reports/top-products${qs({ range, limit })}`),
  reportKpis: (range?: ReportRange) =>
    request<ReportKpis>(`/api/reports/kpis${qs({ range })}`),

  // Streams a binary report and triggers a browser download (PDF/CSV).
  async downloadReport(range: ReportRange = 'monthly', format: 'pdf' | 'csv' = 'pdf'): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/reports/export${qs({ range, format })}`);
    if (!res.ok) {
      throw new Error(`Report export failed (${res.status})`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${range}.${format}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
};

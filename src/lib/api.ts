/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Category, Product, Order, Transaction } from '../types';

// Backend base URL — configurable per environment, falls back to the deployed Render service.
const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://admin-cafe-back-1.onrender.com'
).replace(/\/+$/, '');

// ---- Bearer token (every endpoint except /api/login and /api/guest/orders requires it) ----
const TOKEN_KEY = 'brewmaster_token';

export function setAuthToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// Build the auth header for raw fetch() calls (uploads, downloads).
function authHeader(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeader(),
      ...(options?.headers || {}),
    },
    ...options,
  });

  // An authenticated session that got rejected (expired/invalid token) — clear it
  // and bounce to login. Guests have no token, so they're left alone here.
  if (res.status === 401 && typeof window !== 'undefined' && getAuthToken()) {
    setAuthToken(null);
    localStorage.removeItem('brewmaster_auth');
    if (window.location.pathname !== '/login') window.location.href = '/login';
  }

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

// PATCH /api/orders/{id} — all fields optional (partial edit of a placed order).
export interface UpdateOrderRequest {
  tableNumber?: string;
  customerName?: string;
  isTakeout?: boolean;
  kitchenNote?: string;
  items?: PlaceOrderItemRequest[];
}

export interface RefundRequest {
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  transaction: Transaction;
  order?: Order;
}

// ---- Auth shapes ----

export interface BackendAuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  token: string;
  user: BackendAuthUser;
}

export interface MeResponse {
  user: BackendAuthUser;
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

// ---- Typed endpoint client (mirrors api-docs.json) ----

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<LoginResponse>('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<void>('/api/logout', { method: 'POST' }),
  me: () => request<MeResponse>('/api/me'),

  // Categories
  listCategories: () => request<Category[]>('/api/categories'),
  // Public guest menu — no auth token required.
  listGuestCategories: () => request<Category[]>('/api/guest/categories'),
  createCategory: (body: CategoryRequest) =>
    request<Category>('/api/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: string, body: CategoryRequest) =>
    request<Category>(`/api/categories/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteCategory: (id: string) =>
    request<void>(`/api/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  // Products
  listProducts: () => request<Product[]>('/api/products'),
  // Public guest menu — no auth token required.
  listGuestProducts: () => request<Product[]>('/api/guest/products'),
  createProduct: (body: ProductRequest) =>
    request<Product>('/api/products', { method: 'POST', body: JSON.stringify(body) }),
  updateProduct: (id: string, body: ProductRequest) =>
    request<Product>(`/api/products/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
  deleteProduct: (id: string) =>
    request<void>(`/api/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  // Lock hides a product from the guest menu; unlock re-exposes it.
  lockProduct: (id: string) =>
    request<Product>(`/api/products/${encodeURIComponent(id)}/lock`, { method: 'PATCH' }),
  unlockProduct: (id: string) =>
    request<Product>(`/api/products/${encodeURIComponent(id)}/unlock`, { method: 'PATCH' }),

  // Orders
  listOrders: () => request<Order[]>('/api/orders'),
  // Orders placed by guests — admin-only view.
  listGuestOrders: () => request<Order[]>('/api/orders/guest'),
  placeOrder: (body: PlaceOrderRequest) =>
    request<Order>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  // Public guest checkout — no auth token required.
  placeGuestOrder: (body: PlaceOrderRequest) =>
    request<Order>('/api/guest/orders', { method: 'POST', body: JSON.stringify(body) }),
  updateOrder: (id: string, body: UpdateOrderRequest) =>
    request<Order>(`/api/orders/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  cancelOrder: (id: string) =>
    request<void>(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  updateOrderStatus: (id: string, status: string) =>
    request<UpdateStatusResponse>(`/api/orders/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Transactions
  listTransactions: () => request<Transaction[]>('/api/transactions'),
  refundTransaction: (id: string, body: RefundRequest = {}) =>
    request<RefundResponse>(`/api/transactions/${encodeURIComponent(id)}/refund`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

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
  // Backend supports csv and xlsx (pdf returns 501 — not implemented).
  async downloadReport(range: ReportRange = 'monthly', format: 'csv' | 'xlsx' = 'csv'): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/reports/export${qs({ range, format })}`, {
      headers: authHeader(),
    });
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

  // Uploads an image via multipart/form-data (POST /api/upload).
  // Do NOT set Content-Type — the browser must add the multipart boundary.
  // Returns the absolute asset URL plus the raw server payload.
  async uploadImage(file: File): Promise<{ url: string; filename?: string; raw: Record<string, string> }> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${BASE_URL}/api/upload`, { method: 'POST', body: form, headers: authHeader() });
    if (!res.ok) {
      throw new Error(`Upload failed (${res.status})`);
    }
    const raw = (await res.json()) as Record<string, string>;
    // The response is a string map; tolerate common key names from the backend.
    const candidate = raw.url ?? raw.path ?? raw.location ?? raw.filename ?? Object.values(raw)[0] ?? '';
    const url = candidate && !/^https?:\/\//i.test(candidate)
      ? `${BASE_URL}${candidate.startsWith('/') ? '' : '/'}${candidate}`
      : candidate;
    // The server only returns a url, so derive the filename (basename) from it
    // — that's what DELETE /api/upload/{filename} needs.
    const filename = raw.filename ?? (url ? url.split('/').pop() || undefined : undefined);
    return { url, filename, raw };
  },

  // Removes a previously uploaded file (DELETE /api/upload/{filename}).
  deleteUpload: (filename: string) =>
    request<Record<string, unknown>>(`/api/upload/${encodeURIComponent(filename)}`, { method: 'DELETE' }),
};

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
};

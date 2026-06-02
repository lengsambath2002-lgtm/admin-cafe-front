/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  itemsCount: number;
  image: string;
  icon: string; // lucide icon name
}

export interface Product {
  id: string;
  name: string;
  category: string; // Category id or category name (e.g. 'espresso', 'cold_brew', etc.)
  price: number;
  stock: number;
  description: string;
  image: string;
  imageUrl?: string; // fallback if uploaded
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  size: 'S' | 'Reg' | 'L' | 'XL' | 'Spec';
  notes?: string[];
  priceOrder: number; // calculated as quantity * item_price
}

export interface Order {
  id: string;
  tableNumber: string;
  isTakeout: boolean;
  customerName?: string;
  timeElapsed: string;
  timestamp: string;
  status: 'Preparing' | 'Ready' | 'Picked Up' | 'New' | 'Completed';
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  kitchenNote?: string;
  server?: string;
  queuePosition?: number;
}

export interface Transaction {
  id: string;
  orderId?: string;
  customerName: string;
  description: string;
  timestamp: string;
  itemsCount: number;
  amount: number;
  status: 'COMPLETED' | 'REFUNDED' | 'PENDING';
}

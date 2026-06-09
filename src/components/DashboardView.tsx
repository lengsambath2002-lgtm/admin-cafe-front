/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Coffee,
  TrendingDown,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ClipboardList,
  X,
  QrCode,
} from 'lucide-react';
import { Order } from '../types';
import { api, ReportSummary } from '../lib/api';
import { generateOrderKHQR, OrderKHQR } from '../lib/khqr';
import KHQRModal from './KHQRModal';

interface DashboardViewProps {
  orders: Order[];
  onNavigate: (tab: string) => void;
  onSelectOrder: (orderId: string) => void;
}

// Status pill colors for the Active Orders list.
const STATUS_BADGE: Record<Order['status'], string> = {
  New: 'bg-blue-100 text-blue-700',
  Preparing: 'bg-amber-100 text-amber-700',
  Ready: 'bg-green-100 text-green-700',
  'Picked Up': 'bg-surface-container text-on-surface-variant',
  Completed: 'bg-surface-container text-on-surface-variant',
};

export default function DashboardView({ orders, onNavigate, onSelectOrder }: DashboardViewProps) {
  // Server-computed daily summary (KPI cards).
  const [summary, setSummary] = useState<ReportSummary | null>(null);

  useEffect(() => {
    let active = true;
    api.reportSummary('daily')
      .then(s => { if (active) setSummary(s); })
      .catch(() => { /* leave nulls → graceful fallbacks below */ });
    return () => { active = false; };
  }, []);

  // Fallbacks keep the UI sane before data arrives / if a call fails.
  const totalRevenue = summary?.totalRevenue
    ?? (1284.50 + orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.total, 0));
  const totalOrders = summary?.totalOrders ?? orders.length;
  const activeOrdersCount = summary?.activeOrders ?? orders.filter(o => o.status !== 'Completed').length;
  const revenueGrowth = summary?.revenueGrowthPct ?? 0;
  const ordersGrowth = summary?.ordersGrowthPct ?? 0;
  const topDrink = summary?.topSellingProduct;

  // Live operational lists.
  const activeOrders = orders.filter(o => o.status !== 'Completed' && o.status !== 'Picked Up');

  // Clicking an active order shows its detail in the right panel.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedOrder = selectedId ? orders.find(o => o.id === selectedId) ?? null : null;

  // KHQR payment popup the admin can open for a guest to scan & pay.
  const [khqr, setKhqr] = useState<{ payment: OrderKHQR; orderId: string } | null>(null);
  const [charging, setCharging] = useState<string | null>(null);

  const showKhqr = async (order: Order) => {
    setCharging(order.id);
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const billNumber = `#${order.id}`;
    try {
      const res = await api.generateOrderKhqr(order.id, {
        currency: 'USD', amount: order.total, billNumber, expirationTimestamp: expiresAt,
      });
      setKhqr({ payment: { qr: res.qr, md5: res.md5 ?? '', amount: order.total, currency: 'USD', expiresAt }, orderId: order.id });
    } catch {
      // Backend unavailable — fall back to client-side generation.
      try {
        setKhqr({ payment: generateOrderKHQR(order.total, { billNumber }), orderId: order.id });
      } catch { /* give up */ }
    } finally {
      setCharging(null);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* KHQR payment popup (admin shows it to a guest to pay) */}
      {khqr && (
        <KHQRModal payment={khqr.payment} orderId={khqr.orderId} onClose={() => setKhqr(null)} />
      )}

      {/* Quick Action Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Daily Overview</h2>
          <p className="text-secondary text-base mt-1">Monitor your cafe&apos;s peak performance and order velocity in real-time.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigate('register_product')}
            className="flex items-center gap-2 border border-outline-variant/60 bg-surface-container-lowest text-primary hover:bg-surface-container-low px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            Register Product
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary-container px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <TrendingUp className="w-4 h-4 text-on-primary" />
            Export Report
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Daily Revenue Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col justify-between transition-all duration-300 hover:shadow-bento-raised hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Daily Revenue</p>
              <h3 className="text-4xl font-extrabold text-primary tracking-tight mt-2">
                ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-secondary-container/60 rounded-xl">
              <TrendingUp className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${revenueGrowth < 0 ? 'bg-red-100/80 text-red-800' : 'bg-green-100/80 text-green-800'}`}>
              {revenueGrowth < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {Math.abs(revenueGrowth).toFixed(1)}%
            </span>
            <span className="text-xs text-on-surface-variant">vs yesterday</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col justify-between transition-all duration-300 hover:shadow-bento-raised hover:-translate-y-0.5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Total Orders</p>
              <h3 className="text-4xl font-extrabold text-primary tracking-tight mt-2">{totalOrders.toLocaleString('en-US')}</h3>
            </div>
            <div className="p-3 bg-secondary-container/60 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${ordersGrowth < 0 ? 'bg-red-100/80 text-red-800' : 'bg-green-100/80 text-green-800'}`}>
              {ordersGrowth < 0 ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              {Math.abs(ordersGrowth).toFixed(1)}%
            </span>
            <span className="text-xs text-on-surface-variant">vs average ({activeOrdersCount} billing now)</span>
          </div>
        </div>

        {/* Top Selling Beverage Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col justify-between transition-all duration-300 hover:shadow-bento-raised hover:-translate-y-0.5 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Top Selling Drink</p>
              <h3 className="text-2xl font-bold text-primary tracking-tight mt-2">{topDrink?.name ?? '—'}</h3>
            </div>
            <div className="p-3 bg-secondary-container/60 rounded-xl">
              <Coffee className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">
              {topDrink ? `${topDrink.unitsSold.toLocaleString('en-US')} units sold today` : 'No sales yet today'}
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 pointer-events-none">
            <Coffee className="w-36 h-36 text-primary" />
          </div>
        </div>
      </div>

      {/* Operational row: Active Orders (→ Orders List) + selected order detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:items-start">

        {/* Active Orders — live list, links to the Orders List page */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-bold text-primary tracking-tight">Active Orders</h3>
              {activeOrders.length > 0 && (
                <span className="ml-1 min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary text-on-primary text-xs font-bold flex items-center justify-center">
                  {activeOrders.length}
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigate('order-list')}
              className="text-primary hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              View all
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
                <ClipboardList className="w-5 h-5 text-on-surface-variant/60" />
              </div>
              <p className="text-sm font-semibold text-on-surface-variant">No active orders right now</p>
              <p className="text-xs text-on-surface-variant/70 mt-1">New orders will show up here.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeOrders.slice(0, 6).map((order) => (
                <button
                  key={order.id}
                  onClick={() => setSelectedId(order.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all border text-left cursor-pointer group ${
                    selectedId === order.id
                      ? 'border-primary bg-surface-container-low'
                      : 'border-outline-variant/15 hover:bg-surface-container-low'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                      #{order.id}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate">
                        {order.tableNumber || 'No table'}{order.customerName ? ` · ${order.customerName}` : ''}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {order.items.reduce((n, i) => n + i.quantity, 0)} items
                        {order.isTakeout ? ' · To-Go' : ' · Dine-in'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-primary tabular-nums">${order.total.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right panel: selected order detail, else the Take Order shortcut */}
        {selectedOrder ? (
          <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl shadow-bento-raised border border-outline-variant/30 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold text-primary tracking-tight">Order #{selectedOrder.id}</h3>
              <button
                onClick={() => setSelectedId(null)}
                className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant cursor-pointer"
                aria-label="Close detail"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[selectedOrder.status]}`}>
                {selectedOrder.status}
              </span>
              {selectedOrder.paymentStatus && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedOrder.paymentStatus === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  {selectedOrder.paymentStatus === 'PAID' ? 'Paid' : 'Unpaid'}
                </span>
              )}
              <span className="text-xs text-on-surface-variant">
                {selectedOrder.tableNumber || 'No table'}
                {selectedOrder.customerName ? ` · ${selectedOrder.customerName}` : ''}
                {selectedOrder.isTakeout ? ' · To-Go' : ' · Dine-in'}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-72 pr-1 scrollbar-thin">
              {selectedOrder.items.map((it) => (
                <div key={it.id} className="flex items-start justify-between gap-3 pb-2.5 border-b border-outline-variant/10 last:border-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary">
                      <span className="text-on-surface-variant">{it.quantity}×</span> {it.productName}
                    </p>
                    <p className="text-[11px] text-on-surface-variant">
                      {it.size}{it.notes && it.notes.length > 0 ? ` · ${it.notes.join(' · ')}` : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-primary tabular-nums shrink-0">${it.priceOrder.toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-outline-variant/20 space-y-1">
              <div className="flex justify-between text-xs text-on-surface-variant"><span>Subtotal</span><span>${selectedOrder.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-on-surface-variant"><span>Tax</span><span>${selectedOrder.tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-extrabold text-primary"><span>Total</span><span>${selectedOrder.total.toFixed(2)}</span></div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {selectedOrder.paymentStatus === 'PAID' ? (
                <div className="flex items-center justify-center gap-1.5 bg-green-50 text-green-700 font-bold text-sm py-2.5 rounded-xl">
                  Paid
                </div>
              ) : (
                <button
                  onClick={() => showKhqr(selectedOrder)}
                  disabled={charging === selectedOrder.id}
                  className="flex items-center justify-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container disabled:opacity-50 font-bold text-sm py-2.5 rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                  {charging === selectedOrder.id ? '…' : 'Show KHQR'}
                </button>
              )}
              <button
                onClick={() => onSelectOrder(selectedOrder.id)}
                className="flex items-center justify-center gap-1.5 border border-outline-variant/50 hover:border-primary text-primary font-bold text-sm py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Orders List
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col items-center justify-center text-center min-h-[260px]">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mb-3">
              <ClipboardList className="w-5 h-5 text-on-surface-variant/60" />
            </div>
            <p className="text-sm font-semibold text-on-surface-variant">Select an order</p>
            <p className="text-xs text-on-surface-variant/70 mt-1">Click an active order to see its details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

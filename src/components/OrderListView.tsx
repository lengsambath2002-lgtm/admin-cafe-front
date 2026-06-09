/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useMemo, useState } from 'react';
import { ClipboardList, CheckCircle, ArrowRight, Grid3X3, List, Eye, X, Trash2 } from 'lucide-react';
import { Order } from '../types';

interface OrderListViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => Promise<Order>;
  onCancel?: (orderId: string) => Promise<void>;
}

// Live status progression for a placed order.
const NEXT_STATUS: Partial<Record<Order['status'], Order['status']>> = {
  New: 'Preparing',
  Preparing: 'Ready',
  Ready: 'Completed'
};

const ADVANCE_LABEL: Partial<Record<Order['status'], string>> = {
  New: 'Start Preparing',
  Preparing: 'Mark as Ready',
  Ready: 'Complete & Pickup'
};

const STATUS_BADGE: Record<Order['status'], string> = {
  New: 'bg-blue-100 text-blue-800',
  Preparing: 'bg-amber-100 text-amber-800',
  Ready: 'bg-green-100 text-green-800',
  Completed: 'bg-neutral-100 text-neutral-600',
  'Picked Up': 'bg-neutral-100 text-neutral-600'
};

type Filter = 'active' | 'completed' | 'all';
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
  { id: 'all', label: 'All' }
];

const isActive = (s: Order['status']) => s === 'New' || s === 'Preparing' || s === 'Ready';

export default function OrderListView({ orders, onUpdateStatus, onCancel }: Readonly<OrderListViewProps>) {
  const [filter, setFilter] = useState<Filter>('active');
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>('grid');
  const [advancingId, setAdvancingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const cancelOrder = async (order: Order) => {
    if (!onCancel || cancelingId) return;
    if (!window.confirm(`Cancel order #${order.id}? This cannot be undone.`)) return;
    try {
      setCancelingId(order.id);
      await onCancel(order.id);
      setDetailId(null);
    } catch {
      // parent surfaced the error
    } finally {
      setCancelingId(null);
    }
  };

  const visible = useMemo(() => {
    if (filter === 'active') return orders.filter((o) => isActive(o.status));
    if (filter === 'completed') return orders.filter((o) => !isActive(o.status));
    return orders;
  }, [orders, filter]);

  const advanceStatus = async (order: Order) => {
    if (advancingId) return;
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      setAdvancingId(order.id);
      await onUpdateStatus(order.id, next);
    } catch {
      // parent surfaced the error
    } finally {
      setAdvancingId(null);
    }
  };

  const activeCount = orders.filter((o) => isActive(o.status)).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold text-primary tracking-tight">Orders List</h2>
            <span className="flex items-center gap-1.5 bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {activeCount} Active
            </span>
          </div>
          <p className="text-secondary text-base mt-1">Process and track incoming orders in real-time.</p>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* View toggle (card / table) */}
          <div className="flex bg-surface-container p-0.5 rounded-xl border border-outline-variant/35 shrink-0">
            <button
              type="button"
              onClick={() => setViewStyle('grid')}
              title="Card view"
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewStyle === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewStyle('list')}
              title="Table view"
              className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all cursor-pointer ${viewStyle === 'list' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex bg-surface-container p-0.5 rounded-xl border border-outline-variant/35">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  filter === f.id ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders grid */}
      {visible.length === 0 ? (
        <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/25 shadow-bento">
          <ClipboardList className="w-10 h-10 text-on-surface-variant/35 mx-auto mb-3" />
          <p className="text-on-surface-variant font-semibold text-sm">No {filter === 'all' ? '' : filter} orders.</p>
        </div>
      ) : viewStyle === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {visible.map((order) => {
            const orderItemCount = order.items.reduce((n, i) => n + i.quantity, 0);
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => setDetailId(order.id)}
                className="text-left rounded-2xl border border-outline-variant/30 bg-surface-container-lowest overflow-hidden shadow-bento transition-all duration-300 hover:shadow-bento-raised hover:border-primary/40 cursor-pointer p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-primary">Order #{order.id}</h4>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[order.status]}`}>
                    {order.status}
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  {order.tableNumber || 'No table'}
                  {order.customerName ? ` · ${order.customerName}` : ''}
                  {order.isTakeout ? ' · To-Go' : ' · Dine-in'}
                  {order.timeElapsed ? ` · ${order.timeElapsed}` : ''}
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {orderItemCount} item(s) · view details
                  </span>
                  <span className="text-sm font-bold text-secondary">${order.total.toFixed(2)}</span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 overflow-hidden shadow-bento overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-surface-container-low/50 border-b border-outline-variant/35 text-[11px] uppercase text-on-surface-variant/80">
                <th className="px-5 py-3.5 font-semibold">Order</th>
                <th className="px-5 py-3.5 font-semibold">Details</th>
                <th className="px-5 py-3.5 font-semibold text-center">Items</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold text-right">Total</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15">
              {visible.map((order) => {
                const next = NEXT_STATUS[order.status];
                const closed = order.status === 'Completed' || order.status === 'Picked Up';
                const orderItemCount = order.items.reduce((n, i) => n + i.quantity, 0);
                return (
                  <tr key={order.id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="text-sm font-bold text-primary">#{order.id}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-semibold text-primary">
                        {order.tableNumber || 'No table'}{order.customerName ? ` · ${order.customerName}` : ''}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {order.isTakeout ? 'To-Go' : 'Dine-in'}{order.timeElapsed ? ` · ${order.timeElapsed}` : ''}
                      </p>
                    </td>
                    <td className="px-5 py-3.5 text-center text-xs font-semibold text-on-surface-variant">{orderItemCount}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm font-bold text-secondary">${order.total.toFixed(2)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setDetailId(order.id)}
                          title="View details"
                          className="inline-flex items-center gap-1.5 border border-outline-variant/40 hover:border-primary text-primary font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {closed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {order.status}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => advanceStatus(order)}
                            disabled={advancingId === order.id}
                            className="inline-flex items-center gap-1.5 bg-primary text-on-primary hover:bg-primary-container font-bold text-[11px] px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                          >
                            {advancingId === order.id ? 'Updating…' : ADVANCE_LABEL[order.status]}
                            {next && <ArrowRight className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Order detail popup (used by the table's "Details" button) */}
      {detailId && (() => {
        const o = orders.find((x) => x.id === detailId);
        if (!o) return null;
        const next = NEXT_STATUS[o.status];
        const closed = o.status === 'Completed' || o.status === 'Picked Up';
        return (
          <div
            className="fixed inset-0 z-50 bg-primary/25 backdrop-blur-[2px] flex items-center justify-center p-4 animate-fade-in"
            onClick={() => setDetailId(null)}
          >
            <div
              className="bg-surface-container-lowest rounded-2xl shadow-lg w-full max-w-md max-h-[85vh] overflow-y-auto scrollbar-thin p-6 relative animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setDetailId(null)}
                className="absolute top-4 right-4 text-on-surface-variant hover:text-primary cursor-pointer w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-1 pr-8">
                <h3 className="text-lg font-bold text-primary tracking-tight">Order #{o.id}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${STATUS_BADGE[o.status]}`}>{o.status}</span>
              </div>
              <p className="text-xs text-on-surface-variant mb-4">
                {o.tableNumber || 'No table'}
                {o.customerName ? ` · ${o.customerName}` : ''}
                {o.isTakeout ? ' · To-Go' : ' · Dine-in'}
                {o.timeElapsed ? ` · ${o.timeElapsed}` : ''}
              </p>

              <div className="space-y-2">
                {o.items.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-outline-variant/25 bg-surface-container-low/30">
                    <div className="flex gap-3 min-w-0">
                      <div className="w-8 h-8 bg-secondary-container/60 text-primary rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                        {item.quantity}x
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-primary leading-tight">
                          {item.productName} <span className="text-on-surface-variant font-medium">({item.size})</span>
                        </p>
                        {item.notes && item.notes.length > 0 && (
                          <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-2">{item.notes.join(' • ')}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-secondary shrink-0">${item.priceOrder.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-outline-variant/15">
                <span className="text-[11px] text-on-surface-variant">Subtotal ${o.subtotal.toFixed(2)} · Tax ${o.tax.toFixed(2)}</span>
                <span className="text-base font-bold text-primary">${o.total.toFixed(2)}</span>
              </div>

              {closed ? (
                <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl py-3">
                  <CheckCircle className="w-4 h-4" />
                  Order {o.status}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => advanceStatus(o)}
                  disabled={advancingId === o.id}
                  className="mt-4 w-full bg-primary text-on-primary hover:bg-primary-container font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {advancingId === o.id ? 'Updating…' : ADVANCE_LABEL[o.status]}
                  {next && <ArrowRight className="w-4 h-4" />}
                </button>
              )}

              {!closed && onCancel && (
                <button
                  type="button"
                  onClick={() => cancelOrder(o)}
                  disabled={cancelingId === o.id}
                  className="mt-2 w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  {cancelingId === o.id ? 'Canceling…' : 'Cancel order'}
                </button>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

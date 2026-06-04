/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useMemo, useRef, useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Coffee,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { Product, Category, Order, OrderItem } from '../types';

// A line in the order list — carries its own customization so the admin can
// tweak sugar / size / qty / notes after adding it.
interface LineItem {
  id: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  size: OrderItem['size'];
  sugarLevel: number;
  notes: string[];
  customNote: string;
}

interface DraftOrderItem {
  productName: string;
  quantity: number;
  size: OrderItem['size'];
  notes: string[];
  priceOrder: number;
}

export interface PlaceOrderPayload {
  tableNumber: string;
  customerName: string;
  isTakeout: boolean;
  items: DraftOrderItem[];
}

interface TakeOrderViewProps {
  products: Product[];
  categories: Category[];
  orders: Order[];
  // When false, the existing-orders list is hidden (e.g. for guest cashiers).
  showOrderHistory?: boolean;
  onPlaceOrder: (payload: PlaceOrderPayload) => Promise<Order>;
  onUpdateStatus: (orderId: string, status: Order['status']) => Promise<Order>;
}

const SIZE_OPTIONS: OrderItem['size'][] = ['S', 'Reg', 'L', 'XL'];

// Sugar sweetness levels (percent), like drink shops let customers pick
const SUGAR_LEVELS = [0, 25, 50, 75, 100];

// Common things an admin adds when asking the customer what they want
const QUICK_NOTES = ['Oat milk', 'Extra shot', 'Decaf', 'Less ice', 'Extra hot', 'To stay'];

const TAX_RATE = 0.08;

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

export default function TakeOrderView({ products, categories, orders, showOrderHistory = true, onPlaceOrder, onUpdateStatus }: Readonly<TakeOrderViewProps>) {
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isTakeout, setIsTakeout] = useState(false);

  // The order list the admin is building. Each line is independently customizable.
  const [orderList, setOrderList] = useState<LineItem[]>([]);
  // Only one line's customizer is open at a time; null = list collapsed.
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const lineCounter = useRef(0);

  // Which placed-order card is expanded to show its items (null = all collapsed).
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [isPlacing, setIsPlacing] = useState(false);
  // The order currently having its status advanced — drives the per-card spinner.
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  // Menu browser state
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Does a product belong to the given category record?
  const belongsTo = (p: Product, cat: Category) =>
    p.category === cat.id || p.category.toLowerCase() === cat.name.toLowerCase();

  // Group the catalog into category sections, in category order.
  const sections = useMemo(() => {
    const groups = categories
      .map((cat) => ({
        key: cat.id,
        label: cat.name,
        items: products.filter((p) => belongsTo(p, cat))
      }))
      .filter((g) => g.items.length > 0);

    // Products whose category id matches no Category record fall under "Other".
    const orphans = products.filter((p) => !categories.some((c) => belongsTo(p, c)));
    if (orphans.length > 0) {
      groups.push({ key: '__other__', label: 'Other', items: orphans });
    }

    return categoryFilter === 'All' ? groups : groups.filter((g) => g.key === categoryFilter);
  }, [products, categories, categoryFilter]);

  // Clear the builder back to a blank ticket.
  const resetBuilder = () => {
    setTableNumber('');
    setCustomerName('');
    setIsTakeout(false);
    setOrderList([]);
    setExpandedId(null);
  };

  // Tapping a product adds it to the order list with sensible defaults.
  const addProductToOrder = (product: Product) => {
    const id = `line-${lineCounter.current++}`;
    const line: LineItem = {
      id,
      productName: product.name,
      unitPrice: product.price,
      quantity: 1,
      size: 'Reg',
      sugarLevel: 100,
      notes: [],
      customNote: ''
    };
    setOrderList((prev) => [...prev, line]);
  };

  const updateLine = (id: string, patch: Partial<LineItem>) => {
    setOrderList((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  };

  const toggleLineNote = (id: string, note: string) => {
    setOrderList((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, notes: l.notes.includes(note) ? l.notes.filter((n) => n !== note) : [...l.notes, note] }
          : l
      )
    );
  };

  const removeLine = (id: string) => {
    setOrderList((prev) => prev.filter((l) => l.id !== id));
    setExpandedId((prev) => (prev === id ? null : prev));
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const lineTotal = (l: LineItem) => l.unitPrice * l.quantity;
  const itemCount = orderList.reduce((n, l) => n + l.quantity, 0);
  const subtotal = orderList.reduce((sum, l) => sum + lineTotal(l), 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handlePlace = async () => {
    if (orderList.length === 0 || isPlacing) return;
    const items: DraftOrderItem[] = orderList.map((l) => {
      const allNotes = [`Sugar ${l.sugarLevel}%`, ...l.notes];
      if (l.customNote.trim()) allNotes.push(l.customNote.trim());
      return {
        productName: l.productName,
        quantity: l.quantity,
        size: l.size,
        notes: allNotes,
        priceOrder: lineTotal(l)
      };
    });
    try {
      setIsPlacing(true);
      const created = await onPlaceOrder({
        tableNumber: tableNumber.trim(),
        customerName: customerName.trim(),
        isTakeout,
        items
      });
      // Clear the builder; the new order now appears in the orders list below,
      // expanded so its status can be advanced right away.
      resetBuilder();
      setExpandedOrderId(created.id);
    } catch {
      // The parent surfaces the error; keep the cart intact so the admin can retry.
    } finally {
      setIsPlacing(false);
    }
  };

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

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Page header — matches the Products catalog layout */}
      <div>
        <h2 className="text-3xl font-bold text-primary tracking-tight">Take Order</h2>
        <p className="text-secondary text-base mt-1">Tap a product to add it, customize each line, then place the order.</p>
      </div>

      {/* Category chips — full width, above both columns */}
      <div className="flex gap-2.5 flex-wrap">
        <button
          type="button"
          onClick={() => setCategoryFilter('All')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all border cursor-pointer ${
            categoryFilter === 'All'
              ? 'bg-tertiary text-on-tertiary border-tertiary shadow-sm'
              : 'bg-surface-container-highest/20 hover:bg-outline-variant/15 text-on-surface-variant border-outline-variant/30'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase transition-all border cursor-pointer ${
              categoryFilter === cat.id
                ? 'bg-tertiary text-on-tertiary border-tertiary shadow-sm'
                : 'bg-surface-container-highest/20 hover:bg-outline-variant/15 text-on-surface-variant border-outline-variant/30'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Body: product menu (left) + order panel (right) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Left: product menu, grouped by category ──────────── */}
        <div className="flex-1 w-full">

          {/* Category sections */}
          {sections.length === 0 ? (
            <div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/25 shadow-bento">
              <Coffee className="w-10 h-10 text-on-surface-variant/35 mx-auto mb-3" />
              <p className="text-on-surface-variant font-semibold text-sm">No products in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {sections.flatMap((section) => section.items).map((product) => {
                const locked = !!product.locked;
                const inOrderQty = orderList
                  .filter((l) => l.productName === product.name)
                  .reduce((n, l) => n + l.quantity, 0);
                return (
                  <button
                    key={product.id}
                    type="button"
                    disabled={locked}
                    onClick={() => addProductToOrder(product)}
                    className="group relative text-left rounded-2xl border border-outline-variant/30 overflow-hidden bg-surface-container-lowest shadow-bento hover:shadow-bento-raised transition-all duration-300 active:scale-[0.98] cursor-pointer hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 flex flex-col"
                  >
                    <div className="aspect-[4/3] bg-surface-container-low overflow-hidden relative">
                      <img
                        src={product.imageUrl || product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        referrerPolicy="no-referrer"
                      />
                      {/* Add affordance */}
                      {!locked && (
                        <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                          <Plus className="w-4 h-4" />
                        </div>
                      )}
                      {/* Count badge when already in the order list */}
                      {inOrderQty > 0 && (
                        <div className="absolute top-2 left-2 min-w-[22px] h-6 px-1.5 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-md text-[11px] font-bold">
                          {inOrderQty}
                        </div>
                      )}
                      {locked && (
                        <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-error text-on-error px-2.5 py-1 rounded-lg font-bold text-[10px] tracking-wide">
                            Hidden
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-3 flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold text-primary leading-tight line-clamp-1">{product.name}</p>
                      <span className="text-[13px] font-extrabold text-secondary shrink-0">${product.price.toFixed(2)}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: order panel — only shown when there's an order being built or orders to list ── */}
        {(orderList.length > 0 || (showOrderHistory && orders.length > 0)) && (
        <div className="w-full lg:w-[380px] shrink-0 lg:sticky lg:top-6">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/25 shadow-bento overflow-hidden">
            {/* New-order builder card, then existing order cards */}
            <div className="lg:max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin p-4 space-y-4">
            {/* ===== New Order — appears once a product is added ===== */}
            {orderList.length > 0 && (
            <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low/40 overflow-hidden">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 pt-4">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">New Order</h4>
                </div>
                {/* Who / where */}
                <div className="p-4 space-y-3 border-b border-outline-variant/15">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Table</label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        placeholder="e.g. Table 7"
                        className="w-full bg-surface-container-lowest text-xs px-3 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Customer</label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Optional"
                        className="w-full bg-surface-container-lowest text-xs px-3 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                      />
                    </div>
                  </div>
                  <div className="flex bg-surface-container p-0.5 rounded-xl border border-outline-variant/35 h-[42px]">
                    <button
                      type="button"
                      onClick={() => setIsTakeout(false)}
                      className={`flex-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${!isTakeout ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
                    >
                      Dine-in
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsTakeout(true)}
                      className={`flex-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${isTakeout ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
                    >
                      To-Go
                    </button>
                  </div>
                </div>

                {/* Order list */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Order List ({itemCount})</h4>
                  </div>

                  {orderList.length === 0 ? (
                    <p className="text-xs text-on-surface-variant/70 italic py-6 text-center border border-dashed border-outline-variant/40 rounded-xl">
                      Tap a product on the left to add it to the order list.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {orderList.map((line) => {
                        const isOpen = expandedId === line.id;
                        const summaryBits = [`Size ${line.size}`, `Sugar ${line.sugarLevel}%`, ...line.notes];
                        if (line.customNote.trim()) summaryBits.push(line.customNote.trim());
                        return (
                          <div
                            key={line.id}
                            className={`rounded-xl border bg-surface-container-lowest overflow-hidden transition-colors ${
                              isOpen ? 'border-primary' : 'border-outline-variant/25'
                            }`}
                          >
                            {/* Summary row — click anywhere to open the customizer */}
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={() => toggleExpand(line.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  toggleExpand(line.id);
                                }
                              }}
                              className="flex items-start gap-2.5 p-3 cursor-pointer hover:bg-surface-container-low/40 transition-colors"
                            >
                              <div className="w-8 h-8 bg-secondary-container/60 text-primary rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                                {line.quantity}x
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-primary leading-tight">{line.productName}</p>
                                <p className="text-[11px] text-on-surface-variant mt-0.5 line-clamp-1">{summaryBits.join(' • ')}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-xs font-bold text-secondary">${lineTotal(line).toFixed(2)}</span>
                                <span className="w-7 h-7 rounded-full flex items-center justify-center text-primary">
                                  {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeLine(line.id);
                                  }}
                                  className="w-7 h-7 rounded-full hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
                                  title="Remove"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Inline customizer */}
                            {isOpen && (
                              <div className="px-3 pb-3 pt-1 space-y-3 border-t border-outline-variant/15 animate-fade-in">
                                {/* Size + qty */}
                                <div className="grid grid-cols-2 gap-3">
                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Size</label>
                                    <div className="flex bg-surface-container p-0.5 rounded-lg border border-outline-variant/35 h-[36px]">
                                      {SIZE_OPTIONS.map((s) => (
                                        <button
                                          key={s}
                                          type="button"
                                          onClick={() => updateLine(line.id, { size: s })}
                                          className={`flex-1 text-[11px] font-bold rounded-md transition-all cursor-pointer ${line.size === s ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
                                        >
                                          {s}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Qty</label>
                                    <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/40 rounded-lg h-[36px] px-2">
                                      <button
                                        type="button"
                                        onClick={() => updateLine(line.id, { quantity: Math.max(1, line.quantity - 1) })}
                                        className="w-6 h-6 rounded-md hover:bg-surface-container flex items-center justify-center text-primary cursor-pointer"
                                      >
                                        <Minus className="w-3.5 h-3.5" />
                                      </button>
                                      <span className="text-sm font-bold text-primary tabular-nums">{line.quantity}</span>
                                      <button
                                        type="button"
                                        onClick={() => updateLine(line.id, { quantity: line.quantity + 1 })}
                                        className="w-6 h-6 rounded-md hover:bg-surface-container flex items-center justify-center text-primary cursor-pointer"
                                      >
                                        <Plus className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Sugar level */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Sugar level</label>
                                  <div className="flex bg-surface-container p-0.5 rounded-lg border border-outline-variant/35">
                                    {SUGAR_LEVELS.map((level) => (
                                      <button
                                        key={level}
                                        type="button"
                                        onClick={() => updateLine(line.id, { sugarLevel: level })}
                                        className={`flex-1 py-1.5 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                                          line.sugarLevel === level ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
                                        }`}
                                      >
                                        {level}%
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                {/* Customizations */}
                                <div className="space-y-1.5">
                                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Customizations</label>
                                  <div className="flex flex-wrap gap-1.5">
                                    {QUICK_NOTES.map((note) => {
                                      const active = line.notes.includes(note);
                                      return (
                                        <button
                                          key={note}
                                          type="button"
                                          onClick={() => toggleLineNote(line.id, note)}
                                          className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                                            active
                                              ? 'bg-primary text-on-primary border-primary'
                                              : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/40 hover:border-primary'
                                          }`}
                                        >
                                          {note}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <input
                                    type="text"
                                    value={line.customNote}
                                    onChange={(e) => updateLine(line.id, { customNote: e.target.value })}
                                    placeholder="Other note (e.g. caramel drizzle)…"
                                    className="w-full bg-surface-container-lowest text-xs px-3 py-2 rounded-lg border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Card footer: totals + place */}
                <div className="border-t border-outline-variant/15 px-4 py-4 space-y-3">
                <div className="text-left">
                  <p className="text-[11px] text-on-surface-variant">Subtotal ${subtotal.toFixed(2)} · Tax (8%) ${tax.toFixed(2)}</p>
                  <p className="text-xl font-bold text-primary tracking-tight">Total ${total.toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  onClick={handlePlace}
                  disabled={orderList.length === 0 || isPlacing}
                  className="w-full bg-primary text-on-primary hover:bg-primary-container font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" />
                  {isPlacing ? 'Placing…' : 'Place Order'}
                </button>
                </div>
            </div>
            )}

            {/* ===== Existing orders — expand a card to view items and advance status ===== */}
            {showOrderHistory && orders.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <ClipboardList className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Orders ({orders.length})</h4>
                </div>
                {orders.map((order) => {
                  const isOpen = expandedOrderId === order.id;
                  const next = NEXT_STATUS[order.status];
                  const closed = order.status === 'Completed' || order.status === 'Picked Up';
                  const orderItemCount = order.items.reduce((n, i) => n + i.quantity, 0);
                  return (
                    <div
                      key={order.id}
                      className={`rounded-xl border bg-surface-container-lowest overflow-hidden transition-colors ${isOpen ? 'border-primary' : 'border-outline-variant/25'}`}
                    >
                      {/* Collapsed: order id + status. Click to reveal items + status action. */}
                      <button
                        type="button"
                        onClick={() => setExpandedOrderId((prev) => (prev === order.id ? null : order.id))}
                        className="w-full text-left p-4 space-y-2 cursor-pointer hover:bg-surface-container-low/40 transition-colors"
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
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
                            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            {orderItemCount} item(s) · {isOpen ? 'hide details' : 'view details'}
                          </span>
                          <span className="text-sm font-bold text-secondary">${order.total.toFixed(2)}</span>
                        </div>
                      </button>

                      {/* Items + totals + status action — revealed on click */}
                      {isOpen && (
                        <div className="border-t border-outline-variant/15 p-3 space-y-2 animate-fade-in">
                          {order.items.map((item) => (
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
                          <div className="flex items-center justify-between pt-1 px-1">
                            <span className="text-[11px] text-on-surface-variant">Subtotal ${order.subtotal.toFixed(2)} · Tax ${order.tax.toFixed(2)}</span>
                            <span className="text-sm font-bold text-secondary">${order.total.toFixed(2)}</span>
                          </div>
                          {closed ? (
                            <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-xl py-3">
                              <CheckCircle className="w-4 h-4" />
                              Order {order.status}
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => advanceStatus(order)}
                              disabled={advancingId === order.id}
                              className="w-full bg-primary text-on-primary hover:bg-primary-container font-bold text-xs px-6 py-3 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                              {advancingId === order.id ? 'Updating…' : ADVANCE_LABEL[order.status]}
                              {next && <ArrowRight className="w-4 h-4" />}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

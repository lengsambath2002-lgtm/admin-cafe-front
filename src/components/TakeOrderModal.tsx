/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Coffee,
  ShoppingCart,
  ClipboardList
} from 'lucide-react';
import { Product, OrderItem } from '../types';

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

interface TakeOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onPlaceOrder: (payload: PlaceOrderPayload) => void;
}

const SIZE_OPTIONS: OrderItem['size'][] = ['S', 'Reg', 'L', 'XL'];

// Sugar sweetness levels (percent), like drink shops let customers pick
const SUGAR_LEVELS = [0, 25, 50, 75, 100];

// Common things an admin adds when asking the customer what they want
const QUICK_NOTES = [
  'Oat milk',
  'Extra shot',
  'Decaf',
  'Less ice',
  'Extra hot',
  'To stay'
];

const TAX_RATE = 0.08;

export default function TakeOrderModal({ isOpen, onClose, products, onPlaceOrder }: TakeOrderModalProps) {
  const [tableNumber, setTableNumber] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [isTakeout, setIsTakeout] = useState(false);
  const [cart, setCart] = useState<DraftOrderItem[]>([]);

  // Current line being built
  const [selectedProductId, setSelectedProductId] = useState('');
  const [size, setSize] = useState<OrderItem['size']>('Reg');
  const [quantity, setQuantity] = useState(1);
  const [sugarLevel, setSugarLevel] = useState(100);
  const [notes, setNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  const selectedProduct = products.find(p => p.id === selectedProductId);

  const resetLine = () => {
    setSelectedProductId('');
    setSize('Reg');
    setQuantity(1);
    setSugarLevel(100);
    setNotes([]);
    setCustomNote('');
  };

  const toggleNote = (note: string) => {
    setNotes(prev => (prev.includes(note) ? prev.filter(n => n !== note) : [...prev, note]));
  };

  const addLineToCart = () => {
    if (!selectedProduct) return;
    const allNotes = [`Sugar ${sugarLevel}%`, ...notes];
    if (customNote.trim()) allNotes.push(customNote.trim());
    const line: DraftOrderItem = {
      productName: selectedProduct.name,
      quantity,
      size,
      notes: allNotes,
      priceOrder: selectedProduct.price * quantity
    };
    setCart(prev => [...prev, line]);
    resetLine();
  };

  const removeLine = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.priceOrder, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handlePlace = () => {
    if (cart.length === 0) return;
    onPlaceOrder({
      tableNumber: tableNumber.trim(),
      customerName: customerName.trim(),
      isTakeout,
      items: cart
    });
    // Reset everything for the next order
    setTableNumber('');
    setCustomerName('');
    setIsTakeout(false);
    setCart([]);
    resetLine();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-primary/25 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-surface-container-lowest border border-outline-variant/45 shadow-lg rounded-2xl w-full max-w-3xl relative animate-scale-up text-left flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-outline-variant/25 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-secondary-container rounded-xl">
              <ClipboardList className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary tracking-tight leading-none">Take Order</h3>
              <p className="text-[11px] text-on-surface-variant mt-1">Ask the customer what they'd like and build their ticket.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full text-on-surface-variant hover:bg-surface-container hover:text-primary flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">

          {/* Who / where */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Table</label>
              <input
                type="text"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="e.g. Table 7"
                className="w-full bg-surface-container-low text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Customer name</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Optional"
                className="w-full bg-surface-container-low text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Service</label>
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
          </div>

          {/* Item builder */}
          <div className="border border-outline-variant/30 rounded-2xl p-5 bg-surface-container-low/30 space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Add an item</h4>
            </div>

            {/* Product + size + qty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full appearance-none bg-surface-container-lowest text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                >
                  <option value="">Select a drink or item…</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ${p.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Size</label>
                  <div className="flex bg-surface-container p-0.5 rounded-xl border border-outline-variant/35 h-[42px]">
                    {SIZE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={`flex-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${size === s ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Qty</label>
                  <div className="flex items-center justify-between bg-surface-container-lowest border border-outline-variant/40 rounded-xl h-[42px] px-2">
                    <button
                      type="button"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-primary cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-bold text-primary tabular-nums">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(q => q + 1)}
                      className="w-7 h-7 rounded-lg hover:bg-surface-container flex items-center justify-center text-primary cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sugar level */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Sugar level</label>
              <div className="flex bg-surface-container p-0.5 rounded-xl border border-outline-variant/35">
                {SUGAR_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSugarLevel(level)}
                    className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                      sugarLevel === level ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'
                    }`}
                  >
                    {level}%
                  </button>
                ))}
              </div>
            </div>

            {/* Customizations */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">Customizations</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_NOTES.map((note) => {
                  const active = notes.includes(note);
                  return (
                    <button
                      key={note}
                      type="button"
                      onClick={() => toggleNote(note)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
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
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Other note (e.g. caramel drizzle, almond milk)…"
                className="w-full bg-surface-container-lowest text-xs px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
              />
            </div>

            <button
              type="button"
              onClick={addLineToCart}
              disabled={!selectedProduct}
              className="w-full bg-secondary-container hover:bg-surface-container-high text-primary font-bold text-xs py-3 rounded-xl transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add to ticket{selectedProduct ? ` — $${(selectedProduct.price * quantity).toFixed(2)}` : ''}
            </button>
          </div>

          {/* Current ticket */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Ticket ({cart.length})</h4>
            </div>

            {cart.length === 0 ? (
              <p className="text-xs text-on-surface-variant/70 italic py-4 text-center border border-dashed border-outline-variant/40 rounded-xl">
                No items yet — pick a drink above and add it to the ticket.
              </p>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div key={index} className="flex items-start justify-between gap-3 p-3 rounded-xl border border-outline-variant/25 bg-surface-container-lowest">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-secondary-container/60 text-primary rounded-lg flex items-center justify-center font-bold text-xs shrink-0">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary leading-tight">
                          {item.productName} <span className="text-on-surface-variant font-medium">({item.size})</span>
                        </p>
                        {item.notes.length > 0 && (
                          <p className="text-[11px] text-on-surface-variant mt-0.5">{item.notes.join(' • ')}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-secondary">${item.priceOrder.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="w-7 h-7 rounded-full hover:bg-neutral-200 flex items-center justify-center text-neutral-500 hover:text-neutral-900 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer: totals + place */}
        <div className="border-t border-outline-variant/25 px-6 py-4 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-[11px] text-on-surface-variant">Subtotal ${subtotal.toFixed(2)} · Tax (8%) ${tax.toFixed(2)}</p>
            <p className="text-xl font-bold text-primary tracking-tight">Total ${total.toFixed(2)}</p>
          </div>
          <button
            type="button"
            onClick={handlePlace}
            disabled={cart.length === 0}
            className="bg-primary text-on-primary hover:bg-primary-container font-bold text-xs px-6 py-3.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

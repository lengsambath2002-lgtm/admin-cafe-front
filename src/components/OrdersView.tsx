/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import { 
  Printer, 
  Clock, 
  User, 
  Send, 
  CheckCircle, 
  Coffee, 
  ChevronRight, 
  AlertTriangle,
  Play,
  RotateCcw,
  Plus
} from 'lucide-react';
import { Order } from '../types';

interface OrdersViewProps {
  orders: Order[];
  onOrderUpdate: (orderId: string, status: Order['status']) => void;
  onTakeOrder: () => void;
}

export default function OrdersView({ orders, onOrderUpdate, onTakeOrder }: OrdersViewProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('882');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering orders depending on parameters and searches
  const filteredOrders = orders.filter(o => {
    // Search filter
    const matchesSearch = 
      o.id.includes(searchQuery) || 
      o.tableNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.server && o.server.toLowerCase().includes(searchQuery.toLowerCase())) ||
      o.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    // Status / tab filter
    if (activeTab === 'active') {
      return o.status === 'New' || o.status === 'Preparing' || o.status === 'Ready';
    } else {
      return o.status === 'Completed' || o.status === 'Picked Up';
    }
  });

  // Get currently active selected order object
  const activeDetailOrder = orders.find(o => o.id === selectedOrderId) || filteredOrders[0] || orders[0];

  const handleStatusTransition = (order: Order) => {
    if (order.status === 'New') {
      onOrderUpdate(order.id, 'Preparing');
    } else if (order.status === 'Preparing') {
      onOrderUpdate(order.id, 'Ready');
    } else if (order.status === 'Ready') {
      onOrderUpdate(order.id, 'Completed');
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handlePrint = (orderId: string) => {
    showToast(`Sending Ticket #${orderId} to Barista printer...`);
  };

  const handleNotify = (customerName: string) => {
    showToast(`SMS & buzzer notification broadcasted to ${customerName || 'customer Table'}!`);
  };

  return (
    <div className="flex flex-col h-full bg-surface-container-low/20 border border-outline-variant/30 rounded-2xl overflow-hidden shadow-bento animate-fade-in">
      {/* Toast Notification HUD */}
      {toastMessage && (
        <div className="fixed top-8 right-8 bg-primary text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce border border-white/15">
          <CheckCircle className="w-4 h-4 text-white" />
          {toastMessage}
        </div>
      )}

      {/* Top Header of Orders Management */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center px-6 py-5 bg-surface-container-lowest border-b border-outline-variant/25 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-primary tracking-tight">Live Orders</h2>
            <div className="flex items-center gap-1.5 bg-neutral-200 text-neutral-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              {orders.filter(o => o.status !== 'Completed').length} Active
            </div>
          </div>
          <p className="text-xs text-on-surface-variant mt-1">Process and monitor incoming coffee and pastry tickets in real-time.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Active Tab Toggle buttons */}
          <div className="flex bg-surface-container p-0.5 rounded-xl border border-outline-variant/35 shrink-0">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Active
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`px-5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              History
            </button>
          </div>

          <button
            onClick={onTakeOrder}
            className="bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ml-auto md:ml-0"
          >
            <Plus className="w-4 h-4 text-on-primary" />
            Take Order
          </button>
        </div>
      </header>

      {/* Main Order Board Layout - Master Detail split */}
      <div className="flex flex-1 overflow-hidden min-h-[600px] flex-col lg:flex-row">
        
        {/* Left Side: Master Orders Queue list */}
        <section className="w-full lg:w-[380px] bg-surface-container-low/40 border-r border-outline-variant/20 flex flex-col overflow-hidden">
          {/* Quick Search */}
          <div className="p-4 border-b border-outline-variant/10">
            <input 
              type="text" 
              placeholder="Filter by table name or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container-lowest text-sm px-4 py-2.5 rounded-xl border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
            />
          </div>

          {/* List Wrapper */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="w-8 h-8 text-on-surface-variant/35 mx-auto mb-2" />
                <p className="text-on-surface-variant font-medium text-xs">No matching orders found</p>
                <p className="text-[10px] text-on-surface-variant/75 mt-1">Try adapting your search parameter.</p>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const isActive = activeDetailOrder?.id === order.id;
                
                // Color configuration of status indicators
                // Semantic status colors — New→Preparing→Ready progression, Completed muted
                let badgeStyle = "bg-amber-100 text-amber-800"; // Preparing
                if (order.status === 'Ready') badgeStyle = "bg-green-100 text-green-800";
                if (order.status === 'Completed') badgeStyle = "bg-neutral-100 text-neutral-500";
                if (order.status === 'New') badgeStyle = "bg-blue-100 text-blue-800";

                return (
                  <div 
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`p-4 rounded-xl border border-outline-variant/35 transition-all text-left relative cursor-pointer active:scale-[0.98] ${
                      isActive 
                        ? 'bg-surface-container-lowest ring-1 ring-primary border-primary shadow-sm' 
                        : 'bg-white hover:bg-surface-container-lowest'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-on-surface-variant/60">
                        Order #{order.id}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeStyle}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-primary leading-tight">{order.tableNumber}</h4>
                      <p className="text-xs text-on-surface-variant truncate">
                        {order.items.map(i => `${i.quantity}x ${i.productName}`).join(', ')}
                      </p>
                      <p className="text-[10px] text-on-surface-variant/75">{order.timeElapsed}</p>
                    </div>

                    <div className="absolute right-4 bottom-4 text-primary">
                      <ChevronRight className="w-4 h-4 opacity-50" />
                    </div>
                  </div>
                );
              })
            )}
            <div className="h-6"></div>
          </div>
        </section>

        {/* Right Side: Active Selected Ticket Detail Pane */}
        <section className="flex-1 bg-surface-container-lowest p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
          {activeDetailOrder ? (
            <div className="space-y-8 flex-1 flex flex-col justify-between">
              
              {/* Header block */}
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-2xl font-bold text-primary">Order #{activeDetailOrder.id}</h3>
                      <span className="text-on-surface-variant/40 text-lg">/</span>
                      <span className="text-base font-bold text-on-surface-variant">{activeDetailOrder.tableNumber}</span>
                      {activeDetailOrder.customerName && (
                        <span className="text-base font-medium text-on-surface-variant/70">· {activeDetailOrder.customerName}</span>
                      )}
                      {activeDetailOrder.isTakeout && (
                        <span className="bg-secondary-container/50 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-md">
                          To-Go
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-on-surface-variant/80 mt-2 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Placed: {activeDetailOrder.timestamp}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        Admin: {activeDetailOrder.server || 'None'}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={() => handlePrint(activeDetailOrder.id)}
                    className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors flex items-center justify-center text-primary cursor-pointer border border-outline-variant/20"
                    title="Print Receipt"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                </div>

                <div className="border-b border-outline-variant/15 my-6" />

                {/* Ticket Items breakdown */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest mb-2">Ticket Items</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeDetailOrder.items.map((item) => (
                      <div 
                        key={item.id} 
                        className="p-4 border border-outline-variant/20 rounded-xl bg-surface-container-low/20 flex justify-between items-start"
                      >
                        <div className="flex gap-3">
                          <div className="w-10 h-10 bg-secondary-container/60 text-primary rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                            {item.quantity}x
                          </div>
                          <div>
                            <p className="text-sm font-bold text-primary">{item.productName}</p>
                            {item.notes && item.notes.length > 0 ? (
                              <ul className="text-xs text-on-surface-variant list-disc list-inside mt-1.5 space-y-0.5">
                                {item.notes.map((note, i) => (
                                  <li key={i}>{note}</li>
                                ))}
                              </ul>
                            ) : (
                              <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded mt-2 inline-block">
                                Standard prep
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-secondary">${item.priceOrder.toFixed(2)}</p>
                          <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Size: {item.size}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Kitchen Note Banner - Screen 4 highlight */}
                {activeDetailOrder.kitchenNote && (
                  <div className="mt-6 bg-surface-container/70 border border-secondary-container rounded-2xl p-5 relative overflow-hidden flex items-start gap-4">
                    <div className="p-2 bg-white rounded-xl text-primary shrink-0">
                      <Coffee className="w-5 h-5 text-primary" />
                    </div>
                    <div className="relative z-10">
                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-primary mb-1">Kitchen Instruction Note</h5>
                      <p className="text-sm text-primary font-medium italic">"{activeDetailOrder.kitchenNote}"</p>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-[0.03] select-none translate-y-4 translate-x-4">
                      <Coffee className="w-32 h-32" />
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing Subtotals, Actions and mark complete row */}
              <div className="mt-8 pt-6 border-t border-outline-variant/20">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                  <div className="space-y-1 text-left w-full md:w-auto">
                    <p className="text-xs font-medium text-on-surface-variant">Subtotal: ${activeDetailOrder.subtotal.toFixed(2)}</p>
                    <p className="text-xs font-medium text-on-surface-variant/85">Tax (8%): ${activeDetailOrder.tax.toFixed(2)}</p>
                    <p className="text-2xl font-bold text-primary tracking-tight">Total: ${activeDetailOrder.total.toFixed(2)}</p>
                  </div>

                  {activeDetailOrder.status !== 'Completed' && (
                    <div className="flex gap-3 w-full md:w-auto justify-end">
                      <button 
                        onClick={() => handleNotify(activeDetailOrder.customerName || activeDetailOrder.tableNumber)}
                        className="px-5 py-3 border border-primary text-primary hover:bg-secondary-container/45 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full md:w-auto active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                        Notify Customer
                      </button>

                      {/* Ticket lifecycle accelerator trigger */}
                      <button 
                        onClick={() => handleStatusTransition(activeDetailOrder)}
                        className="px-6 py-3 bg-primary text-on-primary hover:bg-primary-container rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer w-full md:w-auto active:scale-95 shadow-md"
                      >
                        <CheckCircle className="w-4 h-4 text-on-primary" />
                        {activeDetailOrder.status === 'New' && 'Start Preparing'}
                        {activeDetailOrder.status === 'Preparing' && 'Mark as Ready'}
                        {activeDetailOrder.status === 'Ready' && 'Complete & Pickup'}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            <div className="text-center py-24 my-auto">
              <Coffee className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-primary">No ticket selected</h3>
              <p className="text-xs text-on-surface-variant mt-1">Select an active ticket from the list sidebar to view details.</p>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

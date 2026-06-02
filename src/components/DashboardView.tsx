/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  Coffee, 
  Flame, 
  TrendingDown, 
  Search, 
  Sparkles,
  ShoppingBag,
  Clock,
  ArrowRight
} from 'lucide-react';
import { Order, Transaction } from '../types';
import { WEEKLY_CHART_REVENUE, MONTHLY_CHART_REVENUE } from '../data';

interface DashboardViewProps {
  orders: Order[];
  transactions: Transaction[];
  onNavigate: (tab: string) => void;
  onSelectOrder: (orderId: string) => void;
}

export default function DashboardView({ orders, transactions, onNavigate, onSelectOrder }: DashboardViewProps) {
  const [chartMode, setChartMode] = useState<'weekly' | 'monthly'>('weekly');
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  // Dynamic calculations based on state to ensure structural cohesion is absolute
  const totalRevenue = 1284.50 + orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(o => o.status !== 'Completed').length;
  
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Quick Action Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Daily Overview</h2>
          <p className="text-secondary text-base mt-1">Monitor your cafe's peak performance and order velocity in real-time.</p>
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
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col justify-between transition-all hover:shadow-bento-raised duration-300">
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
            <span className="text-xs font-bold px-2.5 py-1 bg-green-100/80 text-green-800 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              12%
            </span>
            <span className="text-xs text-on-surface-variant">vs yesterday</span>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col justify-between transition-all hover:shadow-bento-raised duration-300">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Total Orders</p>
              <h3 className="text-4xl font-extrabold text-primary tracking-tight mt-2">142</h3>
            </div>
            <div className="p-3 bg-secondary-container/60 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 bg-green-100/80 text-green-800 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              8%
            </span>
            <span className="text-xs text-on-surface-variant">vs average ({activeOrdersCount} billing now)</span>
          </div>
        </div>

        {/* Top Selling Beverage Card */}
        <div className="bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col justify-between transition-all hover:shadow-bento-raised duration-300 relative overflow-hidden">
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">Top Selling Drink</p>
              <h3 className="text-2xl font-bold text-primary tracking-tight mt-2">Oat Milk Latte</h3>
            </div>
            <div className="p-3 bg-secondary-container/60 rounded-xl">
              <Coffee className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-6 relative z-10">
            <p className="text-sm font-medium text-on-surface-variant">42 units sold today</p>
          </div>
          {/* Subtle Abstract watermark decoration for hospitality feel */}
          <div className="absolute -right-6 -bottom-6 opacity-[0.03] rotate-12 pointer-events-none">
            <Coffee className="w-36 h-36 text-primary" />
          </div>
        </div>
      </div>

      {/* Sales Trend Custom Interactive Chart */}
      <div className="bg-surface-container-lowest p-6 md:p-8 rounded-2xl shadow-bento border border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-bold text-primary tracking-tight">Sales Trend</h3>
            <p className="text-sm text-on-surface-variant">Visual revenue breakdown across peak hours</p>
          </div>
          <div className="flex gap-1.5 bg-surface-container p-1 rounded-xl">
            <button 
              onClick={() => setChartMode('weekly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${chartMode === 'weekly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setChartMode('monthly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${chartMode === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Dynamic Interactive Bar Graph representation */}
        {chartMode === 'weekly' ? (
          <div className="relative h-64 w-full flex items-end justify-between gap-4 pt-8 px-2">
            {/* Guide Gridlines */}
            <div className="absolute inset-x-0 bottom-10 top-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-outline-variant/15 w-full text-[10px] text-on-surface-variant/40 pb-1">$2,000</div>
              <div className="border-b border-outline-variant/15 w-full text-[10px] text-on-surface-variant/40 pb-1">$1,500</div>
              <div className="border-b border-outline-variant/15 w-full text-[10px] text-on-surface-variant/40 pb-1">$1,000</div>
              <div className="border-b border-outline-variant/15 w-full text-[10px] text-on-surface-variant/40 pb-1">$500</div>
            </div>

            {/* Render bars dynamically */}
            {WEEKLY_CHART_REVENUE.map((bar, index) => (
              <div 
                key={bar.label} 
                className="flex-1 flex flex-col items-center gap-3 group cursor-pointer relative z-10"
                onMouseEnter={() => setHoveredBar(index)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Popover Tooltip */}
                {hoveredBar === index && (
                  <div className="absolute -top-10 bg-primary text-white text-[11px] font-bold px-2 py-1 rounded shadow-md z-20 transition-all">
                    ${bar.revenue}
                  </div>
                )}
                {/* Highlight active/today bar */}
                <div 
                  className={`w-full max-w-[56px] rounded-t-lg transition-all duration-500 ease-out ${
                    bar.isActive 
                      ? 'bg-primary shadow-md shadow-primary/10' 
                      : 'bg-secondary-container hover:bg-tertiary-container hover:shadow'
                  }`}
                  style={{ height: `${bar.heightPercent}%` }}
                />
                <span className={`text-[11px] font-semibold ${bar.isActive ? 'text-primary font-bold' : 'text-on-surface-variant'}`}>
                  {bar.label}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative h-64 w-full flex items-end justify-between gap-2 md:gap-4 pt-8 px-2">
            {/* Guide Gridlines */}
            <div className="absolute inset-x-0 bottom-10 top-0 flex flex-col justify-between pointer-events-none">
              <div className="border-b border-outline-variant/15 w-full text-[10px] text-on-surface-variant/40 pb-1">$5k</div>
              <div className="border-b border-outline-variant/15 w-full text-[10px] text-on-surface-variant/40 pb-1">$4k</div>
              <div className="border-b border-outline-variant/15 w-full text-[10px] text-on-surface-variant/40 pb-1">$3k</div>
              <div className="border-b border-outline-variant/15 w-full text-[10px] text-on-surface-variant/40 pb-1">$2k</div>
            </div>

            {/* Render monthly bars - high count */}
            {MONTHLY_CHART_REVENUE.map((bar, index) => (
              <div 
                key={bar.label} 
                className="flex-1 flex flex-col items-center gap-3 group cursor-pointer relative z-10"
                onMouseEnter={() => setHoveredBar(index + 10)}
                onMouseLeave={() => setHoveredBar(null)}
              >
                {/* Popover Tooltip */}
                {hoveredBar === (index + 10) && (
                  <div className="absolute -top-10 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-20">
                    ${(bar.scale * 45).toLocaleString()}
                  </div>
                )}
                <div 
                  className={`w-full max-w-[20px] rounded-t-md transition-all duration-500 ease-out ${
                    bar.active 
                      ? 'bg-primary' 
                      : 'bg-primary-container/20 hover:bg-primary-container/40'
                  }`}
                  style={{ height: `${bar.scale}%` }}
                />
                <span className="text-[9px] font-semibold text-on-surface-variant hidden md:block">
                  {bar.label.split(' ')[1]}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Asymmetric Bento Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recent Activity/Transactions table widget */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest p-6 rounded-2xl shadow-bento border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-primary tracking-tight">Recent Large Transactions</h3>
              <button 
                onClick={() => onNavigate('reports')}
                className="text-primary hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                View Logs
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {transactions.slice(0, 3).map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3.5 hover:bg-surface-container-low rounded-xl transition-all border-b border-outline-variant/10 group cursor-pointer"
                  onClick={() => onNavigate('reports')}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-on-primary-container" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-primary group-hover:text-primary transition-colors">{tx.customerName}</p>
                      <p className="text-xs text-on-surface-variant">{tx.timestamp} • {tx.itemsCount} Items</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${tx.amount < 0 ? 'text-red-600' : 'text-primary'}`}>
                      {tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                    <span className="text-[10px] text-on-surface-variant font-semibold uppercase">{tx.id}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center text-xs text-on-surface-variant">
            <span>Showing large register payments</span>
            <span className="font-semibold text-primary">Updated live seconds ago</span>
          </div>
        </div>

        {/* Prediction Insights bento box widget */}
        <div className="col-span-12 lg:col-span-4 bg-tertiary-container text-on-tertiary-container p-6 rounded-2xl shadow-bento border border-primary-container/25 flex flex-col justify-between text-white bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-container/50 via-primary-container to-primary-container/90">
          <div>
            <div className="p-3 bg-white/10 rounded-xl w-fit mb-4">
              <Sparkles className="w-6 h-6 text-white/70 animate-pulse" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight mb-2">Busiest Hour Predicted</h3>
            <p className="text-xs text-white/75 leading-relaxed">
              Based on last week's traffic and transaction density, your busiest shift today will be <strong className="text-white">1:00 PM – 2:30 PM</strong>. Ensure both espresso machines are fully calibrated and milk is restocked.
            </p>
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex justify-between items-center mb-2.5">
              <span className="text-[11px] uppercase font-bold tracking-wider text-white/60">Staff Readiness</span>
              <span className="text-xs font-bold text-white">85% (High)</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
              <div className="bg-white/80 h-full w-[85%] rounded-full transition-all duration-1000" />
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}

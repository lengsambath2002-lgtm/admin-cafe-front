/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Search, 
  Coffee, 
  Pizza, // placeholder for food
  TrendingDown, 
  Sparkles,
  FileSpreadsheet,
  Download,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Transaction } from '../types';

interface ReportsViewProps {
  transactions: Transaction[];
}

export default function ReportsView({ transactions }: ReportsViewProps) {
  const [reportTab, setReportTab] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [searchTx, setSearchTx] = useState('');

  // Transactions search filtering
  const filteredTxs = transactions.filter(t => 
    t.customerName.toLowerCase().includes(searchTx.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTx.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTx.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Top Header Row of Reports */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Business Reports</h2>
          <p className="text-secondary text-base mt-1">Audit transactions logs, product allocations, and store revenue performance.</p>
        </div>

        {/* Action controls row */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex bg-surface-container p-0.5 rounded-xl border border-outline-variant/35 shrink-0">
            <button 
              onClick={() => setReportTab('weekly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${reportTab === 'weekly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setReportTab('monthly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${reportTab === 'monthly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setReportTab('yearly')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${reportTab === 'yearly' ? 'bg-white text-primary shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Yearly
            </button>
          </div>

          <button 
            onClick={() => alert('Downloading PDF Financial report payload...')}
            className="bg-primary text-on-primary hover:bg-primary-container px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-on-primary" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Hero Financial Board (Screen 5) */}
      <section className="bg-surface-container-lowest border border-outline-variant/25 rounded-2xl p-6 md:p-8 relative overflow-hidden bg-gradient-to-b from-surface-container/40 to-transparent shadow-bento">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-widest">
              Total Revenue ({reportTab === 'monthly' ? 'This Month' : reportTab === 'weekly' ? 'This Week' : 'This Year'})
            </p>
            <h3 className="text-4xl font-extrabold text-primary tracking-tight mt-2">$42,850.20</h3>
            <div className="flex items-center gap-1.5 text-green-700/90 mt-2 font-semibold text-xs">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% vs last period</span>
            </div>
          </div>
        </div>

        {/* Custom Visual Bar Chart poles (Screen 5 replication) */}
        <div className="relative h-44 w-full flex items-end justify-between gap-1 mt-6">
          {/* Guide Overlay Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
            <div className="border-t border-on-surface-variant w-full" />
            <div className="border-t border-on-surface-variant w-full" />
            <div className="border-t border-on-surface-variant w-full" />
            <div className="border-t border-on-surface-variant w-full" />
          </div>

          {/* Multi-frequency bars layout */}
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '40%' }} title="Oct 1: $14,200" />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '55%' }} />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '45%' }} />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '70%' }} />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '85%' }} />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '60%' }} />
          {/* Main Peak Highlighted Pole (Screen 5 detail) */}
          <div className="flex-1 bg-primary hover:opacity-100 rounded-t-lg transition-all cursor-pointer shadow-sm relative" style={{ height: '95%' }}>
            <div className="absolute -top-8 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-primary text-white text-[9px] px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-md">
              Oct 15 (Peak)
            </div>
          </div>
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '75%' }} />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '50%' }} />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '65%' }} />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '80%' }} />
          <div className="flex-1 bg-primary-container/20 hover:bg-primary-container/40 rounded-t-lg transition-all cursor-pointer" style={{ height: '70%' }} />
        </div>

        {/* Date labels */}
        <div className="flex justify-between mt-4 px-2 font-bold text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
          <span>Oct 01</span>
          <span>Oct 08</span>
          <span>Oct 15</span>
          <span>Oct 22</span>
          <span>Oct 31</span>
        </div>
      </section>

      {/* Side-by-Side double Tables reports grid (Screen 5 split layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Top Selling products */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl flex flex-col shadow-bento overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/20">
            <h4 className="font-bold text-lg text-primary tracking-tight">Top Selling Products</h4>
            <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase">This Month</span>
          </div>
          
          <div className="p-4 overflow-y-auto max-h-[420px] scrollbar-thin">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">Product</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 text-right">Units</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                <tr className="group hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-3 py-3 rounded-l-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary-container/60 text-primary flex items-center justify-center shrink-0">
                        <Coffee className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-primary">Signature Espresso</p>
                        <p className="text-[10px] text-on-surface-variant">Coffee Beans</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-xs text-right">1,240</td>
                  <td className="px-3 py-3 font-bold text-xs text-primary text-right rounded-r-xl">$14,880.00</td>
                </tr>

                <tr className="group hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-3 py-3 rounded-l-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary-container/60 text-primary flex items-center justify-center shrink-0">
                        <Coffee className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-primary">Oat Milk Latte</p>
                        <p className="text-[10px] text-on-surface-variant">Hot Beverages</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-xs text-right">980</td>
                  <td className="px-3 py-3 font-bold text-xs text-primary text-right rounded-r-xl">$5,390.00</td>
                </tr>

                <tr className="group hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-3 py-3 rounded-l-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary-container/60 text-primary flex items-center justify-center shrink-0">
                        <Coffee className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-primary">Almond Croissant</p>
                        <p className="text-[10px] text-on-surface-variant">Pastries</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-xs text-right">720</td>
                  <td className="px-3 py-3 font-bold text-xs text-primary text-right rounded-r-xl">$3,240.00</td>
                </tr>

                <tr className="group hover:bg-surface-container-low/40 transition-colors">
                  <td className="px-3 py-3 rounded-l-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-secondary-container/60 text-primary flex items-center justify-center shrink-0">
                        <Coffee className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-xs text-primary">Cold Brew Blend</p>
                        <p className="text-[10px] text-on-surface-variant">Whole Beans</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 font-medium text-xs text-right">450</td>
                  <td className="px-3 py-3 font-bold text-xs text-primary text-right rounded-r-xl">$6,750.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right pane: Recent Transactions list */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl flex flex-col shadow-bento overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-low/20 gap-4">
            <h4 className="font-bold text-lg text-primary tracking-tight">Recent Transactions</h4>
            
            {/* Table search filter */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                placeholder="Search orders, customers..."
                className="w-full bg-white text-xs pl-8 pr-4 py-1.5 rounded-full border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[420px] scrollbar-thin">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/40 border-b border-outline-variant sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">ID</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">Customer</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">Timestamp</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">Status</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/45">
                {filteredTxs.map((tx) => (
                  <tr key={tx.id} className="hover:bg-surface-container-low/40 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-primary">{tx.id}</td>
                    <td className="px-6 py-4 text-xs font-bold text-primary">{tx.customerName}</td>
                    <td className="px-6 py-4 text-[11px] text-on-surface-variant">{tx.timestamp}</td>
                    <td className="px-6 py-4">
                      {tx.status === 'COMPLETED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-green-50 text-green-700">
                          <CheckCircle className="w-2.5 h-2.5 text-green-700" />
                          COMPLETED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-orange-50 text-orange-600">
                          <XCircle className="w-2.5 h-2.5 text-orange-600" />
                          REFUNDED
                        </span>
                      )}
                    </td>
                    <td className={`px-6 py-4 font-bold text-xs text-right ${tx.amount < 0 ? 'text-red-500' : 'text-primary'}`}>
                      {tx.amount < 0 ? '-' : ''}${Math.abs(tx.amount).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Bottom KPI tiles grid row (Screen 5 bottom row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Avg Order Value KPI Tile */}
        <div className="bg-secondary-container border border-outline-variant/30 p-5 rounded-2xl shadow-bento text-left">
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">AVG ORDER VALUE</p>
          <h5 className="text-2xl font-bold text-primary tracking-tight mt-1.5">$18.42</h5>
          <p className="text-[10px] text-on-surface-variant/80 mt-1">+4% from last week</p>
        </div>

        {/* New Customers KPI Tile */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl shadow-bento text-left">
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">NEW CUSTOMERS</p>
          <h5 className="text-2xl font-bold text-primary tracking-tight mt-1.5">342</h5>
          <p className="text-[10px] text-green-700 font-semibold mt-1">+22% monthly growth</p>
        </div>

        {/* Top Category KPI Tile */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl shadow-bento text-left">
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">TOP CATEGORY</p>
          <h5 className="text-2xl font-bold text-primary tracking-tight mt-1.5">Espresso</h5>
          <p className="text-[10px] text-on-surface-variant/85 mt-1">34% of total daily volume</p>
        </div>

        {/* Staff Efficiency KPI Tile */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl shadow-bento text-left">
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">STAFF EFFICIENCY</p>
          <h5 className="text-2xl font-bold text-primary tracking-tight mt-1.5">4.2m</h5>
          <p className="text-[10px] text-on-surface-variant/85 mt-1">Avg. turnaround times per ticket</p>
        </div>

      </div>

    </div>
  );
}

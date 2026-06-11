/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Coffee,
  Download,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Transaction } from '../types';
import {
  api,
  ReportRange,
  ReportSummary,
  RevenueSeries,
  TopProduct,
  ReportKpis
} from '../lib/api';
import { useT } from '../lib/i18n';

interface ReportsViewProps {
  transactions: Transaction[];
}

const fmtMoney = (n: number) =>
  n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ReportsView({ transactions }: ReportsViewProps) {
  const { t } = useT();
  const [reportTab, setReportTab] = useState<ReportRange>('monthly');
  const [searchTx, setSearchTx] = useState('');

  // Server-computed analytics, refetched whenever the range tab changes.
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [series, setSeries] = useState<RevenueSeries | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [kpis, setKpis] = useState<ReportKpis | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let active = true;
    api.reportSummary(reportTab).then(s => active && setSummary(s)).catch(() => active && setSummary(null));
    api.revenueSeries(reportTab).then(s => active && setSeries(s)).catch(() => active && setSeries(null));
    api.topProducts(reportTab, 5).then(p => active && setTopProducts(p)).catch(() => active && setTopProducts([]));
    api.reportKpis(reportTab).then(k => active && setKpis(k)).catch(() => active && setKpis(null));
    return () => { active = false; };
  }, [reportTab]);

  // Export the current report as a CSV (GET /api/reports/export). The backend
  // doesn't implement PDF yet (501), so we export CSV.
  const handleExport = async () => {
    try {
      setExporting(true);
      await api.downloadReport(reportTab, 'csv');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export report.');
    } finally {
      setExporting(false);
    }
  };

  // Transactions search filtering
  const filteredTxs = transactions.filter(t =>
    t.customerName.toLowerCase().includes(searchTx.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTx.toLowerCase()) ||
    t.description.toLowerCase().includes(searchTx.toLowerCase())
  );

  // Scale chart bars relative to the largest revenue point.
  const points = series?.points ?? [];
  const maxRevenue = points.reduce((m, p) => Math.max(m, p.revenue), 0) || 1;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Top Header Row of Reports */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">{t('rep.title')}</h2>
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
            onClick={handleExport}
            disabled={exporting}
            className="bg-primary text-on-primary hover:bg-primary-container px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4 text-on-primary" />
            {exporting ? 'Exporting…' : 'Export CSV'}
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
            <h3 className="text-4xl font-extrabold text-primary tracking-tight mt-2">
              ${summary ? fmtMoney(summary.totalRevenue) : '—'}
            </h3>
            <div className={`flex items-center gap-1.5 mt-2 font-semibold text-xs ${(summary?.revenueGrowthPct ?? 0) < 0 ? 'text-red-600/90' : 'text-green-700/90'}`}>
              {(summary?.revenueGrowthPct ?? 0) < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
              <span>{(summary?.revenueGrowthPct ?? 0) >= 0 ? '+' : ''}{(summary?.revenueGrowthPct ?? 0).toFixed(1)}% vs last period</span>
            </div>
          </div>
        </div>

        {/* Custom Visual Bar Chart — driven by /api/reports/revenue-series */}
        <div className="relative h-44 w-full flex items-end justify-between gap-1 mt-6">
          {/* Guide Overlay Lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
            <div className="border-t border-on-surface-variant w-full" />
            <div className="border-t border-on-surface-variant w-full" />
            <div className="border-t border-on-surface-variant w-full" />
            <div className="border-t border-on-surface-variant w-full" />
          </div>

          {points.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-on-surface-variant/50">
              No revenue data for this period.
            </div>
          ) : (
            points.map((point) => {
              const heightPercent = Math.max(2, Math.round((point.revenue / maxRevenue) * 100));
              return (
                <div
                  key={`${point.date}-${point.label}`}
                  className={`flex-1 rounded-t-lg transition-all cursor-pointer relative group ${
                    point.isPeak ? 'bg-primary hover:opacity-100 shadow-sm' : 'bg-primary-container/20 hover:bg-primary-container/40'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                  title={`${point.label}: $${fmtMoney(point.revenue)}`}
                >
                  {point.isPeak && (
                    <div className="absolute -top-8 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-primary text-white text-[9px] px-2 py-0.5 rounded font-bold whitespace-nowrap shadow-md">
                      {point.label} (Peak)
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Date labels — first, middle, last buckets */}
        {points.length > 0 && (
          <div className="flex justify-between mt-4 px-2 font-bold text-[10px] text-on-surface-variant font-mono uppercase tracking-wider">
            <span>{points[0].label}</span>
            <span>{points[Math.floor(points.length / 2)].label}</span>
            <span>{points[points.length - 1].label}</span>
          </div>
        )}
      </section>

      {/* Side-by-Side double Tables reports grid (Screen 5 split layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left pane: Top Selling products */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl flex flex-col shadow-bento overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/20">
            <h4 className="font-bold text-lg text-primary tracking-tight">{t('rep.topProducts')}</h4>
            <span className="text-[10px] font-bold text-on-surface-variant/70 uppercase">
              {reportTab === 'monthly' ? 'This Month' : reportTab === 'weekly' ? 'This Week' : 'This Year'}
            </span>
          </div>

          <div className="p-4 overflow-y-auto max-h-[420px] scrollbar-thin">
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="border-b border-outline-variant">
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">{t('rep.colProduct')}</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 text-right">{t('rep.colUnits')}</th>
                  <th className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 text-right">{t('rep.colRevenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/5">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-3 py-8 text-center text-xs text-on-surface-variant/50">
                      No sales data for this period.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p) => (
                    <tr key={p.productName} className="group hover:bg-surface-container-low/40 transition-colors">
                      <td className="px-3 py-3 rounded-l-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-secondary-container/60 text-primary flex items-center justify-center shrink-0">
                            <Coffee className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-bold text-xs text-primary">{p.productName}</p>
                            <p className="text-[10px] text-on-surface-variant">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 font-medium text-xs text-right">{p.unitsSold.toLocaleString('en-US')}</td>
                      <td className="px-3 py-3 font-bold text-xs text-primary text-right rounded-r-xl">${fmtMoney(p.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right pane: Recent Transactions list */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant/25 rounded-2xl flex flex-col shadow-bento overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-low/20 gap-4">
            <h4 className="font-bold text-lg text-primary tracking-tight">{t('rep.recentTransactions')}</h4>
            
            {/* Table search filter */}
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input 
                type="text" 
                value={searchTx}
                onChange={(e) => setSearchTx(e.target.value)}
                placeholder={t('rep.searchOrders')}
                className="w-full bg-white text-xs pl-8 pr-4 py-1.5 rounded-full border border-outline-variant/40 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40"
              />
            </div>
          </div>

          <div className="overflow-x-auto flex-1 max-h-[420px] scrollbar-thin">
            <table className="w-full text-left">
              <thead className="bg-surface-container-low/40 border-b border-outline-variant sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">ID</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">{t('rep.colCustomer')}</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">{t('rep.colTimestamp')}</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">{t('rep.colStatus')}</th>
                  <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60 text-right">{t('rep.colAmount')}</th>
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
                      ) : tx.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-50 text-amber-600">
                          <Clock className="w-2.5 h-2.5 text-amber-600" />
                          PENDING
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
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">{t('rep.avgOrderValue')}</p>
          <h5 className="text-2xl font-bold text-primary tracking-tight mt-1.5">${kpis ? fmtMoney(kpis.avgOrderValue) : '—'}</h5>
          <p className="text-[10px] text-on-surface-variant/80 mt-1">
            {kpis ? `${kpis.avgOrderValueGrowthPct >= 0 ? '+' : ''}${kpis.avgOrderValueGrowthPct.toFixed(1)}% from last period` : ' '}
          </p>
        </div>

        {/* New Customers KPI Tile */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl shadow-bento text-left">
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">{t('rep.newCustomers')}</p>
          <h5 className="text-2xl font-bold text-primary tracking-tight mt-1.5">{kpis ? kpis.newCustomers.toLocaleString('en-US') : '—'}</h5>
          <p className={`text-[10px] font-semibold mt-1 ${(kpis?.newCustomersGrowthPct ?? 0) < 0 ? 'text-red-600' : 'text-green-700'}`}>
            {kpis ? `${kpis.newCustomersGrowthPct >= 0 ? '+' : ''}${kpis.newCustomersGrowthPct.toFixed(1)}% growth` : ' '}
          </p>
        </div>

        {/* Top Category KPI Tile */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl shadow-bento text-left">
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">{t('rep.topCategory')}</p>
          <h5 className="text-2xl font-bold text-primary tracking-tight mt-1.5">{kpis?.topCategory ?? '—'}</h5>
          <p className="text-[10px] text-on-surface-variant/85 mt-1">
            {kpis ? `${kpis.topCategorySharePct.toFixed(0)}% of total volume` : ' '}
          </p>
        </div>

        {/* Staff Efficiency KPI Tile */}
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-5 rounded-2xl shadow-bento text-left">
          <p className="text-[10px] font-bold text-on-surface-variant/70 uppercase tracking-widest">{t('rep.staffEfficiency')}</p>
          <h5 className="text-2xl font-bold text-primary tracking-tight mt-1.5">{kpis ? `${kpis.staffEfficiencyMinutes.toFixed(1)}m` : '—'}</h5>
          <p className="text-[10px] text-on-surface-variant/85 mt-1">Avg. turnaround times per ticket</p>
        </div>

      </div>

    </div>
  );
}

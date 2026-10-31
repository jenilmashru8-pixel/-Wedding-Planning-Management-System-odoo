import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Building2,
  AlertTriangle,
  Scale,
  Receipt,
  Plus,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { StatusBadge } from '../StatusBadge';
import { formatCurrency, formatLakhsCrores, formatDate } from '../../utils/formatters';

interface FinanceDashboardProps {
  data: any;
  milestones?: any[];
  payments?: any[];
  vendorInvoices?: any[];
  extraExpenses?: any[];
  onRefresh?: () => void;
}

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  data,
  milestones = [],
  vendorInvoices = [],
  extraExpenses = [],
}) => {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'ALL' | 'OVERDUE' | 'PAID'>('ALL');

  const kpis = data?.kpis || {};

  // Filtered milestones
  const filteredMilestones = milestones.filter((m) => {
    if (filterType === 'OVERDUE') return m.status === 'OVERDUE' || (m.status === 'PENDING' && new Date(m.dueDate) < new Date());
    if (filterType === 'PAID') return m.status === 'PAID';
    return true;
  });

  // Calculate unbilled additions & GST
  const approvedExtras = extraExpenses.filter((e) => e.approvalStatus === 'APPROVED');
  const totalExtraAmount = approvedExtras.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const gstAmount = totalExtraAmount * 0.18;
  const totalWithGst = totalExtraAmount + gstAmount;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Finance Commercial Ledger Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-xl group min-h-[220px] flex items-center">
        <img
          src="/images/royal_banquet_feast.jpg"
          alt="Palace Banquet Feast"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-950/95 via-burgundy-950/85 to-burgundy-950/45" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 backdrop-blur-sm">
              💰 Royal Treasury & Commercial Ledger
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-gold-200 border border-white/20 backdrop-blur-sm">
              Amit Verma • Finance Director
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold-100">
            Treasury, Invoicing & Settlement Management
          </h1>
          <p className="text-xs sm:text-sm text-gold-200/90 mt-1 leading-relaxed">
            Strict accounting differentiation between Contracted Revenue, Recognized Revenue, Cash Collections, and Vendor Liabilities. Reconcile supplier invoices against agreed quotations and generate consolidated 18% GST invoices.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/payments')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-burgundy-950 text-xs font-bold shadow-xs hover:scale-102 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Client Receipt</span>
            </button>
            <button
              onClick={() => navigate('/vendor-settlements')}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-gold-300" />
              <span>Vendor Settlement Matching</span>
            </button>
            <button
              onClick={() => navigate('/expenses')}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5 text-gold-300" />
              <span>18% GST Extra Invoicing</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Total Cash Realized"
          value={formatLakhsCrores(kpis.totalClientCollections)}
          subtitle={`Outstanding: ${formatLakhsCrores(kpis.totalClientReceivables)}`}
          icon={CreditCard}
          trend="+14.2% Flow"
          trendType="positive"
          highlight
        />
        <MetricCard
          title="Outstanding Receivables"
          value={formatLakhsCrores(kpis.totalClientReceivables)}
          subtitle="Pending Client Milestones"
          icon={AlertTriangle}
          trendType={Number(kpis.totalClientReceivables) > 0 ? 'negative' : 'positive'}
        />
        <MetricCard
          title="Vendor Liabilities"
          value={formatLakhsCrores(kpis.totalVendorLiabilities)}
          subtitle={`Paid: ${formatLakhsCrores(kpis.totalVendorPaymentsPaid)}`}
          icon={Building2}
          trendType="neutral"
        />
        <MetricCard
          title="Net Operating Margin"
          value={`${kpis.profitMargin}%`}
          subtitle={`Net Profit: ${formatLakhsCrores(kpis.netProfit)}`}
          icon={TrendingUp}
          trend={`${kpis.profitMargin}% Accrual`}
          trendType="positive"
          highlight
        />
      </div>

      {/* Client Staged Payment Milestones Radar */}
      <div className="card-luxury p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-charcoal-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Client Staged Milestones & Receivables</h3>
            <p className="text-xs text-charcoal-500">Staged payment terms: Deposit (25%), Advance (50%), Final Balance (25%)</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'ALL' ? 'bg-burgundy-800 text-gold-200' : 'bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200'
              }`}
            >
              All Milestones
            </button>
            <button
              onClick={() => setFilterType('OVERDUE')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'OVERDUE' ? 'bg-rose-700 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              Overdue / Pending
            </button>
            <button
              onClick={() => setFilterType('PAID')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'PAID' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Settled Receipts
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-ivory text-charcoal-600 font-semibold border-b border-charcoal-100">
                <th className="py-2.5 px-3">Milestone Title</th>
                <th className="py-2.5 px-3">Wedding</th>
                <th className="py-2.5 px-3">Share %</th>
                <th className="py-2.5 px-3">Amount Due</th>
                <th className="py-2.5 px-3">Amount Paid</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
              {filteredMilestones.slice(0, 6).map((m: any) => (
                <tr key={m.id} className="hover:bg-gold-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-semibold text-charcoal-900">
                    <div>{m.title}</div>
                    <span className="text-[10px] text-charcoal-400 font-mono uppercase">{m.milestoneType}</span>
                  </td>
                  <td className="py-2.5 px-3">{m.wedding?.name || 'Udaipur Palace Wedding'}</td>
                  <td className="py-2.5 px-3 font-bold text-burgundy-900">{m.percentage}%</td>
                  <td className="py-2.5 px-3 font-semibold">{formatCurrency(m.amountDue)}</td>
                  <td className="py-2.5 px-3 text-emerald-700 font-semibold">{formatCurrency(m.amountPaid || 0)}</td>
                  <td className="py-2.5 px-3">{formatDate(m.dueDate)}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate('/payments')}
                      className="px-2.5 py-1 rounded bg-burgundy-100 text-burgundy-900 hover:bg-burgundy-200 text-xs font-semibold"
                    >
                      Process Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Columns: Vendor Settlement Matrix & 18% GST Additions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Invoice Reconciliation Matrix */}
        <div className="card-luxury p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-burgundy-800" />
                Vendor Invoice Matching & Settlements
              </h3>
              <p className="text-xs text-charcoal-500">Agreed Quotation vs Invoiced Amount vs Net Disbursed</p>
            </div>
            <button
              onClick={() => navigate('/vendor-settlements')}
              className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
            >
              <span>Settlement Hub</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {vendorInvoices.slice(0, 4).map((inv: any) => {
              const variance = Number(inv.finalAmount) - Number(inv.originalQuotedAmount);
              const hasVariance = variance > 0;

              return (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-charcoal-100 hover:border-gold-300 bg-white hover:bg-gold-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-900 text-xs">{inv.invoiceNumber}</span>
                      <span className="text-[11px] text-charcoal-600">• {inv.vendor?.companyName}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="text-[11px] text-charcoal-500 mt-1 flex flex-wrap gap-2">
                      <span>Quoted: {formatCurrency(inv.originalQuotedAmount)}</span>
                      <span>Invoiced: <strong className="text-charcoal-800">{formatCurrency(inv.finalAmount)}</strong></span>
                      {hasVariance && (
                        <span className="text-rose-600 font-bold">
                          (+{formatCurrency(variance)} Variance)
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/vendor-settlements')}
                    className="px-2.5 py-1 rounded bg-gold-100 text-gold-900 hover:bg-gold-200 text-xs font-semibold self-start sm:self-center"
                  >
                    Match & Pay
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Unexpected Additions & 18% GST Invoicing */}
        <div className="card-luxury p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  Unexpected Event Additions (18% GST)
                </h3>
                <p className="text-xs text-charcoal-500">Day-of client requests (extra plates, DJ hours, generator fuel)</p>
              </div>
              <button
                onClick={() => navigate('/expenses')}
                className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
              >
                <span>Tax Invoices</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-ivory border border-gold-200/80 mb-3 space-y-2">
              <div className="flex items-center justify-between text-xs text-charcoal-700">
                <span>Approved Extra Additions:</span>
                <strong className="text-charcoal-900 font-mono">{formatCurrency(totalExtraAmount || 450000)}</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-charcoal-700">
                <span>Consolidated 18% GST (9% CGST + 9% SGST):</span>
                <strong className="text-charcoal-900 font-mono">{formatCurrency(gstAmount || 81000)}</strong>
              </div>
              <div className="pt-2 border-t border-gold-300 flex items-center justify-between text-sm font-bold text-burgundy-950">
                <span>Total Tax Invoice Billed:</span>
                <span className="font-serif font-bold text-base text-burgundy-900">{formatCurrency(totalWithGst || 531000)}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-xs text-charcoal-500">
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> GST Tax Compliant
            </span>
            <button
              onClick={() => navigate('/expenses')}
              className="text-xs font-bold text-burgundy-800 hover:text-burgundy-950 underline"
            >
              Generate Tax Invoice PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

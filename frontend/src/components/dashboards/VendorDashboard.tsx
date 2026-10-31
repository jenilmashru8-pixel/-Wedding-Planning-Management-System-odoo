import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Store,
  CreditCard,
  Clock,
  CheckCircle2,
  FileText,
  Star,
  MapPin,
  ArrowUpRight,
  Upload,
  Receipt,
  Scale,
} from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { StatusBadge } from '../StatusBadge';
import { formatCurrency, formatLakhsCrores } from '../../utils/formatters';

interface VendorDashboardProps {
  weddings: any[];
  quotations: any[];
  invoices: any[];
  checkIns: any[];
  onRefresh?: () => void;
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({
  weddings = [],
  quotations = [],
  invoices = [],
  checkIns = [],
}) => {
  const navigate = useNavigate();

  const acceptedQuotes = quotations.filter((q) => q.status === 'ACCEPTED');
  const totalAgreedValue = acceptedQuotes.reduce((sum, q) => sum + Number(q.totalAmount || 0), 0);

  // Settlement calculations
  const totalInvoiced = invoices.reduce((sum, i) => sum + Number(i.finalAmount || 0), 0);
  const totalPaid = invoices.reduce((sum, i) => sum + Number(i.paidAmount || 0), 0);
  const balanceDue = totalInvoiced - totalPaid;

  const upcomingArrivals = checkIns.slice(0, 3);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Vendor Partner Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-xl group min-h-[220px] flex items-center">
        <img
          src="/images/royal_banquet_feast.jpg"
          alt="Palace Feast"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-950/95 via-burgundy-950/80 to-burgundy-950/40" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-blue-500/25 text-blue-300 border border-blue-400/30 backdrop-blur-sm flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-blue-300" />
              Royal Partner Portal
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-gold-200 border border-white/20 backdrop-blur-sm">
              Royal Mewar Gourmet Catering & Banquets
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gold-400/20 text-gold-300 border border-gold-400/30 flex items-center gap-1">
              <Star className="w-3 h-3 fill-gold-400 text-gold-400" /> 4.9 Verified Partner
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold-100">
            Heritage Partner Operations & Settlements
          </h1>
          <p className="text-xs sm:text-sm text-gold-200/90 mt-1 leading-relaxed">
            Manage palace venue call times, competitive quotations, advance disbursement receipts, and tax invoice settlements across Udaipur and Jaipur.
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/quotations')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-burgundy-950 text-xs font-bold shadow-xs hover:scale-102 transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Submit New Quotation</span>
            </button>
            <button
              onClick={() => navigate('/vendor-settlements')}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <Scale className="w-3.5 h-3.5 text-gold-300" />
              <span>Settlement Ledger</span>
            </button>
            <button
              onClick={() => navigate('/operations')}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-gold-300" />
              <span>Check Call Times</span>
            </button>
          </div>
        </div>
      </div>

      {/* Partner Business KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Awarded Palace Contracts"
          value={acceptedQuotes.length || weddings.length || 2}
          subtitle="Confirmed Wedding Projects"
          icon={Store}
          highlight
        />
        <MetricCard
          title="Total Contracted Value"
          value={formatLakhsCrores(totalAgreedValue || 3500000)}
          subtitle="Accepted Quotation Total"
          icon={CreditCard}
          trendType="positive"
        />
        <MetricCard
          title="Advances & Disbursements"
          value={formatLakhsCrores(totalPaid || 2100000)}
          subtitle="Received via Bank RTGS"
          icon={CheckCircle2}
          trendType="positive"
        />
        <MetricCard
          title="Pending Settlement Due"
          value={formatLakhsCrores(balanceDue || 1400000)}
          subtitle="Upon final invoice audit"
          icon={Scale}
          trendType="neutral"
        />
      </div>

      {/* Upcoming Event Call Times & Venue Arrivals */}
      <div className="card-luxury p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-charcoal-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Upcoming Palace Call Times & On-Site Arrivals</h3>
            <p className="text-xs text-charcoal-500">Designated arrival schedules and on-site hospitality contacts</p>
          </div>
          <button
            onClick={() => navigate('/operations')}
            className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1 self-start sm:self-center"
          >
            <span>Live Schedule</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(upcomingArrivals.length > 0 ? upcomingArrivals : [
            { id: '1', title: 'Royal High Tea & Shehnai Setup', date: 'Tomorrow • 14:00 Call Time', venue: 'The Oberoi Udaivilas, Udaipur', coordinator: 'Vikram Singh (+91 98290 55005)', status: 'EXPECTED' },
            { id: '2', title: 'Royal Sangeet Feast & Live Counters', date: 'Tomorrow • 17:30 Call Time', venue: 'Zenana Mahal Courtyard', coordinator: 'Vikram Singh (+91 98290 55005)', status: 'EXPECTED' },
            { id: '3', title: 'Main Mandap Imperial Gala Dinner', date: 'Day After • 18:00 Call Time', venue: 'Jagmandir Island Palace', coordinator: 'Priya Sharma (+91 98290 22002)', status: 'EXPECTED' },
          ]).map((item: any, idx: number) => (
            <div
              key={item.id || idx}
              className="p-4 rounded-xl border border-charcoal-100 hover:border-gold-300 bg-white hover:bg-gold-50/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-burgundy-900 bg-gold-100 px-2 py-0.5 rounded">
                    {item.date || '15:00 Call Time'}
                  </span>
                  <StatusBadge status={item.status || 'EXPECTED'} />
                </div>
                <h4 className="font-serif font-bold text-sm text-charcoal-900 mb-1">{item.title || item.event?.eventName || 'Palace Banquet'}</h4>
                <div className="text-xs text-charcoal-500 flex items-center gap-1 mb-2">
                  <MapPin className="w-3 h-3 text-gold-600 shrink-0" />
                  <span className="truncate">{item.venue || item.wedding?.location || 'Udaipur Palace'}</span>
                </div>
                <div className="text-[11px] text-charcoal-600 pt-2 border-t border-charcoal-100">
                  Coordinator: <strong className="text-charcoal-800">{item.coordinator || 'Vikram Singh (+91 98290 55005)'}</strong>
                </div>
              </div>

              <button
                onClick={() => navigate('/operations')}
                className="mt-3 w-full py-1.5 rounded-lg bg-burgundy-700 hover:bg-burgundy-800 text-gold-200 text-xs font-semibold transition-colors"
              >
                Confirm Arrival & Call Time
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Quotation Bids & Settlement Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quotation Bids & Proposals */}
        <div className="card-luxury p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-burgundy-800" />
                Submitted Quotations & Bids
              </h3>
              <p className="text-xs text-charcoal-500">Per-plate rates and awarded royal bids</p>
            </div>
            <button
              onClick={() => navigate('/quotations')}
              className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
            >
              <span>All Bids</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {quotations.slice(0, 4).map((q: any) => (
              <div
                key={q.id}
                className="p-3 rounded-xl border border-charcoal-100 hover:border-gold-300 bg-white hover:bg-gold-50/20 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-charcoal-900 text-xs flex items-center gap-2">
                    <span className="font-mono font-bold text-burgundy-900">{q.quoteNumber}</span>
                    <span>• {q.wedding?.name}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="text-[11px] text-charcoal-500 mt-1">
                    Plate: <strong>{q.pricePerPlate ? `₹${q.pricePerPlate}` : '₹2,500'}</strong> ({q.guestCount || 400} guests) • Total:{' '}
                    <strong className="text-charcoal-800">{formatLakhsCrores(q.totalAmount)}</strong>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/quotations')}
                  className="px-2.5 py-1 rounded bg-gold-100 text-gold-900 hover:bg-gold-200 text-xs font-semibold"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Settlements & Advances Ledger */}
        <div className="card-luxury p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-700" />
                  Tax Invoices & Settlement Ledger
                </h3>
                <p className="text-xs text-charcoal-500">Advance disbursements and final reconciliation</p>
              </div>
              <button
                onClick={() => navigate('/vendor-settlements')}
                className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
              >
                <span>Upload Invoice</span>
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {(invoices.length > 0 ? invoices.slice(0, 3) : [
                { id: '1', invoiceNumber: 'INV-CAT-2026-001', finalAmount: 2500000, paidAmount: 1500000, status: 'APPROVED', utrNumber: 'HDFC9982348123', dueDate: new Date() },
                { id: '2', invoiceNumber: 'INV-CAT-2026-002', finalAmount: 1000000, paidAmount: 600000, status: 'RECONCILED', utrNumber: 'SBIN002918239', dueDate: new Date() },
              ]).map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-charcoal-100 bg-white hover:bg-gold-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-charcoal-900">{inv.invoiceNumber}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="text-[11px] text-charcoal-500 mt-1 flex flex-wrap gap-2">
                      <span>Total: {formatCurrency(inv.finalAmount)}</span>
                      <span>Disbursed: <strong className="text-emerald-700">{formatCurrency(inv.paidAmount || 0)}</strong></span>
                      {inv.utrNumber && <span className="font-mono text-[10px] text-charcoal-400">UTR: {inv.utrNumber}</span>}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-burgundy-900 self-start sm:self-center">
                    Due: {formatCurrency(Number(inv.finalAmount) - Number(inv.paidAmount || 0))}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
            <span>Direct Treasury Query: amit.verma@royalknot.com</span>
            <button
              onClick={() => navigate('/vendor-settlements')}
              className="font-bold text-burgundy-800 hover:text-burgundy-950 underline"
            >
              Reconciliation Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

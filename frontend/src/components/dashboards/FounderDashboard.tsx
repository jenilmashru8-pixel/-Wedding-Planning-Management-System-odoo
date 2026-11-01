import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Building2,
  DollarSign,
  ArrowUpRight,
  CheckCircle2,
  ShieldAlert,
  Landmark,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { MetricCard } from '../MetricCard';
import { StatusBadge } from '../StatusBadge';
import { formatCurrency, formatLakhsCrores, formatDate } from '../../utils/formatters';

interface FounderDashboardProps {
  data: any;
  onRefresh?: () => void;
}

const getWeddingPhoto = (location?: string, name?: string) => {
  const loc = (location || '').toLowerCase();
  const n = (name || '').toLowerCase();
  if (loc.includes('udaipur') || n.includes('udaipur') || n.includes('lake') || n.includes('jagmandir') || n.includes('aarav') || n.includes('leela')) {
    return '/images/royal_couple_palace.jpg';
  }
  if (loc.includes('jaipur') || n.includes('jaipur') || n.includes('rambagh') || n.includes('city palace') || n.includes('rohit') || n.includes('ananya')) {
    return '/images/royal_mandap_decor.jpg';
  }
  return '/images/royal_banquet_feast.jpg';
};

export const FounderDashboard: React.FC<FounderDashboardProps> = ({ data }) => {
  const navigate = useNavigate();

  const kpis = data?.kpis || {};
  const weddingBreakdowns = data?.weddingBreakdowns || [];
  const loc = data?.locationComparison || {};
  const enquiries = data?.enquiries || [];
  const incidents = data?.incidents || [];

  const locationPieData = [
    { name: 'Udaipur', value: loc.udaipur?.weddingsCount || 0, color: '#071B35' },
    { name: 'Jaipur', value: loc.jaipur?.weddingsCount || 0, color: '#D6A65D' },
    { name: 'Jodhpur', value: loc.jodhpur?.weddingsCount || 0, color: '#4C6689' },
    { name: 'Pushkar', value: loc.pushkar?.weddingsCount || 0, color: '#B88A48' },
    { name: 'Ranthambore', value: loc.ranthambore?.weddingsCount || 0, color: '#8098B7' },
    { name: 'Delhi NCR', value: loc.delhi?.weddingsCount || 0, color: '#0A2342' },
    { name: 'Mount Abu', value: loc.mountAbu?.weddingsCount || 0, color: '#DEC291' },
  ].filter((location) => location.value > 0);

  const circuitStats = [
    { label: 'Udaipur', color: 'bg-navy-700', profit: loc.udaipur?.profit || 0, revenue: loc.udaipur?.revenue || 0 },
    { label: 'Jaipur', color: 'bg-gold-500', profit: loc.jaipur?.profit || 0, revenue: loc.jaipur?.revenue || 0 },
    { label: 'Jodhpur', color: 'bg-navy-500', profit: loc.jodhpur?.profit || 0, revenue: loc.jodhpur?.revenue || 0 },
    { label: 'Pushkar', color: 'bg-gold-600', profit: loc.pushkar?.profit || 0, revenue: loc.pushkar?.revenue || 0 },
    { label: 'Ranthambore', color: 'bg-navy-400', profit: loc.ranthambore?.profit || 0, revenue: loc.ranthambore?.revenue || 0 },
    { label: 'Delhi NCR', color: 'bg-navy-600', profit: loc.delhi?.profit || 0, revenue: loc.delhi?.revenue || 0 },
    { label: 'Mount Abu', color: 'bg-gold-300', profit: loc.mountAbu?.profit || 0, revenue: loc.mountAbu?.revenue || 0 },
  ].filter((location) => location.profit || location.revenue);

  const totalEnquiries = enquiries.length;
  const convertedEnquiries = enquiries.filter((e: any) => e.status === 'CONVERTED').length;
  const conversionRate = totalEnquiries > 0 ? Math.round((convertedEnquiries / totalEnquiries) * 100) : 0;

  const openIncidents = incidents.filter((i: any) => i.status === 'OPEN');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Executive Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-2xl group min-h-[220px] flex items-center">
        <img
          src="/images/udaipur_palace_night.jpg"
          alt="Udaipur Palace Night"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/85 to-navy-950/45" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-gold-400/25 text-gold-300 border border-gold-400/40 backdrop-blur-sm">
              👑 Executive Founder Command
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-gold-100">
            The Royal Knot Enterprise Performance
          </h1>
          <p className="text-xs sm:text-sm text-gold-200/90 mt-2 leading-relaxed max-w-2xl">
            High-level executive oversight of multi-crore royal palace weddings. Monitor recognized revenues, net accrual profit margins, liquid client receivables, and vendor obligations.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/weddings')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-400 hover:to-gold-300 text-navy-950 text-xs font-bold shadow-md transition-all hover:scale-102 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Wedding Workspaces</span>
            </button>
            <button
              onClick={() => navigate('/finance')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-gold-300" />
              <span>Full Financial Audits</span>
            </button>
            <button
              onClick={() => navigate('/enquiries')}
              className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 text-gold-300" />
              <span>CRM Enquiries ({totalEnquiries})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Recognized Revenue"
          value={formatLakhsCrores(kpis.totalRecognizedRevenue)}
          subtitle="Signed Contracts + Additions"
          icon={TrendingUp}
          highlight
        />
        <MetricCard
          title="Liquid Collections"
          value={formatLakhsCrores(kpis.totalClientCollections)}
          subtitle={`Receivables Due: ${formatLakhsCrores(kpis.totalClientReceivables)}`}
          icon={CreditCard}
          trendType="neutral"
        />
        <MetricCard
          title="Total Wedding Costs"
          value={formatLakhsCrores(kpis.totalWeddingCosts)}
          subtitle="Vendors + Operations + Labour"
          icon={DollarSign}
          trendType="neutral"
        />
        <MetricCard
          title="Net Operating Profit"
          value={formatLakhsCrores(kpis.netProfit)}
          subtitle={`Average Margin: ${kpis.profitMargin}%`}
          icon={Sparkles}
          trend={`${kpis.profitMargin}% Net Margin`}
          trendType="positive"
          highlight
        />
      </div>

      {/* Working Capital & Operational Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="card-luxury p-4 sm:p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal-500 uppercase">Vendor Costs (Contracted)</p>
            <h4 className="text-lg sm:text-xl font-bold font-serif text-charcoal-900 mt-1">{formatLakhsCrores(kpis.totalVendorCosts)}</h4>
            <p className="text-[11px] text-charcoal-500 mt-0.5">Disbursed: {formatLakhsCrores(kpis.totalVendorPaymentsPaid)}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="card-luxury p-4 sm:p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal-500 uppercase">Vendor Liabilities Due</p>
            <h4 className="text-lg sm:text-xl font-bold font-serif text-charcoal-900 mt-1">{formatLakhsCrores(kpis.totalVendorLiabilities)}</h4>
            <p className="text-[11px] text-rose-600 mt-0.5">Unsettled vendor balances</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="card-luxury p-4 sm:p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal-500 uppercase">HNW Pipeline Conversion</p>
            <h4 className="text-lg sm:text-xl font-bold font-serif text-charcoal-900 mt-1">{conversionRate}%</h4>
            <p className="text-[11px] text-emerald-600 mt-0.5">{convertedEnquiries} converted of {totalEnquiries} leads</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="card-luxury p-4 sm:p-5 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-charcoal-500 uppercase">Active Palace Projects</p>
            <h4 className="text-lg sm:text-xl font-bold font-serif text-charcoal-900 mt-1">{kpis.totalWeddings ?? weddingBreakdowns.length} Weddings</h4>
            <p className="text-[11px] text-gold-700 mt-0.5">Udaipur · Jaipur · Jodhpur · Delhi & More</p>
          </div>
          <div className="p-3 bg-gold-50 text-gold-700 rounded-xl border border-gold-200">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Critical Executive Alerts Radar */}
      {(Number(kpis.totalClientReceivables) > 0 || openIncidents.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Number(kpis.totalClientReceivables) > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-amber-900 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900">
                    Client Receivables Pending Collection
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {formatLakhsCrores(kpis.totalClientReceivables)} remains outstanding across active wedding milestones.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/payments')}
                className="px-3 py-1.5 rounded-lg bg-amber-200/80 hover:bg-amber-300 text-amber-900 text-xs font-bold shrink-0 transition-colors"
              >
                View Receivables
              </button>
            </div>
          )}

          {openIncidents.length > 0 && (
            <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-300 text-rose-900 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900">
                    Live Ground Incident Alert ({openIncidents.length})
                  </h4>
                  <p className="text-xs text-rose-800 mt-0.5">
                    {openIncidents[0]?.title || 'On-ground operational disruption'} reported at palace site.
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate('/operations')}
                className="px-3 py-1.5 rounded-lg bg-rose-200/80 hover:bg-rose-300 text-rose-900 text-xs font-bold shrink-0 transition-colors"
              >
                Resolve in Ops
              </button>
            </div>
          )}
        </div>
      )}

      {/* Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Profit Chart */}
        <div className="card-luxury p-6 rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif text-lg font-bold text-charcoal-900">Accrual Revenue & Net Profit by Wedding</h3>
              <p className="text-xs text-charcoal-500">Recognized revenue vs calculated net margin per palace project</p>
            </div>
            <span className="text-xs font-bold text-navy-800 bg-navy-50 px-2.5 py-1 rounded-lg border border-navy-200">
              ₹ Crores
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weddingBreakdowns}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBD9C1" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: any) => [formatCurrency(value), '']} />
                <Legend />
                <Bar dataKey="recognizedRevenue" name="Recognized Revenue" fill="#071B35" radius={[4, 4, 0, 0]} />
                <Bar dataKey="netProfit" name="Net Profit" fill="#D6A65D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Market Share & Package Breakdown */}
        <div className="card-luxury p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1">Palace Circuit Footprint</h3>
            <p className="text-xs text-charcoal-500 mb-3">Revenue share across 7 royal destinations</p>
            <div className="h-44 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {locationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-charcoal-100 space-y-1.5 text-xs max-h-52 overflow-y-auto">
            {circuitStats.map((c) => (
              <div key={c.label} className="flex items-center justify-between text-charcoal-700">
                <span className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${c.color}`} />
                  <span>{c.label}:</span>
                </span>
                <div className="text-right">
                  <strong className="font-bold text-charcoal-900">{formatLakhsCrores(c.profit)}</strong>
                  <span className="text-[10px] text-charcoal-400 ml-1">/ {formatLakhsCrores(c.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Season Master Portfolio Table */}
      <div className="card-luxury rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-charcoal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Season Portfolio Master Ledger</h3>
            <p className="text-xs text-charcoal-500">7 royal palace weddings • Live accrual financials, receipts, vendor obligations & net margins</p>
          </div>
          <button
            onClick={() => navigate('/weddings')}
            className="text-xs font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1"
          >
            <span>All Wedding Workspaces</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-ivory text-charcoal-600 font-semibold border-b border-charcoal-100 whitespace-nowrap">
                <th className="py-3 px-4 sticky left-0 bg-ivory z-10">Wedding & Palace Venue</th>
                <th className="py-3 px-4">Circuit</th>
                <th className="py-3 px-4">Package</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Event Date</th>
                <th className="py-3 px-4">Guests</th>
                <th className="py-3 px-4">Recognized Rev</th>
                <th className="py-3 px-4">Client Collected</th>
                <th className="py-3 px-4 text-rose-700">Client Due</th>
                <th className="py-3 px-4">GST (18%)</th>
                <th className="py-3 px-4">Vendor Costs</th>
                <th className="py-3 px-4 text-emerald-700">Vendor Paid</th>
                <th className="py-3 px-4 text-amber-700">Vendor Due</th>
                <th className="py-3 px-4 font-bold text-navy-800">Net Profit</th>
                <th className="py-3 px-4">Margin</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
              {weddingBreakdowns.map((w: any) => (
                <tr key={w.weddingId} className="hover:bg-gold-50/40 transition-colors whitespace-nowrap">
                  <td className="py-3 px-4 sticky left-0 bg-white hover:bg-gold-50/40 transition-colors z-10">
                    <div className="flex items-center gap-3">
                      <img
                        src={getWeddingPhoto(w.location, w.name)}
                        alt={w.name}
                        className="w-10 h-10 rounded-xl object-cover border border-gold-300/60 shadow-sm shrink-0"
                      />
                      <div>
                        <div className="font-serif font-bold text-charcoal-900 hover:text-navy-700 transition-colors">
                          {w.name}
                        </div>
                        <div className="text-[10px] text-charcoal-500 mt-0.5 max-w-[200px] truncate">{w.venueName || w.location}</div>
                        <span className="text-[9px] text-charcoal-400 font-mono">{w.weddingCode}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-navy-50 text-navy-800 border border-navy-200 text-[10px] font-semibold">
                      {w.circuit || w.location}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      w.packageType === 'ULTRA_LUXURY'
                        ? 'bg-gold-100 text-gold-900 border-gold-300'
                        : w.packageType === 'LUXURY'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {w.packageType === 'ULTRA_LUXURY' ? '👑 Ultra Luxury' : w.packageType === 'LUXURY' ? '✦ Luxury' : '◈ Premium'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={w.status} />
                  </td>
                  <td className="py-3 px-4 text-charcoal-600">
                    {w.startDate ? formatDate(w.startDate) : '—'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-charcoal-800">{(w.guestCount || '—').toLocaleString()}</span>
                    <span className="text-charcoal-400 text-[10px] ml-0.5"> pax</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-charcoal-900">{formatLakhsCrores(w.recognizedRevenue)}</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">{formatLakhsCrores(w.clientCollected)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      Number(w.clientReceivables) > 0 ? 'text-rose-600' : 'text-charcoal-400'
                    }`}>
                      {formatLakhsCrores(w.clientReceivables || 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-charcoal-600">{formatLakhsCrores(w.gstAmount || 0)}</td>
                  <td className="py-3 px-4 text-charcoal-600">{formatLakhsCrores(w.totalVendorCosts)}</td>
                  <td className="py-3 px-4 text-emerald-600">{formatLakhsCrores(w.vendorPaid || 0)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${
                      Number(w.vendorBalance) > 0 ? 'text-amber-700' : 'text-charcoal-400'
                    }`}>
                      {formatLakhsCrores(w.vendorBalance || 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-navy-900">{formatLakhsCrores(w.netProfit)}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-gold-100 text-gold-900 font-bold text-[11px]">
                      {w.profitMargin}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/weddings/${w.weddingId}`)}
                      className="px-3 py-1.5 rounded-lg bg-navy-700 text-gold-200 hover:bg-navy-800 hover:text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      Workspace →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

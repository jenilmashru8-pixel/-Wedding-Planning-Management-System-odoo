import React, { useState, useEffect } from 'react';
import {
  LineChart as LineChartIcon,
  TrendingUp,
  CreditCard,
  DollarSign,
  Scale,
  Sparkles,
  PieChart as PieChartIcon,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAuth } from '../contexts/AuthContext';

export const FinancialReports: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinanceData();
  }, []);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/finance/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load financial reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-charcoal-400">Loading executive financial analytics...</div>;
  }

  if (!data) {
    return <div className="p-12 text-center text-charcoal-400">No financial data available.</div>;
  }

  const kpis = data.kpis || {};
  const locationComparison = data.locationComparison || {};
  const monthlyTrends = data.monthlyTrends || [];
  const weddingBreakdowns = data.weddingBreakdowns || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <LineChartIcon className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900">
              Financial Accounting & Profitability
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Contracted revenue vs recognized revenue, cash collections, vendor disbursements, and destination margins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-ivory-100 text-charcoal-700 text-xs font-semibold border border-gold-300">
            FY 2025-2026 Audit
          </span>
        </div>
      </div>

      {/* Accounting Distinction Alert Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 text-white border border-gold-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <h3 className="font-serif text-sm font-bold text-gold-200">
              Accrual Revenue Recognition & Cash Liquidity Principle
            </h3>
          </div>
          <p className="text-xs text-ivory-300 max-w-3xl leading-relaxed">
            <span className="font-semibold text-gold-300">Contracted Revenue</span> represents total signed wedding agreements.
            <span className="font-semibold text-gold-300"> Recognized Revenue</span> adds approved unforeseen client additions.
            <span className="font-semibold text-gold-300"> Cash Collections</span> tracks actual liquid funds received in agency bank accounts.
          </p>
        </div>

        <div className="shrink-0 text-right">
          <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">NET AGENCY MARGIN</span>
          <div className="text-2xl font-bold font-serif text-emerald-300">{kpis.profitMargin}%</div>
        </div>
      </div>

      {/* Executive KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Contracted Portfolio"
          value={formatCurrency(kpis.totalContractRevenue)}
          icon={Building}
          description="Signed wedding agreements"
          variant="default"
        />
        <MetricCard
          title="Recognized Revenue"
          value={formatCurrency(kpis.totalRecognizedRevenue)}
          icon={TrendingUp}
          description="Contract + Approved Additions"
          variant="gold"
        />
        <MetricCard
          title="Cash Collected"
          value={formatCurrency(kpis.totalClientCollections)}
          icon={CreditCard}
          description="Liquid bank deposits"
          variant="charcoal"
        />
        <MetricCard
          title="Total Cost of Goods"
          value={formatCurrency(kpis.totalCosts)}
          icon={Scale}
          description="Vendors, Labour & Ops"
          variant="default"
        />
        <MetricCard
          title="Agency Net Profit"
          value={formatCurrency(kpis.netProfit)}
          icon={Sparkles}
          description={`Net Margin: ${kpis.profitMargin}%`}
          variant="navy"
        />
      </div>

      {/* Location Comparison: Jaipur vs Udaipur */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-navy-950 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gold-600" />
          <span>Regional Circuit Performance: Jaipur vs Udaipur</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Jaipur Card */}
          <div className="bg-white rounded-2xl p-5 border border-gold-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold text-xs border border-rose-200">
                  JP
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-navy-950">Jaipur Palace Circuit</h3>
                  <p className="text-[11px] text-charcoal-500">Narain Niwas, Rambagh & Jai Mahal</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-ivory-100 text-charcoal-700 border border-gold-200">
                {locationComparison.jaipur?.count || 0} Weddings
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">Revenue</span>
                <p className="font-bold text-xs text-navy-900 mt-1 font-serif">
                  {formatCurrency(locationComparison.jaipur?.revenue || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">Net Profit</span>
                <p className="font-bold text-xs text-emerald-800 mt-1 font-serif">
                  {formatCurrency(locationComparison.jaipur?.profit || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">Margin</span>
                <p className="font-bold text-xs text-gold-700 mt-1">
                  {locationComparison.jaipur?.margin || 0}%
                </p>
              </div>
            </div>
          </div>

          {/* Udaipur Card */}
          <div className="bg-white rounded-2xl p-5 border border-gold-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-charcoal-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                  UD
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-navy-950">Udaipur Lake Circuit</h3>
                  <p className="text-[11px] text-charcoal-500">City Palace, Jagmandir & Oberoi Udaivilas</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-ivory-100 text-charcoal-700 border border-gold-200">
                {locationComparison.udaipur?.count || 0} Weddings
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">Revenue</span>
                <p className="font-bold text-xs text-navy-900 mt-1 font-serif">
                  {formatCurrency(locationComparison.udaipur?.revenue || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">Net Profit</span>
                <p className="font-bold text-xs text-emerald-800 mt-1 font-serif">
                  {formatCurrency(locationComparison.udaipur?.profit || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">Margin</span>
                <p className="font-bold text-xs text-gold-700 mt-1">
                  {locationComparison.udaipur?.margin || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Trends Recharts */}
      {monthlyTrends.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-gold-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-navy-950">
                Revenue vs Net Profit Trajectory
              </h3>
              <p className="text-xs text-charcoal-500">Monthly realized earnings across Rajasthan venues</p>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBD9C1" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#77716A' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#77716A' }}
                  tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value)), '']}
                  contentStyle={{
                    backgroundColor: '#FFF8EF',
                    borderColor: '#D6A65D',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="revenue" name="Recognized Revenue" fill="#071B35" radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Net Agency Profit" fill="#D6A65D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Wedding by Wedding Profitability Breakdown Table */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-navy-950 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold-600" />
          <span>Project Profitability Matrix</span>
        </h2>

        <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                  <th className="py-3 px-4">Wedding Code & Name</th>
                  <th className="py-3 px-4">Circuit</th>
                  <th className="py-3 px-4">Contract Base</th>
                  <th className="py-3 px-4">Additions</th>
                  <th className="py-3 px-4">Recognized Rev</th>
                  <th className="py-3 px-4">Vendor & Costs</th>
                  <th className="py-3 px-4">Net Profit</th>
                  <th className="py-3 px-4">Margin %</th>
                  <th className="py-3 px-4 text-right">Cash Collected</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-xs">
                {weddingBreakdowns.map((wb: any) => (
                  <tr key={wb.weddingId} className="hover:bg-ivory-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">{wb.name}</div>
                      <div className="text-[10px] font-mono text-gold-600 font-bold">{wb.weddingCode}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-charcoal-700">{wb.location}</span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-charcoal-700">
                      {formatCurrency(wb.contractAmount)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                      +{formatCurrency(wb.approvedAdditions)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-navy-950 font-serif">
                      {formatCurrency(wb.recognizedRevenue)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-charcoal-600">
                      {formatCurrency(wb.totalVendorCosts)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-emerald-800 font-serif text-sm">
                      {formatCurrency(wb.netProfit)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {wb.profitMargin}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="font-bold text-navy-900">{formatCurrency(wb.clientCollected)}</div>
                      <div className="text-[10px] text-charcoal-400">
                        Rec: {formatCurrency(wb.clientReceivable)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default FinancialReports;

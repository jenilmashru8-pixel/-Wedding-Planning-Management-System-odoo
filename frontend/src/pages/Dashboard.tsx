import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  MessageSquareHeart,
  CalendarCheck,
  TrendingUp,
  AlertTriangle,
  CreditCard,
  Building2,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  FileText,
  DollarSign,
  ChevronRight,
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
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatLakhsCrores, formatDate } from '../utils/formatters';

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

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        if (user?.role === 'FOUNDER' || user?.role === 'FINANCE') {
          const res = await api.get('/finance/dashboard');
          setData(res.data.data);
        } else {
          // Fetch weddings & tasks
          const [weddingsRes, tasksRes] = await Promise.all([
            api.get('/weddings'),
            api.get('/tasks'),
          ]);
          setData({
            weddings: weddingsRes.data.data.weddings,
            tasks: tasksRes.data.data.tasks,
            stats: tasksRes.data.data.stats,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gold-300 border-t-burgundy-700 rounded-full animate-spin" />
      </div>
    );
  }

  // 1. FOUNDER & FINANCE DASHBOARD
  if (user?.role === 'FOUNDER' || user?.role === 'FINANCE') {
    const kpis = data?.kpis || {};
    const weddingBreakdowns = data?.weddingBreakdowns || [];
    const monthlyTrends = data?.monthlyTrends || [];
    const loc = data?.locationComparison || {};

    const locationPieData = [
      { name: 'Jaipur Weddings', value: loc.jaipur?.weddingsCount || 1, color: '#722F37' },
      { name: 'Udaipur Weddings', value: loc.udaipur?.weddingsCount || 1, color: '#C5A46D' },
    ];

    return (
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl p-8 text-white border border-gold-400/40 shadow-2xl group min-h-[200px] flex items-center">
          <img
            src="/images/udaipur_palace_night.jpg"
            alt="Udaipur Palace Night"
            className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-burgundy-950/95 via-burgundy-950/85 to-burgundy-950/50" />
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold-400/20 text-gold-300 border border-gold-400/30 backdrop-blur-sm">
                Executive Season Overview
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-gold-200 border border-white/20 backdrop-blur-sm">
                Rajasthan Royal Circuit
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-gold-100">
              The Royal Knot Season Portfolio
            </h1>
            <p className="text-sm text-gold-200/90 mt-2 leading-relaxed max-w-xl">
              Real-time financial performance, luxury wedding milestones, client receivables, and vendor obligations across Jaipur & Udaipur.
            </p>
          </div>
        </div>

        {/* Primary Financial KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Recognized Revenue"
            value={formatLakhsCrores(kpis.totalRecognizedRevenue)}
            subtitle="Contract + Approved Additions"
            icon={TrendingUp}
            trend="+18.4%"
            trendType="positive"
            highlight
          />
          <MetricCard
            title="Client Collections"
            value={formatLakhsCrores(kpis.totalClientCollections)}
            subtitle={`Outstanding: ${formatLakhsCrores(kpis.totalClientReceivables)}`}
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
            title="Net Profit"
            value={formatLakhsCrores(kpis.netProfit)}
            subtitle={`Average Margin: ${kpis.profitMargin}%`}
            icon={Sparkles}
            trend={`${kpis.profitMargin}% Margin`}
            trendType="positive"
            highlight
          />
        </div>

        {/* Operational & Liability Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="card-luxury p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-charcoal-500 uppercase">Vendor Costs (Contracted)</p>
              <h4 className="text-xl font-bold font-serif text-charcoal-900 mt-1">{formatLakhsCrores(kpis.totalVendorCosts)}</h4>
              <p className="text-xs text-charcoal-500 mt-0.5">Paid: {formatLakhsCrores(kpis.totalVendorPaymentsPaid)}</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-700 rounded-xl border border-amber-200">
              <Building2 className="w-5 h-5" />
            </div>
          </div>

          <div className="card-luxury p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-charcoal-500 uppercase">Vendor Liabilities Due</p>
              <h4 className="text-xl font-bold font-serif text-charcoal-900 mt-1">{formatLakhsCrores(kpis.totalVendorLiabilities)}</h4>
              <p className="text-xs text-rose-600 mt-0.5">Unpaid balances to vendors</p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="card-luxury p-5 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-charcoal-500 uppercase">Active Weddings</p>
              <h4 className="text-xl font-bold font-serif text-charcoal-900 mt-1">{kpis.totalWeddings} Weddings</h4>
              <p className="text-xs text-emerald-600 mt-0.5">Jaipur & Udaipur destinations</p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Profit Chart */}
          <div className="card-luxury p-6 rounded-2xl lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal-900">Revenue & Profit by Wedding</h3>
                <p className="text-xs text-charcoal-500">Recognized revenue vs calculated net profit</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weddingBreakdowns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f1ef" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tickFormatter={(val) => `₹${(val / 10000000).toFixed(1)}Cr`} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value: any) => [formatCurrency(value), '']} />
                  <Legend />
                  <Bar dataKey="recognizedRevenue" name="Revenue" fill="#722F37" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="netProfit" name="Net Profit" fill="#C5A46D" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Destination Distribution */}
          <div className="card-luxury p-6 rounded-2xl">
            <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-1">Destination Distribution</h3>
            <p className="text-xs text-charcoal-500 mb-4">Jaipur vs Udaipur wedding volume</p>
            <div className="h-60 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={locationPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {locationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-600">
              <span>Udaipur: {formatLakhsCrores(loc.udaipur?.profit)} profit</span>
              <span>Jaipur: {formatLakhsCrores(loc.jaipur?.profit)} profit</span>
            </div>
          </div>
        </div>

        {/* Wedding Projects Financial Table */}
        <div className="card-luxury rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-charcoal-100 flex items-center justify-between">
            <h3 className="font-serif text-lg font-bold text-charcoal-900">All Season Wedding Projects</h3>
            <button
              onClick={() => navigate('/weddings')}
              className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
            >
              View All Workspaces <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-ivory text-charcoal-600 font-semibold border-b border-charcoal-100">
                  <th className="py-3 px-4">Wedding</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Recognized Rev</th>
                  <th className="py-3 px-4">Client Collected</th>
                  <th className="py-3 px-4">Vendor Costs</th>
                  <th className="py-3 px-4">Net Profit</th>
                  <th className="py-3 px-4">Margin</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                {weddingBreakdowns.map((w: any) => (
                  <tr key={w.weddingId} className="hover:bg-gold-50/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-charcoal-900">
                      <div className="flex items-center gap-3">
                        <img
                          src={getWeddingPhoto(w.location, w.name)}
                          alt={w.name}
                          className="w-10 h-10 rounded-xl object-cover border border-gold-300/60 shadow-sm shrink-0"
                        />
                        <div>
                          <div className="font-serif font-bold text-charcoal-900 text-sm hover:text-burgundy-700 transition-colors">
                            {w.name}
                          </div>
                          <span className="text-[10px] text-charcoal-400 font-mono">{w.weddingCode}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{w.location}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={w.status} />
                    </td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(w.recognizedRevenue)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">{formatCurrency(w.clientCollected)}</td>
                    <td className="py-3 px-4 text-charcoal-600">{formatCurrency(w.totalVendorCosts)}</td>
                    <td className="py-3 px-4 font-bold text-burgundy-900">{formatCurrency(w.netProfit)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-gold-100 text-gold-900 font-bold text-[11px]">
                        {w.profitMargin}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => navigate(`/weddings/${w.weddingId}`)}
                        className="px-3 py-1.5 rounded-lg bg-burgundy-700 text-gold-200 hover:text-white text-xs font-semibold shadow-xs"
                      >
                        Workspace
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
  }

  // 2. PLANNER / COORDINATOR / CLIENT DASHBOARD
  const weddings = data?.weddings || [];
  const tasks = data?.tasks || [];
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-xl group">
        <img
          src="/images/royal_couple_palace.jpg"
          alt="Palace Horizon"
          className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-950/95 via-burgundy-950/80 to-burgundy-950/40" />
        <div className="relative z-10 max-w-xl">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gold-400/20 text-gold-300 border border-gold-400/30 backdrop-blur-sm">
            {user?.role?.replace('_', ' ')} PORTAL
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold-100 mt-2">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-xs sm:text-sm text-gold-200/90 mt-1 leading-relaxed">
            {user?.role === 'PLANNER' && 'Managing your assigned luxury weddings, vendors, and milestone schedules.'}
            {user?.role === 'FIELD_COORDINATOR' && 'Live wedding operations, vendor arrival check-in, and incident management.'}
            {user?.role === 'CLIENT' && 'Your dream wedding planning workspace and milestone tracker.'}
            {user?.role === 'VENDOR' && 'Your quotations, approved bookings, and arrival schedules.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Assigned Weddings"
          value={weddings.length}
          subtitle="Jaipur & Udaipur projects"
          icon={Sparkles}
          highlight
        />
        <MetricCard
          title="Total Tasks"
          value={stats.total || tasks.length}
          subtitle={`${stats.done || 0} completed`}
          icon={CalendarCheck}
        />
        <MetricCard
          title="Overdue Tasks"
          value={stats.overdue || 0}
          subtitle="Requires attention"
          icon={AlertTriangle}
          trendType={stats.overdue > 0 ? 'negative' : 'positive'}
        />
        <MetricCard
          title="Completion Rate"
          value={`${stats.completionRate || 0}%`}
          subtitle="Overall progress"
          icon={CheckCircle2}
          trendType="positive"
        />
      </div>

      {/* Weddings Grid */}
      <div>
        <h3 className="font-serif text-lg font-bold text-charcoal-900 mb-3">Wedding Projects</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((w: any) => (
            <div
              key={w.id}
              onClick={() => navigate(`/weddings/${w.id}`)}
              className="card-luxury rounded-2xl cursor-pointer hover:border-gold-400 group overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-lg"
            >
              <div>
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={getWeddingPhoto(w.location, w.name)}
                    alt={w.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase bg-charcoal-900/80 text-gold-300 border border-gold-400/30 backdrop-blur-sm">
                      {w.weddingCode}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    <StatusBadge status={w.status} />
                  </div>
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <p className="text-[11px] font-medium text-gold-200 truncate">{w.location} • {w.venueName || 'Heritage Resort'}</p>
                  </div>
                </div>

                <div className="p-5">
                  <h4 className="font-serif font-bold text-base text-charcoal-900 group-hover:text-burgundy-700 transition-colors line-clamp-1">
                    {w.name}
                  </h4>
                  <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
                    <span className="text-charcoal-500">Dates: {formatDate(w.startDate)}</span>
                    <span className="font-serif font-bold text-burgundy-900">{formatLakhsCrores(w.contractAmount)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gold-700 font-semibold group-hover:text-burgundy-700">
                    <span>Open Workspace</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CalendarCheck,
  AlertTriangle,
  FileCheck2,
  Users,
  MessageSquareHeart,
  Store,
  ChevronRight,
  ArrowUpRight,
  Plus,
  BadgeCheck,
  Calendar,
} from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { StatusBadge } from '../StatusBadge';
import { formatCurrency, formatLakhsCrores, formatDate } from '../../utils/formatters';

interface PlannerDashboardProps {
  weddings: any[];
  tasks: any[];
  taskStats: any;
  enquiries: any[];
  agreements: any[];
  quotations: any[];
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

const CRM_STAGES = [
  { key: 'NEW', label: 'New Lead', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { key: 'CONTACTED', label: 'Contacted', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { key: 'MEETING_SCHEDULED', label: 'Consultation', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { key: 'PROPOSAL_SENT', label: 'Proposal Sent', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { key: 'NEGOTIATION', label: 'Negotiation', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { key: 'CONVERTED', label: 'Converted', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
];

export const PlannerDashboard: React.FC<PlannerDashboardProps> = ({
  weddings = [],
  tasks = [],
  taskStats = {},
  enquiries = [],
  agreements = [],
  quotations = [],
}) => {
  const navigate = useNavigate();
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  const activeWeddings = weddings.filter((w) => w.status !== 'CANCELLED');
  const filteredEnquiries = selectedStage
    ? enquiries.filter((e) => e.status === selectedStage)
    : enquiries;

  const urgentTasks = tasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH');

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Planner Cockpit Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-xl group min-h-[220px] flex items-center">
        <img
          src="/images/royal_mandap_decor.jpg"
          alt="Palace Mandap Decor"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-950/95 via-burgundy-950/80 to-burgundy-950/40" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-gold-400/20 text-gold-300 border border-gold-400/30 backdrop-blur-sm">
              🌸 Lead Wedding Architect Cockpit
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-gold-200 border border-white/20 backdrop-blur-sm">
              Priya Sharma • Senior Luxury Wedding Planner
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold-100">
            Royal Architectural Command & Operations
          </h1>
          <p className="text-xs sm:text-sm text-gold-200/90 mt-1 leading-relaxed">
            Manage HNW client enquiry conversions, staged digital agreements, standard 44-task production checklists, and side-by-side vendor quotation matrices.
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/enquiries')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-burgundy-950 text-xs font-bold shadow-xs hover:scale-102 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Client Enquiry</span>
            </button>
            <button
              onClick={() => navigate('/tasks')}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <CalendarCheck className="w-3.5 h-3.5 text-gold-300" />
              <span>44-Task Kanban Board</span>
            </button>
            <button
              onClick={() => navigate('/quotations')}
              className="px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold backdrop-blur-sm transition-all flex items-center gap-1.5"
            >
              <Store className="w-3.5 h-3.5 text-gold-300" />
              <span>Vendor Quotation Matrix</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational Planner Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Active Weddings"
          value={activeWeddings.length}
          subtitle="Jaipur & Udaipur destinations"
          icon={Sparkles}
          highlight
        />
        <MetricCard
          title="CRM Enquiry Pipeline"
          value={enquiries.length}
          subtitle={`${enquiries.filter((e) => e.status === 'CONVERTED').length} converted to weddings`}
          icon={MessageSquareHeart}
          trend="+2 New Today"
          trendType="positive"
        />
        <MetricCard
          title="Task Completion Rate"
          value={`${taskStats.completionRate || 68}%`}
          subtitle={`${taskStats.done || 42} done of ${taskStats.total || 62} tasks`}
          icon={CalendarCheck}
          trendType="positive"
        />
        <MetricCard
          title="Urgent Actions Due"
          value={urgentTasks.length || 3}
          subtitle="High-priority milestones"
          icon={AlertTriangle}
          trendType={urgentTasks.length > 0 ? 'negative' : 'positive'}
          highlight={urgentTasks.length > 0}
        />
      </div>

      {/* CRM Funnel Pipeline Widget */}
      <div className="card-luxury p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-charcoal-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">CRM Client Ingestion & Funnel Pipeline</h3>
            <p className="text-xs text-charcoal-500">Track high-net-worth inquiries across Instagram, WhatsApp, Website, and Referrals</p>
          </div>
          <button
            onClick={() => navigate('/enquiries')}
            className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1 self-start sm:self-center"
          >
            <span>Open CRM Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Funnel Stage Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {CRM_STAGES.map((stg) => {
            const count = enquiries.filter((e) => e.status === stg.key).length;
            const isSelected = selectedStage === stg.key;

            return (
              <button
                key={stg.key}
                onClick={() => setSelectedStage(isSelected ? null : stg.key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-burgundy-700 bg-burgundy-50 shadow-xs ring-2 ring-burgundy-300'
                    : 'border-charcoal-100 bg-white hover:bg-gold-50/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider">{stg.label}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${stg.color}`}>{count}</span>
                </div>
                <div className="mt-2 text-xs text-charcoal-600 font-medium">
                  {count > 0 ? `${count} Inquiries` : 'No leads'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Filtered Inquiries List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-ivory text-charcoal-600 font-semibold border-b border-charcoal-100">
                <th className="py-2.5 px-3">Lead #</th>
                <th className="py-2.5 px-3">Couple / Client</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Preferred Dates</th>
                <th className="py-2.5 px-3">Max Budget</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
              {filteredEnquiries.slice(0, 5).map((e: any) => (
                <tr key={e.id} className="hover:bg-gold-50/20 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-burgundy-900">{e.enquiryNumber}</td>
                  <td className="py-2.5 px-3 font-semibold text-charcoal-900">
                    <div>{e.coupleName || `${e.partner1Name} & ${e.partner2Name}`}</div>
                    <div className="text-[10px] text-charcoal-400">{e.phone}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-charcoal-100 text-charcoal-700">
                      {e.source}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{e.weddingLocation}</td>
                  <td className="py-2.5 px-3">{formatDate(e.preferredDate)}</td>
                  <td className="py-2.5 px-3 font-semibold text-charcoal-900">{formatLakhsCrores(e.maxBudget)}</td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={e.status} />
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => navigate('/enquiries')}
                      className="px-2.5 py-1 rounded bg-burgundy-100 text-burgundy-900 hover:bg-burgundy-200 text-xs font-semibold"
                    >
                      Process Lead
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Wedding Projects Progress & Milestones */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg font-bold text-charcoal-900">Managed Wedding Projects & Checklists</h3>
          <button
            onClick={() => navigate('/weddings')}
            className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeWeddings.map((w: any) => {
            const completion = w.completionPercentage || 68;

            return (
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
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
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
                      <p className="text-[11px] font-medium text-gold-200 truncate">{w.location} • {w.venueName || 'Heritage Estate'}</p>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h4 className="font-serif font-bold text-base text-charcoal-900 group-hover:text-burgundy-700 transition-colors line-clamp-1">
                      {w.name}
                    </h4>

                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-charcoal-500 font-medium">Standard 44 Tasks Checklist</span>
                        <span className="font-bold text-burgundy-900">{completion}% Done</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-gold-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-burgundy-700 transition-all duration-500"
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
                      <span className="text-charcoal-500 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gold-600" />
                        {formatDate(w.startDate)}
                      </span>
                      <span className="font-serif font-bold text-burgundy-900">{formatLakhsCrores(w.contractAmount)}</span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-2.5 bg-ivory/60 border-t border-charcoal-100 flex items-center justify-between text-xs text-burgundy-800 font-semibold group-hover:bg-gold-50/50 transition-colors">
                  <span>Open Architectural Workspace</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two-Column Hub: Digital Agreements & Vendor Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Digital Agreements Status */}
        <div className="card-luxury p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-burgundy-800" />
                Digital Planning Agreements
              </h3>
              <p className="text-xs text-charcoal-500">Staged payment milestones & client signatures</p>
            </div>
            <button
              onClick={() => navigate('/agreements')}
              className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
            >
              <span>Manage Agreements</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {agreements.slice(0, 4).map((ag: any) => (
              <div
                key={ag.id}
                className="p-3 rounded-xl border border-charcoal-100 hover:border-gold-300 bg-white hover:bg-gold-50/20 transition-all flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-charcoal-900 text-xs flex items-center gap-2">
                    <span>{ag.title || `Master Agreement — ${ag.wedding?.name}`}</span>
                    <StatusBadge status={ag.status} />
                  </div>
                  <div className="text-[11px] text-charcoal-500 mt-0.5">
                    Total: <strong className="text-charcoal-800">{formatLakhsCrores(ag.totalAmount)}</strong> • {ag.wedding?.location || 'Rajasthan'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ag.status === 'SIGNED' ? (
                    <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <BadgeCheck className="w-3 h-3 text-emerald-600" /> Locked & Signed
                    </span>
                  ) : (
                    <button
                      onClick={() => navigate(`/sign/${ag.id}`)}
                      className="px-2.5 py-1 rounded bg-burgundy-700 text-gold-200 text-xs font-semibold hover:text-white"
                    >
                      Signing Link
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vendor Quotations Matrix */}
        <div className="card-luxury p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-gold-600" />
                Vendor Sourcing Matrix
              </h3>
              <p className="text-xs text-charcoal-500">Side-by-side bids on per-plate and total pricing</p>
            </div>
            <button
              onClick={() => navigate('/quotations')}
              className="text-xs font-semibold text-burgundy-700 hover:text-burgundy-900 flex items-center gap-1"
            >
              <span>Compare Quotes</span>
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
                    <span>{q.vendor?.companyName || 'Heritage Vendor'}</span>
                    <StatusBadge status={q.status} />
                  </div>
                  <div className="text-[11px] text-charcoal-500 mt-0.5">
                    Plate: <strong>{q.pricePerPlate ? `₹${q.pricePerPlate}` : 'N/A'}</strong> • Total: <strong className="text-charcoal-800">{formatLakhsCrores(q.totalAmount)}</strong>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/quotations')}
                  className="px-2.5 py-1 rounded bg-gold-100 text-gold-900 hover:bg-gold-200 text-xs font-semibold"
                >
                  View Bid
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

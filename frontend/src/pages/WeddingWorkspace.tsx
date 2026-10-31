import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Users,
  CalendarCheck,
  CreditCard,
  Receipt,
  FileCheck2,
  Radio,
  FileText,
  DollarSign,
  AlertTriangle,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Layers,
  MapPin,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Wedding, WeddingTask, Guest, PaymentMilestone, ExtraExpense, WeddingEvent, VendorCheckIn, Incident } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatLakhsCrores, formatDate, formatDateTime } from '../utils/formatters';

export const WeddingWorkspace: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'guests' | 'operations' | 'payments' | 'expenses' | 'vendors' | 'agreements' | 'reports'>('overview');
  const [wedding, setWedding] = useState<Wedding | null>(null);
  const [overviewMetrics, setOverviewMetrics] = useState<any>(null);
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [guestStats, setGuestStats] = useState<any>(null);
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [extraExpenses, setExtraExpenses] = useState<ExtraExpense[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<WeddingEvent[]>([]);
  const [vendorCheckIns, setVendorCheckIns] = useState<VendorCheckIn[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vendorBookings, setVendorBookings] = useState<any[]>([]);
  const [agreements, setAgreements] = useState<any[]>([]);
  const [profitReport, setProfitReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Forms
  const [newTask, setNewTask] = useState({ taskName: '', category: 'PRE_WEDDING', priority: 'MEDIUM', dueDate: '' });
  const [newGuest, setNewGuest] = useState({ firstName: '', lastName: '', guestGroup: 'General', rsvpStatus: 'CONFIRMED', dietaryPreference: 'VEG' });
  const [newPayment, setNewPayment] = useState({ milestoneId: '', amount: 0, paymentMethod: 'BANK_TRANSFER', transactionRef: '', notes: '' });
  const [newExpense, setNewExpense] = useState({ category: 'CATERING', description: '', quantity: 1, unitPrice: 0, taxRate: 18 });
  const [newIncident, setNewIncident] = useState({ title: '', description: '', severity: 'HIGH' });

  const fetchWorkspaceData = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [overviewRes, tasksRes, guestsRes, payRes, expRes, opsRes, checkInsRes, incRes, bookRes, agrRes, profRes] = await Promise.all([
        api.get(`/weddings/${id}/overview`),
        api.get(`/tasks?weddingId=${id}`),
        api.get(`/guests?weddingId=${id}`),
        api.get(`/payments/milestones?weddingId=${id}`),
        api.get(`/expenses?weddingId=${id}`),
        api.get(`/operations/weddings/${id}/timeline`),
        api.get(`/operations/weddings/${id}/check-ins`),
        api.get(`/operations/incidents?weddingId=${id}`),
        api.get(`/weddings/${id}`),
        api.get(`/agreements?weddingId=${id}`),
        api.get(`/finance/weddings/${id}/profit`),
      ]);

      setWedding(overviewRes.data.data.wedding);
      setOverviewMetrics(overviewRes.data.data.metrics);
      setTasks(tasksRes.data.data.tasks || []);
      setGuests(guestsRes.data.data.guests || []);
      setGuestStats(guestsRes.data.data.stats);
      setMilestones(payRes.data.data.milestones || []);
      setExtraExpenses(expRes.data.data.expenses || []);
      setTimelineEvents(opsRes.data.data.events || []);
      setVendorCheckIns(checkInsRes.data.data.checkIns || []);
      setIncidents(incRes.data.data.incidents || []);
      setVendorBookings(bookRes.data.data.wedding?.vendorBookings || []);
      setAgreements(agrRes.data.data.agreements || []);
      setProfitReport(profRes.data.data.profitAnalysis);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, [id]);

  // Real-time Socket.IO Listeners for this wedding workspace
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join_wedding', id);

    socket.on('vendor_checkin', (checkIn: VendorCheckIn) => {
      setVendorCheckIns((prev) => [checkIn, ...prev.filter((c) => c.id !== checkIn.id)]);
    });

    socket.on('vendor_delayed', (delayedAlert: any) => {
      alert(`⚠️ REAL-TIME ALERT: Vendor ${delayedAlert.vendorName} is delayed by ${delayedAlert.delayMinutes} mins! Reason: ${delayedAlert.delayReason}`);
    });

    socket.on('incident_reported', (incident: Incident) => {
      setIncidents((prev) => [incident, ...prev]);
    });

    socket.on('incident_resolved', (incident: Incident) => {
      setIncidents((prev) => prev.map((inc) => (inc.id === incident.id ? incident : inc)));
    });

    return () => {
      socket.emit('leave_wedding', id);
      socket.off('vendor_checkin');
      socket.off('vendor_delayed');
      socket.off('incident_reported');
      socket.off('incident_resolved');
    };
  }, [socket, id]);

  const handleGenerateTasks = async () => {
    try {
      const res = await api.post(`/tasks/${id}/generate`);
      alert(res.data.message);
      fetchWorkspaceData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate tasks');
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus as any } : t)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckInVendor = async (vendorId: string, status: string = 'ARRIVED') => {
    try {
      await api.post(`/operations/weddings/${id}/vendors/${vendorId}/check-in`, { status });
      fetchWorkspaceData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveExpense = async (expenseId: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
    try {
      await api.patch(`/expenses/${expenseId}/approval`, { approvalStatus });
      fetchWorkspaceData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update approval');
    }
  };

  const handleGenerateClientInvoice = async () => {
    try {
      const res = await api.post('/expenses/invoices/generate', { weddingId: id });
      alert('Invoice generated successfully! Download PDF from the invoices section.');
      fetchWorkspaceData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate invoice');
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/payments', {
        weddingId: id,
        ...newPayment,
        transactionRef: newPayment.transactionRef || `TXN-${Date.now()}`,
      });
      setIsPaymentModalOpen(false);
      setNewPayment({ milestoneId: '', amount: 0, paymentMethod: 'BANK_TRANSFER', transactionRef: '', notes: '' });
      fetchWorkspaceData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment recording failed');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/expenses', { weddingId: id, ...newExpense });
      setIsExpenseModalOpen(false);
      setNewExpense({ category: 'CATERING', description: '', quantity: 1, unitPrice: 0, taxRate: 18 });
      fetchWorkspaceData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Expense creation failed');
    }
  };

  const handleCreateIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/operations/incidents', { weddingId: id, ...newIncident });
      setIsIncidentModalOpen(false);
      setNewIncident({ title: '', description: '', severity: 'HIGH' });
      fetchWorkspaceData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Incident creation failed');
    }
  };

  if (isLoading || !wedding) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-gold-300 border-t-burgundy-700 rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { key: 'overview', label: 'Overview', icon: Sparkles },
    { key: 'tasks', label: `Tasks (${tasks.length})`, icon: CalendarCheck },
    { key: 'guests', label: `Guests (${guests.length})`, icon: Users },
    { key: 'operations', label: 'Live Operations', icon: Radio },
    { key: 'payments', label: 'Milestones & Payments', icon: CreditCard },
    { key: 'expenses', label: `Extra Billing (${extraExpenses.length})`, icon: Receipt },
    { key: 'vendors', label: `Vendors (${vendorBookings.length})`, icon: Layers },
    { key: 'agreements', label: 'Agreements', icon: FileCheck2 },
    { key: 'reports', label: 'Profitability Report', icon: DollarSign },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Workspace Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-2xl group">
        <img
          src={
            wedding.location?.toLowerCase().includes('udaipur') || wedding.name?.toLowerCase().includes('udaipur')
              ? '/images/royal_couple_palace.jpg'
              : '/images/royal_mandap_decor.jpg'
          }
          alt={wedding.name}
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-950/95 via-burgundy-950/85 to-burgundy-950/50" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold-400 font-bold bg-gold-400/20 px-2 py-0.5 rounded border border-gold-400/30 backdrop-blur-sm">
                {wedding.weddingCode}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold-200 bg-white/10 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                {wedding.packageType?.replace('_', ' ')}
              </span>
              <span className="text-[10px] uppercase font-semibold text-gold-300/90 bg-burgundy-900/60 px-2 py-0.5 rounded backdrop-blur-sm border border-gold-400/20">
                Royal Palace Edition
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-gold-100 mt-2">{wedding.name}</h1>
            <p className="text-xs sm:text-sm text-gold-200/90 mt-1 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gold-400" />
                <span>{wedding.location} • {wedding.venueName || 'Palace Heritage Resort'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gold-400" />
                <span>{formatDate(wedding.startDate)} to {formatDate(wedding.endDate)}</span>
              </span>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={wedding.status} />
            <button
              onClick={() => setActiveTab('operations')}
              className="px-3.5 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-burgundy-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:brightness-105"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-burgundy-900" />
              <span>Day-Of Live Mode</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-gold-200/70 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-burgundy-700 text-gold-200 shadow-md border border-gold-400/40'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-gold-50/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-gold-300' : 'text-charcoal-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              title="Planning Progress"
              value={`${overviewMetrics?.completionPercentage || 0}%`}
              subtitle={`${overviewMetrics?.doneTasks || 0} of ${overviewMetrics?.totalTasks || 0} tasks done`}
              icon={CalendarCheck}
              highlight
            />
            <MetricCard
              title="Recognized Contract"
              value={formatLakhsCrores(overviewMetrics?.recognizedRevenue)}
              subtitle={`Contract: ${formatLakhsCrores(wedding.contractAmount)}`}
              icon={DollarSign}
            />
            <MetricCard
              title="Client Payments"
              value={formatLakhsCrores(overviewMetrics?.totalClientPayments)}
              subtitle={`Outstanding: ${formatLakhsCrores(overviewMetrics?.clientOutstanding)}`}
              icon={CreditCard}
              trendType="positive"
            />
            <MetricCard
              title="Guests Confirmed"
              value={`${overviewMetrics?.guestsConfirmed || 0} / ${overviewMetrics?.totalGuests || 0}`}
              subtitle={`${overviewMetrics?.guestsAttended || 0} checked in at venue`}
              icon={Users}
              trendType="neutral"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Snapshot */}
            <div className="card-luxury p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-charcoal-900">Upcoming Wedding Events</h3>
                <button onClick={() => setActiveTab('operations')} className="text-xs font-bold text-burgundy-700 hover:underline">
                  Full Schedule
                </button>
              </div>
              <div className="space-y-3">
                {timelineEvents.slice(0, 4).map((evt) => (
                  <div key={evt.id} className="p-3 rounded-xl border border-charcoal-100 bg-ivory flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-charcoal-900">{evt.eventName}</h4>
                      <p className="text-[11px] text-charcoal-500">{evt.startTime} - {evt.endTime} • {evt.location}</p>
                    </div>
                    <StatusBadge status={evt.status} />
                  </div>
                ))}
              </div>
            </div>

            {/* Active Operational Incidents */}
            <div className="card-luxury p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-burgundy-700" />
                  <span>On-Day Incidents & Alerts</span>
                </h3>
                <button
                  onClick={() => setIsIncidentModalOpen(true)}
                  className="px-2.5 py-1 bg-burgundy-50 text-burgundy-700 border border-burgundy-200 rounded-lg text-xs font-semibold"
                >
                  Report Incident
                </button>
              </div>
              {incidents.length === 0 ? (
                <p className="text-xs text-charcoal-400 italic">No open incidents. All operations smooth.</p>
              ) : (
                <div className="space-y-3">
                  {incidents.slice(0, 3).map((inc) => (
                    <div key={inc.id} className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 text-xs">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-charcoal-900">{inc.title}</span>
                        <StatusBadge status={inc.severity} />
                      </div>
                      <p className="text-[11px] text-charcoal-600 mt-1">{inc.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Palace Scenography & Visual Gallery */}
          <div className="card-luxury p-6 rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-charcoal-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-600" />
                  <span>Palace Architectural Scenography & Production Vision</span>
                </h3>
                <p className="text-xs text-charcoal-500">Curated royal staging, decor themes, and culinary design for this wedding project.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Mandap Architecture */}
              <div className="group rounded-2xl overflow-hidden border border-gold-300/40 bg-ivory shadow-sm hover:shadow-md transition-all">
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src="/images/royal_mandap_decor.jpg"
                    alt="Royal Mandap Decor"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-500/90 text-burgundy-950">
                    Mandap Staging
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-sm text-charcoal-900 group-hover:text-burgundy-700 transition-colors">
                    Heritage Carved Gold Mandap
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                    Opulent carved golden pillars, cascading blush & burgundy roses, vintage crystal chandeliers, and traditional brass oil diyas.
                  </p>
                </div>
              </div>

              {/* Card 2: Royal Feast Catering */}
              <div className="group rounded-2xl overflow-hidden border border-gold-300/40 bg-ivory shadow-sm hover:shadow-md transition-all">
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src="/images/royal_banquet_feast.jpg"
                    alt="Royal Rajasthani Banquet"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-500/90 text-burgundy-950">
                    Culinary Production
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-sm text-charcoal-900 group-hover:text-burgundy-700 transition-colors">
                    Royal Rajasthani Banquet Feast
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                    Traditional Mewari thalis, silver dinnerware, bespoke live culinary stations, fine desserts, and handcrafted royal hospitality.
                  </p>
                </div>
              </div>

              {/* Card 3: Lake Pichola Twilight Celebration */}
              <div className="group rounded-2xl overflow-hidden border border-gold-300/40 bg-ivory shadow-sm hover:shadow-md transition-all">
                <div className="relative h-44 w-full overflow-hidden">
                  <img
                    src="/images/udaipur_palace_night.jpg"
                    alt="Udaipur Palace Lake Pichola"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold-500/90 text-burgundy-950">
                    Night Ambiance
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-sm text-charcoal-900 group-hover:text-burgundy-700 transition-colors">
                    Twilight Lakefront Celebrations
                  </h4>
                  <p className="text-xs text-charcoal-500 mt-1 leading-relaxed">
                    Heritage palace illuminated over Lake Pichola, floating water lanterns, fairy lights, and live classical sitar welcoming.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TASKS */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Wedding Master Task Plan</h3>
              <p className="text-xs text-charcoal-500">Comprehensive checklist covering Pre-Wedding, Event Day, and Post-Wedding settlements.</p>
            </div>
            <div className="flex items-center gap-2">
              {tasks.length === 0 && (
                <button
                  onClick={handleGenerateTasks}
                  className="px-4 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-burgundy-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-burgundy-900" />
                  <span>Auto-Generate Complete Plan</span>
                </button>
              )}
              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3.5 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Custom Task</span>
              </button>
            </div>
          </div>

          {/* Kanban / List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {['TO_PLAN', 'IN_PROGRESS', 'REVIEW', 'DONE'].map((colStatus) => {
              const colTasks = tasks.filter((t) => t.status === colStatus);
              return (
                <div key={colStatus} className="bg-white/80 rounded-2xl p-4 border border-gold-200/60 shadow-xs flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-charcoal-100 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                      {colStatus.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gold-100 text-gold-800">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                    {colTasks.map((task) => (
                      <div key={task.id} className="p-3.5 bg-ivory rounded-xl border border-gold-200/80 shadow-xs text-xs space-y-2">
                        <div className="flex items-start justify-between gap-1">
                          <h5 className="font-semibold text-charcoal-900">{task.taskName}</h5>
                          <StatusBadge status={task.priority} />
                        </div>
                        {task.description && <p className="text-[11px] text-charcoal-500">{task.description}</p>}
                        <div className="flex items-center justify-between pt-2 border-t border-charcoal-100 text-[10px] text-charcoal-400">
                          <span>Due: {formatDate(task.dueDate)}</span>
                          <select
                            value={task.status}
                            onChange={(e) => handleTaskStatusChange(task.id, e.target.value)}
                            className="bg-white px-2 py-0.5 rounded border border-gold-200 text-charcoal-700 font-medium"
                          >
                            <option value="TO_PLAN">To Plan</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="REVIEW">Review</option>
                            <option value="DONE">Done</option>
                          </select>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: GUESTS */}
      {activeTab === 'guests' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Guest Hospitality & RSVPs</h3>
              <p className="text-xs text-charcoal-500">Manage 400+ guests, room allocations, transport, and dietary preferences.</p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={`/api/guests/export/${id}`}
                className="px-3.5 py-2 border border-gold-300 bg-white hover:bg-gold-50 rounded-xl text-xs font-semibold text-charcoal-700 flex items-center gap-1 shadow-xs"
              >
                <Download className="w-4 h-4 text-gold-600" />
                <span>Export CSV</span>
              </a>
              <button
                onClick={() => setIsGuestModalOpen(true)}
                className="px-3.5 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Guest</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard title="Total Invited" value={guestStats?.total || guests.length} icon={Users} />
            <MetricCard title="Confirmed" value={guestStats?.confirmed || 0} icon={CheckCircle2} trendType="positive" />
            <MetricCard title="Declined" value={guestStats?.declined || 0} icon={AlertTriangle} trendType="negative" />
            <MetricCard title="Actual Attendees" value={guestStats?.actualAttendees || 0} icon={Sparkles} highlight />
          </div>

          <div className="card-luxury rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-ivory text-charcoal-600 font-semibold border-b border-charcoal-100">
                    <th className="py-3 px-4">Guest Name</th>
                    <th className="py-3 px-4">Group</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">RSVP Status</th>
                    <th className="py-3 px-4">Dietary</th>
                    <th className="py-3 px-4">Room #</th>
                    <th className="py-3 px-4">Arrival Status</th>
                    <th className="py-3 px-4 text-right">Check-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {guests.slice(0, 30).map((g) => (
                    <tr key={g.id} className="hover:bg-gold-50/20">
                      <td className="py-3 px-4 font-bold text-charcoal-900">{g.firstName} {g.lastName}</td>
                      <td className="py-3 px-4">{g.guestGroup}</td>
                      <td className="py-3 px-4 text-charcoal-500">{g.phone || g.email || '-'}</td>
                      <td className="py-3 px-4"><StatusBadge status={g.rsvpStatus} /></td>
                      <td className="py-3 px-4 font-semibold text-gold-800">{g.dietaryPreference}</td>
                      <td className="py-3 px-4">{g.roomNumber || 'Pending'}</td>
                      <td className="py-3 px-4"><StatusBadge status={g.arrivalStatus} /></td>
                      <td className="py-3 px-4 text-right">
                        {g.arrivalStatus !== 'ARRIVED' ? (
                          <button
                            onClick={async () => {
                              await api.patch(`/guests/${g.id}/check-in`, { arrivalStatus: 'ARRIVED' });
                              fetchWorkspaceData();
                            }}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100"
                          >
                            Check-In
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-700 font-bold">Checked In</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {guests.length > 30 && (
              <div className="p-3 text-center text-xs text-charcoal-400 bg-ivory">
                Showing first 30 of {guests.length} guests. Use Export CSV to view complete master list.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: LIVE OPERATIONS */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900 flex items-center gap-2">
                <Radio className="w-5 h-5 text-burgundy-700 animate-pulse" />
                <span>Wedding Day Live Operations</span>
              </h3>
              <p className="text-xs text-charcoal-500">Live vendor check-ins, automatic delay warnings, and incident resolution.</p>
            </div>
            <button
              onClick={() => setIsIncidentModalOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Report New Incident</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Vendor Check-in Table */}
            <div className="card-luxury p-6 rounded-2xl">
              <h4 className="font-serif text-lg font-bold text-charcoal-900 mb-4">Vendor Arrivals & On-Site Status</h4>
              <div className="space-y-3">
                {vendorCheckIns.map((ci) => (
                  <div key={ci.id} className="p-3.5 rounded-xl border border-charcoal-100 bg-ivory flex items-center justify-between text-xs">
                    <div>
                      <h5 className="font-bold text-charcoal-900">{ci.vendor?.companyName}</h5>
                      <p className="text-[11px] text-charcoal-500 mt-0.5">
                        Expected: {formatDateTime(ci.expectedArrivalTime)}
                      </p>
                      {ci.delayMinutes > 0 && (
                        <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                          ⚠️ Delayed by {ci.delayMinutes} mins • {ci.delayReason}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ci.status} />
                      {ci.status === 'EXPECTED' && (
                        <button
                          onClick={() => handleCheckInVendor(ci.vendorId, 'ARRIVED')}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow-xs"
                        >
                          Check In
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Incidents */}
            <div className="card-luxury p-6 rounded-2xl">
              <h4 className="font-serif text-lg font-bold text-charcoal-900 mb-4">Active & Resolved Incidents</h4>
              <div className="space-y-3">
                {incidents.map((inc) => (
                  <div key={inc.id} className="p-4 rounded-xl border border-charcoal-200 bg-white text-xs space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] text-charcoal-400 font-bold">{inc.incidentNumber}</span>
                        <h5 className="font-bold text-charcoal-900 text-sm mt-0.5">{inc.title}</h5>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={inc.severity} />
                        <StatusBadge status={inc.status} />
                      </div>
                    </div>
                    <p className="text-charcoal-600 text-xs">{inc.description}</p>
                    {inc.resolutionNotes && (
                      <p className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px]">
                        <strong>Resolution:</strong> {inc.resolutionNotes}
                      </p>
                    )}
                    {inc.status !== 'RESOLVED' && (
                      <button
                        onClick={async () => {
                          const notes = prompt('Enter incident resolution notes:');
                          if (notes) {
                            await api.patch(`/operations/incidents/${inc.id}/resolve`, { resolutionNotes: notes });
                            fetchWorkspaceData();
                          }
                        }}
                        className="px-3 py-1 bg-burgundy-700 text-gold-200 rounded-lg text-xs font-semibold"
                      >
                        Resolve Incident
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENTS */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Staged Client Payment Schedule</h3>
              <p className="text-xs text-charcoal-500">Booking deposit (25%), 30-day advance (50%), and post-event final settlement (25%).</p>
            </div>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Record Client Payment</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {milestones.map((m) => (
              <div key={m.id} className="card-luxury p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gold-700 uppercase bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                        Milestone #{m.sortOrder}
                      </span>
                      <h4 className="font-serif font-bold text-base text-charcoal-900 mt-1">{m.title}</h4>
                      <p className="text-xs text-charcoal-500 mt-0.5">Due: {formatDate(m.dueDate)}</p>
                    </div>
                    <StatusBadge status={m.status} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-charcoal-100 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Amount Due:</span>
                      <span className="font-bold text-charcoal-900">{formatCurrency(m.amountDue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Amount Paid:</span>
                      <span className="font-bold text-emerald-700">{formatCurrency(m.amountPaid)}</span>
                    </div>
                  </div>
                </div>

                {m.status !== 'PAID' && (
                  <button
                    onClick={() => {
                      setNewPayment({
                        milestoneId: m.id,
                        amount: Number(m.amountDue) - Number(m.amountPaid),
                        paymentMethod: 'BANK_TRANSFER',
                        transactionRef: `HDFCR${Date.now()}`,
                        notes: `Settlement for ${m.title}`,
                      });
                      setIsPaymentModalOpen(true);
                    }}
                    className="mt-4 w-full py-2 bg-gold-50 text-burgundy-800 hover:bg-burgundy-700 hover:text-gold-200 border border-gold-300 rounded-xl text-xs font-semibold transition-all"
                  >
                    Record Payment
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: EXPENSES & BILLING */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Extra Expenses & Client Billing</h3>
              <p className="text-xs text-charcoal-500">Bill unexpected guests (60 extra plates), extended DJ hours, and generator rentals.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateClientInvoice}
                className="px-3.5 py-2 bg-gradient-to-r from-gold-500 to-gold-400 text-burgundy-950 font-bold rounded-xl text-xs shadow-md flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4 text-burgundy-900" />
                <span>Generate Client Invoice</span>
              </button>
              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-3.5 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold shadow-md flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                <span>Add Extra Expense</span>
              </button>
            </div>
          </div>

          <div className="card-luxury rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-ivory text-charcoal-600 font-semibold border-b border-charcoal-100">
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Qty</th>
                  <th className="py-3 px-4">Unit Rate</th>
                  <th className="py-3 px-4">Subtotal</th>
                  <th className="py-3 px-4">Tax (18%)</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Approval</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {extraExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gold-50/20">
                    <td className="py-3 px-4 font-bold text-charcoal-900">{exp.description}</td>
                    <td className="py-3 px-4">{exp.category}</td>
                    <td className="py-3 px-4 font-bold">{exp.quantity}</td>
                    <td className="py-3 px-4">{formatCurrency(exp.unitPrice)}</td>
                    <td className="py-3 px-4">{formatCurrency(exp.amount)}</td>
                    <td className="py-3 px-4 text-charcoal-500">{formatCurrency(exp.taxAmount)}</td>
                    <td className="py-3 px-4 font-bold text-burgundy-900">{formatCurrency(exp.totalAmount)}</td>
                    <td className="py-3 px-4"><StatusBadge status={exp.approvalStatus} /></td>
                    <td className="py-3 px-4 text-right">
                      {exp.approvalStatus === 'PENDING' && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleApproveExpense(exp.id, 'APPROVED')}
                            className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleApproveExpense(exp.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs font-semibold hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 7: VENDORS */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Contracted Vendors ({vendorBookings.length})</h3>
              <p className="text-xs text-charcoal-500">Agreed commercial references and advance payment records.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendorBookings.map((b) => (
              <div key={b.id} className="card-luxury p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-gold-700 uppercase bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                        {b.vendor?.category?.name || 'Category'}
                      </span>
                      <h4 className="font-serif font-bold text-base text-charcoal-900 mt-1">{b.vendor?.companyName}</h4>
                      <p className="text-xs text-charcoal-500 mt-0.5">{b.vendor?.contactPerson} • {b.vendor?.phone}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
                    <span className="text-charcoal-500">Agreed Value:</span>
                    <span className="font-bold text-burgundy-900">{formatLakhsCrores(b.agreedAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AGREEMENTS */}
      {activeTab === 'agreements' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Digital Service Agreements</h3>
              <p className="text-xs text-charcoal-500">Legally executed digital contracts with audit trail and PDF downloads.</p>
            </div>
          </div>

          <div className="space-y-4">
            {agreements.map((agr) => (
              <div key={agr.id} className="card-luxury p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-charcoal-400">{agr.agreementNumber}</span>
                    <StatusBadge status={agr.status} />
                  </div>
                  <h4 className="font-serif font-bold text-lg text-charcoal-900 mt-1">{agr.title}</h4>
                  <p className="text-xs text-charcoal-500 mt-0.5">
                    Signed by: {agr.signerName || 'Pending'} • Value: {formatLakhsCrores(agr.totalAmount)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/api/agreements/${agr.id}/pdf`}
                    className="px-4 py-2 bg-gold-50 text-burgundy-800 border border-gold-300 rounded-xl text-xs font-semibold hover:bg-burgundy-700 hover:text-gold-200 transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Signed PDF</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: REPORTS / PROFITABILITY */}
      {activeTab === 'reports' && profitReport && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Project Financial Ledger & Profitability</h3>
              <p className="text-xs text-charcoal-500">True profitability separating recognized revenue from cash collections and costs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <MetricCard
              title="Recognized Revenue"
              value={formatLakhsCrores(profitReport.recognizedRevenue)}
              subtitle={`Contract + Extras`}
              icon={DollarSign}
              highlight
            />
            <MetricCard
              title="Total Wedding Costs"
              value={formatLakhsCrores(profitReport.totalWeddingCosts)}
              subtitle="Vendors + Labour + Expenses"
              icon={Receipt}
            />
            <MetricCard
              title="Net Project Profit"
              value={formatLakhsCrores(profitReport.netProfit)}
              subtitle={`Profit Margin: ${profitReport.profitMargin}%`}
              icon={Sparkles}
              trend={`${profitReport.profitMargin}% Margin`}
              trendType="positive"
              highlight
            />
            <MetricCard
              title="Client Outstanding"
              value={formatLakhsCrores(profitReport.clientOutstanding)}
              subtitle={`Collected: ${formatLakhsCrores(profitReport.clientCollected)}`}
              icon={CreditCard}
              trendType={Number(profitReport.clientOutstanding) > 0 ? 'negative' : 'positive'}
            />
          </div>
        </div>
      )}

      {/* Modals for Quick Actions */}
      <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Create Custom Wedding Task">
        <form onSubmit={async (e) => {
          e.preventDefault();
          await api.post('/tasks', { weddingId: id, ...newTask });
          setIsTaskModalOpen(false);
          fetchWorkspaceData();
        }} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Task Name</label>
            <input
              type="text"
              required
              value={newTask.taskName}
              onChange={(e) => setNewTask({ ...newTask, taskName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Category</label>
              <select
                value={newTask.category}
                onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
              >
                <option value="PRE_WEDDING">Pre-Wedding</option>
                <option value="EVENT_DAY">Event Day</option>
                <option value="POST_WEDDING">Post-Wedding</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Due Date</label>
            <input
              type="date"
              required
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold">
              Save Task
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isGuestModalOpen} onClose={() => setIsGuestModalOpen(false)} title="Add Guest">
        <form onSubmit={async (e) => {
          e.preventDefault();
          await api.post('/guests', { weddingId: id, ...newGuest });
          setIsGuestModalOpen(false);
          fetchWorkspaceData();
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">First Name</label>
              <input
                type="text"
                required
                value={newGuest.firstName}
                onChange={(e) => setNewGuest({ ...newGuest, firstName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Last Name</label>
              <input
                type="text"
                required
                value={newGuest.lastName}
                onChange={(e) => setNewGuest({ ...newGuest, lastName: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">RSVP</label>
              <select
                value={newGuest.rsvpStatus}
                onChange={(e) => setNewGuest({ ...newGuest, rsvpStatus: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Dietary</label>
              <select
                value={newGuest.dietaryPreference}
                onChange={(e) => setNewGuest({ ...newGuest, dietaryPreference: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
              >
                <option value="VEG">Vegetarian</option>
                <option value="JAIN">Jain</option>
                <option value="NON_VEG">Non-Veg</option>
              </select>
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold">
              Save Guest
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Client Payment">
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Milestone</label>
            <select
              value={newPayment.milestoneId}
              onChange={(e) => setNewPayment({ ...newPayment, milestoneId: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
            >
              <option value="">Select Milestone...</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>{m.title} (Due: {formatCurrency(m.amountDue)})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Amount (INR)</label>
            <input
              type="number"
              required
              value={newPayment.amount}
              onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Transaction Reference (Unique)</label>
            <input
              type="text"
              required
              value={newPayment.transactionRef}
              onChange={(e) => setNewPayment({ ...newPayment, transactionRef: e.target.value })}
              placeholder="e.g. HDFCR9827364501"
              className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold">
              Record Payment
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isExpenseModalOpen} onClose={() => setIsExpenseModalOpen(false)} title="Add Extra Billing / Service">
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Description</label>
            <input
              type="text"
              required
              value={newExpense.description}
              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
              placeholder="e.g. 60 Additional Dinner Plates for unexpected guests"
              className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Quantity</label>
              <input
                type="number"
                required
                value={newExpense.quantity}
                onChange={(e) => setNewExpense({ ...newExpense, quantity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Unit Rate (INR)</label>
              <input
                type="number"
                required
                value={newExpense.unitPrice}
                onChange={(e) => setNewExpense({ ...newExpense, unitPrice: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>
          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold">
              Submit for Approval
            </button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isIncidentModalOpen} onClose={() => setIsIncidentModalOpen(false)} title="Report Operational Incident">
        <form onSubmit={handleCreateIncident} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Incident Title</label>
            <input
              type="text"
              required
              value={newIncident.title}
              onChange={(e) => setNewIncident({ ...newIncident, title: e.target.value })}
              placeholder="e.g. DJ sound console delayed / Floral generator needed"
              className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Description & Immediate Impact</label>
            <textarea
              rows={3}
              required
              value={newIncident.description}
              onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="submit" className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold">
              Broadcast Alert
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

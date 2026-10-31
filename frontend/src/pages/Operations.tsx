import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldAlert,
  Flame,
  Calendar,
  MapPin,
  Building,
  UserCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { Wedding, WeddingEvent, VendorCheckIn, Incident, Vendor } from '../types';
import { formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';

export const Operations: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'timeline' | 'checkins' | 'incidents'>('timeline');
  const [loading, setLoading] = useState(true);

  // Data
  const [events, setEvents] = useState<WeddingEvent[]>([]);
  const [checkIns, setCheckIns] = useState<VendorCheckIn[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  // Modals
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Event form
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('22:00');
  const [location, setLocation] = useState('Manek Chowk, City Palace');
  const [notes, setNotes] = useState('');

  // Incident form
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentDesc, setIncidentDesc] = useState('');
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [incidentVendorId, setIncidentVendorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWeddings();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedWeddingId) {
      loadOperationsData();

      // Join Socket.io room for this wedding
      if (socket) {
        socket.emit('join_wedding', selectedWeddingId);

        const handleVendorCheckin = (data: any) => {
          setCheckIns((prev) => [data, ...prev.filter((c) => c.id !== data.id)]);
        };

        const handleVendorDelayed = (data: any) => {
          alert(`⚠️ OPERATIONAL ALERT: Vendor "${data.vendorName}" delayed by ${data.delayMinutes} mins!\nReason: ${data.delayReason}`);
          loadOperationsData();
        };

        const handleIncidentReported = (data: any) => {
          setIncidents((prev) => [data, ...prev]);
        };

        const handleIncidentResolved = (data: any) => {
          setIncidents((prev) => prev.map((inc) => (inc.id === data.id ? data : inc)));
        };

        socket.on('vendor_checkin', handleVendorCheckin);
        socket.on('vendor_delayed', handleVendorDelayed);
        socket.on('incident_reported', handleIncidentReported);
        socket.on('incident_resolved', handleIncidentResolved);

        return () => {
          socket.off('vendor_checkin', handleVendorCheckin);
          socket.off('vendor_delayed', handleVendorDelayed);
          socket.off('incident_reported', handleIncidentReported);
          socket.off('incident_resolved', handleIncidentResolved);
        };
      }
    }
  }, [selectedWeddingId, socket]);

  const fetchWeddings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/weddings');
      if (res.data.success && res.data.data.weddings.length > 0) {
        setWeddings(res.data.data.weddings);
        setSelectedWeddingId(res.data.data.weddings[0].id);
      }
    } catch (err) {
      console.error('Failed to load weddings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await api.get('/vendors');
      if (res.data.success) setVendors(res.data.data.vendors);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  };

  const loadOperationsData = async () => {
    if (!selectedWeddingId) return;
    try {
      setLoading(true);
      const [eventsRes, checkInsRes, incidentsRes] = await Promise.all([
        api.get(`/operations/weddings/${selectedWeddingId}/timeline`),
        api.get(`/operations/weddings/${selectedWeddingId}/check-ins`),
        api.get('/operations/incidents', { params: { weddingId: selectedWeddingId } }),
      ]);

      if (eventsRes.data.success) setEvents(eventsRes.data.data.events);
      if (checkInsRes.data.success) setCheckIns(checkInsRes.data.data.checkIns);
      if (incidentsRes.data.success) setIncidents(incidentsRes.data.data.incidents);
    } catch (err) {
      console.error('Failed to load operations data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckInVendor = async (vendorId: string, eventId?: string) => {
    try {
      const res = await api.post(`/operations/weddings/${selectedWeddingId}/vendors/${vendorId}/check-in`, {
        eventId,
        status: 'ARRIVED',
      });
      if (res.data.success) {
        alert(res.data.message || 'Vendor check-in recorded');
        loadOperationsData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !eventName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/operations/events', {
        weddingId: selectedWeddingId,
        eventName,
        eventDate: eventDate || new Date().toISOString(),
        startTime,
        endTime,
        location,
        priority: 'HIGH',
        status: 'SCHEDULED',
        notes,
      });

      if (res.data.success) {
        setIsEventModalOpen(false);
        setEventName('');
        loadOperationsData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add timeline event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !incidentTitle.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/operations/incidents', {
        weddingId: selectedWeddingId,
        title: incidentTitle,
        description: incidentDesc,
        severity,
        vendorId: incidentVendorId || undefined,
      });

      if (res.data.success) {
        setIsIncidentModalOpen(false);
        setIncidentTitle('');
        setIncidentDesc('');
        setIncidentVendorId('');
        loadOperationsData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncidentId || !resolutionNotes.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.patch(`/operations/incidents/${selectedIncidentId}/resolve`, {
        resolutionNotes,
      });

      if (res.data.success) {
        setIsResolveModalOpen(false);
        setSelectedIncidentId('');
        setResolutionNotes('');
        loadOperationsData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to resolve incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const delayedVendors = checkIns.filter((c) => c.status === 'DELAYED');
  const openIncidents = incidents.filter((i) => i.status !== 'RESOLVED');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600 border border-rose-500/20 animate-pulse">
              <Radio className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-burgundy-900">
              Live Day-of Operations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Sync
            </span>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Minute-by-minute itinerary execution, vendor dispatch check-ins, delayed transit alerts, and real-time incident resolution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory-100 text-charcoal-700 text-xs font-semibold hover:bg-ivory-200 border border-gold-300 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-gold-600" />
            <span>Add Event</span>
          </button>

          <button
            onClick={() => setIsIncidentModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Scheduled Events"
          value={events.length}
          icon={Calendar}
          description="Palace ceremonial itinerary"
          variant="default"
        />
        <MetricCard
          title="Vendor Check-ins"
          value={`${checkIns.filter((c) => c.status === 'ARRIVED').length}/${checkIns.length}`}
          icon={UserCheck}
          description="Arrived on site"
          variant="gold"
        />
        <MetricCard
          title="Transit Delays"
          value={delayedVendors.length}
          icon={Clock}
          description="Vendors late >15 mins"
          variant={delayedVendors.length > 0 ? 'burgundy' : 'default'}
        />
        <MetricCard
          title="Active Incidents"
          value={openIncidents.length}
          icon={Flame}
          description="Triage in progress"
          variant={openIncidents.length > 0 ? 'burgundy' : 'default'}
        />
      </div>

      {/* Operational Warning Callout if there are delays or critical incidents */}
      {(delayedVendors.length > 0 || openIncidents.some((i) => i.severity === 'CRITICAL')) && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 shadow-sm flex items-start gap-3 animate-fade-in">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-serif text-sm font-bold text-rose-950">
              High-Priority Operational Notice
            </h4>
            <div className="text-xs text-rose-800 mt-1 space-y-1">
              {delayedVendors.map((v) => (
                <p key={v.id}>
                  • Vendor <span className="font-semibold">{v.vendor?.companyName}</span> delayed by{' '}
                  <span className="font-bold underline">{v.delayMinutes} minutes</span> ({v.delayReason || 'Transit delay'}).
                </p>
              ))}
              {openIncidents.filter((i) => i.severity === 'CRITICAL').map((inc) => (
                <p key={inc.id}>
                  • Critical Incident: <span className="font-semibold">{inc.title}</span> ({inc.description}).
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Selector & Tab Navigation */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Wedding Selector */}
        <div className="w-full md:w-72">
          <select
            value={selectedWeddingId}
            onChange={(e) => setSelectedWeddingId(e.target.value)}
            className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
          >
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                {w.weddingCode} - {w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Operational Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-ivory-100 rounded-xl border border-gold-200 w-full md:w-auto">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timeline'
                ? 'bg-burgundy-900 text-gold-200 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Itinerary Timeline ({events.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('checkins')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'checkins'
                ? 'bg-burgundy-900 text-gold-200 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Vendor Check-in ({checkIns.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'incidents'
                ? 'bg-burgundy-900 text-gold-200 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Incident Log ({openIncidents.length} Open)</span>
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading operations live feed...</div>
      ) : activeTab === 'timeline' ? (
        /* Timeline Itinerary Tab */
        events.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No Events Scheduled"
            description="Add timeline events for Baraat, Varmala, Pheras, or Reception."
            actionLabel="Add Timeline Event"
            onAction={() => setIsEventModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="bg-white rounded-2xl border border-gold-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-burgundy-950 text-gold-300 flex flex-col items-center justify-center shrink-0 border border-gold-500/30">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">TIME</span>
                    <span className="text-xs font-mono font-bold">{evt.startTime}</span>
                  </div>

                  <div>
                    <h3 className="font-serif text-base font-bold text-burgundy-950">{evt.eventName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-charcoal-600 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-gold-600" />
                        <span>{evt.location}</span>
                      </span>
                      <span className="flex items-center gap-1 font-mono text-charcoal-500">
                        <Clock className="w-3.5 h-3.5 text-gold-600" />
                        <span>{evt.startTime} to {evt.endTime}</span>
                      </span>
                    </div>
                    {evt.notes && <p className="text-[11px] text-charcoal-500 mt-1">{evt.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  <StatusBadge status={evt.status} />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-ivory-100 text-charcoal-700 border border-gold-200">
                    {evt.priority} Priority
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : activeTab === 'checkins' ? (
        /* Vendor Check-in Tab */
        checkIns.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="No Vendor Check-Ins"
            description="Check-ins are recorded as partners arrive at palace security and staging docks."
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                    <th className="py-3 px-4">Vendor Partner</th>
                    <th className="py-3 px-4">Event Checkpoint</th>
                    <th className="py-3 px-4">Expected Arrival</th>
                    <th className="py-3 px-4">Actual Arrival</th>
                    <th className="py-3 px-4">Status & Delay</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-xs">
                  {checkIns.map((chk) => (
                    <tr key={chk.id} className="hover:bg-ivory-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal-900">{chk.vendor?.companyName}</div>
                        <div className="text-[10px] text-charcoal-500">
                          {chk.vendor?.contactPerson} • {chk.vendor?.phone}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-charcoal-700">
                          {chk.event?.eventName || 'Palace Gate Staging'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-charcoal-600">
                        {chk.expectedArrivalTime ? formatDate(chk.expectedArrivalTime) : '16:00'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-charcoal-600">
                        {chk.actualArrivalTime ? formatDate(chk.actualArrivalTime) : '—'}
                      </td>

                      <td className="py-3.5 px-4">
                        {chk.status === 'DELAYED' ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                              Delayed (+{chk.delayMinutes} mins)
                            </span>
                            {chk.delayReason && (
                              <div className="text-[10px] text-rose-700 font-medium">{chk.delayReason}</div>
                            )}
                          </div>
                        ) : chk.status === 'ARRIVED' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Arrived On Time
                          </span>
                        ) : (
                          <StatusBadge status={chk.status} />
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {chk.status !== 'ARRIVED' && chk.status !== 'DELAYED' && (
                          <button
                            onClick={() => handleCheckInVendor(chk.vendorId, chk.eventId)}
                            className="px-3 py-1 rounded-lg bg-burgundy-900 text-gold-200 text-[11px] font-bold hover:bg-burgundy-800 shadow-sm"
                          >
                            Record Arrival
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* Incidents Triage Tab */
        incidents.length === 0 ? (
          <EmptyState
            icon={ShieldAlert}
            title="No Incidents Reported"
            description="Operations are running flawlessly with zero reported disruptions."
            actionLabel="Report Incident"
            onAction={() => setIsIncidentModalOpen(true)}
          />
        ) : (
          <div className="space-y-4">
            {incidents.map((inc) => {
              const isCritical = inc.severity === 'CRITICAL';
              const isResolved = inc.status === 'RESOLVED';

              return (
                <div
                  key={inc.id}
                  className={`rounded-2xl p-5 border transition-all ${
                    isCritical && !isResolved
                      ? 'bg-rose-50/70 border-rose-400 shadow-md'
                      : isResolved
                      ? 'bg-white border-emerald-200 shadow-sm'
                      : 'bg-white border-gold-200/80 shadow-sm'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-charcoal-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-burgundy-900">{inc.incidentNumber}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          inc.severity === 'CRITICAL'
                            ? 'bg-rose-600 text-white animate-pulse'
                            : inc.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-charcoal-100 text-charcoal-800'
                        }`}
                      >
                        {inc.severity} Severity
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={inc.status} />
                      <span className="text-[10px] text-charcoal-400">
                        {formatDate(inc.reportedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 space-y-2">
                    <h3 className="font-serif text-base font-bold text-burgundy-950">{inc.title}</h3>
                    <p className="text-xs text-charcoal-700 leading-relaxed">{inc.description}</p>

                    {inc.vendor && (
                      <div className="text-xs text-charcoal-500">
                        Associated Vendor: <span className="font-semibold">{inc.vendor.companyName}</span>
                      </div>
                    )}

                    {isResolved && inc.resolutionNotes && (
                      <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-900">
                        <div className="font-bold flex items-center gap-1 text-emerald-950 mb-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resolution Protocol Completed:</span>
                        </div>
                        {inc.resolutionNotes}
                      </div>
                    )}

                    {!isResolved && (
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => {
                            setSelectedIncidentId(inc.id);
                            setIsResolveModalOpen(true);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow transition-all flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Resolve Incident</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Add Event Modal */}
      <Modal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        title="Add Timeline Event"
        subtitle="Schedule a minute-by-minute royal ceremony milestone"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Event Name *</label>
            <input
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="e.g. Royal Baraat Procession with Vintage Cars & Brass Band"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Start Time *</label>
              <input
                type="text"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                placeholder="17:30"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">End Time *</label>
              <input
                type="text"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                placeholder="19:30"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Location / Palace Courtyard *</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Operational Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escort routes, dhol artists, floral shower cannons..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsEventModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-burgundy-900 text-gold-200 text-xs font-bold hover:bg-burgundy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Event'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Report Incident Modal */}
      <Modal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        title="Report Operational Incident"
        subtitle="Broadcast immediate alert to command team & log triage issue"
        maxWidth="lg"
      >
        <form onSubmit={handleReportIncident} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Incident Headline *</label>
            <input
              type="text"
              value={incidentTitle}
              onChange={(e) => setIncidentTitle(e.target.value)}
              placeholder="e.g. Sound System Power Tripped at Main Courtyard"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Severity Level</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical (Immediate Escalation)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Vendor Responsible (Optional)</label>
              <select
                value={incidentVendorId}
                onChange={(e) => setIncidentVendorId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="">None / Internal Coordination</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Detailed Description *</label>
            <textarea
              rows={3}
              value={incidentDesc}
              onChange={(e) => setIncidentDesc(e.target.value)}
              placeholder="What occurred, affected areas, and immediate risks..."
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsIncidentModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Broadcasting...' : 'Broadcast Alert'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Resolve Incident Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Operational Incident"
        subtitle="Record corrective actions taken and mark issue resolved"
        maxWidth="md"
      >
        <form onSubmit={handleResolveIncident} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Resolution Protocol & Notes *</label>
            <textarea
              rows={4}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Switched to backup 125kVA sound generator. Audio restored within 4 minutes."
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Mark Incident Resolved'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Operations;

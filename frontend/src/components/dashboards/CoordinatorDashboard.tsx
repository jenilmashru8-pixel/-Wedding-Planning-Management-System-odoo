import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Users,
  ShieldAlert,
  Phone,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { StatusBadge } from '../StatusBadge';
import { formatDate } from '../../utils/formatters';

interface CoordinatorDashboardProps {
  weddings: any[];
  timelineEvents: any[];
  vendorCheckIns: any[];
  incidents: any[];
  onCheckInVendor?: (checkInId: string) => void;
  onResolveIncident?: (incidentId: string) => void;
  onRefresh?: () => void;
}

export const CoordinatorDashboard: React.FC<CoordinatorDashboardProps> = ({
  weddings = [],
  timelineEvents = [],
  vendorCheckIns = [],
  incidents = [],
}) => {
  const navigate = useNavigate();
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>(
    weddings[0]?.id || ''
  );

  // Filter events and check-ins for the selected wedding
  const filteredEvents = selectedWeddingId
    ? timelineEvents.filter((ev) => !ev.weddingId || ev.weddingId === selectedWeddingId)
    : timelineEvents;

  const filteredCheckIns = selectedWeddingId
    ? vendorCheckIns.filter((c) => !c.weddingId || c.weddingId === selectedWeddingId)
    : vendorCheckIns;

  const delayedCheckIns = filteredCheckIns.filter(
    (c) => c.status === 'DELAYED' || c.delayMinutes > 15
  );

  const arrivedCount = filteredCheckIns.filter(
    (c) => c.status === 'ARRIVED' || c.status === 'COMPLETED' || c.status === 'WORKING'
  ).length;

  const openIncidents = incidents.filter((i) => i.status === 'OPEN');

  const emergencyContacts = [
    { title: 'Udaivilas Palace General Manager', name: 'R. K. Rathore', phone: '+91 98290 88001' },
    { title: 'Chief Electrician & GenSet (125 kVA)', name: 'Mahesh Sharma', phone: '+91 98290 88002' },
    { title: 'Heritage Police Protocol Escort', name: 'Inspector Digvijay', phone: '+91 98290 88003' },
    { title: 'Lake Boat Transport Master', name: 'Gopal Soni', phone: '+91 98290 88004' },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Day-Of Palace Ground Command Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-gold-400/40 shadow-xl group min-h-[220px] flex items-center">
        <img
          src="/images/udaipur_palace_night.jpg"
          alt="Palace Horizon"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-navy-950/40" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-amber-400/25 text-amber-300 border border-amber-400/30 backdrop-blur-sm flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-amber-300 animate-pulse" />
              Day-Of Palace Ground Command
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-gold-200 border border-white/20 backdrop-blur-sm">
              Vikram Singh • Lead Operations Coordinator
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-gold-100">
            Live Operations & Incident Management
          </h1>
          <p className="text-xs sm:text-sm text-gold-200/90 mt-1 leading-relaxed">
            Real-time minute-by-minute ceremony timeline, vendor on-site arrival tracking with automated &gt;15 min delay detection, and instant incident triage.
          </p>

          {/* Wedding Selector Dropdown */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-charcoal-900/80 px-3 py-1.5 rounded-xl border border-gold-400/40 backdrop-blur-md">
              <span className="text-[11px] text-gold-300 uppercase font-semibold">Active Palace:</span>
              <select
                value={selectedWeddingId}
                onChange={(e) => setSelectedWeddingId(e.target.value)}
                className="bg-transparent text-white font-serif font-bold text-xs focus:outline-none cursor-pointer"
              >
                {weddings.map((w) => (
                  <option key={w.id} value={w.id} className="bg-charcoal-900 text-white">
                    {w.name} ({w.location})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => navigate('/operations')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-gold-500 to-gold-400 text-navy-950 text-xs font-bold shadow-xs hover:scale-102 transition-all flex items-center gap-1.5"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Full Ops Cockpit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Operational KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Scheduled Ceremonies"
          value={filteredEvents.length}
          subtitle="Minute-by-minute rundown"
          icon={Clock}
          highlight
        />
        <MetricCard
          title="Vendor Check-In Rate"
          value={`${arrivedCount} / ${filteredCheckIns.length}`}
          subtitle="On-site partners verified"
          icon={CheckCircle2}
          trendType="positive"
        />
        <MetricCard
          title="Delayed Vendors (>15m)"
          value={delayedCheckIns.length}
          subtitle={delayedCheckIns.length > 0 ? 'Urgent attention required' : 'All arrivals on schedule'}
          icon={AlertTriangle}
          trendType={delayedCheckIns.length > 0 ? 'negative' : 'positive'}
          highlight={delayedCheckIns.length > 0}
        />
        <MetricCard
          title="Palace Incidents"
          value={openIncidents.length}
          subtitle={`${incidents.length - openIncidents.length} resolved`}
          icon={ShieldAlert}
          trendType={openIncidents.length > 0 ? 'negative' : 'positive'}
        />
      </div>

      {/* Delayed Vendors Alert Banner */}
      {delayedCheckIns.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900">
                CRITICAL OPERATIONAL DELAY ALERT ({delayedCheckIns.length} VENDOR)
              </h4>
              <p className="text-xs text-rose-800 mt-0.5">
                <strong>{delayedCheckIns[0]?.vendor?.companyName || 'Vendor'}</strong> is delayed by{' '}
                <strong className="underline">{delayedCheckIns[0]?.delayMinutes ?? 0} minutes</strong>. Reason:{' '}
                {delayedCheckIns[0]?.delayReason || 'No reason provided'}.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/operations')}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold shrink-0 shadow-sm"
          >
            Triage in Operations
          </button>
        </div>
      )}

      {/* Live Minute-by-Minute Event Timeline */}
      <div className="card-luxury p-5 sm:p-6 rounded-2xl shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-charcoal-100">
          <div>
            <h3 className="font-serif text-lg font-bold text-charcoal-900">Minute-by-Minute Day-Of Master Rundown</h3>
            <p className="text-xs text-charcoal-500">Live protocol, venue locations, and ceremony status</p>
          </div>
          <button
            onClick={() => navigate('/operations')}
            className="text-xs font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1 self-start sm:self-center"
          >
            <span>Open Timeline Editor</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(filteredEvents.length > 0 ? filteredEvents : [
            { id: 'ev1', eventName: 'Royal High Tea & Shehnai Welcome', startTime: '16:00', endTime: '18:00', location: 'Palace Front Lawns', status: 'COMPLETED' },
            { id: 'ev2', eventName: 'Sangeet & Royal Folk Spectacular', startTime: '19:30', endTime: '23:30', location: 'Zenana Mahal Courtyard', status: 'IN_PROGRESS' },
            { id: 'ev3', eventName: 'Royal Baraat Vintage Car Assembly', startTime: '16:30', endTime: '18:00', location: 'Grand Gate Promenade', status: 'SCHEDULED' },
            { id: 'ev4', eventName: 'Varmala by the Lake under Fireworks', startTime: '18:30', endTime: '19:15', location: 'Jagmandir Island Jetty', status: 'SCHEDULED' },
            { id: 'ev5', eventName: 'Sacred Mandap Pheras with Shehnai', startTime: '19:30', endTime: '21:30', location: 'Royal Glass Mandap', status: 'SCHEDULED' },
            { id: 'ev6', eventName: 'Imperial Banquet & After-Party', startTime: '21:30', endTime: '02:00', location: 'Grand Ballroom & Terrace', status: 'SCHEDULED' },
          ]).map((ev: any, idx: number) => {
            const isCompleted = ev.status === 'COMPLETED';
            const isInProgress = ev.status === 'IN_PROGRESS';

            return (
              <div
                key={ev.id || idx}
                className={`p-4 rounded-xl border transition-all ${
                  isInProgress
                    ? 'border-amber-400 bg-amber-50/50 ring-2 ring-amber-300/60 shadow-sm'
                    : isCompleted
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-charcoal-100 bg-white hover:border-gold-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1 text-xs font-mono font-bold text-navy-900 bg-gold-100/70 px-2 py-0.5 rounded">
                    <Clock className="w-3 h-3 text-gold-700" />
                    {ev.startTime} - {ev.endTime}
                  </span>
                  <StatusBadge status={ev.status} />
                </div>
                <h4 className="font-serif font-bold text-sm text-charcoal-900 mb-1">{ev.eventName}</h4>
                <div className="flex items-center gap-1 text-[11px] text-charcoal-500">
                  <MapPin className="w-3 h-3 text-gold-600 shrink-0" />
                  <span className="truncate">{ev.location}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Vendor Check-In Radar & Palace Incident Command */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Check-Ins Radar */}
        <div className="card-luxury p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-navy-800" />
                Vendor Arrival & Check-In Radar
              </h3>
              <p className="text-xs text-charcoal-500">Auto late detection (&gt;15 min delay triggers socket broadcast)</p>
            </div>
            <button
              onClick={() => navigate('/operations')}
              className="text-xs font-semibold text-navy-700 hover:text-navy-900 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {filteredCheckIns.slice(0, 4).map((c: any) => {
              const isDelayed = c.status === 'DELAYED' || c.delayMinutes > 15;

              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isDelayed ? 'bg-rose-50/70 border-rose-300' : 'bg-white border-charcoal-100 hover:border-gold-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-charcoal-900 text-xs flex items-center gap-2">
                      <span>{c.vendor?.companyName || 'Heritage Vendor'}</span>
                      <StatusBadge status={c.status} />
                    </div>
                    <div className="text-[11px] text-charcoal-500 mt-0.5">
                      Expected: <strong>{c.expectedArrivalTime ? formatDate(c.expectedArrivalTime) : '15:00'}</strong>
                      {isDelayed && (
                        <span className="text-rose-600 font-bold ml-2">
                          ({c.delayMinutes}m delay: {c.delayReason || 'Transit'})
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/operations')}
                    className="px-2.5 py-1 rounded bg-navy-700 text-gold-200 text-xs font-semibold hover:text-white"
                  >
                    Check In
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Palace Incident Command & Emergency Directory */}
        <div className="card-luxury p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-charcoal-100">
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Incident Command & Rapid Triage
                </h3>
                <p className="text-xs text-charcoal-500">Live operational disruptions logged across palace grounds</p>
              </div>
              <button
                onClick={() => navigate('/operations')}
                className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex items-center gap-1"
              >
                <span>Full Incidents</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {(incidents.length > 0 ? incidents.slice(0, 3) : [
                { id: 'inc1', incidentNumber: 'INC-2026-001', title: 'Main Mandap sound voltage dip', severity: 'HIGH', status: 'RESOLVED', description: 'Secondary 125 kVA silent generator activated' },
                { id: 'inc2', incidentNumber: 'INC-2026-002', title: 'Rain shield required for lake jetty fireworks', severity: 'MEDIUM', status: 'OPEN', description: 'Waterproof tarps deployed across firing consoles' },
              ]).map((inc: any) => (
                <div
                  key={inc.id}
                  className="p-3 rounded-xl border border-charcoal-100 bg-white hover:bg-gold-50/20 transition-all flex items-start justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] text-navy-900">{inc.incidentNumber}</span>
                      <span className="font-semibold text-xs text-charcoal-900">{inc.title}</span>
                      <StatusBadge status={inc.status} />
                    </div>
                    <p className="text-[11px] text-charcoal-500 mt-1">{inc.description}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    inc.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800' : inc.severity === 'HIGH' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {inc.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Personnel Call Matrix */}
          <div className="pt-3 border-t border-charcoal-100">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 mb-2">Emergency On-Site Personnel</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {emergencyContacts.slice(0, 2).map((ct) => (
                <div key={ct.title} className="p-2.5 rounded-lg bg-ivory border border-gold-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-charcoal-900 text-[11px]">{ct.name}</div>
                    <div className="text-[10px] text-charcoal-500">{ct.title}</div>
                  </div>
                  <a
                    href={`tel:${ct.phone}`}
                    className="p-1.5 rounded-md bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

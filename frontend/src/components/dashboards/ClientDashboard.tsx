import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Users,
  CheckCircle2,
  FileCheck2,
  Download,
  Phone,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { MetricCard } from '../MetricCard';
import { formatDate } from '../../utils/formatters';

interface ClientDashboardProps {
  weddings: any[];
  agreements: any[];
  guests: any[];
  milestones: any[];
  events: any[];
  tasks: any[];
  onRefresh?: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  weddings = [],
  agreements = [],
  guests = [],
  milestones = [],
  events = [],
  tasks = [],
}) => {
  const navigate = useNavigate();
  const currentWedding = weddings[0];

  // Live countdown timer state
  const targetDate = currentWedding?.startDate ? new Date(currentWedding.startDate).getTime() : 0;
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = Math.max(0, targetDate - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Guest RSVP calculations
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter((g) => g.rsvpStatus === 'CONFIRMED').length;
  const pendingGuests = guests.filter((g) => g.rsvpStatus === 'PENDING').length;
  const declinedGuests = guests.filter((g) => g.rsvpStatus === 'DECLINED').length;
  const weddingTasks = currentWedding ? tasks.filter((task) => task.weddingId === currentWedding.id) : [];
  const completedTasks = weddingTasks.filter((task) => task.status === 'DONE').length;

  const signedAgreement = agreements.find((a) => a.status === 'SIGNED') || agreements[0];
  const assignedPlanner = currentWedding?.assignedPlanner;
  const weddingEvents = events
    .filter((event) => event.weddingId === currentWedding?.id)
    .slice()
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
  const dietaryPreferences = [
    { key: 'JAIN', label: 'Jain' },
    { key: 'VEG', label: 'Vegetarian' },
    { key: 'NON_VEG', label: 'Non-vegetarian' },
    { key: 'VEGAN', label: 'Vegan' },
    { key: 'OTHER', label: 'Other' },
  ].map((preference) => ({
    ...preference,
    count: guests.filter((guest) => guest.dietaryPreference === preference.key).length,
  })).filter((preference) => preference.count > 0);

  if (!currentWedding) {
    return (
      <div className="card-luxury rounded-2xl p-8 text-center">
        <Heart className="mx-auto h-8 w-8 text-gold-600" />
        <h1 className="mt-3 font-serif text-2xl font-semibold text-navy-900">Your wedding workspace is being prepared</h1>
        <p className="mt-2 text-sm text-charcoal-500">No wedding has been associated with this client account yet.</p>
        <button type="button" onClick={() => navigate('/weddings')} className="mt-5 rounded-full bg-navy-900 px-5 py-2.5 text-xs font-semibold text-gold-100">
          View wedding workspaces
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Royal Couple Welcome Banner with Live Countdown */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-white border border-gold-400/50 shadow-2xl group min-h-[260px] flex items-center">
        <img
          src="/images/royal_couple_palace.jpg"
          alt="Royal Couple Palace"
          className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/85 to-navy-950/45" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest bg-gold-400/25 text-gold-300 border border-gold-400/30 backdrop-blur-sm flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              The Royal Couple Portal
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/10 text-gold-200 border border-white/20 backdrop-blur-sm">
              {currentWedding.name}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl font-bold tracking-tight text-gold-100">
            Welcome to Your Dream Wedding Journey
          </h1>
          <p className="text-xs sm:text-sm text-gold-200/90 mt-1 leading-relaxed max-w-xl">
            {[currentWedding.venueName, currentWedding.location].filter(Boolean).join(' · ')}
          </p>

          {/* Live Countdown Display */}
          <div className="mt-5 pt-4 border-t border-gold-400/30 flex flex-wrap items-center gap-3">
            <div className="text-xs text-gold-300 uppercase tracking-widest font-bold">
              Countdown to The Big Day:
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-charcoal-900/80 border border-gold-400/40 text-center min-w-[50px]">
                <div className="font-mono text-lg sm:text-xl font-bold text-gold-300 leading-none">{timeLeft.days}</div>
                <div className="text-[9px] uppercase tracking-wider text-gold-200/70">Days</div>
              </div>
              <span className="text-gold-400 font-bold">:</span>
              <div className="px-3 py-1.5 rounded-xl bg-charcoal-900/80 border border-gold-400/40 text-center min-w-[50px]">
                <div className="font-mono text-lg sm:text-xl font-bold text-gold-300 leading-none">{timeLeft.hours}</div>
                <div className="text-[9px] uppercase tracking-wider text-gold-200/70">Hours</div>
              </div>
              <span className="text-gold-400 font-bold">:</span>
              <div className="px-3 py-1.5 rounded-xl bg-charcoal-900/80 border border-gold-400/40 text-center min-w-[50px]">
                <div className="font-mono text-lg sm:text-xl font-bold text-gold-300 leading-none">{timeLeft.minutes}</div>
                <div className="text-[9px] uppercase tracking-wider text-gold-200/70">Mins</div>
              </div>
              <span className="text-gold-400 font-bold">:</span>
              <div className="px-3 py-1.5 rounded-xl bg-charcoal-900/80 border border-gold-400/40 text-center min-w-[50px]">
                <div className="font-mono text-lg sm:text-xl font-bold text-gold-300 leading-none">{timeLeft.seconds}</div>
                <div className="text-[9px] uppercase tracking-wider text-gold-200/70">Secs</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Couple's Core Planning Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <MetricCard
          title="Days to Wedding"
          value={timeLeft.days}
          subtitle={`Starting ${formatDate(currentWedding.startDate)}`}
          icon={Calendar}
          highlight
        />
        <MetricCard
          title="Confirmed RSVPs"
          value={`${confirmedGuests} / ${totalGuests}`}
          subtitle={`${pendingGuests} responses pending`}
          icon={Users}
          trend={`${totalGuests ? Math.round((confirmedGuests / totalGuests) * 100) : 0}% Confirmed`}
          trendType="positive"
        />
        <MetricCard
          title="Planning Checklist"
          value={`${completedTasks} / ${weddingTasks.length}`}
          subtitle="Completed planning tasks"
          icon={CheckCircle2}
          trendType="positive"
        />
        <MetricCard
          title="Legal Agreement"
          value={signedAgreement?.status || 'Not issued'}
          subtitle="Master Service Charter"
          icon={FileCheck2}
          highlight={signedAgreement?.status === 'SIGNED'}
          trendType="positive"
        />
      </div>

      {/* Master Digital Agreement & Legal Charter */}
      <div className="card-luxury p-5 sm:p-6 rounded-2xl shadow-sm border border-gold-300">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-200 p-0.5 shadow-md shrink-0">
              <div className="w-full h-full bg-navy-900 rounded-[14px] flex items-center justify-center text-gold-300">
                <Award className="w-6 h-6 text-gold-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-charcoal-900">
                  {signedAgreement?.title || signedAgreement?.agreementNumber || 'Wedding Planning Agreement'}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" /> {signedAgreement?.status || 'No agreement'}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 mt-1 max-w-xl">
                Review your wedding agreement, signing status, and downloadable documents.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center">
            {signedAgreement?.signedPdfUrl ? (
              <a
                href={signedAgreement.signedPdfUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 text-gold-200 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Signed PDF</span>
              </a>
            ) : (
              <button
                onClick={() => navigate('/agreements')}
                className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-900 text-gold-200 text-xs font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>View Agreement Details</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Two Columns: Celebration Itinerary & Guest Hospitality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* The Royal Celebration Itinerary */}
        <div className="card-luxury p-5 sm:p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-charcoal-100">
            <div>
              <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-600" />
                The Royal Celebration Itinerary
              </h3>
              <p className="text-xs text-charcoal-500">Curated sequence of royal destination ceremonies</p>
            </div>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs font-semibold text-navy-700 hover:text-navy-900"
            >
              Checklist
            </button>
          </div>

          <div className="space-y-3">
            {weddingEvents.length ? weddingEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3.5 rounded-xl border border-charcoal-100 hover:border-gold-300 bg-white hover:bg-gold-50/20 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gold-100 text-navy-900 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-gold-700" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-xs text-charcoal-900">{event.eventName}</h4>
                      <p className="text-[11px] text-charcoal-500">{event.location}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-navy-900 bg-ivory px-2 py-1 rounded border border-charcoal-100 shrink-0">
                    {formatDate(event.eventDate)} {event.startTime}
                  </span>
                </div>
              )) : <p className="rounded-xl bg-ivory-100 p-5 text-center text-xs text-charcoal-500">No itinerary events are available yet.</p>}
          </div>
        </div>

        {/* Guest Hospitality & Dietary Preferences */}
        <div className="card-luxury p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-charcoal-100">
              <div>
                <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-navy-800" />
                  Guest Hospitality & RSVP Radar
                </h3>
                <p className="text-xs text-charcoal-500">Attendee confirmations and dietary safety</p>
              </div>
              <button
                onClick={() => navigate('/guests')}
                className="text-xs font-semibold text-navy-700 hover:text-navy-900"
              >
                Full Guest List
              </button>
            </div>

            {/* RSVP Stats Bar */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="font-serif font-bold text-lg text-emerald-800">{confirmedGuests}</div>
                <div className="text-[10px] font-semibold text-emerald-700 uppercase">Attending</div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <div className="font-serif font-bold text-lg text-amber-800">{pendingGuests}</div>
                <div className="text-[10px] font-semibold text-amber-700 uppercase">Pending</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <div className="font-serif font-bold text-lg text-rose-800">{declinedGuests}</div>
                <div className="text-[10px] font-semibold text-rose-700 uppercase">Regrets</div>
              </div>
            </div>

            {/* Dietary Preferences Distribution */}
            <div className="space-y-2 mb-4">
              <div className="text-xs font-bold text-charcoal-700">Guest dietary preferences</div>
              {dietaryPreferences.length ? dietaryPreferences.map((preference) => (
                <div key={preference.key} className="flex items-center justify-between text-xs text-charcoal-600">
                  <span>{preference.label}</span>
                  <strong>{preference.count} guests</strong>
                </div>
              )) : <p className="text-xs text-charcoal-500">No dietary preferences have been recorded.</p>}
            </div>
          </div>

          {/* Dedicated Concierge Planner Card */}
          <div className="pt-3 border-t border-charcoal-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy-900 text-gold-300 font-bold flex items-center justify-center text-xs">
                PS
              </div>
              <div>
                <div className="text-xs font-bold text-charcoal-900">
                  {assignedPlanner ? `${assignedPlanner.firstName} ${assignedPlanner.lastName}` : 'Your wedding planning team'}
                </div>
                <div className="text-[10px] text-charcoal-500">Wedding planning contact</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {assignedPlanner?.phone && (
                <>
                  <a
                    href={`https://wa.me/${assignedPlanner.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    title="Message planner on WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a
                    href={`tel:${assignedPlanner.phone}`}
                    className="p-2 rounded-xl bg-navy-100 text-navy-800 hover:bg-navy-200"
                    title="Call planner"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

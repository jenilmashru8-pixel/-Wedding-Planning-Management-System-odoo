import React, { useMemo, useState } from 'react';
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, isToday, parseISO, startOfMonth, startOfWeek, subMonths } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Users,
  Wallet,
} from 'lucide-react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { UserRole } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getNavItemsForRole } from '../../layouts/Sidebar';

interface DashboardOverviewProps {
  role?: UserRole;
  weddings: any[];
  tasks: any[];
  timelineEvents: any[];
  milestones: any[];
  financeData: any;
}

const weddingImages = [
  '/images/royal_couple_palace.jpg',
  '/images/royal_mandap_decor.jpg',
  '/images/royal_banquet_feast.jpg',
];

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  role,
  weddings,
  tasks,
  timelineEvents,
  milestones,
  financeData,
}) => {
  const navigate = useNavigate();
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trendRange, setTrendRange] = useState(6);

  const visibleDates = eachDayOfInterval({
    start: startOfWeek(startOfMonth(calendarMonth)),
    end: endOfWeek(endOfMonth(calendarMonth)),
  });
  const calendarEvents = useMemo(() => [
    ...weddings.map((wedding) => ({
      id: `wedding-${wedding.id}`,
      title: wedding.name,
      date: wedding.startDate,
      kind: 'Wedding',
    })),
    ...tasks.map((task) => ({
      id: `task-${task.id}`,
      title: task.taskName,
      date: task.dueDate,
      kind: 'Task',
    })),
    ...timelineEvents.map((event) => ({
      id: `event-${event.id}`,
      title: event.eventName,
      date: event.eventDate,
      kind: 'Event',
    })),
  ].filter((event) => event.date), [weddings, tasks, timelineEvents]);

  const selectedDayEvents = calendarEvents.filter((event) => {
    const date = parseISO(event.date);
    return !Number.isNaN(date.getTime()) && isSameDay(date, selectedDate);
  });

  const upcomingWeddings = weddings
    .filter((wedding) => wedding.startDate && new Date(wedding.startDate).getTime() >= Date.now())
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const monthlyTrends = (financeData?.monthlyTrends || [])
    .slice()
    .sort((a: any, b: any) => new Date(`1 ${a.month}`).getTime() - new Date(`1 ${b.month}`).getTime())
    .slice(-trendRange);

  const recentEvents = timelineEvents
    .filter((event) => event.eventDate)
    .slice()
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
    .slice(0, 4);

  const paymentReminders = milestones
    .filter((milestone) => !['PAID', 'CANCELLED'].includes(milestone.status))
    .slice()
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const quickActions = getNavItemsForRole(role)
    .filter((item) => item.path !== '/')
    .slice(0, 4);

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[1.05fr_1.15fr_0.8fr]">
        <div className="card-luxury overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-gold-200 px-5 py-4">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-navy-900">
              <CalendarDays className="h-4 w-4 text-gold-600" /> Upcoming Weddings
            </h2>
            <button type="button" onClick={() => navigate('/weddings')} className="text-[11px] font-semibold text-navy-700 hover:text-gold-700">
              View all
            </button>
          </div>
          <div className="space-y-3 p-4">
            {upcomingWeddings.length ? upcomingWeddings.map((wedding, index) => (
              <button
                type="button"
                key={wedding.id}
                onClick={() => navigate(`/weddings/${wedding.id}`)}
                className="group flex w-full items-center gap-3 rounded-xl border border-gold-100 bg-white p-2 text-left transition-colors hover:border-gold-300 hover:bg-gold-50/40"
              >
                <img
                  src={weddingImages[index % weddingImages.length]}
                  alt=""
                  loading="lazy"
                  className="h-16 w-20 shrink-0 rounded-lg object-cover"
                  onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-serif text-sm font-semibold text-navy-900">{wedding.name}</span>
                  <span className="mt-1 block truncate text-[11px] text-charcoal-500">{wedding.venueName || wedding.location}</span>
                  <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-charcoal-500">
                    <span>{formatDate(wedding.startDate)}</span>
                    {wedding.guestCount != null && <span className="inline-flex items-center gap-1"><Users className="h-3 w-3" />{wedding.guestCount}</span>}
                    {wedding.completionPercentage != null && <span>{wedding.completionPercentage}% planned</span>}
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-gold-600 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            )) : (
              <p className="rounded-xl bg-ivory-100 p-6 text-center text-xs text-charcoal-500">No upcoming weddings are available.</p>
            )}
          </div>
        </div>

        <div className="card-luxury rounded-2xl p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-navy-900">
              <CalendarDays className="h-4 w-4 text-gold-600" /> Wedding Calendar
            </h2>
            <div className="flex items-center gap-1">
              <button type="button" aria-label="Previous month" onClick={() => setCalendarMonth((month) => subMonths(month, 1))} className="rounded-lg p-1.5 text-navy-700 hover:bg-gold-100">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="min-w-24 text-center text-xs font-semibold text-navy-900">{format(calendarMonth, 'MMMM yyyy')}</span>
              <button type="button" aria-label="Next month" onClick={() => setCalendarMonth((month) => addMonths(month, 1))} className="rounded-lg p-1.5 text-navy-700 hover:bg-gold-100">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-[10px] font-semibold uppercase tracking-wide text-charcoal-500">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <span key={day} className="py-2">{day}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {visibleDates.map((date) => {
              const hasEvent = calendarEvents.some((event) => {
                const eventDate = parseISO(event.date);
                return !Number.isNaN(eventDate.getTime()) && isSameDay(eventDate, date);
              });
              const selected = isSameDay(date, selectedDate);
              return (
                <button
                  type="button"
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  aria-label={`${format(date, 'MMMM d, yyyy')}${hasEvent ? ', has event' : ''}`}
                  aria-pressed={selected}
                  className={`mx-auto flex h-8 w-8 flex-col items-center justify-center rounded-full text-xs transition-colors ${
                    selected ? 'bg-navy-900 text-gold-200' : isToday(date) ? 'border border-gold-500 text-navy-900' : 'text-charcoal-700 hover:bg-gold-100'
                  } ${!isSameMonth(date, calendarMonth) ? 'opacity-35' : ''}`}
                >
                  {format(date, 'd')}
                  {hasEvent && <span className={`mt-0.5 h-1 w-1 rounded-full ${selected ? 'bg-gold-200' : 'bg-gold-600'}`} />}
                </button>
              );
            })}
          </div>
          <div className="mt-3 border-t border-gold-100 pt-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-500">{format(selectedDate, 'EEE, d MMM')}</p>
            {selectedDayEvents.length ? selectedDayEvents.slice(0, 3).map((event) => (
              <p key={event.id} className="truncate py-1 text-[11px] text-navy-800">
                <span className="mr-1.5 text-gold-600">•</span>{event.title}
              </p>
            )) : <p className="text-[11px] text-charcoal-500">No scheduled events on this date.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-gold-500/45 bg-navy-900 p-5 text-ivory-50 shadow-luxury">
          <h2 className="font-serif text-lg font-semibold text-gold-100">Quick Actions</h2>
          <p className="mt-1 text-[11px] text-ivory-200/75">Shortcuts available for your role</p>
          <div className="mt-4 space-y-2">
            {quickActions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="flex w-full items-center justify-between rounded-full border border-gold-300/60 bg-gold-400 px-3.5 py-2.5 text-left text-xs font-semibold text-navy-950 transition-colors hover:bg-gold-300"
                >
                  <span className="flex items-center gap-2"><Icon className="h-4 w-4" />{item.name}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="card-luxury rounded-2xl p-4 sm:p-5 xl:col-span-1">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 font-serif text-lg font-semibold text-navy-900">
                <CircleDollarSign className="h-4 w-4 text-gold-600" /> Revenue Overview
              </h2>
              <p className="text-[11px] text-charcoal-500">Monthly figures reported by finance</p>
            </div>
            <select
              aria-label="Revenue chart period"
              value={trendRange}
              onChange={(event) => setTrendRange(Number(event.target.value))}
              className="rounded-lg border border-gold-200 bg-white px-2 py-1.5 text-[11px] text-navy-800"
            >
              <option value={6}>6 months</option>
              <option value={12}>12 months</option>
            </select>
          </div>
          {monthlyTrends.length ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends} margin={{ top: 8, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#EBD9C1" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#77716A' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#77716A' }} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${Math.round(Number(value) / 100000)}L`} width={42} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#071B35" strokeWidth={2.5} dot={{ r: 3, fill: '#071B35' }} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="#B88A48" strokeWidth={2.5} dot={{ r: 3, fill: '#B88A48' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-52 items-center justify-center rounded-xl bg-ivory-100 text-center text-xs text-charcoal-500">
              Financial trend data is not available for this role.
            </div>
          )}
        </div>

        <div className="card-luxury rounded-2xl p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-navy-900">
            <Clock3 className="h-4 w-4 text-gold-600" /> Recent Wedding Activity
          </h2>
          {recentEvents.length ? (
            <div className="space-y-3">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex gap-3 border-b border-gold-100 pb-3 last:border-0 last:pb-0">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-500 ring-4 ring-gold-100" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-navy-900">{event.eventName}</p>
                    <p className="mt-1 text-[10px] text-charcoal-500">{event.location} · {formatDate(event.eventDate)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="rounded-xl bg-ivory-100 p-6 text-center text-xs text-charcoal-500">No wedding activity is available.</p>}
        </div>

        <div className="card-luxury rounded-2xl p-4 sm:p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-navy-900">
            <Wallet className="h-4 w-4 text-gold-600" /> Payment Reminders
          </h2>
          {paymentReminders.length ? (
            <div className="space-y-3">
              {paymentReminders.map((milestone) => {
                const remaining = Math.max(0, Number(milestone.amountDue) - Number(milestone.amountPaid));
                const overdue = milestone.dueDate && new Date(milestone.dueDate).getTime() < Date.now();
                return (
                  <div key={milestone.id} className="flex items-start justify-between gap-3 border-b border-gold-100 pb-3 last:border-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-navy-900">{milestone.title}</p>
                      <p className="mt-1 text-[10px] text-charcoal-500">Due {formatDate(milestone.dueDate)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-bold text-navy-900">{formatCurrency(remaining)}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold ${overdue ? 'bg-rose-100 text-rose-700' : 'bg-gold-100 text-gold-800'}`}>
                        {overdue ? 'Overdue' : milestone.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <p className="rounded-xl bg-ivory-100 p-6 text-center text-xs text-charcoal-500">No pending payment reminders.</p>}
        </div>
      </section>
    </>
  );
};

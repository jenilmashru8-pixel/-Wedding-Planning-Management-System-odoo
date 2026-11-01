import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Clock,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Calendar,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Wedding } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const Team: React.FC = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [activeTab, setActiveTab] = useState<'roster' | 'timelogs'>('roster');
  const [loading, setLoading] = useState(true);

  // Time Log Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [endTime, setEndTime] = useState(new Date(Date.now() + 4 * 3600000).toISOString().slice(0, 16));
  const [hourlyRate, setHourlyRate] = useState('800');
  const [notes, setNotes] = useState('Event coordination and stage supervision');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [empRes, logsRes, wedRes] = await Promise.all([
        api.get('/team/employees'),
        api.get('/team/time-logs'),
        api.get('/weddings'),
      ]);

      if (empRes.data.success) setEmployees(empRes.data.data.employees);
      if (logsRes.data.success) setTimeLogs(logsRes.data.data.logs);
      if (wedRes.data.success) {
        setWeddings(wedRes.data.data.weddings);
        if (wedRes.data.data.weddings.length > 0) {
          setSelectedWeddingId(wedRes.data.data.weddings[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/team/time-logs', {
        weddingId: selectedWeddingId,
        employeeId: selectedEmployeeId || user?.id,
        startTime,
        endTime,
        hourlyRate: Number(hourlyRate) || 800,
        notes,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setNotes('');
        const updatedLogs = await api.get('/team/time-logs');
        if (updatedLogs.data.success) setTimeLogs(updatedLogs.data.data.logs);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log time');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalLabourCost = timeLogs.reduce((acc, log) => acc + Number(log.calculatedLabourCost || 0), 0);
  const totalHoursWorked = timeLogs.reduce((acc, log) => acc + Number(log.hoursWorked || 0), 0);

  const canManageTeam = ['FOUNDER', 'PLANNER', 'FINANCE'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <UserCog className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900">
              Team & Internal Labour Costing
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Planners, field coordinators, hourly rate cards, time logging, and project labour cost attribution.
          </p>
        </div>

        {canManageTeam && (
          <button
            onClick={() => {
              setSelectedEmployeeId(user?.id || '');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-gold-200 text-xs font-semibold hover:from-navy-800 hover:to-navy-700 shadow-md border border-gold-400/30 transition-all"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Log Time Sheet</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Core Agency Staff"
          value={employees.length}
          icon={UserCog}
          description="Planners & field crew"
          variant="default"
        />
        <MetricCard
          title="Total Logged Hours"
          value={`${totalHoursWorked} hrs`}
          icon={Clock}
          description="Dedicated coordination time"
          variant="gold"
        />
        <MetricCard
          title="Allocated Labour Cost"
          value={formatCurrency(totalLabourCost)}
          icon={Briefcase}
          description="Cost of internal staff"
          variant="navy"
        />
        <MetricCard
          title="Average Hourly Rate"
          value="₹850 / hr"
          icon={Sparkles}
          description="Blended agency rate card"
          variant="charcoal"
        />
      </div>

      {/* Tab Switcher */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-ivory-100 rounded-xl border border-gold-200">
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'roster'
                ? 'bg-navy-900 text-gold-200 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Core Team Roster ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('timelogs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'timelogs'
                ? 'bg-navy-900 text-gold-200 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Time Sheet Logs ({timeLogs.length})
          </button>
        </div>
      </div>

      {/* Content Panels */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading team roster...</div>
      ) : activeTab === 'roster' ? (
        /* Team Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {employees.map((emp) => (
            <div
              key={emp.id}
              className="bg-white rounded-2xl p-5 border border-gold-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-navy-900 text-gold-200 flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                      {emp.firstName?.[0]}
                      {emp.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-bold text-navy-950">
                        {emp.firstName} {emp.lastName}
                      </h3>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gold-700 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-400/20">
                        {emp.role.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-charcoal-600 pt-2">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                    <span>{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100 flex items-center justify-between text-xs">
                  <span className="text-charcoal-500">Hourly Rate Card:</span>
                  <span className="font-mono font-bold text-navy-900">
                    {emp.employee?.hourlyRate ? formatCurrency(emp.employee.hourlyRate) : '₹800'}/hr
                  </span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-charcoal-100 flex items-center justify-between text-[11px] text-charcoal-500">
                <span>{emp._count?.assignedWeddings || 0} Weddings Assigned</span>
                <span className="text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Active Staff
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Time Logs Table */
        <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Wedding Project</th>
                  <th className="py-3 px-4">Duration & Hours</th>
                  <th className="py-3 px-4">Hourly Rate</th>
                  <th className="py-3 px-4">Labour Cost</th>
                  <th className="py-3 px-4">Notes</th>
                  <th className="py-3 px-4 text-right">Approval</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-xs">
                {timeLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-ivory-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">
                        {log.employee?.firstName} {log.employee?.lastName}
                      </div>
                      <div className="text-[10px] text-charcoal-500">
                        {log.employee?.role?.replace('_', ' ')}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-charcoal-800">{log.wedding?.name}</div>
                      <div className="text-[10px] font-mono text-gold-600 font-bold">{log.wedding?.weddingCode}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-charcoal-900">{log.hoursWorked} Hours</div>
                      <div className="text-[10px] text-charcoal-400">{formatDate(log.startTime)}</div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-charcoal-600">
                      {formatCurrency(log.hourlyRate)}/hr
                    </td>

                    <td className="py-3.5 px-4 font-bold text-navy-950 font-serif text-sm">
                      {formatCurrency(log.calculatedLabourCost)}
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-600 max-w-xs truncate">
                      {log.notes || 'Routine wedding logistics coordination'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Approved</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Log Time Sheet Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Staff Coordination Hours"
        subtitle="Track hourly labour costs against specific luxury wedding projects"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTimeLog} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Wedding Project *</label>
              <select
                value={selectedWeddingId}
                onChange={(e) => setSelectedWeddingId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                {weddings.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.weddingCode} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Staff Member *</label>
              <select
                value={selectedEmployeeId}
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} ({e.role.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Start Time *</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">End Time *</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Hourly Cost Rate (₹)</label>
            <input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="800"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Tasks Completed / Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary of operational tasks supervised..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-200 text-xs font-bold hover:bg-navy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Log Time Sheet'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Team;

import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Columns,
  List,
  Sparkles,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { WeddingTask, Wedding, TaskStatus, TaskPriority, TaskCategory } from '../types';
import { formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

const KANBAN_COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: 'TO_PLAN', label: 'To Plan', color: 'border-charcoal-300 bg-charcoal-50/50' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'border-blue-400 bg-blue-50/30' },
  { id: 'BLOCKED', label: 'Blocked / Issue', color: 'border-rose-400 bg-rose-50/30' },
  { id: 'REVIEW', label: 'Client / Founder Review', color: 'border-amber-400 bg-amber-50/30' },
  { id: 'DONE', label: 'Completed', color: 'border-emerald-400 bg-emerald-50/30' },
];

export const Tasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('PRE_WEDDING');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchWeddings();
  }, []);

  useEffect(() => {
    if (selectedWeddingId) {
      fetchTasks();
    }
  }, [selectedWeddingId, selectedCategory, selectedPriority]);

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

  const fetchTasks = async () => {
    if (!selectedWeddingId) return;
    try {
      const params: any = { weddingId: selectedWeddingId };
      if (selectedCategory !== 'ALL') params.category = selectedCategory;
      if (selectedPriority !== 'ALL') params.priority = selectedPriority;

      const res = await api.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.data.tasks);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update task status');
      fetchTasks();
    }
  };

  const handleGenerateTemplates = async () => {
    if (!selectedWeddingId) return;
    try {
      setIsGenerating(true);
      const res = await api.post(`/tasks/${selectedWeddingId}/generate`);
      if (res.data.success) {
        alert(res.data.message || 'Standard tasks auto-generated successfully.');
        fetchTasks();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate template tasks');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !taskName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/tasks', {
        weddingId: selectedWeddingId,
        taskName,
        description,
        category,
        priority,
        dueDate,
        status: 'TO_PLAN',
      });

      if (res.data.success) {
        setIsModalOpen(false);
        resetForm();
        fetchTasks();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTaskName('');
    setDescription('');
    setCategory('PRE_WEDDING');
    setPriority('MEDIUM');
    setDueDate(new Date().toISOString().split('T')[0]);
  };

  const filteredTasks = tasks.filter((t) =>
    t.taskName.toLowerCase().includes(search.toLowerCase()) ||
    (t.description && t.description.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCount = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 'DONE').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const blockedCount = tasks.filter((t) => t.status === 'BLOCKED').length;
  const completionPercent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <CalendarCheck className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-burgundy-900">
              Wedding Planning Tasks
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Standard royal task templates, Kanban execution board, team assignments, and operational checklists.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {['FOUNDER', 'PLANNER'].includes(user?.role || '') && (
            <button
              onClick={handleGenerateTemplates}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gold-500/10 text-gold-700 text-xs font-semibold hover:bg-gold-500/20 border border-gold-400/30 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-gold-600" />
              <span>{isGenerating ? 'Generating...' : 'Auto-Generate Templates'}</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-burgundy-900 to-burgundy-800 text-gold-200 text-xs font-semibold hover:from-burgundy-800 hover:to-burgundy-700 shadow-md border border-gold-400/30 transition-all"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Progress & Milestone Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gold-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-burgundy-950 font-serif">
              Overall Project Milestone Execution
            </h3>
            <p className="text-xs text-charcoal-500">
              {doneCount} of {totalCount} tasks completed ({completionPercent}% overall progress)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" /> {doneCount} Done
            </span>
            <span className="flex items-center gap-1.5 text-blue-700">
              <Clock className="w-3.5 h-3.5" /> {inProgressCount} In Progress
            </span>
            {blockedCount > 0 && (
              <span className="flex items-center gap-1.5 text-rose-700">
                <AlertTriangle className="w-3.5 h-3.5" /> {blockedCount} Blocked
              </span>
            )}
          </div>
        </div>

        <div className="w-full bg-ivory-200 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-gold-500 via-gold-400 to-emerald-500 h-full transition-all duration-500 rounded-full"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Filter and View Toggle Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Select Wedding */}
          <div className="w-full sm:w-64">
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

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
          >
            <option value="ALL">All Categories</option>
            <option value="PRE_WEDDING">Pre-Wedding Prep</option>
            <option value="EVENT_DAY">Event Day Coordination</option>
            <option value="POST_WEDDING">Post-Wedding Wrap</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        {/* Search & View Mode */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-between">
          <div className="relative w-48 sm:w-56">
            <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-ivory-100 rounded-xl border border-gold-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'kanban' ? 'bg-burgundy-900 text-gold-200 shadow-sm' : 'text-charcoal-600'
              }`}
              title="Kanban Board"
            >
              <Columns className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition-all ${
                viewMode === 'list' ? 'bg-burgundy-900 text-gold-200 shadow-sm' : 'text-charcoal-600'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tasks View: Kanban or List */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading wedding tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No Tasks Planned"
          description="There are no tasks matching your filters. Click 'Auto-Generate Templates' to load the standard royal wedding checklist."
          actionLabel="Auto-Generate Templates"
          onAction={handleGenerateTemplates}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {KANBAN_COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className={`rounded-2xl border p-3 flex flex-col max-h-[75vh] ${col.color}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-charcoal-200/50">
                  <h4 className="text-xs font-bold text-burgundy-950 uppercase tracking-wider">
                    {col.label}
                  </h4>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-charcoal-700 shadow-sm">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards List */}
                <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl p-3.5 border border-gold-200/60 shadow-sm hover:shadow-md transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span
                          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                            task.priority === 'URGENT'
                              ? 'bg-rose-100 text-rose-800'
                              : task.priority === 'HIGH'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-charcoal-100 text-charcoal-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-charcoal-400">
                          Due {formatDate(task.dueDate)}
                        </span>
                      </div>

                      <h5 className="font-semibold text-xs text-charcoal-900 leading-snug">
                        {task.taskName}
                      </h5>

                      {task.description && (
                        <p className="text-[11px] text-charcoal-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}

                      {/* Status Mover Quick Actions */}
                      <div className="pt-2 border-t border-charcoal-100 flex items-center justify-between">
                        <span className="text-[10px] text-gold-700 font-medium">
                          {task.category.replace('_', ' ')}
                        </span>

                        <select
                          value={task.status}
                          onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                          className="text-[10px] bg-ivory-100 border border-charcoal-200 rounded px-1.5 py-0.5 font-medium text-charcoal-700 focus:outline-none"
                        >
                          <option value="TO_PLAN">To Plan</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="BLOCKED">Blocked</option>
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
      ) : (
        /* Structured List View */
        <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                  <th className="py-3 px-4">Task Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-xs">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-ivory-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">{task.taskName}</div>
                      {task.description && (
                        <div className="text-[11px] text-charcoal-500 mt-0.5">{task.description}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600 font-medium text-[11px]">
                      {task.category.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                          task.priority === 'URGENT'
                            ? 'bg-rose-100 text-rose-800'
                            : task.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-charcoal-100 text-charcoal-700'
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-charcoal-600">{formatDate(task.dueDate)}</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                        className="text-xs bg-ivory-50 border border-charcoal-200 rounded-lg px-2 py-1 font-medium text-charcoal-700 focus:outline-none focus:ring-1 focus:ring-burgundy-800"
                      >
                        <option value="TO_PLAN">To Plan</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="REVIEW">Review</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Wedding Task"
        subtitle="Add a bespoke coordination or execution item"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Task Title *</label>
            <input
              type="text"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              placeholder="e.g. Confirm Vintage Car Arrival for Baraat"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Description / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Special instructions or vendor checkpoints..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Phase</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="PRE_WEDDING">Pre-Wedding</option>
                <option value="EVENT_DAY">Event Day</option>
                <option value="POST_WEDDING">Post-Wedding</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
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
              className="px-5 py-2 rounded-xl bg-burgundy-900 text-gold-200 text-xs font-bold hover:bg-burgundy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Tasks;

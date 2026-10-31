import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Plus,
  Search,
  MapPin,
  Calendar,
  Users,
  ChevronRight,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import { Wedding, PackageType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatLakhsCrores, formatDate } from '../utils/formatters';

export const Weddings: React.FC = () => {
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [packageFilter, setPackageFilter] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    clientId: '',
    location: 'Udaipur',
    venueName: '',
    startDate: '',
    endDate: '',
    guestCount: 400,
    packageType: 'FULL_SERVICE' as PackageType,
    contractAmount: 45000000,
    budget: 45000000,
  });

  const [clients, setClients] = useState<any[]>([]);

  const fetchWeddings = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (locationFilter) params.append('location', locationFilter);
      if (packageFilter) params.append('packageType', packageFilter);

      const res = await api.get(`/weddings?${params.toString()}`);
      setWeddings(res.data.data.weddings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeddings();
    api.get('/clients').then((res) => setClients(res.data.data.clients || []));
  }, [search, statusFilter, locationFilter, packageFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/weddings', formData);
      setIsAddOpen(false);
      fetchWeddings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create wedding');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900">Luxury Wedding Projects</h1>
          <p className="text-xs text-charcoal-500">Destination wedding portfolios in Jaipur & Udaipur palaces.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-burgundy-700 hover:bg-burgundy-800 text-gold-200 hover:text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Wedding Project</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card-luxury p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search wedding name, code, couple, palace..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-none text-charcoal-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-ivory text-xs border border-gold-200 rounded-xl focus:outline-none text-charcoal-700"
          >
            <option value="">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-1.5 bg-ivory text-xs border border-gold-200 rounded-xl focus:outline-none text-charcoal-700"
          >
            <option value="">All Destinations</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Udaipur">Udaipur</option>
          </select>

          <select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            className="px-3 py-1.5 bg-ivory text-xs border border-gold-200 rounded-xl focus:outline-none text-charcoal-700"
          >
            <option value="">All Packages</option>
            <option value="FULL_SERVICE">Full-Service</option>
            <option value="PARTIAL_DAY_OF">Day-Of</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {weddings.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="No Wedding Projects"
          description="Convert an enquiry or create a new wedding project workspace."
          actionText="Create Wedding"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {weddings.map((w) => (
            <div
              key={w.id}
              onClick={() => navigate(`/weddings/${w.id}`)}
              className="card-luxury p-6 rounded-2xl cursor-pointer hover:border-gold-400 group transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-charcoal-400 font-bold uppercase">{w.weddingCode}</span>
                    <h3 className="font-serif font-bold text-base text-charcoal-900 group-hover:text-burgundy-700 transition-colors mt-0.5">
                      {w.name}
                    </h3>
                  </div>
                  <StatusBadge status={w.status} />
                </div>

                <div className="mt-4 space-y-2 text-xs text-charcoal-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gold-600" />
                    <span>{w.location} • {w.venueName || 'Heritage Palace'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gold-600" />
                    <span>{formatDate(w.startDate)} to {formatDate(w.endDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-gold-600" />
                    <span>{w.guestCount} Guests • {w.assignedVendorsCount || 18} Vendors</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-5">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-charcoal-500 font-medium">Planning Progress</span>
                    <span className="font-bold text-burgundy-900">{w.completionPercentage || 0}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-ivory-200 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold-500 to-burgundy-700 rounded-full transition-all duration-500"
                      style={{ width: `${w.completionPercentage || 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-charcoal-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-charcoal-400 block uppercase">Contract Value</span>
                  <span className="font-serif font-bold text-sm text-charcoal-900">{formatLakhsCrores(w.contractAmount)}</span>
                </div>
                <button className="px-3.5 py-1.5 rounded-xl bg-gold-50 text-burgundy-800 border border-gold-300 group-hover:bg-burgundy-700 group-hover:text-gold-200 transition-all text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                  <span>Open Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: New Wedding */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create Wedding Project Workspace"
        subtitle="Initialize new palace wedding project."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Wedding Project Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Siddharth & Tanya Royal Jagmandir Wedding"
              className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Client Profile</label>
            <select
              required
              value={formData.clientId}
              onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
              className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
            >
              <option value="">Select Client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.partner1Name} & {c.partner2Name} ({c.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Destination</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              >
                <option value="Jaipur">Jaipur</option>
                <option value="Udaipur">Udaipur</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Package</label>
              <select
                value={formData.packageType}
                onChange={(e) => setFormData({ ...formData, packageType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              >
                <option value="FULL_SERVICE">Full-Service</option>
                <option value="PARTIAL_DAY_OF">Day-Of</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Palace / Venue Name</label>
            <input
              type="text"
              value={formData.venueName}
              onChange={(e) => setFormData({ ...formData, venueName: e.target.value })}
              placeholder="e.g. The Oberoi Udaivilas / Rambagh Palace"
              className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Guest Count</label>
              <input
                type="number"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 400 })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contract Value (INR)</label>
              <input
                type="number"
                value={formData.contractAmount}
                onChange={(e) => setFormData({ ...formData, contractAmount: parseFloat(e.target.value) || 0, budget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gold-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-gold-300 rounded-xl text-xs font-semibold text-charcoal-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-burgundy-700 text-gold-200 rounded-xl text-xs font-semibold shadow-md"
            >
              Initialize Workspace
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

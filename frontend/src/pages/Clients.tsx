import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, Sparkles, CreditCard, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { Client } from '../types';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    partner1Name: '',
    partner2Name: '',
    email: '',
    phone: '',
    altPhone: '',
    address: '',
    city: 'Jaipur',
    notes: '',
  });

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      const res = await api.get(`/clients?${params.toString()}`);
      setClients(res.data.data.clients || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/clients', formData);
      setIsAddOpen(false);
      fetchClients();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create client');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900">Client Directory</h1>
          <p className="text-xs text-charcoal-500">Profiles, partner details, wedding history, and billing ledgers.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-gold-200 hover:text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="card-luxury p-4 rounded-2xl flex items-center gap-2">
        <Search className="w-4 h-4 text-charcoal-400" />
        <input
          type="text"
          placeholder="Search client by partner names, email, phone, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent border-none focus:outline-none text-charcoal-900"
        />
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Clients Found"
          description="Client profiles are automatically linked upon enquiry conversion or manual addition."
          actionText="Add New Client"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((c) => (
            <div key={c.id} className="card-luxury p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-charcoal-900">
                      {c.partner1Name} & {c.partner2Name}
                    </h4>
                    <p className="text-xs text-charcoal-500 mt-0.5">{c.city || 'Destination Client'}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-gold-50 text-navy-800 border border-gold-200">
                    <Users className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-charcoal-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gold-600" />
                    <span>{c.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gold-600" />
                    <span>{c.phone}</span>
                  </div>
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-gold-600" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-charcoal-100 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-charcoal-400 block text-[10px] uppercase">Weddings</span>
                    <span className="font-bold text-charcoal-800">{c.totalWeddings || 0} Project(s)</span>
                  </div>
                  <div>
                    <span className="text-charcoal-400 block text-[10px] uppercase">Outstanding</span>
                    <span className="font-bold text-rose-700">{formatCurrency(c.outstandingBalance || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-charcoal-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedClient(c)}
                  className="text-xs font-semibold text-navy-700 hover:text-navy-900"
                >
                  View Profile
                </button>
                {c.weddings && c.weddings.length > 0 && (
                  <button
                    onClick={() => navigate(`/weddings/${c.weddings![0].id}`)}
                    className="text-xs font-semibold text-gold-700 hover:text-navy-800 flex items-center gap-1"
                  >
                    <span>Workspace</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Client Details */}
      <Modal
        isOpen={!!selectedClient}
        onClose={() => setSelectedClient(null)}
        title={`${selectedClient?.partner1Name} & ${selectedClient?.partner2Name}`}
        subtitle="Complete Client Profile & Engagement History"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-ivory rounded-xl border border-gold-200 grid grid-cols-2 gap-2">
            <div>
              <span className="text-charcoal-400 block">Email:</span>
              <span className="font-bold">{selectedClient?.email}</span>
            </div>
            <div>
              <span className="text-charcoal-400 block">Phone:</span>
              <span className="font-bold">{selectedClient?.phone}</span>
            </div>
            <div>
              <span className="text-charcoal-400 block">City:</span>
              <span className="font-bold">{selectedClient?.city || 'Not provided'}</span>
            </div>
            <div>
              <span className="text-charcoal-400 block">Address:</span>
              <span className="font-bold">{selectedClient?.address || 'Not provided'}</span>
            </div>
          </div>

          <div>
            <h4 className="font-serif font-bold text-sm text-charcoal-900 mb-2">Linked Wedding Projects</h4>
            {selectedClient?.weddings && selectedClient.weddings.length > 0 ? (
              <div className="space-y-2">
                {selectedClient.weddings.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => {
                      setSelectedClient(null);
                      navigate(`/weddings/${w.id}`);
                    }}
                    className="p-3 rounded-xl border border-gold-200 hover:bg-gold-50/50 cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-charcoal-900">{w.name}</span>
                      <p className="text-[10px] text-charcoal-500">{formatDate(w.startDate)}</p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-charcoal-400 italic">No weddings associated yet.</p>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal: Add Client */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add New Luxury Client Profile"
        subtitle="Record client contact and partner information."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Partner 1</label>
              <input
                type="text"
                required
                value={formData.partner1Name}
                onChange={(e) => setFormData({ ...formData, partner1Name: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Partner 2</label>
              <input
                type="text"
                required
                value={formData.partner2Name}
                onChange={(e) => setFormData({ ...formData, partner2Name: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Phone</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
              className="px-4 py-2 bg-navy-700 text-gold-200 rounded-xl text-xs font-semibold shadow-md"
            >
              Save Client
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

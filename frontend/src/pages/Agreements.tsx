import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  Search,
  ExternalLink,
  Download,
  Send,
  Copy,
  CheckCircle2,
  FileSignature,
  FileText,
  Clock,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Agreement, Wedding } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const Agreements: React.FC = () => {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeddingId, setSelectedWeddingId] = useState('');
  const [title, setTitle] = useState('');
  const [scopeOfServices, setScopeOfServices] = useState(
    'Full-Service Royal Wedding Planning, Venue Architecture & Production, Catering Selection & Menu Curation, Guest Logistics & Hospitality Concierge, Live Event Coordination.'
  );
  const [termsAndConditions, setTermsAndConditions] = useState(
    'Staged Milestones: 25% Non-refundable Booking Deposit upon signing, 50% Advance 30 days prior to first event, 25% Final Settlement post-wedding completion. Unforeseen guest additions billed at agreed per-plate rate.'
  );
  const [totalAmount, setTotalAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAgreements();
    fetchWeddings();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const res = await api.get('/agreements');
      if (res.data.success) {
        setAgreements(res.data.data.agreements);
      }
    } catch (err) {
      console.error('Failed to load agreements:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeddings = async () => {
    try {
      const res = await api.get('/weddings');
      if (res.data.success) {
        setWeddings(res.data.data.weddings);
      }
    } catch (err) {
      console.error('Failed to load weddings:', err);
    }
  };

  const handleCreateAgreement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/agreements', {
        weddingId: selectedWeddingId,
        title: title || undefined,
        scopeOfServices,
        termsAndConditions,
        totalAmount: totalAmount ? Number(totalAmount) : undefined,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        resetForm();
        fetchAgreements();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create agreement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAgreement = async (id: string) => {
    try {
      const res = await api.post(`/agreements/${id}/send`);
      if (res.data.success) {
        alert('Agreement dispatched to client with active signing portal link.');
        fetchAgreements();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to dispatch agreement');
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/sign/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const resetForm = () => {
    setSelectedWeddingId('');
    setTitle('');
    setTotalAmount('');
  };

  // Filtered list
  const filtered = agreements.filter((agr) => {
    const matchesSearch =
      agr.agreementNumber.toLowerCase().includes(search.toLowerCase()) ||
      agr.title.toLowerCase().includes(search.toLowerCase()) ||
      (agr.wedding?.name && agr.wedding.name.toLowerCase().includes(search.toLowerCase())) ||
      (agr.client?.partner1Name && agr.client.partner1Name.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || agr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalValue = agreements.reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0);
  const signedCount = agreements.filter((a) => a.status === 'SIGNED').length;
  const pendingCount = agreements.filter((a) => a.status === 'SENT' || a.status === 'DRAFT').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900">
              Agreements & Client Contracts
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Legally binding luxury planning contracts, digital sign-off execution, and verified PDF issuance.
          </p>
        </div>

        {['FOUNDER', 'PLANNER'].includes(user?.role || '') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-gold-200 text-xs font-semibold hover:from-navy-800 hover:to-navy-700 shadow-md transition-all border border-gold-400/30"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Generate New Agreement</span>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Agreements"
          value={agreements.length}
          icon={FileText}
          description="Contracts drafted & issued"
          variant="default"
        />
        <MetricCard
          title="Digitally Signed"
          value={signedCount}
          icon={CheckCircle2}
          description="Executed and legally active"
          variant="gold"
        />
        <MetricCard
          title="Pending Signing"
          value={pendingCount}
          icon={Clock}
          description="Draft or awaiting client review"
          variant="navy"
        />
        <MetricCard
          title="Contracted Portfolio"
          value={formatCurrency(totalValue)}
          icon={Sparkles}
          description="Aggregate contract valuation"
          variant="charcoal"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by agreement #, client, or wedding..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {['ALL', 'DRAFT', 'SENT', 'SIGNED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-navy-900 text-gold-200 shadow-sm border border-gold-400/40'
                  : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
              }`}
            >
              {st === 'ALL' ? 'All Agreements' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Agreements Table */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading client agreements...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No Agreements Found"
          description={search ? 'No agreements match your search criteria.' : 'Create your first wedding planning agreement.'}
          actionLabel={['FOUNDER', 'PLANNER'].includes(user?.role || '') ? 'Generate Agreement' : undefined}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                  <th className="py-3 px-4">Agreement Details</th>
                  <th className="py-3 px-4">Wedding & Couple</th>
                  <th className="py-3 px-4">Contract Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Signing Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-xs">
                {filtered.map((agr) => (
                  <tr key={agr.id} className="hover:bg-ivory-50/80 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-navy-950 font-serif text-sm">{agr.title}</div>
                      <div className="text-[11px] font-mono text-gold-600 font-bold mt-0.5">{agr.agreementNumber}</div>
                      <div className="text-[10px] text-charcoal-400 mt-1">Created on {formatDate(agr.createdAt)}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-charcoal-900">{agr.wedding?.name || 'Wedding'}</div>
                      <div className="text-[11px] text-charcoal-500">
                        {agr.client ? `${agr.client.partner1Name} & ${agr.client.partner2Name}` : 'Couple'}
                      </div>
                      <div className="text-[10px] text-charcoal-400">{agr.wedding?.location}</div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-bold text-navy-900 text-sm">{formatCurrency(agr.totalAmount)}</div>
                      <div className="text-[10px] text-emerald-600 font-medium">Staged Milestones</div>
                    </td>

                    <td className="py-4 px-4">
                      <StatusBadge status={agr.status} />
                    </td>

                    <td className="py-4 px-4">
                      {agr.status === 'SIGNED' ? (
                        <div>
                          <div className="flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Signed by {agr.signerName}</span>
                          </div>
                          <div className="text-[10px] text-charcoal-400 mt-0.5">
                            {agr.signedAt ? formatDate(agr.signedAt) : 'Verified'} • IP: {agr.signerIp || '127.0.0.1'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-charcoal-400 text-[11px]">
                          {agr.status === 'SENT' ? 'Waiting for client signature' : 'Draft stage'}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy Signing Link */}
                        <button
                          onClick={() => handleCopyLink(agr.id)}
                          title="Copy Digital Sign Link"
                          className="p-1.5 rounded-lg text-charcoal-500 hover:text-navy-900 hover:bg-gold-500/10 transition-colors"
                        >
                          {copiedId === agr.id ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Send Agreement */}
                        {agr.status === 'DRAFT' && ['FOUNDER', 'PLANNER'].includes(user?.role || '') && (
                          <button
                            onClick={() => handleSendAgreement(agr.id)}
                            title="Dispatch Agreement to Client"
                            className="p-1.5 rounded-lg text-gold-600 hover:text-navy-900 hover:bg-gold-500/10 transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        )}

                        {/* Open Public Signing Page */}
                        <a
                          href={`/sign/${agr.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Open Signing Portal"
                          className="p-1.5 rounded-lg text-navy-800 hover:text-gold-600 hover:bg-gold-500/10 transition-colors"
                        >
                          <FileSignature className="w-4 h-4" />
                        </a>

                        {/* Download PDF */}
                        <a
                          href={`/api/agreements/${agr.id}/pdf`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Download Official PDF"
                          className="p-1.5 rounded-lg text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Agreement Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Draft Planning Agreement"
        subtitle="Generate a legally binding luxury wedding contract"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateAgreement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Select Wedding Project *
            </label>
            <select
              value={selectedWeddingId}
              onChange={(e) => {
                setSelectedWeddingId(e.target.value);
                const w = weddings.find((item) => item.id === e.target.value);
                if (w) {
                  setTitle(`${w.name} - Luxury Wedding Planning Agreement`);
                  setTotalAmount(String(w.contractAmount));
                }
              }}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            >
              <option value="">Select Wedding...</option>
              {weddings.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.weddingCode} - {w.name} ({w.location})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Agreement Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Royal Udaipur Destination Wedding Contract"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Total Contract Valuation (INR) *
            </label>
            <input
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              placeholder="e.g. 8500000"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Scope of Luxury Services
            </label>
            <textarea
              rows={3}
              value={scopeOfServices}
              onChange={(e) => setScopeOfServices(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Terms, Conditions & Payment Milestones
            </label>
            <textarea
              rows={3}
              value={termsAndConditions}
              onChange={(e) => setTermsAndConditions(e.target.value)}
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
              {isSubmitting ? 'Creating...' : 'Create Draft Agreement'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Agreements;

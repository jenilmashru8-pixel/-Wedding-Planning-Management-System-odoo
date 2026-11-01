import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { ExtraExpense, ClientInvoice, Wedding, Vendor } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const Expenses: React.FC = () => {
  const { user } = useAuth();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [expenses, setExpenses] = useState<ExtraExpense[]>([]);
  const [invoices, setInvoices] = useState<ClientInvoice[]>([]);
  const [activeTab, setActiveTab] = useState<'expenses' | 'invoices'>('expenses');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState('Extra Catering');
  const [description, setDescription] = useState('60 Extra Guest Plates for Sangeet Dinner');
  const [quantity, setQuantity] = useState('60');
  const [unitPrice, setUnitPrice] = useState('1500');
  const [taxRate, setTaxRate] = useState('18');
  const [vendorId, setVendorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  useEffect(() => {
    fetchWeddings();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedWeddingId) {
      loadData();
    }
  }, [selectedWeddingId]);

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

  const loadData = async () => {
    if (!selectedWeddingId) return;
    try {
      setLoading(true);
      const [expensesRes, invoicesRes] = await Promise.all([
        api.get('/expenses', { params: { weddingId: selectedWeddingId } }),
        api.get('/expenses/invoices', { params: { weddingId: selectedWeddingId } }),
      ]);

      if (expensesRes.data.success) setExpenses(expensesRes.data.data.expenses);
      if (invoicesRes.data.success) setInvoices(invoicesRes.data.data.invoices);
    } catch (err) {
      console.error('Failed to load expenses data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveExpense = async (id: string, approvalStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await api.patch(`/expenses/${id}/approval`, {
        approvalStatus,
        clientComments: approvalStatus === 'APPROVED' ? 'Approved by couple/planner' : 'Declined addition',
      });
      if (res.data.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update approval');
    }
  };

  const handleGenerateInvoice = async () => {
    if (!selectedWeddingId) return;
    const confirmed = window.confirm(
      'Generate consolidated Tax Invoice?\n\nThis will compile the base contract amount plus all approved additions, calculate 18% GST, and subtract client payments made.'
    );
    if (!confirmed) return;

    try {
      setIsGeneratingInvoice(true);
      const res = await api.post('/expenses/invoices/generate', {
        weddingId: selectedWeddingId,
      });

      if (res.data.success) {
        alert('Tax Invoice successfully generated and PDF generated.');
        setActiveTab('invoices');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to generate tax invoice');
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !description.trim() || !unitPrice) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/expenses', {
        weddingId: selectedWeddingId,
        category,
        description,
        quantity: Number(quantity) || 1,
        unitPrice: Number(unitPrice),
        taxRate: Number(taxRate) || 18,
        vendorId: vendorId || undefined,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        resetForm();
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to log extra expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDescription('');
    setQuantity('1');
    setUnitPrice('');
    setVendorId('');
  };

  const totalAdditions = expenses.reduce((acc, e) => acc + Number(e.totalAmount || 0), 0);
  const approvedTotal = expenses
    .filter((e) => e.approvalStatus === 'APPROVED')
    .reduce((acc, e) => acc + Number(e.totalAmount || 0), 0);
  const pendingTotal = expenses
    .filter((e) => e.approvalStatus === 'PENDING')
    .reduce((acc, e) => acc + Number(e.totalAmount || 0), 0);

  const canManageExpenses = ['FOUNDER', 'PLANNER', 'FINANCE'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <Receipt className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900">
              Expenses & Client Billing
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Log extra guest plates, extended DJ hours, generator hire, and generate official Tax Invoices.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canManageExpenses && (
            <button
              onClick={handleGenerateInvoice}
              disabled={isGeneratingInvoice}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <FileText className="w-4 h-4" />
              <span>{isGeneratingInvoice ? 'Generating Invoice...' : 'Generate Tax Invoice'}</span>
            </button>
          )}

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-gold-200 text-xs font-semibold hover:from-navy-800 hover:to-navy-700 shadow-md border border-gold-400/30 transition-all"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Log Extra Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Extra Expenses"
          value={formatCurrency(totalAdditions)}
          icon={Receipt}
          description="Gross unforeseen additions"
          variant="default"
        />
        <MetricCard
          title="Approved by Client"
          value={formatCurrency(approvedTotal)}
          icon={CheckCircle2}
          description="Eligible for billing"
          variant="gold"
        />
        <MetricCard
          title="Pending Approval"
          value={formatCurrency(pendingTotal)}
          icon={Clock}
          description="Awaiting client sign-off"
          variant="navy"
        />
        <MetricCard
          title="Invoices Issued"
          value={invoices.length}
          icon={FileText}
          description="Official tax invoices"
          variant="charcoal"
        />
      </div>

      {/* Project Selector & Tab Switcher Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <span className="text-xs font-semibold text-charcoal-600">Wedding:</span>
          <select
            value={selectedWeddingId}
            onChange={(e) => setSelectedWeddingId(e.target.value)}
            className="w-full md:w-80 px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
          >
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                {w.weddingCode} - {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-ivory-100 rounded-xl border border-gold-200">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'expenses'
                ? 'bg-navy-900 text-gold-200 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Extra Expenses ({expenses.length})
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'invoices'
                ? 'bg-navy-900 text-gold-200 shadow-sm'
                : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            Client Tax Invoices ({invoices.length})
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading expenses...</div>
      ) : activeTab === 'expenses' ? (
        /* Extra Expenses Table */
        expenses.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No Extra Expenses"
            description="Log extra guest catering plates, extended DJ hours, or emergency backup generators."
            actionLabel="Log Extra Expense"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                    <th className="py-3 px-4">Addition Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Qty & Rate</th>
                    <th className="py-3 px-4">Tax (18% GST)</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Approval Status</th>
                    <th className="py-3 px-4 text-right">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-xs">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-ivory-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal-900">{e.description}</div>
                        {e.vendor && (
                          <div className="text-[10px] text-charcoal-500">
                            Partner: {e.vendor.companyName}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-gold-500/10 text-gold-700 text-[11px] font-medium border border-gold-400/20">
                          {e.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-charcoal-700">
                        {e.quantity} × {formatCurrency(e.unitPrice)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-500">
                        {formatCurrency(e.taxAmount)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-navy-950 font-serif text-sm">
                        {formatCurrency(e.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={e.approvalStatus} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {e.approvalStatus === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleApproveExpense(e.id, 'APPROVED')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApproveExpense(e.id, 'REJECTED')}
                              className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-charcoal-400">
                            {e.approvalStatus === 'APPROVED' ? 'Ready for billing' : 'Declined'}
                          </span>
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
        /* Invoices Table */
        invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Tax Invoices Generated"
            description="Generate a consolidated tax invoice including contract amount and approved additions."
            actionLabel="Generate Tax Invoice"
            onAction={handleGenerateInvoice}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Contract Amount</th>
                    <th className="py-3 px-4">Approved Additions</th>
                    <th className="py-3 px-4">18% GST</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Paid Amount</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Official PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-xs">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-ivory-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-navy-900">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-charcoal-700">
                        {formatCurrency(inv.contractAmount)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                        +{formatCurrency(inv.approvedAdditions)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-charcoal-500">
                        {formatCurrency(inv.taxAmount)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-navy-950 font-serif text-sm">
                        {formatCurrency(inv.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-emerald-700">
                        {formatCurrency(inv.paidAmount)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-rose-800 font-mono">
                        {formatCurrency(inv.balanceDue)}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={inv.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {inv.pdfUrl ? (
                          <a
                            href={inv.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-ivory-100 hover:bg-gold-500/10 text-navy-900 text-xs font-semibold border border-gold-300 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-gold-600" />
                            <span>Download PDF</span>
                          </a>
                        ) : (
                          <span className="text-[11px] text-charcoal-400">Archived</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Log Extra Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Unforeseen Wedding Expense"
        subtitle="Record additions for couple sign-off and subsequent billing"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Addition Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. 60 Extra Guest Plates for Sangeet Dinner"
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                <option value="Extra Catering">Extra Catering (Plates)</option>
                <option value="Extended Hours">Extended Hours (DJ / Artists)</option>
                <option value="Emergency Power">Emergency Generator / Power</option>
                <option value="Additional Decor">Additional Floral / Decor</option>
                <option value="Extra Transport">Extra Luxury Transport</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Partner Vendor (Optional)</label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                <option value="">None / Agency Coordination</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Quantity *</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                placeholder="1500"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">GST Tax Rate (%)</label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
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
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-200 text-xs font-bold hover:bg-navy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Log Extra Expense'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Expenses;

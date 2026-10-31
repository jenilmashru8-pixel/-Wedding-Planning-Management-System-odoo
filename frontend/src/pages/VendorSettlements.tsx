import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  CreditCard,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { VendorInvoice, VendorPayment, Wedding, Vendor, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const VendorSettlements: React.FC = () => {
  const { user } = useAuth();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [invoices, setInvoices] = useState<VendorInvoice[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // New Invoice Form
  const [modalVendorId, setModalVendorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [quotedAmount, setQuotedAmount] = useState('');
  const [finalAmount, setFinalAmount] = useState('');
  const [approvedAdditions, setApprovedAdditions] = useState('0');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  // Payment Form
  const [payVendorId, setPayVendorId] = useState('');
  const [payInvoiceId, setPayInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [transactionRef, setTransactionRef] = useState('');
  const [isAdvance, setIsAdvance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWeddings();
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedWeddingId) {
      loadInvoices();
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

  const loadInvoices = async () => {
    if (!selectedWeddingId) return;
    try {
      setLoading(true);
      const res = await api.get('/vendor-settlements/invoices', {
        params: { weddingId: selectedWeddingId },
      });
      if (res.data.success) {
        setInvoices(res.data.data.invoices);
      }
    } catch (err) {
      console.error('Failed to load vendor invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !modalVendorId || !invoiceNumber || !finalAmount) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/vendor-settlements/invoices', {
        weddingId: selectedWeddingId,
        vendorId: modalVendorId,
        invoiceNumber,
        originalQuotedAmount: Number(quotedAmount) || Number(finalAmount),
        approvedAdditions: Number(approvedAdditions) || 0,
        finalAmount: Number(finalAmount),
        dueDate,
      });

      if (res.data.success) {
        setIsInvoiceModalOpen(false);
        resetInvoiceForm();
        loadInvoices();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to record vendor invoice');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !payVendorId || !payAmount || !transactionRef) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/vendor-settlements/payments', {
        weddingId: selectedWeddingId,
        vendorId: payVendorId,
        vendorInvoiceId: payInvoiceId || undefined,
        amount: Number(payAmount),
        paymentMethod,
        transactionRef: transactionRef.trim(),
        isAdvance,
      });

      if (res.data.success) {
        setIsPaymentModalOpen(false);
        resetPaymentForm();
        loadInvoices();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to disburse vendor payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetInvoiceForm = () => {
    setModalVendorId('');
    setInvoiceNumber('');
    setQuotedAmount('');
    setFinalAmount('');
    setApprovedAdditions('0');
  };

  const resetPaymentForm = () => {
    setPayVendorId('');
    setPayInvoiceId('');
    setPayAmount('');
    setTransactionRef('');
    setIsAdvance(false);
  };

  const totalInvoiced = invoices.reduce((acc, i) => acc + Number(i.finalAmount || 0), 0);
  const totalAdvances = invoices.reduce((acc, i) => acc + Number(i.advancePaid || 0), 0);
  const totalBalanceDue = invoices.reduce((acc, i) => acc + Number(i.balanceDue || 0), 0);
  const fullySettledCount = invoices.filter((i) => Number(i.balanceDue) <= 0).length;

  const canManageSettlements = ['FOUNDER', 'FINANCE', 'PLANNER'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-burgundy-900">
              Vendor Settlements & Invoice Matching
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Compare billed invoices against agreed quotations, reconcile advances, and disburse final settlements.
          </p>
        </div>

        {canManageSettlements && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ivory-100 text-charcoal-700 text-xs font-semibold hover:bg-ivory-200 border border-gold-300 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-gold-600" />
              <span>Record Vendor Invoice</span>
            </button>

            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-burgundy-900 to-burgundy-800 text-gold-200 text-xs font-bold shadow-md hover:from-burgundy-800 hover:to-burgundy-700 border border-gold-400/30 transition-all"
            >
              <CreditCard className="w-4 h-4 text-gold-400" />
              <span>Disburse Payment</span>
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Billed Liabilities"
          value={formatCurrency(totalInvoiced)}
          icon={Building}
          description="Invoices received"
          variant="default"
        />
        <MetricCard
          title="Advances Disbursed"
          value={formatCurrency(totalAdvances)}
          icon={CheckCircle2}
          description="Pre-event vendor retainers"
          variant="gold"
        />
        <MetricCard
          title="Balance Payable"
          value={formatCurrency(totalBalanceDue)}
          icon={Clock}
          description="Pending final disbursement"
          variant="burgundy"
        />
        <MetricCard
          title="Settlement Progress"
          value={`${fullySettledCount} / ${invoices.length}`}
          icon={ShieldCheck}
          description="Vendors fully settled"
          variant="charcoal"
        />
      </div>

      {/* Project Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-charcoal-600">Wedding:</span>
          <select
            value={selectedWeddingId}
            onChange={(e) => setSelectedWeddingId(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
          >
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                {w.weddingCode} - {w.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-charcoal-500">
          Showing {invoices.length} partner settlement accounts
        </div>
      </div>

      {/* Invoices & Settlements Table */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading vendor settlements...</div>
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={Scale}
          title="No Vendor Invoices Logged"
          description="Log invoices submitted by palace caterers, decorators, or artists to reconcile against quotations."
          actionLabel={canManageSettlements ? 'Record Vendor Invoice' : undefined}
          onAction={() => setIsInvoiceModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Vendor Partner</th>
                  <th className="py-3 px-4">Quoted vs Final</th>
                  <th className="py-3 px-4">Variance</th>
                  <th className="py-3 px-4">Advance Paid</th>
                  <th className="py-3 px-4">Balance Payable</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-xs">
                {invoices.map((inv) => {
                  const variance = Number(inv.finalAmount) - Number(inv.originalQuotedAmount);
                  const isFullyPaid = Number(inv.balanceDue) <= 0;

                  return (
                    <tr key={inv.id} className="hover:bg-ivory-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-burgundy-900">
                        {inv.invoiceNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-charcoal-900">{inv.vendor?.companyName}</div>
                        <div className="text-[10px] text-charcoal-500">{inv.vendor?.contactPerson}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-charcoal-900">{formatCurrency(inv.finalAmount)}</div>
                        <div className="text-[10px] text-charcoal-400">
                          Quoted: {formatCurrency(inv.originalQuotedAmount)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {variance > 0 ? (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            +{formatCurrency(variance)}
                          </span>
                        ) : variance < 0 ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            -{formatCurrency(Math.abs(variance))}
                          </span>
                        ) : (
                          <span className="text-[11px] text-charcoal-400 font-medium">Matched 0%</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-emerald-700 font-semibold">
                        {formatCurrency(inv.advancePaid)}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-rose-800 font-serif text-sm">
                        {formatCurrency(inv.balanceDue)}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={inv.status} />
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isFullyPaid && canManageSettlements ? (
                          <button
                            onClick={() => {
                              setPayVendorId(inv.vendorId);
                              setPayInvoiceId(inv.id);
                              setPayAmount(String(inv.balanceDue));
                              setIsAdvance(false);
                              setIsPaymentModalOpen(true);
                            }}
                            className="px-3 py-1 rounded-lg bg-burgundy-900 text-gold-200 text-[11px] font-bold hover:bg-burgundy-800 transition-colors shadow-sm"
                          >
                            Disburse Balance
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Settled</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Vendor Invoice Modal */}
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Record Vendor Invoice"
        subtitle="Match vendor bill against approved contract and quotation"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Vendor Partner *</label>
              <select
                value={modalVendorId}
                onChange={(e) => setModalVendorId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="">Select Vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Invoice Number *</label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="e.g. RRC-2026-INV-101"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Original Quoted Amount (₹)</label>
              <input
                type="number"
                value={quotedAmount}
                onChange={(e) => setQuotedAmount(e.target.value)}
                placeholder="e.g. 2124000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Final Billed Amount (₹) *</label>
              <input
                type="number"
                value={finalAmount}
                onChange={(e) => setFinalAmount(e.target.value)}
                placeholder="e.g. 2230200"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Payment Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-burgundy-900 text-gold-200 text-xs font-bold hover:bg-burgundy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Record Invoice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Disburse Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Disburse Vendor Payment"
        subtitle="Record bank transfer advance or final settlement with UTR"
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Vendor Partner *</label>
              <select
                value={payVendorId}
                onChange={(e) => setPayVendorId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="">Select Vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Amount to Disburse (INR) *</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                placeholder="e.g. 500000"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">UTR / Bank Wire Reference *</label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. UTR-HDFC-99881122"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="BANK_TRANSFER">Bank Wire / RTGS / NEFT</option>
                <option value="UPI">UPI Transfer</option>
                <option value="CHEQUE">Bank Cheque</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-ivory-50 rounded-xl border border-charcoal-200">
            <input
              type="checkbox"
              id="isAdvance"
              checked={isAdvance}
              onChange={(e) => setIsAdvance(e.target.checked)}
              className="rounded text-burgundy-900 focus:ring-burgundy-800"
            />
            <label htmlFor="isAdvance" className="text-xs font-semibold text-charcoal-700 cursor-pointer">
              Mark as Pre-Event Advance Retainer (Unsettled until final invoice)
            </label>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsPaymentModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-burgundy-900 text-gold-200 text-xs font-bold hover:bg-burgundy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : 'Disburse Payment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default VendorSettlements;

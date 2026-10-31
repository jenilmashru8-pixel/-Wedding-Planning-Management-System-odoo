import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Receipt,
  Building,
} from 'lucide-react';
import { api } from '../services/api';
import { ClientPayment, PaymentMilestone, Wedding, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const Payments: React.FC = () => {
  const { user } = useAuth();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [milestones, setMilestones] = useState<PaymentMilestone[]>([]);
  const [payments, setPayments] = useState<ClientPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMilestoneId, setModalMilestoneId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWeddings();
  }, []);

  useEffect(() => {
    if (selectedWeddingId) {
      loadPaymentsData();
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

  const loadPaymentsData = async () => {
    if (!selectedWeddingId) return;
    try {
      setLoading(true);
      const [milestonesRes, paymentsRes] = await Promise.all([
        api.get('/payments/milestones', { params: { weddingId: selectedWeddingId } }),
        api.get('/payments', { params: { weddingId: selectedWeddingId } }),
      ]);

      if (milestonesRes.data.success) setMilestones(milestonesRes.data.data.milestones);
      if (paymentsRes.data.success) setPayments(paymentsRes.data.data.payments);
    } catch (err) {
      console.error('Failed to load payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !amount || !transactionRef.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/payments', {
        weddingId: selectedWeddingId,
        milestoneId: modalMilestoneId || undefined,
        amount: Number(amount),
        paymentMethod,
        transactionRef: transactionRef.trim(),
        paymentDate,
        notes,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        resetForm();
        loadPaymentsData();
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        alert(`Duplicate Transaction Error: ${err.response.data.message}`);
      } else {
        alert(err.response?.data?.message || 'Failed to record payment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setModalMilestoneId('');
    setAmount('');
    setPaymentMethod('BANK_TRANSFER');
    setTransactionRef('');
    setNotes('');
  };

  const selectedWedding = weddings.find((w) => w.id === selectedWeddingId);
  const contractAmount = Number(selectedWedding?.contractAmount || 0);
  const totalPaid = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const balanceDue = Math.max(0, contractAmount - totalPaid);

  const canRecordPayment = ['FOUNDER', 'PLANNER', 'FINANCE'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-burgundy-900">
              Client Payments & Staged Milestones
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Deposit booking retainers, 30-day advance disbursements, post-event settlements, and official receipts.
          </p>
        </div>

        {canRecordPayment && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-burgundy-900 to-burgundy-800 text-gold-200 text-xs font-semibold hover:from-burgundy-800 hover:to-burgundy-700 shadow-md border border-gold-400/30 transition-all"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Record Client Payment</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Contract Valuation"
          value={formatCurrency(contractAmount)}
          icon={Sparkles}
          description="Agreed planning agreement"
          variant="default"
        />
        <MetricCard
          title="Cash Collected"
          value={formatCurrency(totalPaid)}
          icon={CheckCircle2}
          description="Realized bank receipts"
          variant="gold"
        />
        <MetricCard
          title="Balance Due"
          value={formatCurrency(balanceDue)}
          icon={Clock}
          description="Outstanding milestones"
          variant="burgundy"
        />
        <MetricCard
          title="Collection Rate"
          value={contractAmount > 0 ? `${Math.round((totalPaid / contractAmount) * 100)}%` : '0%'}
          icon={TrendingUp}
          description="Cash collection ratio"
          variant="charcoal"
        />
      </div>

      {/* Wedding Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs font-semibold text-charcoal-600">Select Wedding Project:</span>
          <select
            value={selectedWeddingId}
            onChange={(e) => setSelectedWeddingId(e.target.value)}
            className="w-full sm:w-80 px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
          >
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                {w.weddingCode} - {w.name} ({w.location})
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-charcoal-500">
          Showing {milestones.length} staged milestones • {payments.length} verified receipts
        </div>
      </div>

      {/* Staged Payment Milestones Cards */}
      <div className="space-y-3">
        <h2 className="font-serif text-lg font-bold text-burgundy-950 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-gold-600" />
          <span>Staged Milestone Schedule</span>
        </h2>

        {milestones.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-gold-200 text-charcoal-400 text-xs">
            No milestones configured for this wedding.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {milestones.map((m) => {
              const due = Number(m.amountDue);
              const paid = Number(m.amountPaid);
              const isFullyPaid = paid >= due;
              const percentPaid = due > 0 ? Math.min(100, Math.round((paid / due) * 100)) : 0;

              return (
                <div
                  key={m.id}
                  className={`bg-white rounded-2xl p-5 border shadow-sm transition-all flex flex-col justify-between ${
                    isFullyPaid ? 'border-emerald-300' : 'border-gold-200/90'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-400/20">
                          {m.percentage}% STAGE
                        </span>
                        <h3 className="font-serif text-base font-bold text-burgundy-950 mt-1">
                          {m.title}
                        </h3>
                      </div>
                      <StatusBadge status={m.status} />
                    </div>

                    <div className="p-3 rounded-xl bg-ivory-50 border border-charcoal-100 space-y-1 text-xs">
                      <div className="flex justify-between items-center text-charcoal-600">
                        <span>Milestone Due:</span>
                        <span className="font-bold text-burgundy-900 font-mono">
                          {formatCurrency(m.amountDue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-charcoal-600">
                        <span>Amount Paid:</span>
                        <span className="font-bold text-emerald-700 font-mono">
                          {formatCurrency(m.amountPaid)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full bg-ivory-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${percentPaid}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-charcoal-400">
                        <span>{percentPaid}% Cleared</span>
                        <span>Due {formatDate(m.dueDate)}</span>
                      </div>
                    </div>
                  </div>

                  {!isFullyPaid && canRecordPayment && (
                    <div className="pt-3 mt-3 border-t border-charcoal-100">
                      <button
                        onClick={() => {
                          setModalMilestoneId(m.id);
                          setAmount(String(due - paid));
                          setIsModalOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-burgundy-900 hover:bg-burgundy-800 text-gold-200 text-xs font-bold transition-all shadow-sm"
                      >
                        Record Stage Payment
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payments History Table */}
      <div className="space-y-3 pt-4">
        <h2 className="font-serif text-lg font-bold text-burgundy-950 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-gold-600" />
          <span>Payment Transactions & Receipts</span>
        </h2>

        {loading ? (
          <div className="p-12 text-center text-charcoal-400">Loading payments registry...</div>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No Payments Recorded"
            description="Client advances and settlement transactions will appear here."
            actionLabel={canRecordPayment ? 'Record Payment' : undefined}
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                    <th className="py-3 px-4">Receipt Ref</th>
                    <th className="py-3 px-4">Milestone</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">UTR / Trans Ref</th>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4 text-right">Official Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-xs">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-ivory-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-burgundy-900">
                        {p.paymentNumber}
                      </td>

                      <td className="py-3.5 px-4 text-charcoal-800 font-medium">
                        {p.milestone?.title || 'General Milestone'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-800 font-serif text-sm">
                        {formatCurrency(p.amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-ivory-100 text-charcoal-700 text-[11px] font-medium border border-gold-200">
                          {p.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-charcoal-600">
                        {p.transactionRef}
                      </td>

                      <td className="py-3.5 px-4 text-charcoal-600">
                        {formatDate(p.paymentDate)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {p.receiptUrl ? (
                          <a
                            href={p.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-ivory-100 hover:bg-gold-500/10 text-burgundy-900 text-xs font-semibold border border-gold-300 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5 text-gold-600" />
                            <span>PDF Receipt</span>
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
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Client Payment"
        subtitle="Log verified bank transfer, cheque, or UPI advance"
        maxWidth="lg"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Select Milestone (Optional)
            </label>
            <select
              value={modalMilestoneId}
              onChange={(e) => setModalMilestoneId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            >
              <option value="">General Project Payment</option>
              {milestones.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.percentage}%) - Due: {formatCurrency(m.amountDue)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Amount Received (INR) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 2125000"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="BANK_TRANSFER">Bank Wire / RTGS / NEFT</option>
                <option value="UPI">UPI Payment</option>
                <option value="CHEQUE">Bank Cheque</option>
                <option value="CARD">Credit / Debit Card</option>
                <option value="CASH">Cash Deposit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                UTR / Transaction Reference *
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                placeholder="e.g. HDFC-RTGS-99882211"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                Payment Date *
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bank account credited, receipt notes..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
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
              className="px-5 py-2 rounded-xl bg-burgundy-900 text-gold-200 text-xs font-bold hover:bg-burgundy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : 'Generate Receipt & Record'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Payments;

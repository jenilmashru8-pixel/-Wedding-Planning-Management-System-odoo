import React, { useState, useEffect } from 'react';
import {
  FileText,
  Plus,
  CheckCircle2,
  XCircle,
  Columns,
  List,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { VendorQuotation, Wedding, Vendor, VendorCategory } from '../types';
import { formatCurrency } from '../utils/formatters';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const Quotations: React.FC = () => {
  const { user } = useAuth();
  const [quotations, setQuotations] = useState<VendorQuotation[]>([]);
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalWeddingId, setModalWeddingId] = useState('');
  const [modalVendorId, setModalVendorId] = useState('');
  const [modalCategoryId, setModalCategoryId] = useState('');
  const [pricePerPlate, setPricePerPlate] = useState('2200');
  const [guestCount, setGuestCount] = useState('400');
  const [baseAmount, setBaseAmount] = useState('0');
  const [extraHourRate, setExtraHourRate] = useState('25000');
  const [taxRate, setTaxRate] = useState('18');
  const [servicesIncluded, setServicesIncluded] = useState(
    'Royal Rajasthani Buffet, Live Chat Counters, Silver Platter Service, Mineral Water & Beverages'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchQuotations();
  }, [selectedWeddingId, selectedCategoryId]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [weddingsRes, vendorsRes, categoriesRes] = await Promise.all([
        api.get('/weddings'),
        api.get('/vendors'),
        api.get('/vendors/categories'),
      ]);

      if (weddingsRes.data.success) {
        setWeddings(weddingsRes.data.data.weddings);
        if (weddingsRes.data.data.weddings.length > 0) {
          setSelectedWeddingId(weddingsRes.data.data.weddings[0].id);
        }
      }
      if (vendorsRes.data.success) setVendors(vendorsRes.data.data.vendors);
      if (categoriesRes.data.success) setCategories(categoriesRes.data.data.categories);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotations = async () => {
    try {
      const params: any = {};
      if (selectedWeddingId) params.weddingId = selectedWeddingId;
      if (selectedCategoryId !== 'ALL') params.categoryId = selectedCategoryId;

      const res = await api.get('/quotations', { params });
      if (res.data.success) {
        setQuotations(res.data.data.quotations);
      }
    } catch (err) {
      console.error('Failed to load quotations:', err);
    }
  };

  const handleSelectWinningQuotation = async (id: string, vendorName: string) => {
    const confirmed = window.confirm(
      `Award contract to "${vendorName}"?\n\nThis will mark this quotation as ACCEPTED and automatically CLOSE all competing vendor proposals in this category.`
    );
    if (!confirmed) return;

    try {
      const res = await api.post(`/quotations/${id}/select`);
      if (res.data.success) {
        alert(`Success! ${vendorName} has been selected. Competing quotes have been closed.`);
        fetchQuotations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to select quotation');
    }
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalWeddingId || !modalVendorId || !modalCategoryId) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/quotations', {
        weddingId: modalWeddingId,
        vendorId: modalVendorId,
        categoryId: modalCategoryId,
        guestCount: Number(guestCount) || 400,
        pricePerPlate: Number(pricePerPlate) || 0,
        baseAmount: Number(baseAmount) || 0,
        extraHourRate: Number(extraHourRate) || 0,
        taxRate: Number(taxRate) || 18,
        includedServices: servicesIncluded.split(',').map((s) => s.trim()),
        status: 'SUBMITTED',
      });

      if (res.data.success) {
        setIsModalOpen(false);
        fetchQuotations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create quotation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canManageQuotations = ['FOUNDER', 'PLANNER', 'FINANCE'].includes(user?.role || '');

  // Group quotations by category for the matrix
  const groupedByCategory = quotations.reduce((acc, q) => {
    const catName = q.category?.name || 'General';
    if (!acc[catName]) acc[catName] = [];
    acc[catName].push(q);
    return acc;
  }, {} as Record<string, VendorQuotation[]>);

  const acceptedCount = quotations.filter((q) => q.status === 'ACCEPTED').length;
  const closedCount = quotations.filter((q) => q.status === 'CLOSED').length;
  const pendingCount = quotations.filter((q) => q.status === 'SUBMITTED' || q.status === 'RECOMMENDED').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <FileText className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900">
              Vendor Quotations & Comparison Matrix
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Side-by-side pricing evaluation, menu inclusions, and automated competitor closing upon selection.
          </p>
        </div>

        {canManageQuotations && (
          <button
            onClick={() => {
              setModalWeddingId(selectedWeddingId || (weddings[0]?.id ?? ''));
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-gold-200 text-xs font-semibold hover:from-navy-800 hover:to-navy-700 shadow-md transition-all border border-gold-400/30"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add Vendor Quotation</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Quotations Received"
          value={quotations.length}
          icon={FileText}
          description="Total bids in pipeline"
          variant="default"
        />
        <MetricCard
          title="Awarded & Booked"
          value={acceptedCount}
          icon={CheckCircle2}
          description="Approved winning vendors"
          variant="gold"
        />
        <MetricCard
          title="Under Comparison"
          value={pendingCount}
          icon={TrendingDown}
          description="Awaiting selection"
          variant="navy"
        />
        <MetricCard
          title="Auto-Closed Competitors"
          value={closedCount}
          icon={XCircle}
          description="Closed upon winning bid"
          variant="charcoal"
        />
      </div>

      {/* Visual Discipline Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl h-28 p-5 text-white flex items-center border border-gold-300/40 shadow-sm group">
          <img
            src="/images/royal_banquet_feast.jpg"
            alt="Royal Catering"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/75 to-transparent" />
          <div className="relative z-10 max-w-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 bg-gold-400/20 px-2 py-0.5 rounded">
              Banqueting & Gastronomy
            </span>
            <h3 className="font-serif font-bold text-base text-gold-100 mt-1">
              Plate-Cost & Inclusions Comparison
            </h3>
            <p className="text-[11px] text-gold-200/90 line-clamp-1">
              Live Mewari chaat counters, silver cloche dining & bar packages
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl h-28 p-5 text-white flex items-center border border-gold-300/40 shadow-sm group">
          <img
            src="/images/royal_mandap_decor.jpg"
            alt="Royal Floral Decor"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/75 to-transparent" />
          <div className="relative z-10 max-w-sm">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 bg-gold-400/20 px-2 py-0.5 rounded">
              Decor & Floral Production
            </span>
            <h3 className="font-serif font-bold text-base text-gold-100 mt-1">
              Mandap Architecture & Lighting
            </h3>
            <p className="text-[11px] text-gold-200/90 line-clamp-1">
              Heritage carved structures, imported Dutch roses & crystal chandeliers
            </p>
          </div>
        </div>
      </div>

      {/* Filter and View Toggle Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Select Wedding */}
          <div className="w-full sm:w-64">
            <select
              value={selectedWeddingId}
              onChange={(e) => setSelectedWeddingId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            >
              {weddings.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.weddingCode} - {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Select Category */}
          <div className="w-full sm:w-56">
            <select
              value={selectedCategoryId}
              onChange={(e) => setSelectedCategoryId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            >
              <option value="ALL">All Disciplines</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-ivory-100 rounded-xl border border-gold-200">
          <button
            onClick={() => setViewMode('matrix')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'matrix' ? 'bg-navy-900 text-gold-200 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Comparison Matrix</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list' ? 'bg-navy-900 text-gold-200 shadow-sm' : 'text-charcoal-600 hover:text-charcoal-900'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>List View</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading quotations...</div>
      ) : quotations.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Quotations Found"
          description="There are no vendor quotations for the selected wedding and category filters."
          actionLabel={canManageQuotations ? 'Add Quotation' : undefined}
          onAction={() => setIsModalOpen(true)}
        />
      ) : viewMode === 'matrix' ? (
        /* Side-by-Side Competitive Matrix */
        <div className="space-y-8">
          {Object.entries(groupedByCategory).map(([categoryName, quoteList]) => (
            <div key={categoryName} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gold-300">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gold-500" />
                  <h2 className="font-serif text-lg font-bold text-navy-950">{categoryName} Proposals</h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-700 font-semibold border border-gold-400/20">
                    {quoteList.length} competing {quoteList.length === 1 ? 'quote' : 'quotes'}
                  </span>
                </div>

                {quoteList.some((q) => q.status === 'ACCEPTED') && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Contract Awarded</span>
                  </span>
                )}
              </div>

              {/* Side-by-side cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {quoteList.map((q) => {
                  const isWinning = q.status === 'ACCEPTED';
                  const isClosed = q.status === 'CLOSED';

                  return (
                    <div
                      key={q.id}
                      className={`rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                        isWinning
                          ? 'bg-gradient-to-b from-emerald-50/50 to-white border-2 border-emerald-500 shadow-lg'
                          : isClosed
                          ? 'bg-charcoal-50/70 border-charcoal-200 opacity-60'
                          : 'bg-white border-gold-200/90 shadow-sm hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-4">
                        {/* Vendor Name & Status */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[11px] font-mono text-gold-600 font-bold">{q.quoteNumber}</div>
                            <h3 className="font-serif text-base font-bold text-navy-950 mt-0.5">
                              {q.vendor?.companyName || 'Vendor'}
                            </h3>
                            <div className="text-xs text-charcoal-500">Contact: {q.vendor?.contactPerson}</div>
                          </div>
                          <StatusBadge status={q.status} />
                        </div>

                        {/* Pricing Matrix Breakdown */}
                        <div className="p-3.5 rounded-xl bg-ivory-50 border border-charcoal-100 space-y-2 text-xs">
                          {Number(q.pricePerPlate) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-charcoal-600">Rate Per Plate:</span>
                              <span className="font-bold text-navy-900 font-mono text-sm">
                                {formatCurrency(q.pricePerPlate)}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-charcoal-600">Base / Guest Count:</span>
                            <span className="font-semibold text-charcoal-800">
                              {q.guestCount ? `${q.guestCount} Royal Guests` : formatCurrency(q.baseAmount)}
                            </span>
                          </div>

                          {Number(q.extraHourRate) > 0 && (
                            <div className="flex justify-between items-center">
                              <span className="text-charcoal-600">Extra Hour Rate:</span>
                              <span className="font-mono text-charcoal-700">
                                {formatCurrency(q.extraHourRate)}/hr
                              </span>
                            </div>
                          )}

                          <div className="pt-2 border-t border-charcoal-200 flex justify-between items-center">
                            <span className="font-bold text-charcoal-900">Total Quoted:</span>
                            <span className="font-bold text-navy-950 font-serif text-base">
                              {formatCurrency(q.totalAmount)}
                            </span>
                          </div>
                        </div>

                        {/* Included Services & Menu */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                            Included Offerings
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {q.includedServices && q.includedServices.length > 0 ? (
                              q.includedServices.map((item, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-ivory-100 text-charcoal-700 border border-gold-200"
                                >
                                  {item}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-charcoal-400">Full Royal Package Included</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="pt-4 mt-4 border-t border-charcoal-100">
                        {isWinning ? (
                          <div className="w-full py-2.5 rounded-xl bg-emerald-100/80 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-1.5 border border-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Awarded Contract Winner</span>
                          </div>
                        ) : isClosed ? (
                          <div className="w-full py-2 rounded-xl bg-charcoal-100 text-charcoal-500 text-xs font-medium text-center">
                            Auto-Closed by Winner Selection
                          </div>
                        ) : canManageQuotations ? (
                          <button
                            onClick={() => handleSelectWinningQuotation(q.id, q.vendor?.companyName || 'Vendor')}
                            className="w-full py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-200 text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 border border-gold-400/30"
                          >
                            <span>Award & Auto-Close Competitors</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <div className="text-xs text-charcoal-400 text-center">Under Founder Review</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                  <th className="py-3 px-4">Quote Number</th>
                  <th className="py-3 px-4">Vendor Partner</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Rate / Base</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-xs">
                {quotations.map((q) => (
                  <tr key={q.id} className="hover:bg-ivory-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-navy-900">{q.quoteNumber}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">{q.vendor?.companyName}</div>
                      <div className="text-[10px] text-charcoal-500">{q.vendor?.contactPerson}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-gold-500/10 text-gold-700 text-[11px] font-medium border border-gold-400/20">
                        {q.category?.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {Number(q.pricePerPlate) > 0 ? (
                        <span>{formatCurrency(q.pricePerPlate)} / plate</span>
                      ) : (
                        <span>{formatCurrency(q.baseAmount)} base</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-950 font-serif text-sm">
                      {formatCurrency(q.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={q.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {q.status === 'ACCEPTED' ? (
                        <span className="text-emerald-700 font-bold text-xs">Awarded</span>
                      ) : q.status === 'CLOSED' ? (
                        <span className="text-charcoal-400 text-xs">Closed</span>
                      ) : canManageQuotations ? (
                        <button
                          onClick={() => handleSelectWinningQuotation(q.id, q.vendor?.companyName || 'Vendor')}
                          className="px-3 py-1 rounded-lg bg-navy-900 text-gold-200 text-[11px] font-bold hover:bg-navy-800"
                        >
                          Select Winner
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Quotation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Vendor Quotation"
        subtitle="Record vendor bid for competitive matrix analysis"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateQuotation} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Wedding Project *</label>
              <select
                value={modalWeddingId}
                onChange={(e) => setModalWeddingId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                <option value="">Select Wedding...</option>
                {weddings.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.weddingCode} - {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Vendor Partner *</label>
              <select
                value={modalVendorId}
                onChange={(e) => {
                  setModalVendorId(e.target.value);
                  const v = vendors.find((vend) => vend.id === e.target.value);
                  if (v) setModalCategoryId(v.categoryId);
                }}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                <option value="">Select Vendor...</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.companyName} ({v.category?.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Price Per Plate (₹)</label>
              <input
                type="number"
                value={pricePerPlate}
                onChange={(e) => setPricePerPlate(e.target.value)}
                placeholder="2200"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Guest Count</label>
              <input
                type="number"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                placeholder="400"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Extra Hour Rate (₹)</label>
              <input
                type="number"
                value={extraHourRate}
                onChange={(e) => setExtraHourRate(e.target.value)}
                placeholder="25000"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">
              Included Offerings (Comma-separated)
            </label>
            <textarea
              rows={2}
              value={servicesIncluded}
              onChange={(e) => setServicesIncluded(e.target.value)}
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
              {isSubmitting ? 'Recording...' : 'Record Quotation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Quotations;

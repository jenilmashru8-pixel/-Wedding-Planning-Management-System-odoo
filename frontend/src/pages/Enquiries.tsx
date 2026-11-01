import React, { useState, useEffect } from 'react';
import {
  MessageSquareHeart,
  Plus,
  Search,
  Filter,
  Calendar,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { Enquiry, EnquiryStatus, EnquirySource, PackageType } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { MetricCard } from '../components/MetricCard';
import { EmptyState } from '../components/EmptyState';
import { formatCurrency, formatLakhsCrores, formatDate } from '../utils/formatters';

export const Enquiries: React.FC = () => {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isConsultOpen, setIsConsultOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    coupleName: '',
    partner1Name: '',
    partner2Name: '',
    email: '',
    phone: '',
    source: 'INSTAGRAM' as EnquirySource,
    weddingLocation: 'Udaipur',
    preferredDate: '',
    weddingDurationDays: 3,
    guestCount: 400,
    maxBudget: 40000000,
    theme: 'Royal Rajputana Heritage',
    packageType: 'FULL_SERVICE' as PackageType,
    notes: '',
  });

  const [convertData, setConvertData] = useState({
    contractAmount: 40000000,
    venueName: 'The Oberoi Udaivilas, Udaipur',
  });

  const [consultData, setConsultData] = useState({
    scheduledAt: '',
    location: 'The Royal Knot Studio, Jaipur',
    meetingNotes: 'Discussing budget, themes, and palace shortlists.',
  });

  const fetchEnquiries = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (sourceFilter) params.append('source', sourceFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (locationFilter) params.append('location', locationFilter);

      const res = await api.get(`/enquiries?${params.toString()}`);
      setEnquiries(res.data.data.enquiries || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [search, sourceFilter, statusFilter, locationFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/enquiries', formData);
      setIsAddOpen(false);
      fetchEnquiries();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create enquiry');
    }
  };

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      await api.post(`/api/enquiries/${selectedEnquiry.id}/convert`, convertData);
      setIsConvertOpen(false);
      setSelectedEnquiry(null);
      fetchEnquiries();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to convert enquiry');
    }
  };

  const handleScheduleConsult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    try {
      await api.post(`/api/enquiries/${selectedEnquiry.id}/consultation`, consultData);
      setIsConsultOpen(false);
      setSelectedEnquiry(null);
      fetchEnquiries();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule consultation');
    }
  };

  // Funnel Analytics
  const total = enquiries.length;
  const converted = enquiries.filter((e) => e.status === 'CONVERTED').length;
  const inPipeline = enquiries.filter((e) => !['CONVERTED', 'LOST'].includes(e.status)).length;
  const conversionRate = total > 0 ? Math.round((converted / total) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-charcoal-900">Enquiries & CRM Pipeline</h1>
          <p className="text-xs text-charcoal-500">Capture luxury couple enquiries, manage consultations, and convert to wedding workspaces.</p>
        </div>
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2.5 bg-navy-700 hover:bg-navy-800 text-gold-200 hover:text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Enquiry</span>
        </button>
      </div>

      {/* Conversion Funnel KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Inquiries"
          value={total}
          subtitle="All recorded leads"
          icon={MessageSquareHeart}
        />
        <MetricCard
          title="Active Pipeline"
          value={inPipeline}
          subtitle="Proposals & meetings"
          icon={Clock}
          highlight
        />
        <MetricCard
          title="Converted Weddings"
          value={converted}
          subtitle="Closed client projects"
          icon={CheckCircle2}
          trendType="positive"
        />
        <MetricCard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          subtitle="Inquiry to wedding ratio"
          icon={Sparkles}
          trend="+5.2%"
          trendType="positive"
        />
      </div>

      {/* Filter Bar */}
      <div className="card-luxury p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search couple name, phone, enquiry #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-none text-charcoal-900"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-3 py-1.5 bg-ivory text-xs border border-gold-200 rounded-xl focus:outline-none text-charcoal-700"
          >
            <option value="">All Sources</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="WEBSITE">Website</option>
            <option value="PHONE">Phone</option>
            <option value="REFERRAL">Referral</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-ivory text-xs border border-gold-200 rounded-xl focus:outline-none text-charcoal-700"
          >
            <option value="">All Stages</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
            <option value="PROPOSAL_SENT">Proposal Sent</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>

          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-1.5 bg-ivory text-xs border border-gold-200 rounded-xl focus:outline-none text-charcoal-700"
          >
            <option value="">All Locations</option>
            <option value="Jaipur">Jaipur</option>
            <option value="Udaipur">Udaipur</option>
          </select>
        </div>
      </div>

      {/* Enquiries List */}
      {enquiries.length === 0 ? (
        <EmptyState
          icon={MessageSquareHeart}
          title="No Enquiries Found"
          description="Capture new enquiries coming from WhatsApp, Instagram, and calls to ensure no leads are lost."
          actionText="Add New Enquiry"
          onAction={() => setIsAddOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enquiries.map((enq) => (
            <div key={enq.id} className="card-luxury p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-charcoal-400 font-semibold">{enq.enquiryNumber}</span>
                    <h4 className="font-serif font-bold text-base text-charcoal-900 mt-0.5">{enq.coupleName}</h4>
                    <span className="text-[10px] uppercase font-bold text-gold-700 bg-gold-50 px-2 py-0.5 rounded border border-gold-200">
                      Via {enq.source}
                    </span>
                  </div>
                  <StatusBadge status={enq.status} />
                </div>

                <div className="mt-4 space-y-2 text-xs text-charcoal-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gold-600" />
                    <span>{enq.weddingLocation} • {enq.weddingDurationDays} Days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gold-600" />
                    <span>Preferred Date: {formatDate(enq.preferredDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gold-600" />
                    <span>{enq.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gold-600" />
                    <span>{enq.email}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
                  <span className="text-charcoal-500">{enq.guestCount} Guests</span>
                  <span className="font-bold text-navy-900">{formatLakhsCrores(enq.maxBudget)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-charcoal-100 flex items-center justify-between gap-2">
                {enq.status !== 'CONVERTED' ? (
                  <>
                    <button
                      onClick={() => {
                        setSelectedEnquiry(enq);
                        setIsConsultOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg border border-gold-300 text-charcoal-700 hover:bg-gold-50 text-xs font-semibold"
                    >
                      Consultation
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEnquiry(enq);
                        setConvertData({
                          contractAmount: Number(enq.maxBudget),
                          venueName: enq.weddingLocation.includes('Udaipur') ? 'The Oberoi Udaivilas' : 'Rambagh Palace',
                        });
                        setIsConvertOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-navy-700 hover:bg-navy-800 text-gold-200 text-xs font-semibold flex items-center gap-1 shadow-xs"
                    >
                      <span>Convert</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Converted to Project
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Enquiry */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Couple Enquiry"
        subtitle="Capture details the moment couple contacts via WhatsApp, Instagram or Call."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Partner 1 Name</label>
              <input
                type="text"
                required
                value={formData.partner1Name}
                onChange={(e) => setFormData({ ...formData, partner1Name: e.target.value, coupleName: `${e.target.value} & ${formData.partner2Name}` })}
                placeholder="Aarav"
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Partner 2 Name</label>
              <input
                type="text"
                required
                value={formData.partner2Name}
                onChange={(e) => setFormData({ ...formData, partner2Name: e.target.value, coupleName: `${formData.partner1Name} & ${e.target.value}` })}
                placeholder="Meera"
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98290..."
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="couple@example.com"
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Lead Source</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value as any })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              >
                <option value="INSTAGRAM">Instagram</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="WEBSITE">Website</option>
                <option value="PHONE">Phone Call</option>
                <option value="REFERRAL">Referral</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Destination</label>
              <select
                value={formData.weddingLocation}
                onChange={(e) => setFormData({ ...formData, weddingLocation: e.target.value })}
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

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Guests</label>
              <input
                type="number"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: parseInt(e.target.value) || 400 })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Max Budget (INR)</label>
              <input
                type="number"
                value={formData.maxBudget}
                onChange={(e) => setFormData({ ...formData, maxBudget: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gold-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 border border-gold-300 rounded-xl text-xs font-semibold text-charcoal-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-700 text-gold-200 hover:text-white rounded-xl text-xs font-semibold shadow-md"
            >
              Save Enquiry
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Schedule Consultation */}
      <Modal
        isOpen={isConsultOpen}
        onClose={() => setIsConsultOpen(false)}
        title={`Schedule Consultation: ${selectedEnquiry?.coupleName}`}
        subtitle="Book first design & theme discovery meeting before sharing vendor proposals."
      >
        <form onSubmit={handleScheduleConsult} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Meeting Date & Time</label>
            <input
              type="datetime-local"
              required
              value={consultData.scheduledAt}
              onChange={(e) => setConsultData({ ...consultData, scheduledAt: e.target.value })}
              className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Location / Video Link</label>
            <input
              type="text"
              value={consultData.location}
              onChange={(e) => setConsultData({ ...consultData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Meeting Agenda & Notes</label>
            <textarea
              rows={3}
              value={consultData.meetingNotes}
              onChange={(e) => setConsultData({ ...consultData, meetingNotes: e.target.value })}
              className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
            />
          </div>
          <div className="pt-4 border-t border-gold-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConsultOpen(false)}
              className="px-4 py-2 border border-gold-300 rounded-xl text-xs font-semibold text-charcoal-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-navy-700 text-gold-200 rounded-xl text-xs font-semibold shadow-md"
            >
              Schedule Consultation
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Convert Enquiry to Wedding */}
      <Modal
        isOpen={isConvertOpen}
        onClose={() => setIsConvertOpen(false)}
        title={`Convert to Wedding Project: ${selectedEnquiry?.coupleName}`}
        subtitle="Creates client account, generates wedding workspace, and initializes payment milestone stages."
      >
        <form onSubmit={handleConvert} className="space-y-4">
          <div className="p-3.5 bg-gold-50/60 border border-gold-300 rounded-xl text-xs text-charcoal-700 space-y-1">
            <p><strong>Package:</strong> {selectedEnquiry?.packageType?.replace('_', ' ')}</p>
            <p><strong>Location:</strong> {selectedEnquiry?.weddingLocation}</p>
            <p><strong>Preferred Date:</strong> {selectedEnquiry ? formatDate(selectedEnquiry.preferredDate) : ''}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contract Amount (INR)</label>
            <input
              type="number"
              required
              value={convertData.contractAmount}
              onChange={(e) => setConvertData({ ...convertData, contractAmount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Venue Name</label>
            <input
              type="text"
              required
              value={convertData.venueName}
              onChange={(e) => setConvertData({ ...convertData, venueName: e.target.value })}
              className="w-full px-3 py-2 border border-gold-200 rounded-xl text-xs bg-ivory-50"
            />
          </div>

          <div className="pt-4 border-t border-gold-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsConvertOpen(false)}
              className="px-4 py-2 border border-gold-300 rounded-xl text-xs font-semibold text-charcoal-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-navy-900 to-navy-700 text-gold-200 rounded-xl text-xs font-semibold shadow-md"
            >
              Confirm & Launch Wedding Workspace
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

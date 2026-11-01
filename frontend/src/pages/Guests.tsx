import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Download,
  Upload,
  CheckCircle2,
  Clock,
  Utensils,
  Hotel,
  Car,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { api } from '../services/api';
import { Guest, Wedding, RsvpStatus, DietaryPreference } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import readXlsxFile from 'read-excel-file/browser';
import { GuestImportRecord, parseGuestCsv, parseGuestImportRows } from '../utils/guestImport';

export const Guests: React.FC = () => {
  const { user } = useAuth();
  const [weddings, setWeddings] = useState<Wedding[]>([]);
  const [selectedWeddingId, setSelectedWeddingId] = useState<string>('');
  const [guests, setGuests] = useState<Guest[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0, declined: 0, attended: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<string>('ALL');
  const [dietaryFilter, setDietaryFilter] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const limit = 50;

  // Add Guest Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [guestGroup, setGuestGroup] = useState("Groom's Family");
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('VEG');
  const [roomNumber, setRoomNumber] = useState('');
  const [accommodationAssigned, setAccommodationAssigned] = useState(false);
  const [transportationNeeded, setTransportationNeeded] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<RsvpStatus>('CONFIRMED');
  const [plusGuests, setPlusGuests] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importRows, setImportRows] = useState<GuestImportRecord[] | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWeddings();
  }, []);

  useEffect(() => {
    if (selectedWeddingId) {
      fetchGuests();
    }
  }, [selectedWeddingId, rsvpFilter, dietaryFilter, search, page]);

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

  const fetchGuests = async () => {
    if (!selectedWeddingId) return;
    try {
      setLoading(true);
      const params: any = {
        weddingId: selectedWeddingId,
        page,
        limit,
      };
      if (rsvpFilter !== 'ALL') params.rsvpStatus = rsvpFilter;
      if (dietaryFilter !== 'ALL') params.dietaryPreference = dietaryFilter;
      if (search) params.search = search;

      const res = await api.get('/guests', { params });
      if (res.data.success) {
        setGuests(res.data.data.guests);
        setTotalCount(res.data.data.pagination.total);
        setStats({
          total: res.data.data.stats.total,
          confirmed: res.data.data.stats.confirmed,
          pending: res.data.data.stats.pending,
          declined: res.data.data.stats.declined,
          attended: res.data.data.stats.actualAttendees,
        });
      }
    } catch (err) {
      console.error('Failed to load guests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (guestId: string) => {
    try {
      const res = await api.patch(`/guests/${guestId}/check-in`);
      if (res.data.success) {
        const alreadyCheckedIn = guests.some((guest) => guest.id === guestId && guest.arrivalStatus === 'ARRIVED');
        setGuests((prev) =>
          prev.map((g) => (g.id === guestId ? { ...g, arrivalStatus: 'ARRIVED' } : g))
        );
        if (!alreadyCheckedIn) {
          setStats((prev) => ({ ...prev, attended: prev.attended + 1 }));
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCreateGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWeddingId || !firstName.trim() || !lastName.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/guests', {
        weddingId: selectedWeddingId,
        firstName,
        lastName,
        guestGroup,
        phone: phone || undefined,
        email: email || undefined,
        rsvpStatus,
        dietaryPreference,
        accommodationAssigned,
        roomNumber: roomNumber || undefined,
        transportationNeeded,
        plusGuests: Number(plusGuests) || 0,
      });

      if (res.data.success) {
        setIsAddModalOpen(false);
        resetGuestForm();
        fetchGuests();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add guest');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    try {
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Choose a file smaller than 10 MB.');
      }

      const extension = file.name.split('.').pop()?.toLowerCase();
      let rows: GuestImportRecord[];
      if (extension === 'csv') {
        rows = parseGuestCsv(await file.text());
      } else if (extension === 'xlsx') {
        const sheets = await readXlsxFile(file);
        rows = parseGuestImportRows(sheets[0]?.data || []);
      } else {
        throw new Error('Choose a CSV or Excel .xlsx file.');
      }

      setImportRows(rows);
      setSelectedFileName(file.name);
      setCsvContent('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Unable to read this file.');
    }
  };

  const handleImportCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!csvContent.trim() && !importRows?.length) || !selectedWeddingId) return;

    try {
      setIsImporting(true);
      const res = await api.post('/guests/import', {
        weddingId: selectedWeddingId,
        guests: importRows || parseGuestCsv(csvContent),
      });

      if (res.data.success) {
        alert(res.data.message || 'Guests imported successfully');
        setIsImportModalOpen(false);
        setCsvContent('');
        setImportRows(null);
        setSelectedFileName('');
        fetchGuests();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || (err instanceof Error ? err.message : 'Guest import failed.'));
    } finally {
      setIsImporting(false);
    }
  };

  const resetGuestForm = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setRoomNumber('');
    setAccommodationAssigned(false);
    setTransportationNeeded(false);
    setPlusGuests('0');
  };

  const handleExportCsv = async () => {
    if (!selectedWeddingId) return;
    try {
      const response = await api.get(`/guests/export/${selectedWeddingId}`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wedding_${selectedWeddingId}_guests.csv`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Guest export failed.');
    }
  };

  const totalPages = Math.ceil(totalCount / limit) || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <UserCheck className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900">
              Royal Guest List & Concierge
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            RSVP tracking, dietary allocations, palace suite room assignments, and airport transfer logistics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={!selectedWeddingId}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-ivory-100 text-charcoal-700 text-xs font-semibold hover:bg-ivory-200 border border-gold-300 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-gold-600" />
            <span>Export CSV</span>
          </button>

          {/* Import CSV */}
          <button
            onClick={() => {
              setCsvContent('');
              setImportRows(null);
              setSelectedFileName('');
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gold-500/10 text-gold-700 text-xs font-semibold hover:bg-gold-500/20 border border-gold-400/30 transition-all shadow-sm"
          >
            <Upload className="w-4 h-4 text-gold-600" />
            <span>Import CSV / Excel</span>
          </button>

          {/* Add Guest */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-gold-200 text-xs font-semibold hover:from-navy-800 hover:to-navy-700 shadow-md border border-gold-400/30 transition-all"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Add Guest</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Invited"
          value={stats.total}
          icon={UserCheck}
          description="Guest invites dispatched"
          variant="default"
        />
        <MetricCard
          title="Confirmed RSVPs"
          value={stats.confirmed}
          icon={CheckCircle2}
          description="Confirmed attendance"
          variant="gold"
        />
        <MetricCard
          title="Palace Arrivals"
          value={stats.attended}
          icon={Hotel}
          description="Checked in at palace concierge"
          variant="navy"
        />
        <MetricCard
          title="Awaiting RSVP"
          value={stats.pending}
          icon={Clock}
          description="Pending couple follow-up"
          variant="charcoal"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Select Wedding */}
          <div className="w-full sm:w-64">
            <select
              value={selectedWeddingId}
              onChange={(e) => {
                setSelectedWeddingId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            >
              {weddings.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.weddingCode} - {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* RSVP Filter */}
          <select
            value={rsvpFilter}
            onChange={(e) => {
              setRsvpFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
          >
            <option value="ALL">All RSVPs</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="DECLINED">Declined</option>
          </select>

          {/* Dietary Filter */}
          <select
            value={dietaryFilter}
            onChange={(e) => {
              setDietaryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
          >
            <option value="ALL">All Diets</option>
            <option value="VEG">Pure Veg</option>
            <option value="JAIN">Jain Special</option>
            <option value="NON_VEG">Non-Veg</option>
            <option value="VEGAN">Vegan</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, group, or phone..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
          />
        </div>
      </div>

      {/* Guests Table */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading guest registry...</div>
      ) : guests.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No Guests In Registry"
          description={search ? 'No guests match your search criteria.' : 'Import guest list via CSV or add individual invites.'}
          actionLabel="Add First Guest"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="bg-white rounded-2xl border border-gold-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-ivory-100/80 text-[11px] font-bold uppercase tracking-wider text-charcoal-500 border-b border-gold-200">
                  <th className="py-3 px-4">Guest Name</th>
                  <th className="py-3 px-4">Family / Group</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">RSVP Status</th>
                  <th className="py-3 px-4">Dietary</th>
                  <th className="py-3 px-4">Palace Suite</th>
                  <th className="py-3 px-4">Arrival Status</th>
                  <th className="py-3 px-4 text-right">Check-in Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 text-xs">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-ivory-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-charcoal-900">
                        {g.firstName} {g.lastName}
                        {g.plusGuests > 0 && (
                          <span className="ml-1 text-[10px] text-gold-700 font-bold bg-gold-100 px-1.5 py-0.5 rounded">
                            +{g.plusGuests}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-medium text-charcoal-700 bg-ivory-100 px-2 py-0.5 rounded-md border border-gold-200">
                        {g.guestGroup}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-charcoal-500 text-[11px]">
                      <div>{g.phone || '—'}</div>
                      <div className="text-[10px] text-charcoal-400">{g.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <StatusBadge status={g.rsvpStatus} />
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          g.dietaryPreference === 'JAIN'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : g.dietaryPreference === 'VEG'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : 'bg-charcoal-100 text-charcoal-700'
                        }`}
                      >
                        {g.dietaryPreference}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {g.roomNumber ? (
                        <div className="flex items-center gap-1.5 text-navy-900 font-semibold font-mono text-[11px]">
                          <Hotel className="w-3.5 h-3.5 text-gold-600" />
                          <span>{g.roomNumber}</span>
                        </div>
                      ) : (
                        <span className="text-charcoal-400 text-[11px]">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {g.arrivalStatus === 'ARRIVED' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Arrived</span>
                        </span>
                      ) : (
                        <span className="text-charcoal-400 text-[11px]">Not Arrived</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {g.arrivalStatus !== 'ARRIVED' ? (
                        <button
                          onClick={() => handleCheckIn(g.id)}
                          className="px-3 py-1 rounded-lg bg-navy-900 text-gold-200 text-[11px] font-bold hover:bg-navy-800 transition-colors shadow-sm"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-medium">Checked In</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="p-4 border-t border-charcoal-100 flex items-center justify-between text-xs text-charcoal-500">
            <div>
              Showing {guests.length} of {totalCount} registered guests
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-charcoal-200 hover:bg-charcoal-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-semibold text-charcoal-700">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-charcoal-200 hover:bg-charcoal-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Royal Guest"
        subtitle="Register guest invitation and hospitality accommodations"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateGuest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">First Name *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Vikram"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Last Name *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Singhania"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Guest Group / Family Side</label>
              <select
                value={guestGroup}
                onChange={(e) => setGuestGroup(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                <option value="Groom's Family">Groom's Family</option>
                <option value="Bride's Family">Bride's Family</option>
                <option value="VIP Royal Guests">VIP Royal Guests</option>
                <option value="Close Friends">Close Friends</option>
                <option value="International Guests">International Guests</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Dietary Preference</label>
              <select
                value={dietaryPreference}
                onChange={(e) => setDietaryPreference(e.target.value as DietaryPreference)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                <option value="VEG">Vegetarian</option>
                <option value="JAIN">Jain Strict</option>
                <option value="NON_VEG">Non-Vegetarian</option>
                <option value="VEGAN">Vegan</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98200 11223"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="guest@example.com"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Assigned Palace Suite / Room</label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => {
                  setRoomNumber(e.target.value);
                  setAccommodationAssigned(Boolean(e.target.value));
                }}
                placeholder="e.g. Suite 304 - Peacock Wing"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">RSVP Status</label>
              <select
                value={rsvpStatus}
                onChange={(e) => setRsvpStatus(e.target.value as RsvpStatus)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
              >
                <option value="CONFIRMED">Confirmed</option>
                <option value="PENDING">Pending</option>
                <option value="DECLINED">Declined</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-200 text-xs font-bold hover:bg-navy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Registering...' : 'Add Guest'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CSV Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Guests from CSV or Excel"
        subtitle="Upload a .csv or .xlsx file, or paste CSV text. Include First Name and Last Name columns."
        maxWidth="2xl"
      >
        <form onSubmit={handleImportCsv} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Upload guest list</label>
            <input
              ref={importFileRef}
              type="file"
              accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleImportFile}
              className="block w-full text-xs text-charcoal-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gold-500/10 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-gold-700 hover:file:bg-gold-500/20"
            />
            {selectedFileName && (
              <p className="mt-2 text-xs text-emerald-700">
                {selectedFileName} ready — {importRows?.length} guests found.
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-charcoal-700 mb-1">Or paste CSV content</label>
            <textarea
              rows={8}
              value={csvContent}
              onChange={(e) => {
                setCsvContent(e.target.value);
                setImportRows(null);
                setSelectedFileName('');
              }}
              placeholder={`Group,First Name,Last Name,Phone,Email,RSVP,Dietary,Room,Transportation\nGroom's Family,Rohan,Kapoor,+91 98200 11223,rohan@example.com,CONFIRMED,VEG,Suite 201,Yes\nBride's Family,Ananya,Singhania,+91 98200 44556,ananya@example.com,CONFIRMED,JAIN,Suite 202,No`}
              className="w-full p-3 font-mono text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-charcoal-100">
            <button
              type="button"
              onClick={() => setIsImportModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isImporting || (!csvContent.trim() && !importRows?.length)}
              className="px-5 py-2 rounded-xl bg-navy-900 text-gold-200 text-xs font-bold hover:bg-navy-800 transition-all shadow-md disabled:opacity-50"
            >
              {isImporting ? 'Importing Guests...' : 'Import Guests'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Guests;

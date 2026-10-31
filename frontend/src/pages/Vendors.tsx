import React, { useState, useEffect } from 'react';
import {
  Store,
  Plus,
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  CheckCircle2,
  Filter,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Vendor, VendorCategory } from '../types';
import { MetricCard } from '../components/MetricCard';
import { Modal } from '../components/Modal';
import { EmptyState } from '../components/EmptyState';
import { useAuth } from '../contexts/AuthContext';

export const Vendors: React.FC = () => {
  const { user } = useAuth();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<VendorCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [location, setLocation] = useState('Udaipur');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [rating, setRating] = useState('4.8');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchVendors();
    fetchCategories();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors');
      if (res.data.success) {
        setVendors(res.data.data.vendors);
      }
    } catch (err) {
      console.error('Failed to load vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get('/vendors/categories/list');
      if (res.data.success) {
        setCategories(res.data.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName || !contactPerson || !categoryId) return;

    try {
      setIsSubmitting(true);
      const res = await api.post('/vendors', {
        companyName,
        contactPerson,
        phone,
        email,
        categoryId,
        location,
        address,
        gstNumber,
        bankName,
        bankAccount,
        bankIfsc,
        rating: Number(rating) || 4.5,
        services: ['Luxury Wedding Execution', 'Heritage Hospitality'],
      });

      if (res.data.success) {
        setIsModalOpen(false);
        resetForm();
        fetchVendors();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to onboard vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCompanyName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setCategoryId('');
    setLocation('Udaipur');
    setAddress('');
    setGstNumber('');
    setBankName('');
    setBankAccount('');
    setBankIfsc('');
    setRating('4.8');
  };

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.companyName.toLowerCase().includes(search.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      (v.category?.name && v.category.name.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || v.categoryId === selectedCategory;
    const matchesCity = selectedCity === 'ALL' || v.location.toLowerCase().includes(selectedCity.toLowerCase());

    return matchesSearch && matchesCategory && matchesCity;
  });

  const canManageVendors = ['FOUNDER', 'PLANNER', 'FINANCE'].includes(user?.role || '');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <Store className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-burgundy-900">
              Luxury Vendor Directory
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Curated palace caterers, royal decorators, Rajasthani folk artists, sound & light technicians.
          </p>
        </div>

        {canManageVendors && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-burgundy-900 to-burgundy-800 text-gold-200 text-xs font-semibold hover:from-burgundy-800 hover:to-burgundy-700 shadow-md transition-all border border-gold-400/30"
          >
            <Plus className="w-4 h-4 text-gold-400" />
            <span>Onboard New Vendor</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Partners"
          value={vendors.length}
          icon={Store}
          description="Verified heritage vendors"
          variant="default"
        />
        <MetricCard
          title="Active Categories"
          value={categories.length}
          icon={Filter}
          description="Palace & heritage disciplines"
          variant="gold"
        />
        <MetricCard
          title="Avg Quality Score"
          value="4.9 ★"
          icon={Star}
          description="Excellence rating"
          variant="burgundy"
        />
        <MetricCard
          title="Key Destinations"
          value="Jaipur & Udaipur"
          icon={Sparkles}
          description="Rajasthan royal circuit"
          variant="charcoal"
        />
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gold-200/80 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vendor name, contact person, or category..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-charcoal-500 font-medium">Destination:</span>
            {['ALL', 'Udaipur', 'Jaipur', 'Jodhpur'].map((city) => (
              <button
                key={city}
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCity === city
                    ? 'bg-burgundy-900 text-gold-200 shadow-sm border border-gold-400/30'
                    : 'bg-ivory-100 text-charcoal-600 hover:bg-ivory-200'
                }`}
              >
                {city === 'ALL' ? 'All Cities' : city}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-charcoal-100">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-gold-500/20 text-gold-700 border border-gold-400/50'
                : 'text-charcoal-500 hover:bg-charcoal-100'
            }`}
          >
            All Categories ({vendors.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-gold-500/20 text-gold-700 border border-gold-400/50'
                  : 'text-charcoal-500 hover:bg-charcoal-100'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Grid */}
      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading vendor partners...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No Vendors Found"
          description={search ? 'No vendors match your search filters.' : 'Onboard your first luxury wedding vendor.'}
          actionLabel={canManageVendors ? 'Onboard Vendor' : undefined}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((vendor) => (
            <div
              key={vendor.id}
              className="bg-white rounded-2xl border border-gold-200/90 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gold-600 bg-gold-500/10 px-2 py-0.5 rounded-md border border-gold-400/20">
                      {vendor.category?.name || 'Partner'}
                    </span>
                    <h3 className="font-serif text-base font-bold text-burgundy-950 mt-1">
                      {vendor.companyName}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200 shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{Number(vendor.rating).toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-charcoal-600 pt-1">
                  <div className="flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                    <span className="font-medium">{vendor.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                    <span>{vendor.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                    <span className="truncate">{vendor.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-charcoal-400 shrink-0" />
                    <span>{vendor.location} {vendor.address ? `• ${vendor.address}` : ''}</span>
                  </div>
                </div>

                {/* Bank / Compliance Details */}
                <div className="p-2.5 rounded-xl bg-ivory-50 border border-charcoal-100 text-[11px] text-charcoal-500 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-gold-600" />
                    <span>Bank Account:</span>
                  </div>
                  <span className="font-mono font-medium text-charcoal-700">
                    {vendor.bankAccount || '•••• •••• •••• 5678'}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-charcoal-100 flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Available for Bookings</span>
                </span>
                <span className="text-[10px] text-charcoal-400 font-mono">
                  {vendor.gstNumber ? `GST: ${vendor.gstNumber}` : 'Verified Partner'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Onboard Vendor Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Onboard Luxury Vendor"
        subtitle="Add a new verified heritage vendor to The Royal Knot network"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Company / Brand Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Royal Rajputana Caterers"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Contact Person Name *</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Chef Mahendra Singh"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Vendor Discipline / Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="">Select Category...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">City / Region *</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              >
                <option value="Udaipur">Udaipur</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Jodhpur">Jodhpur</option>
                <option value="Rajasthan Circuit">Rajasthan Circuit</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98290 12345"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@royalcaterers.com"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="HDFC Bank"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">Account Number</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                placeholder="50200012345678"
                className="w-full px-3 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={bankIfsc}
                onChange={(e) => setBankIfsc(e.target.value)}
                placeholder="HDFC0001234"
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
              {isSubmitting ? 'Onboarding...' : 'Onboard Vendor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default Vendors;

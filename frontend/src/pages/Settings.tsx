import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Save,
  Building,
  Shield,
  Percent,
  Calendar,
  Globe,
  Database,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const Settings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form State
  const [agencyName, setAgencyName] = useState('The Royal Knot');
  const [agencyTagline, setAgencyTagline] = useState('Luxury Destination Wedding Planning');
  const [locations, setLocations] = useState('Jaipur, Udaipur');
  const [defaultGstRate, setDefaultGstRate] = useState('18');
  const [bookingDepositPercentage, setBookingDepositPercentage] = useState('25');
  const [advancePaymentPercentage, setAdvancePaymentPercentage] = useState('50');
  const [finalPaymentPercentage, setFinalPaymentPercentage] = useState('25');
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/settings');
      if (res.data.success && res.data.data.settings) {
        const s = res.data.data.settings;
        if (s.agencyName) setAgencyName(s.agencyName);
        if (s.agencyTagline) setAgencyTagline(s.agencyTagline);
        if (s.locations) setLocations(s.locations);
        if (s.defaultGstRate) setDefaultGstRate(s.defaultGstRate);
        if (s.bookingDepositPercentage) setBookingDepositPercentage(s.bookingDepositPercentage);
        if (s.advancePaymentPercentage) setAdvancePaymentPercentage(s.advancePaymentPercentage);
        if (s.finalPaymentPercentage) setFinalPaymentPercentage(s.finalPaymentPercentage);
        if (s.currency) setCurrency(s.currency);
        if (s.timezone) setTimezone(s.timezone);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.put('/settings', {
        agencyName,
        agencyTagline,
        locations,
        defaultGstRate,
        bookingDepositPercentage,
        advancePaymentPercentage,
        finalPaymentPercentage,
        currency,
        timezone,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  const canEdit = ['FOUNDER', 'ADMIN'].includes(user?.role || '');

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gold-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold-500/10 text-gold-600 border border-gold-500/20">
              <SettingsIcon className="w-5 h-5" />
            </span>
            <h1 className="font-serif text-2xl lg:text-3xl font-bold text-navy-900">
              System Configuration & Preferences
            </h1>
          </div>
          <p className="text-xs lg:text-sm text-charcoal-600 mt-1">
            Agency branding, default GST tax rates, staged milestone formulas, and database health.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully</span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-charcoal-400">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Agency Identity */}
          <div className="bg-white rounded-2xl p-6 border border-gold-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-charcoal-100">
              <Building className="w-4 h-4 text-gold-600" />
              <h2 className="font-serif text-base font-bold text-navy-950">
                Agency Brand Identity & Offices
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Brand Name
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800 disabled:bg-ivory-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Tagline / Descriptor
                </label>
                <input
                  type="text"
                  value={agencyTagline}
                  onChange={(e) => setAgencyTagline(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800 disabled:bg-ivory-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Active Circuit Destinations
                </label>
                <input
                  type="text"
                  value={locations}
                  onChange={(e) => setLocations(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800 disabled:bg-ivory-100"
                />
              </div>
            </div>
          </div>

          {/* Financial & Milestone Defaults */}
          <div className="bg-white rounded-2xl p-6 border border-gold-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-charcoal-100">
              <Percent className="w-4 h-4 text-gold-600" />
              <h2 className="font-serif text-base font-bold text-navy-950">
                Taxation & Staged Payment Defaults
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Default GST Rate (%)
                </label>
                <input
                  type="number"
                  value={defaultGstRate}
                  onChange={(e) => setDefaultGstRate(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800 disabled:bg-ivory-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Booking Retainer (%)
                </label>
                <input
                  type="number"
                  value={bookingDepositPercentage}
                  onChange={(e) => setBookingDepositPercentage(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800 disabled:bg-ivory-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  30-Day Advance (%)
                </label>
                <input
                  type="number"
                  value={advancePaymentPercentage}
                  onChange={(e) => setAdvancePaymentPercentage(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800 disabled:bg-ivory-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Final Settlement (%)
                </label>
                <input
                  type="number"
                  value={finalPaymentPercentage}
                  onChange={(e) => setFinalPaymentPercentage(e.target.value)}
                  disabled={!canEdit}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-charcoal-200 focus:outline-none focus:ring-2 focus:ring-navy-800 disabled:bg-ivory-100"
                />
              </div>
            </div>
          </div>

          {/* System & Architecture Status */}
          <div className="bg-white rounded-2xl p-6 border border-gold-200/90 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-charcoal-100">
              <Database className="w-4 h-4 text-gold-600" />
              <h2 className="font-serif text-base font-bold text-navy-950">
                System Infrastructure & Database
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-ivory-50 border border-charcoal-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">DATABASE</span>
                <p className="font-semibold text-charcoal-900">PostgreSQL 16 (Port 5435)</p>
                <p className="text-[10px] text-emerald-700 font-medium">39 Models Synchronized</p>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-50 border border-charcoal-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">REAL-TIME ENGINE</span>
                <p className="font-semibold text-charcoal-900">Socket.IO 4.8</p>
                <p className="text-[10px] text-emerald-700 font-medium">WebSocket & Polling</p>
              </div>

              <div className="p-3.5 rounded-xl bg-ivory-50 border border-charcoal-100 space-y-1">
                <span className="text-[10px] uppercase font-bold text-charcoal-400">DOCUMENTS ENGINE</span>
                <p className="font-semibold text-charcoal-900">PDFKit Generator</p>
                <p className="text-[10px] text-emerald-700 font-medium">Agreements, Invoices, Receipts</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          {canEdit && (
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-navy-900 text-gold-200 text-xs font-bold hover:bg-navy-800 transition-all shadow-md disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-gold-400" />
                <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
              </button>
            </div>
          )}
        </form>
      )}
    </div>
  );
};
export default Settings;

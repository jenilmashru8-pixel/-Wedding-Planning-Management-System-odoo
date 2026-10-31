import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Lock, Mail, ArrowRight, ShieldCheck, HeartHandshake } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('RoyalKnot@2026');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const demoRoles = [
    { role: 'Founder & Admin', email: 'founder@royalknot.com', desc: 'Full agency financials, all weddings, executive controls' },
    { role: 'Wedding Planner', email: 'priya.sharma@royalknot.com', desc: 'Assigned weddings, quotations, tasks, guest lists' },
    { role: 'Finance Manager', email: 'amit.verma@royalknot.com', desc: 'Client billing, vendor settlements, expense auditing' },
    { role: 'Field Coordinator', email: 'vikram.singh@royalknot.com', desc: 'Day-of live timeline, vendor check-in, incident triage' },
    { role: 'Client / Couple', email: 'aarav.kapoor@example.com', desc: 'Wedding workspace, sign agreements, approve extra expenses' },
    { role: 'Vendor Partner', email: 'royal.caterers@example.com', desc: 'Quotation submissions, booking specs, arrival confirmation' },
  ];

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('RoyalKnot@2026');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-burgundy-950 via-burgundy-900 to-charcoal-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Luxury Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-burgundy-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-200 p-0.5 shadow-gold-glow mb-4">
          <div className="w-full h-full bg-burgundy-950 rounded-[14px] flex items-center justify-center text-gold-300">
            <Crown className="w-8 h-8 text-gold-400" />
          </div>
        </div>
        <h2 className="font-serif text-3xl font-bold tracking-wider text-gold-200">THE ROYAL KNOT</h2>
        <p className="mt-1 text-xs uppercase tracking-widest text-gold-400/80 font-medium">
          Luxury Wedding Planning Management System • Jaipur & Udaipur
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-gold-300">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-in fade-in">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@royalknot.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-gold-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-charcoal-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-gold-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 focus:border-gold-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-burgundy-900 via-burgundy-800 to-burgundy-900 hover:from-burgundy-800 hover:to-burgundy-700 text-gold-200 hover:text-white font-serif font-bold text-sm tracking-wide rounded-xl shadow-lg border border-gold-500/40 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Management Portal'}</span>
              <ArrowRight className="w-4 h-4 text-gold-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* 1-Click Role Access Buttons */}
          <div className="mt-6 pt-6 border-t border-gold-200/80">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-burgundy-950 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-gold-600" />
              <span>1-Click Demo Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {demoRoles.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleSelectDemo(demo.email)}
                  className="p-2.5 text-left rounded-xl border border-gold-200/90 bg-gold-50/40 hover:bg-gold-100/70 hover:border-gold-400 transition-all"
                >
                  <p className="text-xs font-bold text-burgundy-900 truncate">{demo.role}</p>
                  <p className="text-[10px] text-charcoal-500 truncate">{demo.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

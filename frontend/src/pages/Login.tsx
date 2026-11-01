import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Lock, Mail, ArrowRight, ShieldCheck, MapPin, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    { role: 'Founder & Admin', email: 'founder@royalknot.com', desc: 'Full agency financials & executive controls' },
    { role: 'Wedding Planner', email: 'priya.sharma@royalknot.com', desc: 'Quotations, tasks, guest hospitality' },
    { role: 'Finance Manager', email: 'amit.verma@royalknot.com', desc: 'Client billing & vendor settlements' },
    { role: 'Field Coordinator', email: 'vikram.singh@royalknot.com', desc: 'Live timeline, check-in & incidents' },
    { role: 'Client (Couple)', email: 'aarav.kapoor@example.com', desc: 'Wedding workspace & approvals' },
    { role: 'Vendor Partner', email: 'royal.caterers@example.com', desc: 'Quotations & bookings' },
  ];

  const handleSelectDemo = (demoEmail: string) => {
    setEmail(demoEmail);
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col lg:flex-row relative overflow-hidden font-sans">
      {/* Left Hero Showcase with Real Palace Photo */}
      <div className="relative lg:w-7/12 min-h-[40vh] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 text-white overflow-hidden">
        {/* Background Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
          style={{ backgroundImage: `url('/images/udaipur_palace_night.jpg')` }}
        />
        {/* Luxury Vignette & Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/60 to-charcoal-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(20,5,10,0.7)_100%)]" />

        {/* Brand Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-navy-950/80 border border-gold-400/30 backdrop-blur-md shadow-2xl">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-gold-200 p-0.5 flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center text-gold-300">
                <Crown className="w-5 h-5 text-gold-400" />
              </div>
            </div>
            <div>
              <h1 className="font-serif text-lg font-bold tracking-wider text-gold-200 leading-none">THE ROYAL KNOT</h1>
              <p className="text-[9px] uppercase tracking-widest text-gold-400/90 font-medium mt-0.5">Jaipur & Udaipur Palace Weddings</p>
            </div>
          </div>
        </div>

        {/* Mid Hero Editorial Statement */}
        <div className="relative z-10 max-w-xl my-auto py-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-gold-500/20 text-gold-300 border border-gold-400/30 mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            <span>Rajasthan Heritage Circuit • Enterprise ERP</span>
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-ivory-50 tracking-tight leading-tight">
            Curating Royal Legacies in Majestic Palaces
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-ivory-200/90 leading-relaxed font-normal max-w-lg">
            A unified management platform for elite destination weddings. From competitive vendor matrixes and minute-by-minute live coordination to accrual profitability accounting.
          </p>

          {/* Floating Luxury Stats */}
          <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-gold-400/20">
            <div className="p-3 rounded-xl bg-navy-950/60 border border-gold-400/20 backdrop-blur-md">
              <div className="text-sm font-bold font-serif text-gold-300">Guest Hospitality</div>
              <div className="text-[10px] text-ivory-300 uppercase tracking-wider mt-0.5">From invitation to arrival</div>
            </div>
            <div className="p-3 rounded-xl bg-navy-950/60 border border-gold-400/20 backdrop-blur-md">
              <div className="text-sm font-bold font-serif text-gold-300">Heritage Partners</div>
              <div className="text-[10px] text-ivory-300 uppercase tracking-wider mt-0.5">A coordinated vendor network</div>
            </div>
            <div className="p-3 rounded-xl bg-navy-950/60 border border-gold-400/20 backdrop-blur-md">
              <div className="text-sm font-bold font-serif text-gold-300">One Workspace</div>
              <div className="text-[10px] text-ivory-300 uppercase tracking-wider mt-0.5">Planning through celebration</div>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="relative z-10 text-[11px] text-ivory-300/60 flex items-center justify-between">
          <span>City Palace • Jagmandir Island • Rambagh Palace</span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-gold-400" />
            <span>Udaipur, Rajasthan</span>
          </span>
        </div>
      </div>

      {/* Right Login Form & 1-Click Demo Accounts */}
      <div className="lg:w-5/12 bg-gradient-to-b from-navy-950 via-navy-900 to-charcoal-950 flex flex-col justify-center p-6 sm:p-10 lg:p-12 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-6">
          <div className="text-left space-y-1">
            <span className="text-[11px] uppercase font-bold tracking-widest text-gold-400">STAFF & CLIENT PORTAL</span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ivory-50 tracking-wide">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-ivory-300/80">
              Enter your credentials or choose a demo profile email.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gold-300/90">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium animate-fade-in">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="founder@royalknot.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-ivory-50 border border-gold-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-navy-900 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 bg-ivory-50 border border-gold-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-navy-800 focus:border-navy-900 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((shown) => !shown)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex items-center px-3 text-charcoal-500 hover:text-navy-800"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="-mt-2 flex items-center justify-between gap-3 text-xs">
                <Link to="/register" className="font-semibold text-navy-800 hover:text-gold-700">
                  Create account
                </Link>
                <Link to="/forgot-password" className="font-semibold text-navy-800 hover:text-gold-700">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 hover:from-navy-900 hover:to-navy-800 text-gold-200 font-bold text-xs sm:text-sm tracking-wider uppercase rounded-xl shadow-xl border border-gold-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>{isLoading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
                <ArrowRight className="w-4 h-4 text-gold-400" />
              </button>
            </form>

            {/* 1-Click Role Accounts */}
            <div className="mt-6 pt-5 border-t border-charcoal-100">
              <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-navy-950 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-gold-600" />
                <span>Demo Profile Emails</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoRoles.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => handleSelectDemo(demo.email)}
                    className="p-2.5 text-left rounded-xl border border-gold-200 bg-ivory-50 hover:bg-gold-50 hover:border-gold-400 transition-all group"
                  >
                    <p className="text-xs font-bold text-navy-950 truncate group-hover:text-gold-700">{demo.role}</p>
                    <p className="text-[10px] text-charcoal-500 truncate">{demo.email}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;

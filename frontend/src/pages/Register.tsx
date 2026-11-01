import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, Eye, EyeOff, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Register: React.FC = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await register(form);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory-50 px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-lg rounded-3xl border border-gold-200 bg-white p-7 shadow-luxury sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-xl bg-navy-900 p-3 text-gold-300"><Crown className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-700">The Royal Knot</p>
            <h1 className="font-serif text-2xl font-bold text-navy-950">Create account</h1>
          </div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-charcoal-800" htmlFor="firstName">First name</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gold-200 bg-ivory-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                  placeholder="Aarav"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-charcoal-800" htmlFor="lastName">Last name</label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gold-200 bg-ivory-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                  placeholder="Kapoor"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-charcoal-800" htmlFor="email">Email address</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gold-200 bg-ivory-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-charcoal-800" htmlFor="phone">Phone number</label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full rounded-xl border border-gold-200 bg-ivory-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-charcoal-800" htmlFor="password">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-gold-200 bg-ivory-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
                placeholder="Create a strong password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-charcoal-500 hover:text-navy-800"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl border border-gold-500/40 bg-navy-900 px-4 py-3 font-semibold text-gold-200 transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </section>
    </main>
  );
};

export default Register;

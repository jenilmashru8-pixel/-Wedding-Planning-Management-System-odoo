import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Crown, Eye, EyeOff, Lock } from 'lucide-react';
import { api } from '../services/api';

const isStrongPassword = (value: string): boolean =>
  value.length >= 12 &&
  value.length <= 128 &&
  /[a-z]/.test(value) &&
  /[A-Z]/.test(value) &&
  /[0-9]/.test(value) &&
  /[^A-Za-z0-9]/.test(value);

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!message) return undefined;
    const timer = window.setTimeout(() => navigate('/login', { replace: true }), 1800);
    return () => window.clearTimeout(timer);
  }, [message, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!token) {
      setError('This reset link is invalid or expired. Request a new link to continue.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError('Use 12-128 characters with an uppercase letter, lowercase letter, number, and special character.');
      return;
    }
    if (password !== confirmation) {
      setError('The passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/reset-password', { token, password });
      setMessage(response.data.message);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Unable to reset the password. Request a new reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-ivory-50 px-4 py-10 flex items-center justify-center">
      <section className="w-full max-w-md rounded-3xl border border-gold-200 bg-white p-7 shadow-luxury sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <div className="rounded-xl bg-navy-900 p-3 text-gold-300"><Crown className="h-5 w-5" /></div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold-700">The Royal Knot</p>
            <h1 className="font-serif text-2xl font-bold text-navy-950">Choose a new password</h1>
          </div>
        </div>
        <p className="mb-6 text-sm leading-6 text-charcoal-600">
          Create a strong password for your account. Reset links can only be used once and expire after 15 minutes.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-charcoal-800" htmlFor="new-password">New password</label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <input
              id="new-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gold-200 bg-ivory-50 py-3 pl-10 pr-12 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
            />
            <button type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-500 hover:text-navy-800">
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <label className="block text-sm font-semibold text-charcoal-800" htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className="w-full rounded-xl border border-gold-200 bg-ivory-50 px-4 py-3 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
          />
          {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || !token}
            className="w-full rounded-xl border border-gold-500/40 bg-navy-900 px-4 py-3 font-semibold text-gold-200 transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Updating password...' : 'Reset password'}
          </button>
        </form>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </section>
    </main>
  );
};

export default ResetPassword;

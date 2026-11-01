import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Crown, Mail } from 'lucide-react';
import { api } from '../services/api';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
    } catch (requestError: any) {
      setError(requestError.response?.data?.message || 'Unable to process the request right now. Please try again later.');
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
            <h1 className="font-serif text-2xl font-bold text-navy-950">Forgot password?</h1>
          </div>
        </div>
        <p className="mb-6 text-sm leading-6 text-charcoal-600">
          Enter your account email. If it belongs to an active account, we will process the request for a secure reset link that expires in 15 minutes. This page does not confirm email delivery.
        </p>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-charcoal-800" htmlFor="reset-email">Email address</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400" />
            <input
              id="reset-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gold-200 bg-ivory-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20"
              placeholder="you@example.com"
            />
          </div>
          {message && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl border border-gold-500/40 bg-navy-900 px-4 py-3 font-semibold text-gold-200 transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Processing...' : 'Send reset link'}
          </button>
        </form>
        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-navy-800 hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </Link>
      </section>
    </main>
  );
};

export default ForgotPassword;

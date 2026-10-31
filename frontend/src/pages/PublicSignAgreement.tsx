import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Crown,
  FileCheck2,
  CheckCircle2,
  Download,
  AlertCircle,
  ShieldCheck,
  Calendar,
  MapPin,
  Lock,
  PenTool,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api';
import { Agreement } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

export const PublicSignAgreement: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [agreement, setAgreement] = useState<Agreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Signing form state
  const [signerName, setSignerName] = useState('');
  const [signerEmail, setSignerEmail] = useState('');
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Signature canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    fetchAgreement();
  }, [id]);

  const fetchAgreement = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/agreements/${id}/public`);
      if (res.data.success) {
        setAgreement(res.data.data.agreement);
        if (res.data.data.agreement.client) {
          setSignerName(`${res.data.data.agreement.client.partner1Name} & ${res.data.data.agreement.client.partner2Name}`);
          setSignerEmail(res.data.data.agreement.client.email || '');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load agreement. The link may be expired or invalid.');
    } finally {
      setLoading(false);
    }
  };

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#722F37'; // Royal Burgundy signature ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentChecked || !signerName.trim() || !signerEmail.trim()) {
      alert('Please fill in your legal name, email, and accept the agreement terms.');
      return;
    }

    let signatureImage = '';
    if (canvasRef.current && hasDrawn) {
      signatureImage = canvasRef.current.toDataURL('image/png');
    }

    try {
      setIsSubmitting(true);
      const res = await api.post(`/agreements/${id}/sign`, {
        signerName,
        signerEmail,
        signatureImage,
      });

      if (res.data.success) {
        setIsSuccess(true);
        fetchAgreement();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Signing failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Crown className="w-10 h-10 text-gold-500 animate-bounce mx-auto" />
          <p className="text-sm font-serif text-burgundy-900 font-semibold tracking-wide">
            Retrieving Official Agreement...
          </p>
        </div>
      </div>
    );
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-ivory-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="font-serif text-xl font-bold text-charcoal-900">Agreement Link Unavailable</h2>
          <p className="text-xs text-charcoal-600">{error || 'This agreement could not be retrieved.'}</p>
        </div>
      </div>
    );
  }

  const isAlreadySigned = agreement.status === 'SIGNED';

  return (
    <div className="min-h-screen bg-gradient-to-b from-ivory-100 via-ivory-50 to-ivory-200 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Ceremonial Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-burgundy-900/10 border border-gold-500/30 text-burgundy-950 text-xs font-semibold">
            <Crown className="w-4 h-4 text-gold-600" />
            <span>THE ROYAL KNOT • JAIPUR & UDAIPUR</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-burgundy-950 tracking-tight">
            Luxury Wedding Planning Agreement
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 max-w-xl mx-auto">
            Official digital contract and scope of royal services for{' '}
            <span className="font-semibold text-burgundy-900">{agreement.wedding?.name}</span>.
          </p>
        </div>

        {/* Status Callout if already signed */}
        {(isAlreadySigned || isSuccess) && (
          <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-md">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-emerald-950">
                  Agreement Legally Executed & Immutable
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Signed by <span className="font-semibold">{agreement.signerName}</span> on{' '}
                  {agreement.signedAt ? formatDate(agreement.signedAt) : 'Recently'} (IP: {agreement.signerIp || 'Verified'})
                </p>
              </div>
            </div>

            <a
              href={`/api/agreements/${agreement.id}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Signed PDF</span>
            </a>
          </div>
        )}

        {/* Contract Parchment Card */}
        <div className="bg-white rounded-3xl border border-gold-300 shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gold-500/30">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">
                OFFICIAL CONTRACT REF
              </span>
              <h2 className="font-mono text-xl font-bold text-gold-200 mt-0.5">{agreement.agreementNumber}</h2>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400">CONTRACT AMOUNT</span>
              <div className="text-2xl font-bold text-gold-200 font-serif">
                {formatCurrency(agreement.totalAmount)}
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            {/* Wedding Overview Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5 rounded-2xl bg-ivory-50 border border-gold-200">
              <div className="flex items-start gap-3">
                <Crown className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">Couple</p>
                  <p className="text-xs font-semibold text-charcoal-900 mt-0.5">
                    {agreement.client ? `${agreement.client.partner1Name} & ${agreement.client.partner2Name}` : 'Couple'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">Destination</p>
                  <p className="text-xs font-semibold text-charcoal-900 mt-0.5">
                    {agreement.wedding?.location} {agreement.wedding?.venueName ? `• ${agreement.wedding?.venueName}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gold-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-charcoal-400 tracking-wider">Celebration Dates</p>
                  <p className="text-xs font-semibold text-charcoal-900 mt-0.5">
                    {agreement.wedding?.startDate ? formatDate(agreement.wedding.startDate) : 'TBD'} to{' '}
                    {agreement.wedding?.endDate ? formatDate(agreement.wedding.endDate) : 'TBD'}
                  </p>
                </div>
              </div>
            </div>

            {/* Scope of Services */}
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-burgundy-950 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gold-600" />
                <span>Scope of Luxury Planning & Execution</span>
              </h3>
              <div className="p-4 rounded-xl bg-ivory-50/60 border border-charcoal-200 text-xs text-charcoal-700 leading-relaxed whitespace-pre-line font-sans">
                {agreement.scopeOfServices}
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <h3 className="font-serif text-base font-bold text-burgundy-950 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold-600" />
                <span>Staged Milestones & Terms of Engagement</span>
              </h3>
              <div className="p-4 rounded-xl bg-ivory-50/60 border border-charcoal-200 text-xs text-charcoal-700 leading-relaxed whitespace-pre-line font-sans">
                {agreement.termsAndConditions}
              </div>
            </div>

            {/* Digital Signature Execution Section */}
            {!isAlreadySigned && !isSuccess ? (
              <form onSubmit={handleSign} className="space-y-6 pt-6 border-t border-gold-200">
                <div className="space-y-1">
                  <h3 className="font-serif text-lg font-bold text-burgundy-950">
                    Digital Signature Execution
                  </h3>
                  <p className="text-xs text-charcoal-500">
                    Please provide your legal signature and affirmation below. Once submitted, this document is locked and legally binding.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Full Legal Signer Name *
                    </label>
                    <input
                      type="text"
                      value={signerName}
                      onChange={(e) => setSignerName(e.target.value)}
                      required
                      placeholder="e.g. Aarav Kapoor & Meera Singhania"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-300 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-charcoal-700 mb-1">
                      Signer Email Address *
                    </label>
                    <input
                      type="email"
                      value={signerEmail}
                      onChange={(e) => setSignerEmail(e.target.value)}
                      required
                      placeholder="e.g. aarav.kapoor@example.com"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-charcoal-300 focus:outline-none focus:ring-2 focus:ring-burgundy-800"
                    />
                  </div>
                </div>

                {/* Signature Pad */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-charcoal-700 flex items-center gap-1.5">
                      <PenTool className="w-3.5 h-3.5 text-burgundy-900" />
                      <span>Draw Digital Signature (Mouse / Stylus / Touch)</span>
                    </label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-charcoal-500 hover:text-burgundy-900 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Clear Pad</span>
                    </button>
                  </div>

                  <div className="border-2 border-dashed border-gold-400 rounded-2xl p-2 bg-ivory-50 flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="bg-white rounded-xl shadow-inner cursor-crosshair max-w-full"
                    />
                  </div>
                  <p className="text-[10px] text-charcoal-400 text-center">
                    Signing as an authorized legal party. Canvas signature will be embedded onto the archival PDF.
                  </p>
                </div>

                {/* Legal Consent Checkbox */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-gold-500/10 border border-gold-400/40">
                  <input
                    type="checkbox"
                    id="consent"
                    checked={consentChecked}
                    onChange={(e) => setConsentChecked(e.target.checked)}
                    className="mt-0.5 rounded text-burgundy-900 focus:ring-burgundy-800"
                  />
                  <label htmlFor="consent" className="text-xs text-charcoal-700 leading-normal cursor-pointer">
                    I confirm that I am legally authorized to execute this agreement. I have reviewed the scope of services, payment schedule, and terms, and agree to be bound by them digitally pursuant to the Information Technology Act.
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isSubmitting || !consentChecked}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-950 text-gold-200 font-bold text-sm tracking-wider uppercase shadow-xl hover:from-burgundy-900 hover:to-burgundy-800 transition-all border border-gold-400/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <FileCheck2 className="w-5 h-5 text-gold-400" />
                  <span>{isSubmitting ? 'Authenticating & Signing...' : 'Digitally Execute Agreement'}</span>
                </button>
              </form>
            ) : (
              <div className="pt-6 border-t border-gold-200 text-center space-y-4">
                <div className="inline-block p-4 rounded-full bg-emerald-100 text-emerald-800 mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="font-serif text-lg font-bold text-burgundy-950">
                  Official Verification Complete
                </h4>
                <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                  This luxury wedding contract has been verified and permanently stored with timestamped electronic audit trails.
                </p>
                <div className="pt-2">
                  <a
                    href={`/api/agreements/${agreement.id}/pdf`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-burgundy-900 text-gold-200 text-xs font-bold shadow-lg hover:bg-burgundy-800 transition-all border border-gold-400/30"
                  >
                    <Download className="w-4 h-4 text-gold-400" />
                    <span>Download Signed Official Document</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-charcoal-400">
          The Royal Knot Luxury Weddings • Jaipur: Narain Niwas Palace • Udaipur: City Palace Road • Certified ISO 9001
        </div>
      </div>
    </div>
  );
};
export default PublicSignAgreement;

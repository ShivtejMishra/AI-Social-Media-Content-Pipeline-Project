import { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MailWarning, X, RefreshCw, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import axios from '../../services/apiClient';

/* ─── OTP Modal ──────────────────────────────────────────────────────────── */
const OtpModal = ({ onClose, onVerified }) => {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef([]);
  const focusAt = (i) => inputRefs.current[i]?.focus();

  const verifyMutation = useMutation({
    mutationFn: (otp) => axios.post('/auth/verify-otp', { otp }),
    onSuccess: () => {
      toast.success('Email verified! 🎉');
      onVerified();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Invalid code'),
  });

  const resendMutation = useMutation({
    mutationFn: () => axios.post('/auth/send-verification'),
    onSuccess: () => {
      toast.success('New code sent! Check your inbox 📧');
      setDigits(['', '', '', '', '', '']);
      focusAt(0);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to resend'),
  });

  const handleChange = (i, val) => {
    // Only accept digits
    const digit = val.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = digit;
    setDigits(next);
    // Auto-advance
    if (digit && i < 5) inputRefs.current[i + 1]?.focus();
    // Auto-submit when all filled
    if (digit && i === 5) {
      const otp = [...next].join('');
      if (otp.length === 6) verifyMutation.mutate(otp);
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const otp = digits.join('');
      if (otp.length === 6) verifyMutation.mutate(otp);
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((d, i) => { if (i < 6) next[i] = d; });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) verifyMutation.mutate(pasted);
    e.preventDefault();
  };

  const otp = digits.join('');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 w-full max-w-sm animate-fadeIn">

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-1">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Verify your email</h3>
        <p className="text-slate-500 text-sm mb-6">
          Enter the 6-digit code sent to your email address. The code expires in 15 minutes.
        </p>

        {/* OTP inputs */}
        <div className="flex gap-2 justify-center mb-5" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoFocus={i === 0}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`w-11 h-12 text-center text-xl font-bold rounded-xl border-2 transition-all outline-none
                bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white
                ${d
                  ? 'border-indigo-500 dark:border-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-400'
                }
                ${verifyMutation.isPending ? 'opacity-60 pointer-events-none' : ''}
              `}
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={() => verifyMutation.mutate(otp)}
          disabled={otp.length < 6 || verifyMutation.isPending}
          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {verifyMutation.isPending
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Verifying…</>
            : <><ShieldCheck className="w-4 h-4" /> Verify Email</>
          }
        </button>

        {/* Resend */}
        <p className="text-center text-xs text-slate-500 mt-4">
          Didn't receive it?{' '}
          <button
            onClick={() => resendMutation.mutate()}
            disabled={resendMutation.isPending}
            className="text-indigo-400 hover:text-indigo-300 font-medium disabled:opacity-60"
          >
            {resendMutation.isPending ? 'Sending…' : 'Resend code'}
          </button>
        </p>
      </div>
    </div>
  );
};

/* ─── Banner ─────────────────────────────────────────────────────────────── */
const EmailVerificationBanner = () => {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const handleVerified = () => {
    // Update local user state so banner disappears immediately
    setUser({ ...user, isEmailVerified: true });
    queryClient.invalidateQueries({ queryKey: ['me'] });
    setShowModal(false);
    setDismissed(true);
  };

  if (!user || user.isEmailVerified || dismissed) return null;

  return (
    <>
      <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-2.5">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <MailWarning className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-xs sm:text-sm font-medium truncate">
              Please verify your email to unlock all features.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Enter Code</span>
              <span className="sm:hidden">Verify</span>
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 rounded-lg hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <OtpModal
          onClose={() => setShowModal(false)}
          onVerified={handleVerified}
        />
      )}
    </>
  );
};

export default EmailVerificationBanner;

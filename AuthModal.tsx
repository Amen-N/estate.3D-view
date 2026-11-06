import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User as UserIcon, Phone, AlertCircle, Crown } from 'lucide-react';
import { UserRole } from '../../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authMode, setAuthMode, login, register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (authMode === 'login') {
        await login({ email, password });
      } else {
        await register({
          email,
          password,
          full_name: fullName,
          phone_number: phoneNumber || undefined,
          role,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="auth-modal"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="w-full sm:max-w-md bg-[#0b0f19] border border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-auto flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Subtle Silver Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-white/05 bg-slate-900/40">
          <button
            data-testid="auth-modal-close"
            onClick={closeAuthModal}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/05 transition touch-target flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <Crown className="w-4 h-4 text-slate-400" />
            <span className="text-[10px] font-mono font-medium tracking-widest uppercase">EstateView Concierge</span>
          </div>

          <h2 id="auth-modal-title" className="text-xl font-display font-semibold text-white tracking-tight">
            {authMode === 'login' ? 'Private Client Access' : 'Create VIP Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authMode === 'login'
              ? 'Access 360° virtual spaces, saved residences, and schedule private viewings.'
              : 'Join to reserve in-person viewings and unlock full 3D architectural models.'}
          </p>

          {/* Mode Switcher Tabs */}
          <div className="flex p-1 mt-4 bg-[#030712] rounded-xl border border-slate-800">
            <button
              type="button"
              data-testid="auth-tab-login"
              onClick={() => {
                setAuthMode('login');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition touch-target flex items-center justify-center ${
                authMode === 'login'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              data-testid="auth-tab-register"
              onClick={() => {
                setAuthMode('register');
                setError(null);
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition touch-target flex items-center justify-center ${
                authMode === 'register'
                  ? 'bg-white text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-red-200 text-sm">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'register' && (
            <>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    data-testid="auth-fullname-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Lord Sterling"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition text-sm touch-target"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Direct Phone (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    data-testid="auth-phone-input"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition text-sm touch-target"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                  Membership Role
                </label>
                <select
                  data-testid="auth-role-select"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition text-sm touch-target"
                >
                  <option value="buyer">Private Buyer / Explorer</option>
                  <option value="agent">Licensed Listing Broker</option>
                  <option value="admin">Platform Super-Administrator</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                data-testid="auth-email-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="client@estateview.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition text-sm touch-target"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Confidential Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                data-testid="auth-password-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition text-sm touch-target"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            data-testid="auth-submit-btn"
            className="shimmer-gold-btn w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-950 font-semibold rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center justify-center gap-2 mt-2"
          >
            {isSubmitting ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-slate-950 border-t-transparent" />
            ) : null}
            <span>{authMode === 'login' ? 'Authenticate & Enter' : 'Complete VIP Registration'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};

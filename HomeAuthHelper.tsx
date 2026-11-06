import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Crown,
  KeyRound,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  Compass,
  Calendar,
  Layers,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { UserRole } from '../../types';

export const HomeAuthHelper: React.FC = () => {
  const { isAuthenticated, user, login, register, logout, openAuthModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'register' | 'login' | 'quick-test'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await register({
        email,
        password,
        full_name: fullName,
        phone_number: phoneNumber || undefined,
        role,
      });
      setSuccessMessage('Welcome! Your VIP account has been created and authenticated.');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email, password });
      setSuccessMessage('Authentication successful! Welcome back.');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await login({ email: demoEmail, password: demoPass });
      setSuccessMessage(`Authenticated as ${demoEmail}`);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with demo credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already authenticated, show the VIP Member Concierge Lounge card
  if (isAuthenticated && user) {
    return (
      <div
        data-testid="home-auth-authenticated-banner"
        className="w-full max-w-5xl mx-auto my-8 p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#0f172a] to-[#0b0f19] border border-white/10 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white text-xl font-bold font-display shadow-sm">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-slate-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>VIP Client Session Active</span>
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-200 border border-slate-700">
                  {user.role}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-white mt-0.5">
                Welcome back, {user.full_name}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {user.email} • Full 360° Showrooms & GiST Temporal Tours Unlocked
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <a
              href="/properties/luxury-penthouse"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition flex items-center gap-2 shadow-sm"
            >
              <Compass className="w-4 h-4 text-slate-950" />
              <span>360° Showroom</span>
            </a>

            <a
              href="#tours"
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-semibold text-xs transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Private Appointments</span>
            </a>

            {user.role === 'admin' && (
              <a
                href="/admin/dashboard"
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs transition flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Command Center</span>
              </a>
            )}

            <button
              type="button"
              data-testid="home-auth-logout-btn"
              onClick={logout}
              className="px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-slate-800 transition text-xs font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      data-testid="home-auth-helper"
      className="w-full max-w-5xl mx-auto my-10 p-6 sm:p-8 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl relative overflow-hidden"
    >
      {/* Subtle silver top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/08">
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono font-medium uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4 text-slate-400" />
            <span>EstateView Concierge Onboarding</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-semibold text-white tracking-tight">
            Register for VIP Access or Sign In
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            Create your account to unlock interactive 360° room walkthroughs, reserve guaranteed conflict-free viewing times, and access exclusive architectural models.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex p-1 bg-[#030712] rounded-xl border border-slate-800 shrink-0 self-start md:self-auto">
          <button
            type="button"
            data-testid="home-auth-tab-register"
            onClick={() => {
              setActiveTab('register');
              setError(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>

          <button
            type="button"
            data-testid="home-auth-tab-login"
            onClick={() => {
              setActiveTab('login');
              setError(null);
            }}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            data-testid="home-auth-tab-quick"
            onClick={() => {
              setActiveTab('quick-test');
              setError(null);
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'quick-test'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Click Test</span>
          </button>
        </div>
      </div>

      {/* Error or Success Notice */}
      {error && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-red-200 text-xs">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {successMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-start gap-2.5 text-emerald-200 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Tab 1: Direct VIP Registration */}
      {activeTab === 'register' && (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Benefits Column */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 font-mono">
              Membership Privileges
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#030712] border border-slate-800">
                <div className="p-2 rounded-lg bg-slate-800 text-slate-300 shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-medium">360° Virtual Showroom Access</strong>
                  <span className="text-slate-400 mt-0.5 block leading-relaxed">
                    Walk through multi-room penthouses with spherical camera rotation and feature hotspots.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#030712] border border-slate-800">
                <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-medium">GiST Temporal Booking Guarantee</strong>
                  <span className="text-slate-400 mt-0.5 block leading-relaxed">
                    Self-service appointments with conflict-free slot exclusion and instant .ics calendar exports.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-[#030712] border border-slate-800">
                <div className="p-2 rounded-lg bg-slate-800 text-sky-400 shrink-0">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <strong className="text-white block font-medium">Architectural Specification & CAD</strong>
                  <span className="text-slate-400 mt-0.5 block leading-relaxed">
                    Inspect finish materials, chevron oak flooring, and custom marble upgrade pricing in real time.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form Column */}
          <form onSubmit={handleRegister} className="lg:col-span-7 space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    data-testid="home-register-name-input"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Lord Sterling"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Membership Role
                </label>
                <select
                  value={role}
                  data-testid="home-register-role-select"
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-white/30 text-xs"
                >
                  <option value="buyer">Private Buyer / Explorer</option>
                  <option value="agent">Licensed Listing Broker</option>
                  <option value="admin">Platform Super-Administrator</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    data-testid="home-register-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="client@estateview.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    data-testid="home-register-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Direct Contact Phone (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+251 91 123 4567"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="home-register-submit-btn"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent" />
                ) : null}
                <span>Complete Registration & Enter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('register')}
                className="text-xs text-slate-400 hover:text-white transition font-mono underline underline-offset-4"
              >
                Or open modal dialog
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Direct Client Sign In */}
      {activeTab === 'login' && (
        <div className="mt-6 max-w-xl mx-auto space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Registered Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  data-testid="home-login-email-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@estateview.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 font-mono">
                Confidential Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  data-testid="home-login-password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-[#030712] border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                data-testid="home-login-submit-btn"
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-950 border-t-transparent" />
                ) : null}
                <span>Sign In & Enter Portfolio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => openAuthModal('login')}
                className="text-xs text-slate-400 hover:text-white transition font-mono underline underline-offset-4"
              >
                Or open sign-in dialog
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Fast 1-Click Sandbox Test Accounts */}
      {activeTab === 'quick-test' && (
        <div className="mt-6 space-y-4">
          <div className="text-center max-w-md mx-auto">
            <h4 className="text-sm font-semibold text-white">Instant Sandbox Authenticator</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Select any pre-configured platform role below to authenticate instantly with 1-click:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Buyer Demo */}
            <div className="p-4 rounded-xl bg-[#030712] border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 border border-sky-500/20">
                    Buyer Role
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Explorer</span>
                </div>
                <h5 className="text-sm font-semibold text-white">VIP Private Buyer</h5>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  buyer@example.com
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Book conflict-free tours, inspect 360 virtual spaces, and explore penthouse suites.
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                data-testid="home-sandbox-buyer-btn"
                onClick={() => handleQuickLogin('buyer@example.com', 'Password123!')}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-sky-400" />
                <span>Sign In as Buyer</span>
              </button>
            </div>

            {/* Admin Demo */}
            <div className="p-4 rounded-xl bg-[#030712] border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    Admin Role
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Executive</span>
                </div>
                <h5 className="text-sm font-semibold text-white">Super-Administrator</h5>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  admin@example.com
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Access Command Center, Audit Logs, and click-to-pin 360 Visual Hotspot Studio.
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                data-testid="home-sandbox-admin-btn"
                onClick={() => handleQuickLogin('admin@example.com', 'AdminSecret123!')}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In as Admin</span>
              </button>
            </div>

            {/* Broker Demo */}
            <div className="p-4 rounded-xl bg-[#030712] border border-slate-800 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Broker Role
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Licensed</span>
                </div>
                <h5 className="text-sm font-semibold text-white">Listing Broker</h5>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  agent@example.com
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Manage assigned buyer viewing schedules and review property portfolios.
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                data-testid="home-sandbox-agent-btn"
                onClick={() => handleQuickLogin('agent@example.com', 'Password123!')}
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sign In as Broker</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

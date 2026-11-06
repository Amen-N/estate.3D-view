import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ThemeSelector } from '../theme/ThemeSelector';
import { Compass, Calendar, Menu, X, LogOut, Building2, Crown } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0f19]/95 border-b border-slate-800/80 backdrop-blur-xl transition-all shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-slate-100 shadow-sm group-hover:border-slate-500 transition-colors">
                <Building2 className="w-5 h-5 text-slate-200" />
              </div>
              <div>
                <span className="text-lg font-display font-bold tracking-tight text-white flex items-center gap-2">
                  <span>EstateView</span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    3D Spatial
                  </span>
                </span>
                <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-slate-400 block -mt-0.5">
                  Architectural Real Estate Platform
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 lg:gap-2">
            <a
              href="/"
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition"
            >
              Curated Residences
            </a>
            <a
              href="/properties/luxury-penthouse"
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5 group"
            >
              <Compass className="w-4 h-4 text-slate-400 group-hover:text-sky-400 transition-colors" />
              <span>360° Showroom</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] font-mono border border-slate-700">
                Interactive
              </span>
            </a>
            <a
              href="#tours"
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Private Appointments</span>
            </a>
            {user?.role === 'admin' && (
              <a
                href="/admin/dashboard"
                className="px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 text-amber-300" />
                <span>Command Center</span>
              </a>
            )}
          </nav>

          {/* Desktop Right Side Auth Controls & Theme Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeSelector />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-2.5">
                <div
                  {...(!mobileMenuOpen ? { 'data-testid': 'user-profile-avatar' } : {})}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 shadow-sm"
                >
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 text-xs font-semibold uppercase">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <div className="text-left pr-1">
                    <span data-testid="user-name-display" className="text-xs font-semibold text-white block leading-tight">
                      {user.full_name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  data-testid="nav-logout-btn"
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition border border-transparent hover:border-red-500/20"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  {...(!mobileMenuOpen ? { 'data-testid': 'nav-login-btn' } : {})}
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition border border-slate-800 hover:border-slate-700"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal('register')}
                  className="shimmer-gold-btn px-4 py-2 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <span>Request Portfolio</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center">
            <button
              type="button"
              data-testid="mobile-menu-button"
              onClick={toggleMobileMenu}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition touch-target flex items-center justify-center border border-slate-800"
              aria-label="Open navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0b0f19] px-5 pt-4 pb-7 space-y-4 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400 font-mono">Theme Ambience</span>
            <ThemeSelector compact />
          </div>

          <nav className="space-y-1.5">
            <a
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/80 hover:text-white touch-target transition"
            >
              Curated Residences
            </a>
            <a
              href="/properties/luxury-penthouse"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/80 hover:text-white touch-target transition flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-slate-400" />
                <span>360° Virtual Showroom</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                Interactive
              </span>
            </a>
            <a
              href="#tours"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800/80 hover:text-white touch-target transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Private Appointments</span>
            </a>
            {user?.role === 'admin' && (
              <a
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3.5 py-2.5 rounded-lg text-sm font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 touch-target transition flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-amber-300" />
                <span>Command Center</span>
              </a>
            )}
          </nav>

          <div className="pt-4 border-t border-slate-800">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div
                  data-testid="user-profile-avatar"
                  className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800"
                >
                  <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-semibold text-xs">
                    {user.full_name ? user.full_name.charAt(0) : 'U'}
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">{user.full_name}</span>
                    <span className="text-xs text-slate-400 block font-mono">{user.email}</span>
                  </div>
                </div>

                <button
                  type="button"
                  data-testid="nav-logout-btn"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg text-red-400 hover:bg-red-950/30 border border-red-900/30 text-xs font-semibold transition touch-target flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="nav-login-btn"
                  onClick={() => {
                    openAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold transition touch-target flex items-center justify-center"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    openAuthModal('register');
                    setMobileMenuOpen(false);
                  }}
                  className="shimmer-gold-btn w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition touch-target flex items-center justify-center shadow-sm"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

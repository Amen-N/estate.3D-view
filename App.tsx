import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/navbar/Navbar';
import { AuthModal } from './components/auth/AuthModal';
import { PropertyDirectory } from './components/properties/PropertyDirectory';
import { TourBookingModal } from './components/tours/TourBookingModal';
import { ShowroomModal } from './components/showroom/ShowroomModal';
import { VisualHotspotStudio } from './components/admin/VisualHotspotStudio';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HomeAuthHelper } from './components/home/HomeAuthHelper';
import { Property } from './types';
import { fetchPropertiesApi } from './services/api';
import {
  Compass,
  Calendar,
  MapPin,
  ArrowRight,
  Sparkles,
  Bed,
  Bath,
  Maximize2,
  Shield,
  Layers,
  CheckCircle2,
  Building,
  KeyRound,
  ArrowLeft,
  ChevronRight,
  Award,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { openAuthModal, isAuthenticated, user } = useAuth();

  const [propertySlug] = useState<string | null>(() => {
    const path = window.location.pathname;
    const match = path.match(/^\/properties\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  });

  const [detailProperty, setDetailProperty] = useState<Property | null>(() => {
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    if (path.includes('luxury-penthouse')) {
      return {
        id: '1960307d-4c97-49eb-bc7c-c0e12f165adc',
        agent_id: '3384401c-4166-494e-9c44-61e7284e883c',
        title: 'Luxury Penthouse with Skyline Views',
        slug: 'luxury-penthouse',
        description:
          'Prestigious penthouse featuring full glass panoramas, private elevator access, Italian Calacatta marble bathrooms, dual terraces, and Lutron smart home automation.',
        price: 650000,
        property_type: 'penthouse',
        status: 'published',
        bedrooms: 3,
        bathrooms: 3,
        area_sqft: 3200,
        address: 'Bole Subcity Luxury Tower, 18th Floor',
        city: 'Addis Ababa',
        has_virtual_showroom: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return null;
  });

  const [isTourModalOpen, setIsTourModalOpen] = useState(false);
  const [isShowroomModalOpen, setIsShowroomModalOpen] = useState(false);
  const [selectedShowroomProperty, setSelectedShowroomProperty] = useState<Property | null>(null);

  useEffect(() => {
    if (propertySlug) {
      fetchPropertiesApi()
        .then((res) => {
          const match =
            res.items.find((p) => p.slug === propertySlug) ||
            res.items.find((p) => p.slug.includes(propertySlug)) ||
            res.items[0];
          if (match) {
            setDetailProperty(match);
          }
        })
        .catch(() => {});
    }
  }, [propertySlug]);

  const handleScheduleTourClick = () => {
    if (!isAuthenticated) {
      openAuthModal('login', () => {
        setIsTourModalOpen(true);
      });
    } else {
      setIsTourModalOpen(true);
    }
  };

  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
  const isHomePage = currentPath === '/' || currentPath === '' || currentPath.startsWith('/#');
  const adminStudioMatch = currentPath.match(/^\/admin\/properties\/([a-zA-Z0-9_-]+)\/showroom-studio/);
  const adminStudioSlug = adminStudioMatch ? adminStudioMatch[1] : null;
  const isAdminDashboard = currentPath === '/admin' || currentPath === '/admin/dashboard';

  useEffect(() => {
    if (window.location.pathname === '/login' && !isAuthenticated) {
      openAuthModal('login');
    }
  }, [isAuthenticated, openAuthModal]);

  if (adminStudioSlug) {
    return (
      <>
        <VisualHotspotStudio
          propertySlug={adminStudioSlug}
          onBackToDashboard={() => {
            window.location.href = '/admin/dashboard';
          }}
        />
        <AuthModal />
      </>
    );
  }

  if (isAdminDashboard) {
    return (
      <>
        <AdminDashboard
          onOpenStudio={(slug) => {
            window.location.href = `/admin/properties/${slug}/showroom-studio`;
          }}
        />
        <AuthModal />
      </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f19] text-slate-100 selection:bg-slate-700 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* Dedicated Property Detail Showcase if navigating to /properties/:slug */}
        {propertySlug && detailProperty && (
          <section className="relative overflow-hidden pt-8 pb-16 border-b border-slate-800/80 bg-[#0b0f19]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              {/* Back breadcrumb */}
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 mb-6">
                <a href="/" className="hover:text-white transition flex items-center gap-1">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Residences</span>
                </a>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-200 truncate max-w-xs">{detailProperty.title}</span>
              </div>

              {/* Main Showcase Hero Container */}
              <div className="rounded-2xl p-6 sm:p-10 border border-slate-800 bg-[#0f172a]/80 shadow-xl relative overflow-hidden">
                <div className="flex flex-col lg:flex-row items-start justify-between gap-10 relative z-10">
                  {/* Left Column: Details & Specs */}
                  <div className="max-w-2xl">
                    <div className="flex flex-wrap items-center gap-2.5 mb-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        <span>Curated Residence</span>
                      </span>

                      <span className="px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/50 text-emerald-400 text-xs font-mono font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Spatial Verified</span>
                      </span>

                      <span className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono uppercase">
                        {detailProperty.property_type}
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight leading-tight">
                      {detailProperty.title}
                    </h1>

                    <div className="mt-3 flex items-center gap-2 text-slate-400 text-sm sm:text-base">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-medium">
                        {detailProperty.address}, {detailProperty.city}
                      </span>
                    </div>

                    <p className="mt-5 text-slate-300 text-sm sm:text-base leading-relaxed">
                      {detailProperty.description}
                    </p>

                    {/* Specs Grid */}
                    <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
                      <div className="p-4 rounded-xl border border-slate-800/90 text-center bg-slate-900/60">
                        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 font-mono">
                          <Bed className="w-4 h-4 text-slate-400" />
                          <span>Bedrooms</span>
                        </div>
                        <span className="text-xl sm:text-2xl font-display font-bold text-white">
                          {detailProperty.bedrooms}
                        </span>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-800/90 text-center bg-slate-900/60">
                        <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 font-mono">
                          <Bath className="w-4 h-4 text-slate-400" />
                          <span>Bathrooms</span>
                        </div>
                        <span className="text-xl sm:text-2xl font-display font-bold text-white">
                          {detailProperty.bathrooms}
                        </span>
                      </div>

                      {detailProperty.area_sqft && (
                        <div className="p-4 rounded-xl border border-slate-800/90 text-center bg-slate-900/60">
                          <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs mb-1 font-mono">
                            <Maximize2 className="w-4 h-4 text-slate-400" />
                            <span>Area</span>
                          </div>
                          <span className="text-xl sm:text-2xl font-display font-bold text-white">
                            {Math.round(detailProperty.area_sqft).toLocaleString()}
                            <span className="text-xs font-normal text-slate-400 ml-1 font-mono">sqft</span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Pricing & CTAs */}
                  <div className="w-full lg:w-auto flex flex-col items-start lg:items-end gap-5 shrink-0 lg:min-w-[340px]">
                    <div className="w-full lg:text-right p-6 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-mono block mb-1">
                        List Valuation
                      </span>
                      <span className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0,
                        }).format(detailProperty.price)}
                      </span>
                      <span className="text-xs text-slate-400 font-mono block mt-1">
                        Advisory & Concierge Financing
                      </span>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      {detailProperty.has_virtual_showroom && (
                        <button
                          type="button"
                          data-testid="open-showroom-btn"
                          onClick={() => {
                            setSelectedShowroomProperty(detailProperty);
                            setIsShowroomModalOpen(true);
                          }}
                          className="shimmer-gold-btn w-full px-6 py-3.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 group shadow-sm"
                        >
                          <Compass className="w-4 h-4 text-slate-900" />
                          <span>Open 360° Showroom</span>
                          <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 text-[10px] font-mono uppercase font-semibold">
                            Interactive
                          </span>
                        </button>
                      )}

                      <button
                        type="button"
                        data-testid="schedule-tour-btn"
                        onClick={handleScheduleTourClick}
                        className="w-full px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2 group"
                      >
                        <Calendar className="w-4 h-4 text-slate-300" />
                        <span>Schedule Private Viewing</span>
                      </button>
                    </div>

                    {/* Security & Guarantee Note */}
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Conflict-Free Temporal Scheduling Active</span>
                    </div>
                  </div>
                </div>

                {/* Architectural Features Strip */}
                <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-white font-medium">Private Access</strong>
                      <span className="text-slate-400 font-mono text-[11px]">Direct elevator foyer</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-white font-medium">Italian Finishes</strong>
                      <span className="text-slate-400 font-mono text-[11px]">Calacatta marble</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-white font-medium">Smart Systems</strong>
                      <span className="text-slate-400 font-mono text-[11px]">Integrated automation</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <strong className="block text-white font-medium">24/7 Security</strong>
                      <span className="text-slate-400 font-mono text-[11px]">Concierge & valet</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Hero Section for Main Marketplace */}
        {isHomePage && (
          <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
              {/* Subtitle Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-mono uppercase tracking-wider mb-8 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Spatial Architectural Real Estate</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white max-w-4xl mx-auto leading-tight">
                Architectural Mastery in <span className="text-slate-300">360° & Spatial 3D</span>
              </h1>

              <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
                Explore curated residences with interactive spherical walkthroughs and reserve verified in-person viewings with instant calendar confirmation.
              </p>

              {/* CTAs */}
              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
                {!isAuthenticated ? (
                  <button
                    type="button"
                    onClick={() => openAuthModal('register')}
                    className="shimmer-gold-btn w-full sm:w-auto px-6 py-3.5 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Request Portfolio Access</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono">
                    Authenticated: <strong className="text-white">{user?.full_name}</strong> ({user?.role})
                  </div>
                )}

                <a
                  href="/properties/luxury-penthouse"
                  className="w-full sm:w-auto px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm rounded-xl transition border border-slate-700 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Compass className="w-4 h-4 text-slate-300" />
                  <span>Launch 360° Showroom</span>
                </a>
              </div>

              {/* Metrics Stats Ribbon */}
              <div className="mt-14 sm:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                <div className="p-5 rounded-xl text-center border border-slate-800 bg-[#0f172a]/70">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-white block">100%</span>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono mt-1 block">
                    Conflict-Free Bookings
                  </span>
                </div>
                <div className="p-5 rounded-xl text-center border border-slate-800 bg-[#0f172a]/70">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-white block">360°</span>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono mt-1 block">
                    Equirectangular Views
                  </span>
                </div>
                <div className="p-5 rounded-xl text-center border border-slate-800 bg-[#0f172a]/70">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-white block">&lt;20ms</span>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono mt-1 block">
                    Spatial Query Index
                  </span>
                </div>
                <div className="p-5 rounded-xl text-center border border-slate-800 bg-[#0f172a]/70">
                  <span className="text-2xl sm:text-3xl font-display font-bold text-white block">RBAC</span>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-mono mt-1 block">
                    Administrative Studio
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Homepage Direct Onboarding & Concierge Authentication Portal */}
        {isHomePage && <HomeAuthHelper />}

        {/* Feature Highlights Grid */}
        {isHomePage && (
          <section id="showrooms" className="py-16 sm:py-20 border-t border-slate-800/80 bg-[#0b0f19]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-14">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-medium block mb-2">
                  Platform Architecture
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
                  Architectural Innovation Meets Seamless Booking
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-400">
                  Experience prime residential spaces online with verified room telemetry before site visits.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Feature 1 */}
                <div className="p-7 rounded-2xl relative overflow-hidden group bg-[#0f172a]/60 border border-slate-800 hover:border-slate-700 transition">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 mb-5">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-display font-bold text-white mb-2">
                    Interactive 360° Showrooms
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    Equirectangular panoramas connected by interactive spherical navigation nodes and real-time upgrade pricing hotspots.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="p-7 rounded-2xl relative overflow-hidden group bg-[#0f172a]/60 border border-slate-800 hover:border-slate-700 transition">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 mb-5">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    PostgreSQL GiST Scheduling
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Self-service viewing slots enforced at database level with temporal exclusion constraints, ensuring guaranteed zero double-bookings.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="glass-card p-8 rounded-3xl relative overflow-hidden group bg-[#060a17]/70 border border-white/10 hover:border-amber-500/40">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-6 shadow-inner">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-white mb-2">
                    PostGIS Geospatial Discovery
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Sub-second spatial radius queries (<code className="text-amber-300 font-mono text-xs">ST_DWithin</code>) matching properties with verified geographical accuracy.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Property Directory Section */}
        <section className="border-t border-amber-500/20 bg-[#030611]">
          <PropertyDirectory />
        </section>
      </main>

      {/* Luxury Architectural Footer */}
      <footer className="border-t border-amber-500/20 bg-[#02040a] py-12 text-sm text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-md">
                EV
              </div>
              <div>
                <span className="text-base font-display font-bold text-white block">EstateView 3D</span>
                <span className="text-xs text-amber-200/50 font-mono">Ultra-Prime Spatial Real Estate</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
              <a href="/properties/luxury-penthouse" className="hover:text-amber-300 transition">
                360° Showroom
              </a>
              <a href="/admin/dashboard" className="hover:text-amber-300 transition">
                Super-Admin Portal
              </a>
              <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition">
                FastAPI Swagger Docs
              </a>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              © 2026 EstateView Technologies Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal />

      {/* Detail Property Tour Modal */}
      {detailProperty && (
        <TourBookingModal
          property={detailProperty}
          isOpen={isTourModalOpen}
          onClose={() => setIsTourModalOpen(false)}
        />
      )}

      {/* Virtual Showroom Modal */}
      {selectedShowroomProperty && (
        <ShowroomModal
          property={selectedShowroomProperty}
          isOpen={isShowroomModalOpen}
          onClose={() => setIsShowroomModalOpen(false)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

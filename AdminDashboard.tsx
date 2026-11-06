import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  AdminAnalyticsOverview,
  AuditLogItem,
  Tour,
  Property,
} from '../../types';
import {
  fetchAdminOverviewApi,
  fetchAdminAuditLogsApi,
  fetchAdminToursApi,
  fetchPropertiesApi,
  cancelTourApi,
} from '../../services/api';
import {
  Building2,
  Calendar,
  Users,
  TrendingUp,
  Sparkles,
  FileText,
  ArrowRight,
  RefreshCw,
  LogOut,
  MapPin,
  Crown,
} from 'lucide-react';

interface AdminDashboardProps {
  onOpenStudio?: (propertySlug: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenStudio }) => {
  const { user, token, logout } = useAuth();

  const [overview, setOverview] = useState<AdminAnalyticsOverview | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'tours'>('overview');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('ALL');
  const [tourStatusFilter, setTourStatusFilter] = useState<string>('ALL');

  const loadAllAdminData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [overviewData, auditData, toursData, propsData] = await Promise.all([
        fetchAdminOverviewApi(token).catch(() => null),
        fetchAdminAuditLogsApi(token, 1, 15).catch(() => ({ items: [], total: 0, page: 1, page_size: 15 })),
        fetchAdminToursApi(token).catch(() => ({ items: [], total: 0 })),
        fetchPropertiesApi().catch(() => ({ items: [], total: 0, limit: 10, offset: 0 })),
      ]);

      if (overviewData) setOverview(overviewData);
      setAuditLogs(auditData.items);
      setTours(toursData.items);
      setProperties(propsData.items);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, [token]);

  const handleCancelTour = async (tourId: string) => {
    if (!token) return;
    const reason = window.prompt('Enter reason for cancellation:');
    if (!reason) return;
    try {
      await cancelTourApi(tourId, reason, token);
      await loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel tour');
    }
  };

  const filteredAuditLogs = auditLogs.filter((log) => {
    if (auditActionFilter === 'ALL') return true;
    return log.action === auditActionFilter;
  });

  const filteredTours = tours.filter((t) => {
    if (tourStatusFilter === 'ALL') return true;
    return t.status === tourStatusFilter;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-white flex flex-col selection:bg-slate-700 selection:text-white">
      {/* Top Navbar */}
      <header className="h-16 sm:h-20 px-6 bg-[#0b0f19]/95 border-b border-white/10 backdrop-blur-md flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shadow-sm">
            <Crown className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h1 className="text-base font-display font-semibold text-white tracking-tight flex items-center gap-2">
              <span>EstateView Super-Admin Command Center</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-medium border border-emerald-500/20 uppercase tracking-wider">
                Live
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Authorized Executive: <strong className="text-white">{user?.full_name}</strong> ({user?.email})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={loadAllAdminData}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 transition flex items-center gap-1.5 text-xs font-semibold border border-slate-800"
            title="Refresh Metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline font-mono">Sync</span>
          </button>

          <a
            href="/"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition border border-slate-800"
          >
            Client Storefront
          </a>

          <button
            type="button"
            onClick={logout}
            className="p-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition border border-slate-800"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-8">
          <button
            type="button"
            data-testid="admin-tab-overview"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>KPI Overview</span>
          </button>

          <button
            type="button"
            data-testid="admin-tab-audit"
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Logs ({auditLogs.length})</span>
          </button>

          <button
            type="button"
            data-testid="admin-tab-tours"
            onClick={() => setActiveTab('tours')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition flex items-center gap-2 ${
              activeTab === 'tours'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Master Appointments ({tours.length})</span>
          </button>
        </div>

        {/* Tab 1: Overview & Showroom Studio Properties */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-xl border border-white/08 bg-[#0f172a] shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2 font-mono">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Listings</span>
                  <Building2 className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-2xl sm:text-3xl font-display font-bold text-white block">
                  {overview?.total_properties ?? properties.length}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">PostGIS spatial listings</span>
              </div>

              <div className="p-5 rounded-xl border border-white/08 bg-[#0f172a] shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2 font-mono">
                  <span className="text-xs font-semibold uppercase tracking-wider">Active Tours</span>
                  <Calendar className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-2xl sm:text-3xl font-display font-bold text-emerald-400 block">
                  {overview?.active_tours ?? 0}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">GiST conflict-free bookings</span>
              </div>

              <div className="p-5 rounded-xl border border-white/08 bg-[#0f172a] shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2 font-mono">
                  <span className="text-xs font-semibold uppercase tracking-wider">Registered VIPs</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-2xl sm:text-3xl font-display font-bold text-white block">
                  {overview?.total_users ?? 0}
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">Buyers, Brokers, Admins</span>
              </div>

              <div className="p-5 rounded-xl border border-white/08 bg-[#0f172a] shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2 font-mono">
                  <span className="text-xs font-semibold uppercase tracking-wider">Tour Conversion</span>
                  <TrendingUp className="w-4 h-4 text-slate-400" />
                </div>
                <span className="text-2xl sm:text-3xl font-display font-bold text-white block">
                  {overview?.conversion_rate ?? 0}%
                </span>
                <span className="text-[11px] text-slate-500 mt-1 block font-mono">Confirmed / Total Tours</span>
              </div>
            </div>

            {/* Visual Showroom CMS Jump Rail */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-display font-semibold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-slate-400" />
                    <span>Visual Hotspot Studio Residences</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Select any residence below to open the interactive 360 viewer and click-to-pin coordinate hotspots in real time.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-xl border border-white/08 hover:border-white/20 transition flex flex-col justify-between bg-[#0f172a] shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] uppercase font-mono font-semibold">
                          {p.property_type}
                        </span>
                        {p.has_virtual_showroom ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-semibold border border-slate-700 uppercase tracking-wider font-mono">
                            360 Showroom Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-500 text-[10px] font-mono">
                            Standard
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-display font-semibold text-white truncate">{p.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{p.address}, {p.city}</span>
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-white/05 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white font-mono">
                        ${Number(p.price).toLocaleString()}
                      </span>

                      {onOpenStudio ? (
                        <button
                          type="button"
                          onClick={() => onOpenStudio(p.slug)}
                          className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Open Studio</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <a
                          href={`/admin/properties/${p.slug}/showroom-studio`}
                          className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs transition flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Open Studio</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Audit Logs */}
        {activeTab === 'audit' && (
          <div className="rounded-xl border border-white/08 overflow-hidden animate-fade-in bg-[#0f172a] shadow-sm">
            <div className="p-5 border-b border-white/08 bg-[#0b0f19] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-slate-400" />
                  <span>System Audit Trail</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Cryptographically verified chronological ledger of administrative operations and CMS modifications.
                </p>
              </div>

              {/* Action Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                {['ALL', 'HOTSPOT_CREATE', 'HOTSPOT_DELETE', 'SCENE_CREATE', 'TOUR_CREATE', 'TOUR_CANCEL'].map((act) => (
                  <button
                    key={act}
                    type="button"
                    onClick={() => setAuditActionFilter(act)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold font-mono whitespace-nowrap transition border ${
                      auditActionFilter === act
                        ? 'bg-white text-slate-950 border-white font-bold'
                        : 'bg-[#030712] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {act}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b0f19] border-b border-white/08 text-slate-400 uppercase font-mono font-semibold">
                  <tr>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Resource</th>
                    <th className="py-3 px-4">Admin User</th>
                    <th className="py-3 px-4">Details</th>
                    <th className="py-3 px-4">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05">
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono">
                        No audit records match the selected action filter.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4 font-semibold text-white font-mono">
                          {log.action}
                        </td>
                        <td className="py-3 px-4 text-slate-300">
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
                            {log.resource_type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {log.user_email || 'System'}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                          {JSON.stringify(log.details)}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap font-mono">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Master Tours List */}
        {activeTab === 'tours' && (
          <div className="rounded-xl border border-white/08 overflow-hidden animate-fade-in bg-[#0f172a] shadow-sm">
            <div className="p-5 border-b border-white/08 bg-[#0b0f19] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-lg font-display font-semibold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <span>All Scheduled Tours Across Agents</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Master scheduler records secured by PostgreSQL GiST temporal exclusion constraints.
                </p>
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5">
                {['ALL', 'confirmed', 'pending', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setTourStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize font-mono transition border ${
                      tourStatusFilter === st
                        ? 'bg-white text-slate-950 border-white font-bold'
                        : 'bg-[#030712] text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0b0f19] border-b border-white/08 text-slate-400 uppercase font-mono font-semibold">
                  <tr>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Buyer</th>
                    <th className="py-3 px-4">Broker</th>
                    <th className="py-3 px-4">Scheduled Slot</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/05">
                  {filteredTours.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                        No tours match the selected status filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTours.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition">
                        <td className="py-3 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider font-mono ${
                              t.status === 'confirmed'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : t.status === 'pending'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : 'bg-red-500/15 text-red-300 border border-red-500/30'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-white truncate max-w-xs">
                          {t.property?.title || t.property_id}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {t.buyer?.full_name || t.buyer?.email || t.buyer_id}
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          {t.agent?.full_name || t.agent?.email || t.agent_id}
                        </td>
                        <td className="py-3 px-4 text-slate-400 whitespace-nowrap font-mono">
                          {new Date(t.scheduled_start).toLocaleString()} -{' '}
                          {new Date(t.scheduled_end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {t.status === 'confirmed' && (
                            <button
                              type="button"
                              onClick={() => handleCancelTour(t.id)}
                              className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-[11px] font-semibold transition font-mono"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

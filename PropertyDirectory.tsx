import React, { useState, useEffect, useCallback } from 'react';
import { Property, PropertyFilterParams } from '../../types';
import { fetchPropertiesApi } from '../../services/api';
import { PropertyCard } from './PropertyCard';
import { PropertyFilters } from './PropertyFilters';
import { TourBookingModal } from '../tours/TourBookingModal';
import { useAuth } from '../../context/AuthContext';
import { Search, Sparkles, MapPin, Building2 } from 'lucide-react';

export const PropertyDirectory: React.FC = () => {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTourProperty, setSelectedTourProperty] = useState<Property | null>(null);
  const [isTourModalOpen, setIsTourModalOpen] = useState<boolean>(false);

  const handleScheduleTour = (p: Property) => {
    if (!isAuthenticated) {
      openAuthModal('login', () => {
        setSelectedTourProperty(p);
        setIsTourModalOpen(true);
      });
    } else {
      setSelectedTourProperty(p);
      setIsTourModalOpen(true);
    }
  };

  const [filters, setFilters] = useState<PropertyFilterParams>({});
  const [searchTerm, setSearchTerm] = useState('');

  const loadProperties = useCallback(async (currentFilters: PropertyFilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPropertiesApi(currentFilters);
      setProperties(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties(filters);
  }, [filters, loadProperties]);

  const handleFilterChange = (newFilters: PropertyFilterParams) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilters({});
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      search: searchTerm.trim() || undefined,
    }));
  };

  return (
    <div id="listings" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Directory Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 sm:mb-12">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium mb-3">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-mono uppercase tracking-wider text-[11px]">Curated Portfolio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
            Prime Residential Collection
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Explore architectural residences with PostGIS spatial radius discovery and interactive 3D virtual showrooms.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search city, neighborhood, or title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-24 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-slate-700 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 shimmer-gold-btn text-slate-950 text-xs font-semibold rounded-lg transition shadow-sm"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Main Two-Column Directory Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-8">
        {/* Left Filter Rail (Desktop) / Trigger (Mobile) */}
        <PropertyFilters
          filters={filters}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
          totalResults={total}
        />

        {/* Right Property Grid */}
        <div className="flex-1 w-full">
          {/* Active Filter Pills Bar */}
          <div className="flex items-center justify-between mb-6 pb-3.5 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
              <span>Showing</span>
              <strong className="text-white font-semibold font-mono">{properties.length}</strong>
              <span>of</span>
              <strong className="text-white font-semibold font-mono">{total}</strong>
              <span>residences</span>
              {filters.has_showroom && (
                <span className="inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  <Sparkles className="w-3 h-3 text-slate-400" />
                  3D Showroom Only
                </span>
              )}
            </div>

            {Object.keys(filters).length > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-slate-400 hover:text-white font-medium transition"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/50 text-red-300 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="glass-card rounded-[28px] overflow-hidden border border-white/10 p-4 space-y-4 animate-pulse bg-[#050914]/80"
                >
                  <div className="aspect-[16/10] bg-slate-800/60 rounded-2xl" />
                  <div className="h-5 bg-slate-800/60 rounded-lg w-3/4" />
                  <div className="h-4 bg-slate-800/40 rounded-lg w-1/2" />
                  <div className="h-10 bg-slate-800/30 rounded-xl" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            /* Empty State */
            <div className="glass-panel-gold rounded-3xl p-12 text-center max-w-md mx-auto my-12 border border-amber-500/30">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-white">No Residences Found</h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                No active listings match your current search filters. Try adjusting price bounds or location queries.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-sm font-bold transition shadow-lg shadow-amber-500/20"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            /* Responsive Grid: 1 col (mobile) -> 2 cols (tablet) -> 3 cols (desktop) */
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onSelect={handleScheduleTour}
                  onScheduleTour={handleScheduleTour}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tour Scheduling Modal */}
      <TourBookingModal
        property={selectedTourProperty}
        isOpen={isTourModalOpen}
        onClose={() => setIsTourModalOpen(false)}
      />
    </div>
  );
};

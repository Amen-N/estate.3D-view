import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { PropertyFilterParams } from '../../types';
import { SlidersHorizontal, X, Sparkles, RotateCcw, Check } from 'lucide-react';

interface PropertyFiltersProps {
  filters: PropertyFilterParams;
  onChange: (newFilters: PropertyFilterParams) => void;
  onReset: () => void;
  totalResults: number;
}

const PROPERTY_TYPES = [
  { label: 'All Types', value: '' },
  { label: 'Condo', value: 'condo' },
  { label: 'Villa', value: 'villa' },
  { label: 'Penthouse', value: 'penthouse' },
  { label: 'Townhouse', value: 'townhouse' },
];

const BEDROOM_OPTIONS = [
  { label: 'Any', value: undefined },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  filters,
  onChange,
  onReset,
  totalResults,
}) => {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Local draft state for mobile drawer
  const [draftFilters, setDraftFilters] = useState<PropertyFilterParams>(filters);

  const openMobileDrawer = () => {
    setDraftFilters({ ...filters });
    setMobileDrawerOpen(true);
  };

  const closeMobileDrawer = () => {
    setMobileDrawerOpen(false);
  };

  const handleApplyMobile = () => {
    onChange(draftFilters);
    setMobileDrawerOpen(false);
  };

  const handleToggleShowroom = (current: boolean | undefined, isDraft = false) => {
    const nextVal = current ? undefined : true;
    if (isDraft) {
      setDraftFilters((prev) => ({ ...prev, has_showroom: nextVal }));
    } else {
      onChange({ ...filters, has_showroom: nextVal });
    }
  };

  const FilterContent = ({ isDraft = false }: { isDraft?: boolean }) => {
    const activeState = isDraft ? draftFilters : filters;
    const updateHandler = (updates: Partial<PropertyFilterParams>) => {
      if (isDraft) {
        setDraftFilters((prev) => ({ ...prev, ...updates }));
      } else {
        onChange({ ...filters, ...updates });
      }
    };

    return (
      <div className="space-y-6">
        {/* 3D Showroom Filter Card */}
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white block">3D Virtual Showrooms</span>
                <span className="text-xs text-slate-400 block">Interactive spaces only</span>
              </div>
            </div>

            <button
              type="button"
              {...((isDraft ? mobileDrawerOpen : !mobileDrawerOpen) ? { 'data-testid': 'filter-has-showroom-toggle' } : {})}
              onClick={() => handleToggleShowroom(activeState.has_showroom, isDraft)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                activeState.has_showroom ? 'bg-slate-100' : 'bg-slate-800'
              }`}
              role="switch"
              aria-checked={Boolean(activeState.has_showroom)}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-slate-950 shadow-sm ring-0 transition duration-200 ease-in-out ${
                  activeState.has_showroom ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Property Type Pills */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
            Residence Type
          </label>
          <div className="flex flex-wrap gap-1.5">
            {PROPERTY_TYPES.map((type) => {
              const isSelected =
                (type.value === '' && !activeState.property_type) ||
                activeState.property_type === type.value;
              return (
                <button
                  key={type.value || 'all'}
                  type="button"
                  onClick={() => updateHandler({ property_type: type.value || undefined })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition touch-target ${
                    isSelected
                      ? 'bg-slate-100 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bedroom Chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
            Bedrooms
          </label>
          <div className="grid grid-cols-5 gap-1.5">
            {BEDROOM_OPTIONS.map((opt) => {
              const isSelected = activeState.bedrooms === opt.value;
              return (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => updateHandler({ bedrooms: opt.value })}
                  className={`py-1.5 rounded-lg text-xs font-medium transition text-center ${
                    isSelected
                      ? 'bg-slate-100 text-slate-950 font-semibold shadow-sm'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
            Price Range ($)
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <input
                type="number"
                placeholder="Min Price"
                value={activeState.min_price !== undefined ? activeState.min_price : ''}
                onChange={(e) =>
                  updateHandler({
                    min_price: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 transition"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max Price"
                value={activeState.max_price !== undefined ? activeState.max_price : ''}
                onChange={(e) =>
                  updateHandler({
                    max_price: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 transition"
              />
            </div>
          </div>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 font-mono">
            City Location
          </label>
          <input
            type="text"
            placeholder="e.g. Addis Ababa, Dallas, Austin"
            value={activeState.city || ''}
            onChange={(e) =>
              updateHandler({ city: e.target.value ? e.target.value : undefined })
            }
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-slate-600 transition"
          />
        </div>

        {/* Reset Button */}
        <button
          type="button"
          onClick={() => {
            if (isDraft) {
              setDraftFilters({});
            } else {
              onReset();
            }
          }}
          className="w-full py-2.5 px-4 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white text-xs font-medium transition flex items-center justify-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    );
  };

  const mobileFloatingButton = !mobileDrawerOpen && typeof document !== 'undefined'
    ? createPortal(
        <div className="lg:hidden fixed bottom-6 inset-x-0 flex justify-center pointer-events-none z-30">
          <button
            type="button"
            data-testid="filter-bottom-sheet-btn"
            onClick={openMobileDrawer}
            className="pointer-events-auto px-5 py-3 rounded-full bg-slate-100 text-slate-950 font-semibold text-sm shadow-xl flex items-center gap-2 border border-white backdrop-blur-lg touch-target cursor-pointer hover:bg-white transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters & Search</span>
            {Boolean(filters.has_showroom || filters.bedrooms || filters.min_price || filters.max_price || filters.property_type || filters.city) && (
              <span className="w-2 h-2 rounded-full bg-slate-900" />
            )}
          </button>
        </div>,
        document.body
      )
    : null;

  const mobileBottomSheet = mobileDrawerOpen && typeof document !== 'undefined'
    ? createPortal(
        <div className="lg:hidden fixed inset-0 z-[100] flex items-end justify-center pointer-events-auto">
          {/* Backdrop */}
          <div
            onClick={closeMobileDrawer}
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          {/* Bottom Sheet Drawer */}
          <div className="relative w-full max-h-[85vh] bg-[#0b0f19] border-t border-slate-800 rounded-t-2xl p-6 overflow-y-auto shadow-2xl z-10 flex flex-col justify-between">
            {/* Grab Handle */}
            <div className="w-12 h-1 bg-slate-800 rounded-full mx-auto mb-4" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <h3 className="text-base font-semibold text-white">Search Filters</h3>
              </div>
              <button
                type="button"
                onClick={closeMobileDrawer}
                className="p-2 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 pb-6">
              <FilterContent isDraft={true} />
            </div>

            {/* Apply Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                data-testid="apply-filters-btn"
                onClick={handleApplyMobile}
                className="shimmer-gold-btn w-full py-3.5 text-slate-950 font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 touch-target"
              >
                <Check className="w-4 h-4 text-slate-950" />
                <span>Apply Filters</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {/* Mobile Floating Filter Pill Button (Portaled to body) */}
      {mobileFloatingButton}

      {/* Desktop Filter Rail */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-28 p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/75 space-y-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-400" />
              <h2 className="text-sm font-semibold text-white tracking-wide">Refine Search</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono font-medium">{totalResults} Listings</span>
          </div>

          <FilterContent isDraft={false} />
        </div>
      </aside>

      {/* Mobile Slide-Up Bottom Sheet (Portaled to body) */}
      {mobileBottomSheet}
    </>
  );
};

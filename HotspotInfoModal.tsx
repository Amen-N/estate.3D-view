import React from 'react';
import { ShowroomHotspot } from '../../types';
import { X, Sparkles, Info, DollarSign, CheckCircle2 } from 'lucide-react';

interface HotspotInfoModalProps {
  hotspot: ShowroomHotspot | null;
  onClose: () => void;
}

export const HotspotInfoModal: React.FC<HotspotInfoModalProps> = ({
  hotspot,
  onClose,
}) => {
  if (!hotspot) return null;

  const isUpgrade = hotspot.hotspot_type === 'upgrade';
  const upgradeCost = hotspot.metadata?.upgrade_cost;
  const material = hotspot.metadata?.material;
  const brand = hotspot.metadata?.brand;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        data-testid="hotspot-detail-card"
        className="w-full max-w-lg bg-[#0b0f19] rounded-2xl border border-white/10 p-6 sm:p-8 shadow-2xl relative overflow-hidden text-white"
      >
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-800 border border-slate-700 text-slate-300"
            >
              {isUpgrade ? <Sparkles className="w-5 h-5" /> : <Info className="w-5 h-5" />}
            </div>
            <div>
              <span
                className="text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-slate-800/80 border-slate-700 text-slate-300"
              >
                {isUpgrade ? 'Architectural Upgrade' : 'Specification Highlight'}
              </span>
              <h3 className="text-xl sm:text-2xl font-display font-semibold mt-1 text-white">
                {hotspot.title || 'Feature Highlight'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            data-testid="close-hotspot-modal-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        {hotspot.description && (
          <p className="mt-4 text-slate-300 text-sm leading-relaxed">
            {hotspot.description}
          </p>
        )}

        {/* Metadata Details Grid */}
        <div className="mt-6 pt-5 border-t border-white/05 grid grid-cols-2 gap-3">
          {material && (
            <div className="p-3.5 rounded-xl bg-[#030712] border border-slate-800">
              <span className="text-[11px] uppercase text-slate-400 block tracking-wider font-semibold font-mono">
                Material / Finish
              </span>
              <span className="text-sm font-semibold text-white mt-0.5 block">
                {material}
              </span>
            </div>
          )}

          {brand && (
            <div className="p-3.5 rounded-xl bg-[#030712] border border-slate-800">
              <span className="text-[11px] uppercase text-slate-400 block tracking-wider font-semibold font-mono">
                Manufacturer / Brand
              </span>
              <span className="text-sm font-semibold text-white mt-0.5 block">
                {brand}
              </span>
            </div>
          )}

          {upgradeCost && (
            <div className="p-3.5 rounded-xl col-span-2 flex items-center justify-between border border-white/10 bg-slate-900/80">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-300">
                  Estimated Upgrade Premium
                </span>
              </div>
              <span className="text-base font-semibold text-emerald-400">
                +${Number(upgradeCost).toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 flex items-center justify-end gap-3 border-t border-white/05">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-semibold text-sm transition shadow-sm flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>Got It</span>
          </button>
        </div>
      </div>
    </div>
  );
};

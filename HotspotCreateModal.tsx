import React, { useState, useEffect } from 'react';
import { ShowroomScene, CreateHotspotPayload } from '../../types';
import { X, MapPin, Tag, Compass, Sparkles } from 'lucide-react';

interface HotspotCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPitch: number;
  initialYaw: number;
  scenes: ShowroomScene[];
  currentSceneId: string;
  onSave: (payload: CreateHotspotPayload) => Promise<void>;
}

export const HotspotCreateModal: React.FC<HotspotCreateModalProps> = ({
  isOpen,
  onClose,
  initialPitch,
  initialYaw,
  scenes,
  currentSceneId,
  onSave,
}) => {
  const [pitch, setPitch] = useState<number>(initialPitch);
  const [yaw, setYaw] = useState<number>(initialYaw);
  const [title, setTitle] = useState('');
  const [hotspotType, setHotspotType] = useState<'navigation' | 'info' | 'upgrade'>('navigation');
  const [targetSceneId, setTargetSceneId] = useState<string>('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPitch(initialPitch);
    setYaw(initialYaw);
    setError(null);
  }, [initialPitch, initialYaw, isOpen]);

  // Set default target scene (first scene that isn't current)
  useEffect(() => {
    const otherScenes = scenes.filter((s) => s.id !== currentSceneId);
    if (otherScenes.length > 0 && !targetSceneId) {
      setTargetSceneId(otherScenes[0].id);
    }
  }, [scenes, currentSceneId, targetSceneId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        hotspot_type: hotspotType,
        pitch: Number(pitch),
        yaw: Number(yaw),
        target_scene_id:
          hotspotType === 'navigation'
            ? targetSceneId || (otherScenes.length > 0 ? otherScenes[0].id : undefined)
            : undefined,
        description: description.trim() || undefined,
        metadata: {
          created_via: 'visual_hotspot_studio',
        },
      });
      setTitle('');
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save hotspot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const otherScenes = scenes.filter((s) => s.id !== currentSceneId);

  return (
    <div
      data-testid="hotspot-create-modal"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020409]/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-lg bg-[#0b0f19] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/08 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Pin Coordinate Hotspot</h3>
              <p className="text-xs text-slate-400">
                Extracted spherical coordinates from 360 panorama click
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Coordinates Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>Pitch (Degrees)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="-85"
                max="85"
                data-testid="hotspot-pitch-input"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Yaw (Degrees)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="-180"
                max="180"
                data-testid="hotspot-yaw-input"
                value={yaw}
                onChange={(e) => setYaw(parseFloat(e.target.value) || 0)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
              />
            </div>
          </div>

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Hotspot Label / Title
            </label>
            <input
              type="text"
              data-testid="hotspot-title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dining Room Gateway"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition placeholder-slate-600"
            />
          </div>

          {/* Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Hotspot Action Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setHotspotType('navigation')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                  hotspotType === 'navigation'
                    ? 'bg-white text-slate-950 font-bold border-white shadow-sm'
                    : 'bg-[#030712] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>Navigation</span>
              </button>
              <button
                type="button"
                onClick={() => setHotspotType('info')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                  hotspotType === 'info'
                    ? 'bg-white text-slate-950 font-bold border-white shadow-sm'
                    : 'bg-[#030712] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <span>Info Card</span>
              </button>
              <button
                type="button"
                onClick={() => setHotspotType('upgrade')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition border flex items-center justify-center gap-1.5 ${
                  hotspotType === 'upgrade'
                    ? 'bg-white text-slate-950 font-bold border-white shadow-sm'
                    : 'bg-[#030712] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade</span>
              </button>
            </div>
          </div>

          {/* Navigation Target Scene Dropdown (if navigation) */}
          {hotspotType === 'navigation' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
                Target Room Destination
              </label>
              <select
                data-testid="target-scene-select"
                value={targetSceneId}
                onChange={(e) => setTargetSceneId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
              >
                {otherScenes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.room_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Description / Notes (Optional)
            </label>
            <textarea
              data-testid="hotspot-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Leads into the Italian designer kitchen with breakfast island."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition resize-none placeholder-slate-600"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/08">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-sm font-semibold transition border border-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              data-testid="save-hotspot-btn"
              disabled={isSubmitting}
              className="shimmer-gold-btn px-6 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <Tag className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'Saving...' : 'Pin Hotspot to Scene'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

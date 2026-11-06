import React, { useState } from 'react';
import { CreateScenePayload } from '../../types';
import { X, Layers, Image as ImageIcon, Compass, Plus } from 'lucide-react';

interface SceneCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: CreateScenePayload) => Promise<void>;
}

const PRESET_PANORAMAS = [
  {
    name: 'Modern Penthouse Alma',
    url: 'https://pannellum.org/images/alma.jpg',
  },
  {
    name: 'Cerro Toco Panorama',
    url: 'https://pannellum.org/images/cerro-toco-0.jpg',
  },
  {
    name: 'BMA Architectural Hall',
    url: 'https://pannellum.org/images/bma-0.jpg',
  },
  {
    name: 'Milan Classical Living',
    url: 'https://pannellum.org/images/milan.jpg',
  },
];

export const SceneCreateModal: React.FC<SceneCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [roomName, setRoomName] = useState('');
  const [panoramaUrl, setPanoramaUrl] = useState(PRESET_PANORAMAS[0].url);
  const [defaultPitch, setDefaultPitch] = useState(0);
  const [defaultYaw, setDefaultYaw] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError('Room name is required');
      return;
    }
    if (!panoramaUrl.trim()) {
      setError('Panorama image URL is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave({
        room_name: roomName.trim(),
        panorama_url: panoramaUrl.trim(),
        default_pitch: Number(defaultPitch),
        default_yaw: Number(defaultYaw),
        sort_order: 10,
        is_initial_scene: false,
      });
      setRoomName('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create room scene');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      data-testid="scene-create-modal"
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-display font-semibold text-white">Add Showroom Scene</h3>
              <p className="text-xs text-slate-400">
                Attach an additional 360° panorama room to this property
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
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Room Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Room / Scene Name
            </label>
            <input
              type="text"
              data-testid="scene-name-input"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Rooftop Sky Lounge, Master Bathroom"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition placeholder-slate-600"
            />
          </div>

          {/* Preset Panoramas */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Select 360 Panorama Source Preset
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PANORAMAS.map((preset) => {
                const isSelected = panoramaUrl === preset.url;
                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => setPanoramaUrl(preset.url)}
                    className={`p-2.5 rounded-xl text-left text-xs font-medium border transition ${
                      isSelected
                        ? 'bg-white text-slate-950 font-semibold border-white shadow-sm'
                        : 'bg-[#030712] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-semibold truncate">
                      <ImageIcon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{preset.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Panorama Image URL Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 font-mono">
              Or Custom Equirectangular URL
            </label>
            <input
              type="url"
              data-testid="scene-url-input"
              value={panoramaUrl}
              onChange={(e) => setPanoramaUrl(e.target.value)}
              placeholder="https://.../panorama.jpg"
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition placeholder-slate-600"
            />
          </div>

          {/* Default Camera Angles */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1 font-mono">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Initial Pitch</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="-85"
                max="85"
                value={defaultPitch}
                onChange={(e) => setDefaultPitch(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1 font-mono">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Initial Yaw</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="-180"
                max="180"
                value={defaultYaw}
                onChange={(e) => setDefaultYaw(parseFloat(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition"
              />
            </div>
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
              data-testid="save-scene-btn"
              disabled={isSubmitting}
              className="shimmer-gold-btn px-6 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-sm font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'Creating...' : 'Add Room to Tour'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

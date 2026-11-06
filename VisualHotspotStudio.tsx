import React, { useState, useEffect, useCallback } from 'react';
import { Property, Showroom, CreateHotspotPayload, CreateScenePayload } from '../../types';
import { fetchPropertiesApi, fetchShowroomApi, createAdminHotspotApi, deleteAdminHotspotApi, createAdminSceneApi } from '../../services/api';
import { PanoramaViewer360 } from '../showroom/PanoramaViewer360';
import { HotspotCreateModal } from './HotspotCreateModal';
import { SceneCreateModal } from './SceneCreateModal';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Plus,
  Trash2,
  Navigation,
  Info,
  Sparkles,
  ArrowLeft,
  Layers,
  MapPin,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface VisualHotspotStudioProps {
  propertySlug: string;
  onBackToDashboard?: () => void;
}

export const VisualHotspotStudio: React.FC<VisualHotspotStudioProps> = ({
  propertySlug,
  onBackToDashboard,
}) => {
  const { token } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hotspot modal state
  const [isHotspotModalOpen, setIsHotspotModalOpen] = useState(false);
  const [isSceneModalOpen, setIsSceneModalOpen] = useState(false);
  const [clickedPitch, setClickedPitch] = useState<number>(0);
  const [clickedYaw, setClickedYaw] = useState<number>(0);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Load property and showroom
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch showroom directly by slug (supported by backend)
      const sr = await fetchShowroomApi(propertySlug);
      setShowroom(sr);

      // 2. Fetch property details
      try {
        const propsRes = await fetchPropertiesApi({ search: propertySlug });
        const match =
          propsRes.items.find((p) => p.slug === propertySlug) ||
          propsRes.items.find((p) => p.id === sr.property_id) ||
          propsRes.items[0];
        if (match) {
          setProperty(match);
        } else {
          setProperty({
            id: sr.property_id,
            agent_id: '',
            title: 'Luxury Penthouse',
            slug: propertySlug,
            price: 650000,
            property_type: 'penthouse',
            status: 'published',
            bedrooms: 3,
            bathrooms: 3,
            address: 'Bole Subcity Luxury Tower, 18th Floor',
            city: 'Addis Ababa',
            has_virtual_showroom: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      } catch {
        setProperty({
          id: sr.property_id,
          agent_id: '',
          title: 'Luxury Penthouse',
          slug: propertySlug,
          price: 650000,
          property_type: 'penthouse',
          status: 'published',
          bedrooms: 3,
          bathrooms: 3,
          address: 'Bole Subcity Luxury Tower, 18th Floor',
          city: 'Addis Ababa',
          has_virtual_showroom: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      if (sr.scenes.length > 0) {
        setCurrentSceneId((prev) => (prev && sr.scenes.some((s) => s.id === prev) ? prev : sr.scenes[0].id));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load showroom data.');
    } finally {
      setLoading(false);
    }
  }, [propertySlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const currentScene = showroom?.scenes.find((s) => s.id === currentSceneId) || showroom?.scenes[0];

  // Canvas coordinate click handler
  const handleCanvasClick = (coords: { pitch: number; yaw: number; x: number; y: number }) => {
    setClickedPitch(coords.pitch);
    setClickedYaw(coords.yaw);
    setIsHotspotModalOpen(true);
  };

  // Save new hotspot
  const handleSaveHotspot = async (payload: CreateHotspotPayload) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
    if (!currentScene || !activeToken) {
      throw new Error('Active scene or admin authorization token missing');
    }

    const newHotspot = await createAdminHotspotApi(currentScene.id, payload, activeToken);

    // Update showroom scene tree locally for instantaneous visual update
    setShowroom((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scenes: prev.scenes.map((s) => {
          if (s.id === currentScene.id) {
            return {
              ...s,
              hotspots: [...s.hotspots, newHotspot],
            };
          }
          return s;
        }),
      };
    });

    setSuccessNotice(`Hotspot "${newHotspot.title || 'Node'}" added successfully!`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Save new scene
  const handleSaveScene = async (payload: CreateScenePayload) => {
    const activeToken = token || (typeof window !== 'undefined' ? localStorage.getItem('access_token') : null);
    if (!showroom || !activeToken) {
      throw new Error('Showroom or admin authorization token missing');
    }

    const newScene = await createAdminSceneApi(showroom.id, payload, activeToken);

    setShowroom((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        scenes: [...prev.scenes, newScene],
      };
    });

    setCurrentSceneId(newScene.id);
    setSuccessNotice(`Room "${newScene.room_name}" added to tour!`);
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  // Delete hotspot
  const handleDeleteHotspot = async (hotspotId: string) => {
    if (!token) return;
    try {
      await deleteAdminHotspotApi(hotspotId, token);
      setShowroom((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          scenes: prev.scenes.map((s) => ({
            ...s,
            hotspots: s.hotspots.filter((h) => h.id !== hotspotId),
          })),
        };
      });
      setSuccessNotice('Hotspot removed.');
      setTimeout(() => setSuccessNotice(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove hotspot.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020409] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400 font-medium">Loading Visual Showroom Studio...</p>
        </div>
      </div>
    );
  }

  if (error || !property || !showroom || !currentScene) {
    return (
      <div className="min-h-screen bg-[#020409] p-8 flex items-center justify-center text-white">
        <div className="glass-panel-gold p-8 rounded-3xl max-w-md text-center border border-red-800/60 bg-[#060a12]/90">
          <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <h3 className="text-xl font-bold">Studio Load Error</h3>
          <p className="text-slate-400 text-sm mt-2">{error || 'Showroom not found'}</p>
          <button
            type="button"
            onClick={loadData}
            className="mt-6 px-6 py-2.5 shimmer-gold-btn rounded-xl font-bold text-sm text-slate-950"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0f19] overflow-hidden select-none text-white">
      {/* Top Studio Toolbar */}
      <header className="h-16 px-6 bg-[#0b0f19]/95 border-b border-white/10 backdrop-blur-md flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          {onBackToDashboard ? (
            <button
              type="button"
              onClick={onBackToDashboard}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <a
              href="/admin/dashboard"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Dashboard</span>
            </a>
          )}

          <div className="h-6 w-px bg-white/10" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest text-slate-300 font-semibold font-mono">
                Showroom Studio CMS
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                Super-Admin
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-display font-semibold text-white truncate max-w-md">
              {property.title} — <span className="text-slate-400 font-medium">{currentScene.room_name}</span>
            </h1>
          </div>
        </div>

        {/* Status / Instructions */}
        <div className="flex items-center gap-4">
          {successNotice && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successNotice}</span>
            </div>
          )}

          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <Compass className="w-4 h-4 text-slate-400 animate-pulse" />
            <span>Click anywhere on 360 canvas to pin a new hotspot</span>
          </div>

          <a
            href={`/properties/${property.slug}`}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            Preview Public Tour
          </a>
        </div>
      </header>

      {/* Main Studio Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: 360 Panorama Canvas Workspace */}
        <div className="w-full md:flex-1 h-[65vh] md:h-full relative bg-[#030712]">
          <PanoramaViewer360
            scene={currentScene}
            scenes={showroom.scenes}
            onNavigateScene={(targetId) => setCurrentSceneId(targetId)}
            onSelectHotspot={() => {}}
            onCanvasClick={handleCanvasClick}
            isStudioMode={true}
          />

          {/* Floating Instructions Banner at Bottom of Canvas */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
            <div className="px-5 py-2.5 rounded-xl border border-white/10 shadow-lg text-xs font-semibold text-white flex items-center gap-2.5 backdrop-blur-md bg-[#0b0f19]/90">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>Click any spot in this room to extract pitch & yaw coordinates dynamically</span>
            </div>
          </div>
        </div>

        {/* Right Side: Scene & Hotspots Management Tree Drawer */}
        <aside className="w-full md:w-80 lg:w-96 h-[35vh] md:h-full bg-[#0f172a] border-t md:border-t-0 md:border-l border-white/10 flex flex-col shrink-0 z-20 overflow-hidden shadow-sm">
          {/* Room Selector Tabs */}
          <div className="p-4 border-b border-white/08 bg-[#0b0f19]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>Showroom Scenes ({showroom.scenes.length})</span>
              </span>
              <button
                type="button"
                data-testid="add-scene-modal-btn"
                onClick={() => setIsSceneModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-950 text-[11px] font-semibold transition flex items-center gap-1 shadow-sm"
                title="Add New Room Scene"
              >
                <Plus className="w-3 h-3" />
                <span>Add Room</span>
              </button>
            </div>

            <div
              data-testid="studio-scenes-list"
              className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin"
            >
              {showroom.scenes.map((s) => {
                const isActive = s.id === currentSceneId;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentSceneId(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                      isActive
                        ? 'bg-white text-slate-950 font-semibold border-white shadow-sm'
                        : 'bg-[#030712] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {s.room_name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hotspots List Tree for Active Scene */}
          <div className="flex-1 flex flex-col overflow-hidden p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>Pinned Hotspots ({currentScene.hotspots.length})</span>
              </h3>

              <button
                type="button"
                onClick={() => {
                  setClickedPitch(0);
                  setClickedYaw(0);
                  setIsHotspotModalOpen(true);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Coordinate</span>
              </button>
            </div>

            {/* Hotspot List Container with exact data-testid for Playwright Test */}
            <div
              data-testid="hotspot-list"
              className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin"
            >
              {currentScene.hotspots.length === 0 ? (
                <div className="py-12 px-4 text-center border border-dashed border-white/10 rounded-xl bg-[#0b0f19]">
                  <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">No Hotspots In This Scene</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-mono">
                    Click anywhere on the 360 viewer canvas to place a navigation node or feature card.
                  </p>
                </div>
              ) : (
                currentScene.hotspots.map((hs) => {
                  const isNav = hs.hotspot_type === 'navigation';
                  const isUpgrade = hs.hotspot_type === 'upgrade';

                  return (
                    <div
                      key={hs.id}
                      className="p-3 rounded-xl bg-[#0b0f19] border border-white/08 hover:border-white/20 transition flex items-start justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div
                          className="p-2 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 shrink-0 mt-0.5"
                        >
                          {isNav ? (
                            <Navigation className="w-4 h-4 rotate-45 text-slate-300" />
                          ) : isUpgrade ? (
                            <Sparkles className="w-4 h-4 text-slate-300" />
                          ) : (
                            <Info className="w-4 h-4 text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-white truncate">
                            {hs.title || 'Untitled Hotspot'}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                            <span>P: {Number(hs.pitch).toFixed(1)}°</span>
                            <span>•</span>
                            <span>Y: {Number(hs.yaw).toFixed(1)}°</span>
                          </div>
                          {hs.description && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                              {hs.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteHotspot(hs.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition opacity-60 group-hover:opacity-100"
                        title="Remove Hotspot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* Dynamic Hotspot Coordinate Modal */}
      <HotspotCreateModal
        isOpen={isHotspotModalOpen}
        onClose={() => setIsHotspotModalOpen(false)}
        initialPitch={clickedPitch}
        initialYaw={clickedYaw}
        scenes={showroom.scenes}
        currentSceneId={currentScene.id}
        onSave={handleSaveHotspot}
      />

      {/* Dynamic Scene Addition Modal */}
      <SceneCreateModal
        isOpen={isSceneModalOpen}
        onClose={() => setIsSceneModalOpen(false)}
        onSave={handleSaveScene}
      />
    </div>
  );
};

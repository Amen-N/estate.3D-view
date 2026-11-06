import React, { useState, useEffect } from 'react';
import { Property, Showroom, ShowroomHotspot } from '../../types';
import { fetchShowroomApi } from '../../services/api';
import { PanoramaViewer360 } from './PanoramaViewer360';
import { ModelViewer3D } from './ModelViewer3D';
import { HotspotInfoModal } from './HotspotInfoModal';
import {
  X,
  Compass,
  Box,
  Maximize2,
  Minimize2,
  Home,
} from 'lucide-react';

interface ShowroomModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
}

export const ShowroomModal: React.FC<ShowroomModalProps> = ({
  property,
  isOpen,
  onClose,
}) => {
  const [showroom, setShowroom] = useState<Showroom | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'panorama_360' | 'model_3d'>('panorama_360');
  const [selectedHotspot, setSelectedHotspot] = useState<ShowroomHotspot | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Fallback Showroom Generator
  const getFallbackShowroom = (): Showroom => {
    const livingId = 'living-scene-id';
    const kitchenId = 'kitchen-scene-id';
    const masterId = 'master-scene-id';

    return {
      id: 'default-showroom-id',
      property_id: property.id,
      showroom_mode: 'both',
      model_3d_url:
        'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/SheenChair/glTF-Binary/SheenChair.glb',
      model_config: { fov: 45 },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      scenes: [
        {
          id: livingId,
          showroom_id: 'default-showroom-id',
          room_name: 'Grand Living Room',
          panorama_url: 'https://pannellum.org/images/alma.jpg',
          thumbnail_url:
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
          default_pitch: 0.0,
          default_yaw: 10.0,
          sort_order: 0,
          is_initial_scene: true,
          hotspots: [
            {
              id: 'h1',
              scene_id: livingId,
              hotspot_type: 'navigation',
              title: 'Kitchen',
              description: 'Proceed into the Gourmet Chef Kitchen',
              pitch: -2.5,
              yaw: 45.0,
              target_scene_id: kitchenId,
              target_room_name: 'Gourmet Chef Kitchen',
              metadata: {},
              created_at: new Date().toISOString(),
            },
            {
              id: 'h2',
              scene_id: livingId,
              hotspot_type: 'navigation',
              title: 'Master Suite',
              description: 'Enter the luxury bedroom retreat',
              pitch: 0.0,
              yaw: -80.0,
              target_scene_id: masterId,
              target_room_name: 'Master Suite',
              metadata: {},
              created_at: new Date().toISOString(),
            },
            {
              id: 'h3',
              scene_id: livingId,
              hotspot_type: 'info',
              title: 'Curtain Wall Glass',
              description: 'Triple-pane acoustic insulated glazing providing 270-degree skyline views.',
              pitch: 15.0,
              yaw: 12.0,
              target_scene_id: null,
              metadata: { brand: 'Schüco Panorama' },
              created_at: new Date().toISOString(),
            },
            {
              id: 'h4',
              scene_id: livingId,
              hotspot_type: 'upgrade',
              title: 'White Oak Flooring',
              description: 'Hand-scraped chevron white oak timber with integrated acoustic underlay.',
              pitch: -35.0,
              yaw: -10.0,
              target_scene_id: null,
              metadata: { material: 'Chevron Oak', upgrade_cost: 4800 },
              created_at: new Date().toISOString(),
            },
          ],
        },
        {
          id: kitchenId,
          showroom_id: 'default-showroom-id',
          room_name: 'Gourmet Chef Kitchen',
          panorama_url: 'https://pannellum.org/images/cerro-toco-0.jpg',
          thumbnail_url:
            'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80',
          default_pitch: -5.0,
          default_yaw: -45.0,
          sort_order: 1,
          is_initial_scene: false,
          hotspots: [
            {
              id: 'h5',
              scene_id: kitchenId,
              hotspot_type: 'navigation',
              title: 'Living Room',
              description: 'Return to the Grand Living Room',
              pitch: 0.0,
              yaw: -140.0,
              target_scene_id: livingId,
              target_room_name: 'Grand Living Room',
              metadata: {},
              created_at: new Date().toISOString(),
            },
            {
              id: 'h6',
              scene_id: kitchenId,
              hotspot_type: 'upgrade',
              title: 'Marble Waterfall Island',
              description: 'Polished Calacatta Gold bookmatched marble island.',
              pitch: -20.0,
              yaw: 35.0,
              target_scene_id: null,
              metadata: { material: 'Calacatta Gold', upgrade_cost: 7500 },
              created_at: new Date().toISOString(),
            },
          ],
        },
        {
          id: masterId,
          showroom_id: 'default-showroom-id',
          room_name: 'Master Suite',
          panorama_url: 'https://pannellum.org/images/bma-0.jpg',
          thumbnail_url:
            'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80',
          default_pitch: 2.0,
          default_yaw: 90.0,
          sort_order: 2,
          is_initial_scene: false,
          hotspots: [
            {
              id: 'h7',
              scene_id: masterId,
              hotspot_type: 'navigation',
              title: 'Living Room',
              description: 'Return to the Grand Living Room',
              pitch: -5.0,
              yaw: 170.0,
              target_scene_id: livingId,
              target_room_name: 'Grand Living Room',
              metadata: {},
              created_at: new Date().toISOString(),
            },
          ],
        },
      ],
    };
  };

  // Fetch showroom configuration when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setIsLoading(true);
    fetchShowroomApi(property.id)
      .then((data) => {
        setShowroom(data);
        const initialScene = data.scenes.find((s) => s.is_initial_scene) || data.scenes[0];
        if (initialScene) {
          setCurrentSceneId(initialScene.id);
        }
      })
      .catch((_err) => {
        // Use realistic fallback
        const fallback = getFallbackShowroom();
        setShowroom(fallback);
        setCurrentSceneId(fallback.scenes[0].id);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isOpen, property.id]);

  if (!isOpen) return null;

  const currentScene =
    showroom?.scenes.find((s) => s.id === currentSceneId) || showroom?.scenes[0];

  const handleNavigateScene = (targetSceneId: string) => {
    setCurrentSceneId(targetSceneId);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      data-testid="virtual-showroom-modal"
      className="fixed inset-0 z-[100] flex flex-col bg-[#02040a] text-white animate-fadeIn overflow-hidden"
    >
      {/* 1. Showroom Top Navigation Bar */}
      <header className="relative z-30 shrink-0 h-16 sm:h-20 px-4 sm:px-6 bg-[#0b0f19]/95 backdrop-blur-md border-b border-white/10 flex items-center justify-between gap-4 shadow-sm">
        {/* Left: Property & Current Room Details */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 items-center justify-center text-slate-300 shrink-0">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400 truncate hidden md:inline font-mono">
                {property.title}
              </span>
              <span className="hidden md:inline text-slate-700">•</span>
              <span className="text-[10px] font-mono font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 shrink-0 uppercase tracking-widest">
                Interactive VR
              </span>
            </div>

            {/* Crucial: data-testid="current-room-label" */}
            <h2
              data-testid="current-room-label"
              className="text-lg sm:text-xl font-display font-semibold text-white tracking-tight truncate mt-0.5"
            >
              {currentScene?.room_name || 'Virtual Showroom'}
            </h2>
          </div>
        </div>

        {/* Center: Mode Switcher (360 Panorama vs 3D Model) */}
        <div className="flex items-center bg-[#030712] p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            data-testid="mode-toggle-360"
            onClick={() => setViewMode('panorama_360')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition touch-target ${
              viewMode === 'panorama_360'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>360° Panorama</span>
          </button>

          <button
            type="button"
            data-testid="mode-toggle-3d"
            onClick={() => setViewMode('model_3d')}
            className={`flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition touch-target ${
              viewMode === 'model_3d'
                ? 'bg-white text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>3D Model</span>
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            data-testid="fullscreen-showroom-btn"
            onClick={toggleFullscreen}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 flex items-center justify-center transition touch-target"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>

          <button
            type="button"
            data-testid="close-showroom-btn"
            onClick={onClose}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-slate-900 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/40 text-slate-400 hover:text-red-400 flex items-center justify-center transition touch-target"
            title="Close Virtual Showroom"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* 2. Main Viewport Stage */}
      <main className="relative flex-1 w-full h-full overflow-hidden bg-[#030712]">
        {isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#030712]">
            <div className="w-10 h-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <span className="text-slate-400 text-sm font-mono">
              Rendering High-Definition Virtual Showroom...
            </span>
          </div>
        ) : viewMode === 'panorama_360' && currentScene ? (
          <PanoramaViewer360
            scene={currentScene}
            scenes={showroom?.scenes || []}
            onNavigateScene={handleNavigateScene}
            onSelectHotspot={setSelectedHotspot}
          />
        ) : (
          <ModelViewer3D
            modelUrl={showroom?.model_3d_url}
            config={showroom?.model_config}
          />
        )}
      </main>

      {/* 3. Bottom Room Navigation Drawer */}
      {viewMode === 'panorama_360' && showroom && showroom.scenes.length > 1 && (
        <footer className="relative z-30 shrink-0 py-3 sm:py-4 px-4 bg-[#0b0f19]/95 backdrop-blur-md border-t border-white/10 shadow-lg">
          <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
            {showroom.scenes.map((scene, idx) => {
              const isActive = scene.id === currentScene?.id;
              return (
                <button
                  key={scene.id}
                  type="button"
                  data-testid={`scene-select-btn-${idx}`}
                  onClick={() => setCurrentSceneId(scene.id)}
                  className={`flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition touch-target shrink-0 border ${
                    isActive
                      ? 'bg-white text-slate-950 border-white shadow-sm'
                      : 'bg-[#030712] border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <Home className="w-4 h-4 shrink-0" />
                  <span>{scene.room_name}</span>
                </button>
              );
            })}
          </div>
        </footer>
      )}

      {/* 4. Hotspot Specification / Upgrade Modal */}
      <HotspotInfoModal
        hotspot={selectedHotspot}
        onClose={() => setSelectedHotspot(null)}
      />
    </div>
  );
};

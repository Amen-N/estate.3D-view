import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Center, Float } from '@react-three/drei';
import * as THREE from 'three';
import { RotateCcw, Play, Pause, Sun, Moon, Layers } from 'lucide-react';

interface ModelViewer3DProps {
  modelUrl?: string | null;
  config?: Record<string, any>;
}

// Procedural Architectural Showcase Component
const ArchitecturalPenthouse: React.FC<{ lightMode: 'day' | 'evening' }> = ({ lightMode }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Subtle floating ambient rotation
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.04;
    }
  });

  const floorColor = lightMode === 'day' ? '#242b35' : '#141820';
  const sofaColor = lightMode === 'day' ? '#e2e8f0' : '#cbd5e1';
  const marbleColor = '#f8fafc';

  return (
    <group ref={groupRef} position={[0, -0.6, 0]}>
      {/* 1. Main Architectural Platform (Floor Slab) */}
      <mesh receiveShadow position={[0, -0.05, 0]}>
        <boxGeometry args={[7, 0.1, 7]} />
        <meshStandardMaterial color={floorColor} roughness={0.2} metalness={0.1} />
      </mesh>

      {/* Perimeter Glow Edge */}
      <mesh position={[0, -0.06, 0]}>
        <boxGeometry args={[7.1, 0.05, 7.1]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* 2. Glass Curtain Wall Backdrop */}
      <mesh position={[0, 1.5, -3.4]}>
        <boxGeometry args={[6.8, 3, 0.05]} />
        <meshPhysicalMaterial
          color="#93c5fd"
          transparent
          opacity={0.35}
          roughness={0.05}
          transmission={0.9}
          thickness={0.5}
        />
      </mesh>

      {/* Mullions / Window Frame Beams */}
      {[-2.2, 0, 2.2].map((x) => (
        <mesh key={x} position={[x, 1.5, -3.38]}>
          <boxGeometry args={[0.08, 3, 0.08]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} />
        </mesh>
      ))}

      {/* 3. Luxury Sectional Sofa */}
      {/* Base Cushion */}
      <mesh castShadow receiveShadow position={[0, 0.25, 0.4]}>
        <boxGeometry args={[3.2, 0.4, 1.6]} />
        <meshStandardMaterial color={sofaColor} roughness={0.7} />
      </mesh>
      {/* Backrest */}
      <mesh castShadow receiveShadow position={[0, 0.65, -0.3]}>
        <boxGeometry args={[3.2, 0.6, 0.35]} />
        <meshStandardMaterial color={sofaColor} roughness={0.7} />
      </mesh>
      {/* Left Chaise Extension */}
      <mesh castShadow receiveShadow position={[-1.1, 0.25, 1.3]}>
        <boxGeometry args={[1.0, 0.4, 1.4]} />
        <meshStandardMaterial color={sofaColor} roughness={0.7} />
      </mesh>

      {/* Accent Pillows */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} castShadow position={[x, 0.55, -0.1]}>
          <boxGeometry args={[0.45, 0.35, 0.2]} />
          <meshStandardMaterial color={i === 0 ? '#0284c7' : '#f59e0b'} roughness={0.5} />
        </mesh>
      ))}

      {/* 4. Minimalist Calacatta Marble Coffee Table */}
      <mesh castShadow receiveShadow position={[0.2, 0.2, 1.4]}>
        <boxGeometry args={[1.5, 0.2, 0.8]} />
        <meshStandardMaterial color={marbleColor} roughness={0.15} metalness={0.2} />
      </mesh>
      {/* Gold Table Legs */}
      {[
        [-0.45, 0.8],
        [0.85, 0.8],
        [-0.45, 2.0],
        [0.85, 2.0],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z - 0.6]}>
          <cylinderGeometry args={[0.02, 0.02, 0.16]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}

      {/* Decorative Books & Vase on Table */}
      <mesh position={[0.4, 0.35, 1.4]} castShadow>
        <cylinderGeometry args={[0.08, 0.05, 0.18, 16]} />
        <meshStandardMaterial color="#0284c7" roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.32, 1.4]} castShadow>
        <boxGeometry args={[0.3, 0.04, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* 5. Modern Ceramic Planter & Ficus Tree */}
      <group position={[2.5, 0, -2.2]}>
        <mesh castShadow position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.35, 0.25, 0.7, 24]} />
          <meshStandardMaterial color="#1e293b" roughness={0.4} />
        </mesh>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.1}>
          <mesh castShadow position={[0, 1.2, 0]}>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color="#166534" roughness={0.8} />
          </mesh>
        </Float>
      </group>

      {/* 6. Sculptural Floor Lamp */}
      <group position={[-2.5, 0, -2.2]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 24]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} />
        </mesh>
        <mesh position={[0, 1.3, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 2.6]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} />
        </mesh>
        <mesh position={[0, 2.5, 0]} castShadow>
          <sphereGeometry args={[0.22, 24, 24]} />
          <meshStandardMaterial
            color="#fef08a"
            emissive="#fef08a"
            emissiveIntensity={lightMode === 'day' ? 0.8 : 2.0}
          />
        </mesh>
        <pointLight
          position={[0, 2.5, 0]}
          intensity={lightMode === 'day' ? 2 : 5}
          color="#fef08a"
          distance={5}
        />
      </group>
    </group>
  );
};

export const ModelViewer3D: React.FC<ModelViewer3DProps> = ({ config }) => {
  const [autoRotate, setAutoRotate] = useState(true);
  const [lightMode, setLightMode] = useState<'day' | 'evening'>('day');
  const controlsRef = useRef<any>(null);

  const resetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [3.8, 3.2, 4.2],
          fov: config?.fov || 45,
        }}
        className="w-full h-full"
      >
        <color attach="background" args={[lightMode === 'day' ? '#090d16' : '#030712']} />

        {/* Ambient & Directional Lights */}
        <ambientLight intensity={lightMode === 'day' ? 0.7 : 0.25} />
        <directionalLight
          position={[5, 8, 4]}
          intensity={lightMode === 'day' ? 1.4 : 0.6}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-4, 4, -4]} intensity={0.3} color="#38bdf8" />

        <Suspense fallback={null}>
          <Center>
            <ArchitecturalPenthouse lightMode={lightMode} />
          </Center>
        </Suspense>

        <OrbitControls
          ref={controlsRef}
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={0.8}
          minDistance={2}
          maxDistance={12}
          maxPolarAngle={Math.PI / 2 - 0.05} // prevent going below floor
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Floating 3D Controls Rail */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Auto Rotate Toggle */}
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition shadow-lg backdrop-blur-md border ${
            autoRotate
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'glass-card border-slate-700/80 text-slate-300 hover:text-white hover:border-amber-500/30'
          }`}
          title={autoRotate ? 'Pause Auto-Rotation' : 'Start Auto-Rotation'}
        >
          {autoRotate ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        {/* Lighting Mode Toggle */}
        <button
          type="button"
          onClick={() => setLightMode(lightMode === 'day' ? 'evening' : 'day')}
          className="w-12 h-12 rounded-2xl glass-card border border-slate-700/80 hover:border-amber-500/30 text-slate-300 hover:text-amber-300 flex items-center justify-center transition shadow-lg backdrop-blur-md"
          title={`Switch to ${lightMode === 'day' ? 'Evening Mood' : 'Daylight Mood'}`}
        >
          {lightMode === 'day' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
        </button>

        {/* Reset Camera Button */}
        <button
          type="button"
          onClick={resetCamera}
          className="w-12 h-12 rounded-2xl glass-card border border-slate-700/80 hover:border-amber-500/30 text-slate-300 hover:text-white flex items-center justify-center transition shadow-lg backdrop-blur-md"
          title="Reset Camera View"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Hint Banner */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
        <div className="px-4 py-2 rounded-full glass-panel-gold text-xs text-amber-300/90 border border-amber-500/30 shadow-xl backdrop-blur-md flex items-center gap-2 bg-[#020409]/90">
          <Layers className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Architectural 3D Space • Orbit with Touch or Mouse</span>
        </div>
      </div>
    </div>
  );
};

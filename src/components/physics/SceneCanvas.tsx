'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';

import { FurnitureMesh, GlbModel, type Preset } from './FurnitureMesh';

export type Frame = {
  frame_number: number;
  object_ref: number;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  timestamp: number;
};

export type ObjectState = {
  id: number;
  furnitureTitle: string;
  preset: Preset;
  modelUrl: string | null;
  width: number;
  depth: number;
  height: number;
  color: string;
  frames: Frame[];
};

export function generateColor(id: number): string {
  const h = (id * 137.508) % 360;
  return `hsl(${h}, 55%, 58%)`;
}

export function buildObjects(
  frames: Frame[],
  infoByRef: Map<number, { title: string; preset: string; width: number; height: number; depth: number; model_url: string | null }>,
): ObjectState[] {
  const objectMap = new Map<number, ObjectState>();
  frames.forEach((f) => {
    if (!objectMap.has(f.object_ref)) {
      const it = infoByRef.get(f.object_ref);
      objectMap.set(f.object_ref, {
        id: f.object_ref,
        furnitureTitle: it?.title || `Objet ${f.object_ref}`,
        preset: ((it?.preset as string) || 'box') as Preset,
        modelUrl: it?.model_url || null,
        width: it?.width || 0.5,
        depth: it?.depth || 0.5,
        height: it?.height || 0.5,
        color: generateColor(f.object_ref),
        frames: [],
      });
    }
    objectMap.get(f.object_ref)!.frames.push(f);
  });
  objectMap.forEach((o) => o.frames.sort((a, b) => a.frame_number - b.frame_number));
  return Array.from(objectMap.values());
}

function FurnitureObject({
  object,
  isPlaying,
  speed,
  resetKey,
}: {
  object: ObjectState;
  isPlaying: boolean;
  speed: number;
  resetKey: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const elapsedRef = useRef(0);

  const frames = object.frames;
  const duration = frames.length > 0 ? frames[frames.length - 1].timestamp : 1;

  useEffect(() => {
    elapsedRef.current = 0;
  }, [resetKey]);

  useFrame((_, delta) => {
    if (!groupRef.current || frames.length === 0) return;

    if (isPlaying) {
      elapsedRef.current += delta * speed;
    }
    const t = Math.min(elapsedRef.current, duration);

    let frameIdx = 0;
    for (let i = 0; i < frames.length - 1; i++) {
      if (frames[i].timestamp <= t && frames[i + 1].timestamp > t) {
        frameIdx = i;
        break;
      }
      if (t >= duration) frameIdx = frames.length - 1;
    }

    const f0 = frames[frameIdx];
    const f1 = frames[Math.min(frameIdx + 1, frames.length - 1)];
    const alpha = f1.timestamp > f0.timestamp
      ? (t - f0.timestamp) / (f1.timestamp - f0.timestamp)
      : 0;

    groupRef.current.position.set(
      f0.position_x + alpha * (f1.position_x - f0.position_x),
      f0.position_y + alpha * (f1.position_y - f0.position_y),
      f0.position_z + alpha * (f1.position_z - f0.position_z),
    );
    groupRef.current.rotation.set(
      THREE.MathUtils.degToRad(f0.rotation_x + alpha * (f1.rotation_x - f0.rotation_x)),
      THREE.MathUtils.degToRad(f0.rotation_y + alpha * (f1.rotation_y - f0.rotation_y)),
      THREE.MathUtils.degToRad(f0.rotation_z + alpha * (f1.rotation_z - f0.rotation_z)),
    );
  });

  return (
    <group ref={groupRef}>
      {object.modelUrl ? (
        <GlbModel
          url={object.modelUrl}
          width={object.width}
          depth={object.depth}
          height={object.height}
        />
      ) : (
        <FurnitureMesh
          preset={object.preset}
          width={object.width}
          depth={object.depth}
          height={object.height}
          color={object.color}
        />
      )}
      <Text
        fontSize={0.12}
        anchorX="center"
        anchorY="middle"
        position={[0, object.height / 2 + 0.15, 0]}
        color="#334155"
      >
        {object.furnitureTitle}
      </Text>
    </group>
  );
}

export function SceneCanvas({
  objects,
  autoPlay = true,
  footerLabel,
}: {
  objects: ObjectState[];
  autoPlay?: boolean;
  footerLabel?: string;
}) {
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [speed, setSpeed] = useState(1);
  const [resetKey, setResetKey] = useState(0);

  return (
    <div className="relative w-full h-full">
      <Canvas shadows camera={{ position: [3.5, 3.5, 3.5], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <Grid args={[20, 20]} cellColor="#e5e7eb" sectionColor="#cbd5e1" infiniteGrid />
        <OrbitControls makeDefault />
        <Suspense fallback={null}>
          {objects.map((obj) => (
            <FurnitureObject
              key={obj.id}
              object={obj}
              isPlaying={isPlaying}
              speed={speed}
              resetKey={resetKey}
            />
          ))}
        </Suspense>
      </Canvas>

      <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 p-2 bg-white/90 backdrop-blur rounded-lg border border-gray-200 shadow-md">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition"
        >
          {isPlaying ? 'Pause' : 'Lecture'}
        </button>
        <button
          onClick={() => {
            setIsPlaying(false);
            setResetKey((k) => k + 1);
            setIsPlaying(true);
          }}
          className="px-3 py-1.5 border border-gray-200 text-secondary rounded text-sm font-medium hover:bg-gray-50 transition"
        >
          Rejouer
        </button>
        <label className="text-xs text-gray-600">Vitesse</label>
        <input
          type="range"
          min="0.25"
          max="3"
          step="0.25"
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-24 accent-blue-600"
        />
        <span className="text-xs text-gray-600 ml-auto">
          {footerLabel || `${objects.length} objet(s) — physique MuJoCo`}
        </span>
      </div>
    </div>
  );
}

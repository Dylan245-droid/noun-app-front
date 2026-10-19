'use client';

import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { FurnitureMesh, GlbModel, type Preset } from './FurnitureMesh';

type Props = {
  preset: Preset;
  width: number;
  depth: number;
  height: number;
  modelUrl?: string | null;
};

export function CatalogPreview({ preset, width, depth, height, modelUrl }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { rootMargin: '100px' },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden"
    >
      {visible && (
        <Canvas frameloop="demand" dpr={1} camera={{ position: [1.8, 1.4, 1.8], fov: 40 }}>
          <ambientLight intensity={0.9} />
          <directionalLight position={[3, 5, 3]} intensity={1.1} />
          <group rotation={[0, Math.PI / 6, 0]}>
            {modelUrl ? (
              <GlbModel
                url={modelUrl}
                width={width}
                depth={depth}
                height={height}
              />
            ) : (
              <FurnitureMesh
                preset={preset}
                width={width}
                depth={depth}
                height={height}
                color="#64748b"
              />
            )}
          </group>
        </Canvas>
      )}
    </div>
  );
}

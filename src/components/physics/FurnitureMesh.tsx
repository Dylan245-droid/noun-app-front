'use client';

import { useMemo } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export type Preset =
  | 'box' | 'chair' | 'table' | 'sofa'
  | 'shelf' | 'lamp' | 'rug' | 'plant';

type Props = {
  preset: Preset;
  width: number;
  depth: number;
  height: number;
  color: string;
};

function Leg({
  x, z, height, size, color,
}: { x: number; z: number; height: number; size: number; color: string }) {
  return (
    <mesh position={[x, -height / 2 + height * 0.25, z]} castShadow>
      <boxGeometry args={[size, height * 0.5, size]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

export function FurnitureMesh({ preset, width, depth, height, color }: Props) {
  const w = width, d = depth, h = height;

  const legs = useMemo(() => {
    const lx = w / 2 - 0.04;
    const lz = d / 2 - 0.04;
    return [
      [lx, lz], [-lx, lz], [lx, -lz], [-lx, -lz],
    ];
  }, [w, d]);

  switch (preset) {
    case 'chair':
      return (
        <group>
          <mesh position={[0, h * 0.1, 0]} castShadow>
            <boxGeometry args={[w, h * 0.15, d]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, h * 0.15, -d / 2 + 0.03]} castShadow>
            <boxGeometry args={[w, h * 0.6, 0.06]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {legs.map(([x, z], i) => (
            <Leg key={i} x={x * 0.85} z={z * 0.85} height={h} size={0.05} color={color} />
          ))}
        </group>
      );

    case 'table':
      return (
        <group>
          <mesh position={[0, h * 0.35, 0]} castShadow>
            <boxGeometry args={[w, h * 0.12, d]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {legs.map(([x, z], i) => (
            <Leg key={i} x={x * 0.9} z={z * 0.9} height={h} size={0.06} color={color} />
          ))}
        </group>
      );

    case 'sofa':
      return (
        <group>
          <mesh position={[0, -h * 0.1, 0]} castShadow>
            <boxGeometry args={[w, h * 0.5, d]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, h * 0.15, -d / 2 + 0.08]} castShadow>
            <boxGeometry args={[w, h * 0.55, 0.16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[-w / 2 + 0.08, h * 0.05, 0]} castShadow>
            <boxGeometry args={[0.16, h * 0.45, d]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[w / 2 - 0.08, h * 0.05, 0]} castShadow>
            <boxGeometry args={[0.16, h * 0.45, d]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );

    case 'shelf':
      return (
        <group>
          <mesh position={[0, 0, -d / 2 + 0.02]} castShadow>
            <boxGeometry args={[w, h, 0.04]} />
            <meshStandardMaterial color={color} />
          </mesh>
          {[-0.5, 0, 0.5].map((f, i) => (
            <mesh key={i} position={[0, h * f, 0]} castShadow>
              <boxGeometry args={[w, 0.03, d]} />
              <meshStandardMaterial color={color} />
            </mesh>
          ))}
        </group>
      );

    case 'lamp':
      return (
        <group>
          <mesh position={[0, -h / 2 + 0.02, 0]} castShadow>
            <cylinderGeometry args={[w * 0.35, w * 0.4, 0.04, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, h * 0.8, 12]} />
            <meshStandardMaterial color="#94a3b8" />
          </mesh>
          <mesh position={[0, h * 0.3, 0]} castShadow>
            <coneGeometry args={[w * 0.45, h * 0.35, 16, 1, true]} />
            <meshStandardMaterial color={color} side={2} />
          </mesh>
        </group>
      );

    case 'rug':
      return (
        <mesh position={[0, -h / 2 + 0.01, 0]} receiveShadow>
          <boxGeometry args={[w, Math.max(h, 0.02), d]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );

    case 'plant':
      return (
        <group>
          <mesh position={[0, -h / 2 + h * 0.18, 0]} castShadow>
            <cylinderGeometry args={[w * 0.35, w * 0.28, h * 0.36, 16]} />
            <meshStandardMaterial color="#b45309" />
          </mesh>
          <mesh position={[0, h * 0.15, 0]} castShadow>
            <sphereGeometry args={[Math.max(w, d) * 0.45, 16, 16]} />
            <meshStandardMaterial color="#15803d" />
          </mesh>
        </group>
      );

    case 'box':
    default:
      return (
        <mesh castShadow receiveShadow>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
  }
}

export function GlbModel({
  url,
  width,
  depth,
  height,
}: {
  url: string;
  width: number;
  depth: number;
  height: number;
}) {
  const { scene } = useGLTF(url);

  const { clone, scale, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const s = new THREE.Vector3(
      size.x > 1e-6 ? width / size.x : 1,
      size.y > 1e-6 ? height / size.y : 1,
      size.z > 1e-6 ? depth / size.z : 1,
    );

    return { clone: scene.clone(true), scale: s, offset: center };
  }, [scene, width, height, depth]);

  return (
    <group scale={[scale.x, scale.y, scale.z]}>
      <primitive object={clone} position={[-offset.x, -offset.y, -offset.z]} />
    </group>
  );
}

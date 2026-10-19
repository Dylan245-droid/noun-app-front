'use client';

import { Suspense, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls, useTexture } from '@react-three/drei';

import { FurnitureMesh, GlbModel, type Preset } from './FurnitureMesh';

export type PreviewObject = {
  furnitureTitle: string;
  preset: Preset;
  modelUrl: string | null;
  width: number;
  depth: number;
  height: number;
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_y: number;
  color: string;
};

export type PreviewOpening = { side: 'N' | 'S' | 'E' | 'W'; position: number; width: number };

export type PreviewRoom = {
  key: string;
  width: number;
  depth: number;
  height: number;
  offset_x: number;
  offset_z: number;
  floor_material?: string;
  wall_material?: string;
  openings?: PreviewOpening[];
  objects: PreviewObject[];
};

export type MaterialColors = Record<string, { color: string; roughness?: number; texture?: string | null }>;

function TexturedMaterial({
  url,
  roughness,
  opacity,
}: {
  url: string;
  roughness: number;
  opacity?: number;
}) {
  const map = useTexture(url);
  return (
    <meshStandardMaterial
      map={map}
      roughness={roughness}
      transparent={opacity != null}
      opacity={opacity ?? 1}
    />
  );
}

function SurfaceMaterial({
  color,
  roughness,
  texture,
  opacity,
}: {
  color: string;
  roughness: number;
  texture?: string | null;
  opacity?: number;
}) {
  if (texture) {
    return <TexturedMaterial url={texture} roughness={roughness} opacity={opacity} />;
  }
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      transparent={opacity != null}
      opacity={opacity ?? 1}
    />
  );
}

const WALL_H = 0.28;
const WALL_T = 0.05;
const DOOR = 0.9;
const ADJACENCY_EPS = 0.25;

type Side = 'N' | 'S' | 'W' | 'E';
type Gap = { center: number; width: number };

function autoGap(room: PreviewRoom, side: Side, rooms: PreviewRoom[]): Gap | null {
  const vertical = side === 'N' || side === 'S';
  const edge = vertical
    ? side === 'N' ? room.offset_z - room.depth / 2 : room.offset_z + room.depth / 2
    : side === 'W' ? room.offset_x - room.width / 2 : room.offset_x + room.width / 2;

  for (const other of rooms) {
    if (other.key === room.key) continue;
    const otherEdge = vertical
      ? side === 'N' ? other.offset_z + other.depth / 2 : other.offset_z - other.depth / 2
      : side === 'W' ? other.offset_x + other.width / 2 : other.offset_x - other.width / 2;
    if (Math.abs(otherEdge - edge) > ADJACENCY_EPS) continue;

    const aMin = vertical ? room.offset_x - room.width / 2 : room.offset_z - room.depth / 2;
    const aMax = vertical ? room.offset_x + room.width / 2 : room.offset_z + room.depth / 2;
    const bMin = vertical ? other.offset_x - other.width / 2 : other.offset_z - other.depth / 2;
    const bMax = vertical ? other.offset_x + other.width / 2 : other.offset_z + other.depth / 2;
    const oMin = Math.max(aMin, bMin);
    const oMax = Math.min(aMax, bMax);
    if (oMax - oMin > 0.9) {
      return { center: (oMin + oMax) / 2, width: DOOR };
    }
  }
  return null;
}

function gapsForSide(room: PreviewRoom, side: Side, rooms: PreviewRoom[]): Gap[] {
  const manual = (room.openings || []).filter((o) => o.side === side);
  if (manual.length > 0) {
    const vertical = side === 'N' || side === 'S';
    return manual.map((o) => ({
      center: (vertical ? room.offset_x : room.offset_z) + o.position,
      width: Math.max(0.4, o.width || DOOR),
    }));
  }
  const auto = autoGap(room, side, rooms);
  return auto ? [auto] : [];
}

function wallSegments(min: number, max: number, gaps: Gap[]): [number, number][] {
  const sorted = gaps
    .map((g) => ({ a: g.center - g.width / 2, b: g.center + g.width / 2 }))
    .sort((x, y) => x.a - y.a);
  const segments: [number, number][] = [];
  let cursor = min;
  for (const g of sorted) {
    const a = Math.max(min, g.a);
    const b = Math.min(max, g.b);
    if (b <= a) continue;
    if (a > cursor + 0.05) segments.push([cursor, a]);
    cursor = Math.max(cursor, b);
  }
  if (max > cursor + 0.05) segments.push([cursor, max]);
  return segments;
}

function Wall({
  axis,
  fixed,
  min,
  max,
  gaps,
  color,
  roughness,
  texture,
}: {
  axis: 'x' | 'z';
  fixed: number;
  min: number;
  max: number;
  gaps: Gap[];
  color: string;
  roughness: number;
  texture?: string | null;
}) {
  return (
    <>
      {wallSegments(min, max, gaps).map(([a, b], i) => {
        const len = b - a;
        const c = (a + b) / 2;
        return (
          <mesh key={i} position={axis === 'x' ? [c, WALL_H / 2, fixed] : [fixed, WALL_H / 2, c]}>
            <boxGeometry args={axis === 'x' ? [len, WALL_H, WALL_T] : [WALL_T, WALL_H, len]} />
            <SurfaceMaterial color={color} roughness={roughness} texture={texture} opacity={0.7} />
          </mesh>
        );
      })}
    </>
  );
}

function Room({
  room,
  rooms,
  materials,
}: {
  room: PreviewRoom;
  rooms: PreviewRoom[];
  materials: MaterialColors;
}) {
  const ox = room.offset_x;
  const oz = room.offset_z;
  const w = room.width;
  const d = room.depth;

  const floor = materials[room.floor_material || ''] || { color: '#eef2f7', roughness: 0.9 };
  const wall = materials[room.wall_material || ''] || { color: '#1E3A5F', roughness: 0.9 };

  return (
    <group>
      <mesh position={[ox, -0.01, oz]} receiveShadow>
        <boxGeometry args={[w, 0.02, d]} />
        <SurfaceMaterial color={floor.color} roughness={floor.roughness ?? 0.9} texture={floor.texture} />
      </mesh>

      <Wall axis="x" fixed={oz - d / 2} min={ox - w / 2} max={ox + w / 2} gaps={gapsForSide(room, 'N', rooms)} color={wall.color} roughness={wall.roughness ?? 0.9} texture={wall.texture} />
      <Wall axis="x" fixed={oz + d / 2} min={ox - w / 2} max={ox + w / 2} gaps={gapsForSide(room, 'S', rooms)} color={wall.color} roughness={wall.roughness ?? 0.9} texture={wall.texture} />
      <Wall axis="z" fixed={ox - w / 2} min={oz - d / 2} max={oz + d / 2} gaps={gapsForSide(room, 'W', rooms)} color={wall.color} roughness={wall.roughness ?? 0.9} texture={wall.texture} />
      <Wall axis="z" fixed={ox + w / 2} min={oz - d / 2} max={oz + d / 2} gaps={gapsForSide(room, 'E', rooms)} color={wall.color} roughness={wall.roughness ?? 0.9} texture={wall.texture} />

      <Suspense fallback={null}>
        {room.objects.map((o, i) => (
          <group
            key={i}
            position={[ox + o.position_x, o.position_y, oz + o.position_z]}
            rotation={[0, (o.rotation_y * Math.PI) / 180, 0]}
          >
            {o.modelUrl ? (
              <GlbModel url={o.modelUrl} width={o.width} depth={o.depth} height={o.height} />
            ) : (
              <FurnitureMesh
                preset={o.preset}
                width={o.width}
                depth={o.depth}
                height={o.height}
                color={o.color}
              />
            )}
          </group>
        ))}
      </Suspense>
    </group>
  );
}

export function BuildingPreview({
  rooms,
  materials = {},
}: {
  rooms: PreviewRoom[];
  materials?: MaterialColors;
}) {
  const { center, extent } = useMemo(() => {
    if (rooms.length === 0) return { center: { x: 0, z: 0 }, extent: 8 };
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    rooms.forEach((r) => {
      minX = Math.min(minX, r.offset_x - r.width / 2);
      maxX = Math.max(maxX, r.offset_x + r.width / 2);
      minZ = Math.min(minZ, r.offset_z - r.depth / 2);
      maxZ = Math.max(maxZ, r.offset_z + r.depth / 2);
    });
    return {
      center: { x: (minX + maxX) / 2, z: (minZ + maxZ) / 2 },
      extent: Math.max(maxX - minX, maxZ - minZ, 5),
    };
  }, [rooms]);

  const cam = extent * 1.15;

  return (
    <Canvas shadows camera={{ position: [cam, cam * 0.9, cam], fov: 45 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[8, 14, 8]} intensity={1.1} castShadow />
      <Grid args={[60, 60]} cellColor="#e2e8f0" sectionColor="#cbd5e1" infiniteGrid />
      <OrbitControls makeDefault minDistance={3} maxDistance={80} />
      <group position={[-center.x, 0, -center.z]}>
        {rooms.map((room) => (
          <Suspense key={room.key} fallback={null}>
            <Room room={room} rooms={rooms} materials={materials} />
          </Suspense>
        ))}
      </group>
    </Canvas>
  );
}

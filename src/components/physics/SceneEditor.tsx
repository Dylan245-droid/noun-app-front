'use client';

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, TransformControls } from '@react-three/drei';
import * as THREE from 'three';

import { FurnitureMesh, GlbModel, type Preset } from './FurnitureMesh';

export type SceneInfo = {
  width: number;
  depth: number;
  height: number;
  floor_material: string;
};

export type EditorObject = {
  id: number;
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

export type CommitTransform = {
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_y: number;
};

function Room({ scene }: { scene: SceneInfo }) {
  const w = scene.width;
  const d = scene.depth;
  const h = scene.height;
  const t = 0.05;

  return (
    <group>
      {/* Sol */}
      <mesh position={[0, -0.01, 0]} receiveShadow>
        <boxGeometry args={[w, 0.02, d]} />
        <meshStandardMaterial color="#f1f5f9" />
      </mesh>
      {/* Murs */}
      <mesh position={[0, h / 2, -d / 2]}>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, h / 2, d / 2]}>
        <boxGeometry args={[w, h, t]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-w / 2, h / 2, 0]}>
        <boxGeometry args={[t, h, d]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[w / 2, h / 2, 0]}>
        <boxGeometry args={[t, h, d]} />
        <meshStandardMaterial color="#e2e8f0" transparent opacity={0.35} side={THREE.DoubleSide} />
      </mesh>
      <Grid
        args={[w, d]}
        position={[0, 0.005, 0]}
        cellSize={0.25}
        cellColor="#cbd5e1"
        sectionSize={1}
        sectionColor="#94a3b8"
        fadeDistance={30}
        infiniteGrid={false}
      />
    </group>
  );
}

function EditorItem({
  obj,
  selected,
  mode,
  onSelect,
  onCommit,
}: {
  obj: EditorObject;
  selected: boolean;
  mode: 'translate' | 'rotate';
  onSelect: (id: number) => void;
  onCommit: (id: number, t: CommitTransform) => void;
}) {
  const ref = useRef<THREE.Group>(null);

  const content = (
    <group
      ref={ref}
      position={[obj.position_x, obj.position_y, obj.position_z]}
      rotation={[0, THREE.MathUtils.degToRad(obj.rotation_y), 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(obj.id);
      }}
    >
      {obj.modelUrl ? (
        <GlbModel
          url={obj.modelUrl}
          width={obj.width}
          depth={obj.depth}
          height={obj.height}
        />
      ) : (
        <FurnitureMesh
          preset={obj.preset}
          width={obj.width}
          depth={obj.depth}
          height={obj.height}
          color={obj.color}
        />
      )}
      {/* Boîte de sélection */}
      <mesh visible={selected}>
        <boxGeometry args={[obj.width, obj.height, obj.depth]} />
        <meshBasicMaterial color="#2563eb" wireframe />
      </mesh>
    </group>
  );

  if (!selected) return content;

  const commit = () => {
    const g = ref.current;
    if (!g) return;
    onCommit(obj.id, {
      position_x: g.position.x,
      position_y: g.position.y,
      position_z: g.position.z,
      rotation_y: THREE.MathUtils.radToDeg(g.rotation.y),
    });
  };

  return (
    <TransformControls
      mode={mode}
      translationSnap={0.1}
      rotationSnap={Math.PI / 12}
      showY={mode !== 'translate'}
      onMouseUp={commit}
    >
      {content}
    </TransformControls>
  );
}

export function SceneEditor({
  scene,
  objects,
  selectedId,
  mode,
  onSelect,
  onCommit,
}: {
  scene: SceneInfo;
  objects: EditorObject[];
  selectedId: number | null;
  mode: 'translate' | 'rotate';
  onSelect: (id: number | null) => void;
  onCommit: (id: number, t: CommitTransform) => void;
}) {
  return (
    <Canvas
      shadows
      camera={{ position: [scene.width * 0.9, scene.height * 1.4, scene.depth * 0.9], fov: 50 }}
      onPointerMissed={() => onSelect(null)}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[6, 12, 6]} intensity={1.1} castShadow />
      <Room scene={scene} />
      <OrbitControls makeDefault minDistance={1} maxDistance={40} />
      <Suspense fallback={null}>
        {objects.map((obj) => (
          <EditorItem
            key={obj.id}
            obj={obj}
            selected={selectedId === obj.id}
            mode={mode}
            onSelect={onSelect}
            onCommit={onCommit}
          />
        ))}
      </Suspense>
    </Canvas>
  );
}

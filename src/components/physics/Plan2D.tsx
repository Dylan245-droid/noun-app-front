'use client';

import { useMemo, useRef, useState } from 'react';

export type PlanObject = {
  position_x: number;
  position_z: number;
  width: number;
  depth: number;
};

export type PlanRoom = {
  key: string;
  label: string;
  width: number;
  depth: number;
  offset_x: number;
  offset_z: number;
  objects: PlanObject[];
};

export type RoomSize = {
  width: number;
  depth: number;
  offset_x: number;
  offset_z: number;
};

type Corner = 'nw' | 'ne' | 'sw' | 'se';

type Interaction =
  | { type: 'move'; key: string; startX: number; startZ: number; originX: number; originZ: number }
  | { type: 'resize'; key: string; corner: Corner; fx: number; fz: number };

type Preview = { key: string; width: number; depth: number; offset_x: number; offset_z: number };

const MIN_SIZE = 1.5;

function snap(v: number) {
  return Math.round(v * 2) / 2;
}

function cornerAnchor(room: PlanRoom, corner: Corner) {
  const halfW = room.width / 2;
  const halfD = room.depth / 2;
  const sides: Record<Corner, [number, number]> = {
    nw: [room.offset_x + halfW, room.offset_z + halfD],
    ne: [room.offset_x - halfW, room.offset_z + halfD],
    sw: [room.offset_x + halfW, room.offset_z - halfD],
    se: [room.offset_x - halfW, room.offset_z - halfD],
  };
  const [fx, fz] = sides[corner];
  return { fx, fz };
}

export function Plan2D({
  rooms,
  selectedKey,
  onSelect,
  onMove,
  onResize,
}: {
  rooms: PlanRoom[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onMove: (key: string, offsetX: number, offsetZ: number) => void;
  onResize: (key: string, size: RoomSize) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const interactionRef = useRef<Interaction | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);

  const bounds = useMemo(() => {
    if (rooms.length === 0) return { minX: -5, minZ: -5, width: 10, depth: 10 };
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    rooms.forEach((r) => {
      minX = Math.min(minX, r.offset_x - r.width / 2);
      maxX = Math.max(maxX, r.offset_x + r.width / 2);
      minZ = Math.min(minZ, r.offset_z - r.depth / 2);
      maxZ = Math.max(maxZ, r.offset_z + r.depth / 2);
    });
    const m = 1.2;
    return { minX: minX - m, minZ: minZ - m, width: maxX - minX + m * 2, depth: maxZ - minZ + m * 2 };
  }, [rooms]);

  const toSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const p = pt.matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  };

  const startMove = (e: React.PointerEvent, room: PlanRoom) => {
    e.stopPropagation();
    onSelect(room.key);
    const p = toSvg(e.clientX, e.clientY);
    interactionRef.current = {
      type: 'move',
      key: room.key,
      startX: p.x,
      startZ: p.y,
      originX: room.offset_x,
      originZ: room.offset_z,
    };
    setPreview({ key: room.key, width: room.width, depth: room.depth, offset_x: room.offset_x, offset_z: room.offset_z });
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const startResize = (e: React.PointerEvent, room: PlanRoom, corner: Corner) => {
    e.stopPropagation();
    onSelect(room.key);
    const { fx, fz } = cornerAnchor(room, corner);
    interactionRef.current = { type: 'resize', key: room.key, corner, fx, fz };
    setPreview({ key: room.key, width: room.width, depth: room.depth, offset_x: room.offset_x, offset_z: room.offset_z });
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };

  const handleMove = (e: React.PointerEvent) => {
    const it = interactionRef.current;
    if (!it) return;
    const p = toSvg(e.clientX, e.clientY);

    if (it.type === 'move') {
      setPreview((prev) => ({
        key: it.key,
        width: prev?.width ?? 0,
        depth: prev?.depth ?? 0,
        offset_x: it.originX + (p.x - it.startX),
        offset_z: it.originZ + (p.y - it.startZ),
      }));
      return;
    }

    const w = Math.max(MIN_SIZE, snap(Math.abs(p.x - it.fx)));
    const d = Math.max(MIN_SIZE, snap(Math.abs(p.y - it.fz)));
    const sx = p.x >= it.fx ? 1 : -1;
    const sz = p.y >= it.fz ? 1 : -1;
    setPreview({
      key: it.key,
      width: w,
      depth: d,
      offset_x: it.fx + (sx * w) / 2,
      offset_z: it.fz + (sz * d) / 2,
    });
  };

  const handleUp = () => {
    const it = interactionRef.current;
    const p = preview;
    interactionRef.current = null;
    setPreview(null);
    if (!it || !p) return;
    if (it.type === 'move') {
      onMove(it.key, snap(p.offset_x), snap(p.offset_z));
    } else {
      onResize(it.key, {
        width: Math.max(MIN_SIZE, snap(p.width)),
        depth: Math.max(MIN_SIZE, snap(p.depth)),
        offset_x: snap(p.offset_x),
        offset_z: snap(p.offset_z),
      });
    }
  };

  return (
    <svg
      ref={svgRef}
      className="w-full h-full touch-none select-none"
      viewBox={`${bounds.minX} ${bounds.minZ} ${bounds.width} ${bounds.depth}`}
      preserveAspectRatio="xMidYMid meet"
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerLeave={handleUp}
    >
      {/* eslint-disable-next-line react-hooks/refs */}
      {rooms.map((room) => {
        const p = preview?.key === room.key ? preview : null;
        const w = p?.width ?? room.width;
        const d = p?.depth ?? room.depth;
        const ox = p?.offset_x ?? room.offset_x;
        const oz = p?.offset_z ?? room.offset_z;
        const selected = selectedKey === room.key;
        return (
          <g key={room.key} onPointerDown={(e) => startMove(e, room)} style={{ cursor: 'move' }}>
            <rect
              x={ox - w / 2}
              y={oz - d / 2}
              width={w}
              height={d}
              fill={selected ? 'rgba(30,58,95,0.10)' : 'rgba(245,245,245,0.9)'}
              stroke={selected ? '#1E3A5F' : '#94a3b8'}
              strokeWidth={0.06}
            />
            {room.objects.map((o, i) => (
              <rect
                key={i}
                x={ox + o.position_x - o.width / 2}
                y={oz + o.position_z - o.depth / 2}
                width={Math.max(o.width, 0.2)}
                height={Math.max(o.depth, 0.2)}
                fill="#1E3A5F"
                opacity={0.35}
                rx={0.05}
              />
            ))}
            <text
              x={ox}
              y={oz}
              fontSize={0.28}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={selected ? '#0F1F33' : '#475569'}
              style={{ pointerEvents: 'none', fontWeight: 600 }}
            >
              {room.label}
            </text>
            {selected &&
              (['nw', 'ne', 'sw', 'se'] as Corner[]).map((corner) => {
                const hx = corner === 'nw' || corner === 'sw' ? ox - w / 2 : ox + w / 2;
                const hz = corner === 'nw' || corner === 'ne' ? oz - d / 2 : oz + d / 2;
                return (
                  <rect
                    key={corner}
                    x={hx - 0.14}
                    y={hz - 0.14}
                    width={0.28}
                    height={0.28}
                    fill="#1E3A5F"
                    stroke="#ffffff"
                    strokeWidth={0.03}
                    style={{ cursor: 'nwse-resize' }}
                    onPointerDown={(e) => startResize(e, room, corner)}
                  />
                );
              })}
          </g>
        );
      })}
    </svg>
  );
}

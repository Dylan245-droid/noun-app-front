'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Move3d, RotateCw, Trash2, Play, Plus, Layers, Map as MapIcon, Box, PencilRuler } from 'lucide-react'
import { physicsApi } from '@/services/physics'
import { buildObjects, generateColor } from '@/components/physics/SceneCanvas'
import type { CommitTransform } from '@/components/physics/SceneEditor'
import type { Preset } from '@/components/physics/FurnitureMesh'
import type { PlanRoom } from '@/components/physics/Plan2D'
import type { PreviewRoom } from '@/components/physics/BuildingPreview'

const SceneEditor = dynamic(
  () => import('@/components/physics/SceneEditor').then((m) => m.SceneEditor),
  { ssr: false, loading: () => <Loader /> },
)
const Plan2D = dynamic(
  () => import('@/components/physics/Plan2D').then((m) => m.Plan2D),
  { ssr: false, loading: () => <Loader /> },
)
const BuildingPreview = dynamic(
  () => import('@/components/physics/BuildingPreview').then((m) => m.BuildingPreview),
  { ssr: false, loading: () => <Loader /> },
)
const SceneCanvas = dynamic(
  () => import('@/components/physics/SceneCanvas').then((m) => m.SceneCanvas),
  { ssr: false, loading: () => <Loader /> },
)

function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

interface Furniture {
  id: number
  title: string
  preset: string
  width: number
  depth: number
  height: number
  model_3d: string | null
}

type AdminObj = {
  id: number
  furnitureId: number
  furnitureTitle: string
  preset: Preset
  modelUrl: string | null
  width: number
  depth: number
  height: number
  position_x: number
  position_y: number
  position_z: number
  rotation_y: number
  color: string
}

type AdminOpening = { id: number; side: 'N' | 'S' | 'E' | 'W'; position: number; width: number }

type AdminRoom = {
  key: string
  id: number
  slug: string
  label: string
  width: number
  depth: number
  height: number
  offset_x: number
  offset_z: number
  floor_material: string
  wall_material: string
  openings: AdminOpening[]
  objects: AdminObj[]
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toAdminObj(o: any): AdminObj {
  return {
    id: o.id,
    furnitureId: o.furniture,
    furnitureTitle: o.furniture_title || 'Objet',
    preset: (o.furniture_preset || 'box') as Preset,
    modelUrl: o.model_3d || null,
    width: o.furniture_width || 0.5,
    depth: o.furniture_depth || 0.5,
    height: o.furniture_height || 0.5,
    position_x: o.position_x || 0,
    position_y: o.position_y > 0 ? o.position_y : (o.furniture_height || 0.5) / 2,
    position_z: o.position_z || 0,
    rotation_y: o.rotation_y || 0,
    color: generateColor(o.id),
  }
}

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

export default function BuildingEditorPage() {
  const params = useParams()
  const router = useRouter()
  const id = String(params?.id || '')

  const [building, setBuilding] = useState<{ id: number; name: string } | null>(null)
  const [rooms, setRooms] = useState<AdminRoom[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null)
  const [view, setView] = useState<'plan' | '3d' | 'furnish' | 'whole'>('plan')
  const [mode, setMode] = useState<'translate' | 'rotate'>('translate')
  const [furniture, setFurniture] = useState<Furniture[]>([])
  const [materials, setMaterials] = useState<{ slug: string; name: string; kind: string; color: string; roughness: number; texture: string | null }[]>([])
  const [opening, setOpening] = useState<{ side: 'N' | 'S' | 'E' | 'W'; position: number; width: number }>({
    side: 'S', position: 0, width: 0.9,
  })
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultObjects, setResultObjects] = useState<any[] | null>(null)

  const selectedRoom = rooms.find((r) => r.key === selectedKey) || null

  const loadObjects = useCallback(async (sceneId: number): Promise<AdminObj[]> => {
    const data = await physicsApi.getObjects(String(sceneId))
    const list = Array.isArray(data) ? data : data.results || []
    return list.map(toAdminObj)
  }, [])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const b = await physicsApi.getBuilding(id)
        if (cancelled) return
        setBuilding({ id: b.id, name: b.name })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roomsData: any[] = b.rooms || []
        const mapped: AdminRoom[] = await Promise.all(
          roomsData.map(async (r) => ({
            key: String(r.id),
            id: r.id,
            slug: r.slug,
            label: r.label || r.title,
            width: r.width,
            depth: r.depth,
            height: r.height,
            offset_x: r.offset_x || 0,
            offset_z: r.offset_z || 0,
            floor_material: r.floor_material || 'wood',
            wall_material: r.wall_material || 'plaster',
            openings: r.openings || [],
            objects: await loadObjects(r.id),
          })),
        )
        if (!cancelled) {
          setRooms(mapped)
          setSelectedKey(mapped[0]?.key ?? null)
        }
        const [f, m] = await Promise.all([
          physicsApi.getFurniture(),
          physicsApi.getMaterials(),
        ])
        if (!cancelled) {
          setFurniture(Array.isArray(f) ? f : f.results || [])
          setMaterials(Array.isArray(m) ? m : m.results || [])
        }
      } catch (e) {
        console.error(e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [id, loadObjects])

  const patchRoom = async (room: AdminRoom, patch: Record<string, unknown>) => {
    setRooms((prev) => prev.map((r) => (r.key === room.key ? ({ ...r, ...patch } as AdminRoom) : r)))
    try {
      await physicsApi.updateScene(room.slug, patch)
    } catch (e) {
      console.error('Échec mise à jour pièce', e)
    }
  }

  const addRoom = async () => {
    let maxX = 0
    rooms.forEach((r) => {
      maxX = Math.max(maxX, r.offset_x + r.width / 2)
    })
    setBusy(true)
    try {
      const created = await physicsApi.createScene({
        building: building?.id,
        title: `Pièce ${rooms.length + 1}`,
        label: `Pièce ${rooms.length + 1}`,
        width: 3,
        depth: 3,
        height: 2.8,
        offset_x: maxX + 2,
        offset_z: 0,
        floor_material: 'wood',
      })
      const room: AdminRoom = {
        key: String(created.id),
        id: created.id,
        slug: created.slug,
        label: created.label || created.title,
        width: created.width,
        depth: created.depth,
        height: created.height,
        offset_x: created.offset_x || 0,
        offset_z: created.offset_z || 0,
        floor_material: created.floor_material || 'wood',
        wall_material: created.wall_material || 'plaster',
        openings: [],
        objects: [],
      }
      setRooms((prev) => [...prev, room])
      setSelectedKey(room.key)
      setView('plan')
    } catch (e) {
      alert('Impossible d’ajouter la pièce')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const deleteRoom = async () => {
    if (!selectedRoom) return
    if (!confirm(`Supprimer « ${selectedRoom.label} » ?`)) return
    setBusy(true)
    try {
      await physicsApi.deleteScene(selectedRoom.slug)
      setRooms((prev) => prev.filter((r) => r.key !== selectedRoom.key))
      setSelectedKey(null)
      setSelectedObjectId(null)
      setView('plan')
    } finally {
      setBusy(false)
    }
  }

  const addFurniture = async (f: Furniture) => {
    if (!selectedRoom) return
    setBusy(true)
    try {
      const count = selectedRoom.objects.length
      const x = clamp(((count % 3) - 1) * 0.6, -selectedRoom.width / 2 + f.width / 2, selectedRoom.width / 2 - f.width / 2)
      const z = clamp((Math.floor(count / 3) - 0.5) * 0.6, -selectedRoom.depth / 2 + f.depth / 2, selectedRoom.depth / 2 - f.depth / 2)
      const created = await physicsApi.createObject({
        scene: selectedRoom.id,
        furniture: f.id,
        position_x: x,
        position_y: f.height / 2,
        position_z: z,
        rotation_y: 0,
      })
      const obj = toAdminObj(created)
      setRooms((prev) =>
        prev.map((r) =>
          r.key === selectedRoom.key ? { ...r, objects: [...r.objects, obj] } : r,
        ),
      )
      setSelectedObjectId(obj.id)
      setView('furnish')
      setSheetOpen(false)
    } catch (e) {
      alert('Impossible d’ajouter ce meuble')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const commitObject = async (objId: number, t: CommitTransform) => {
    if (!selectedRoom) return
    const obj = selectedRoom.objects.find((o) => o.id === objId)
    if (!obj) return
    const payload = {
      position_x: clamp(t.position_x, -selectedRoom.width / 2 + obj.width / 2, selectedRoom.width / 2 - obj.width / 2),
      position_y: obj.height / 2,
      position_z: clamp(t.position_z, -selectedRoom.depth / 2 + obj.depth / 2, selectedRoom.depth / 2 - obj.depth / 2),
      rotation_y: t.rotation_y,
    }
    setRooms((prev) =>
      prev.map((r) =>
        r.key === selectedRoom.key
          ? { ...r, objects: r.objects.map((o) => (o.id === objId ? { ...o, ...payload } : o)) }
          : r,
      ),
    )
    try {
      await physicsApi.updateObject(String(objId), payload)
    } catch (e) {
      console.error('Échec sauvegarde objet', e)
    }
  }

  const deleteObject = async () => {
    if (!selectedRoom || selectedObjectId == null) return
    setBusy(true)
    try {
      await physicsApi.deleteObject(String(selectedObjectId))
      setRooms((prev) =>
        prev.map((r) =>
          r.key === selectedRoom.key
            ? { ...r, objects: r.objects.filter((o) => o.id !== selectedObjectId) }
            : r,
        ),
      )
      setSelectedObjectId(null)
    } finally {
      setBusy(false)
    }
  }

  const renameRoom = (room: AdminRoom, value: string) =>
    setRooms((prev) => prev.map((r) => (r.key === room.key ? { ...r, label: value } : r)))

  const saveRoomLabel = async (room: AdminRoom) => {
    try {
      await physicsApi.updateScene(room.slug, { label: room.label, title: room.label })
    } catch (e) {
      console.error('Échec renommage pièce', e)
    }
  }

  const addOpening = async () => {
    if (!selectedRoom) return
    setBusy(true)
    try {
      const created = await physicsApi.createOpening({
        scene: selectedRoom.id,
        side: opening.side,
        position: opening.position,
        width: opening.width,
      })
      setRooms((prev) =>
        prev.map((r) =>
          r.key === selectedRoom.key ? { ...r, openings: [...r.openings, created] } : r,
        ),
      )
    } catch (e) {
      alert('Impossible d’ajouter la porte')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const removeOpening = async (openingId: number) => {
    if (!selectedRoom) return
    setBusy(true)
    try {
      await physicsApi.deleteOpening(openingId)
      setRooms((prev) =>
        prev.map((r) =>
          r.key === selectedRoom.key
            ? { ...r, openings: r.openings.filter((o) => o.id !== openingId) }
            : r,
        ),
      )
    } finally {
      setBusy(false)
    }
  }

  const simulate = async () => {
    if (!selectedRoom) return
    setBusy(true)
    try {
      const res = await physicsApi.runScene(selectedRoom.slug, 5)
      router.push(`/simulation?sim=${res.id}`)
    } catch (e) {
      alert('Échec du lancement de la simulation')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const simulateAll = async () => {
    setBusy(true)
    try {
      const res = await physicsApi.simulateBuilding(id, 3)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshot: any[] = res.objects_snapshot || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const infoByRef = new Map(snapshot.map((it: any) => [it.ref, it]))
      setResultObjects(buildObjects(res.frames || [], infoByRef))
      setView('whole')
    } catch (e) {
      alert('Échec de la simulation de la maison')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!building) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-muted gap-3">
        <p>Projet 3D introuvable.</p>
        <Link href="/admin/buildings" className="text-primary hover:underline text-sm">
          Retour aux projets 3D
        </Link>
      </div>
    )
  }

  const planRooms: PlanRoom[] = rooms.map((r) => ({
    key: r.key,
    label: r.label,
    width: r.width,
    depth: r.depth,
    offset_x: r.offset_x,
    offset_z: r.offset_z,
    objects: r.objects.map((o) => ({
      position_x: o.position_x,
      position_z: o.position_z,
      width: o.width,
      depth: o.depth,
    })),
  }))

  const previewRooms: PreviewRoom[] = rooms.map((r) => ({
    key: r.key,
    width: r.width,
    depth: r.depth,
    height: r.height,
    offset_x: r.offset_x,
    offset_z: r.offset_z,
    floor_material: r.floor_material,
    wall_material: r.wall_material,
    openings: r.openings,
    objects: r.objects.map((o) => ({
      furnitureTitle: o.furnitureTitle,
      preset: o.preset,
      modelUrl: o.modelUrl,
      width: o.width,
      depth: o.depth,
      height: o.height,
      position_x: o.position_x,
      position_y: o.position_y,
      position_z: o.position_z,
      rotation_y: o.rotation_y,
      color: o.color,
    })),
  }))

  const materialColors = Object.fromEntries(
    materials.map((m) => [m.slug, { color: m.color, roughness: m.roughness, texture: m.texture }]),
  )

  const catalog = (
    <div>
      {furniture.length === 0 && <p className="text-xs text-muted">Aucun meuble au catalogue.</p>}
      {furniture.map((f) => (
        <button
          key={f.id}
          onClick={() => addFurniture(f)}
          disabled={busy || !selectedRoom}
          className="w-full flex items-center justify-between gap-2 p-2.5 rounded-lg border border-gray-100 hover:border-primary/40 hover:bg-primary/5 text-left transition disabled:opacity-50"
        >
          <span className="min-w-0">
            <span className="block text-sm font-medium text-secondary truncate">{f.title}</span>
            <span className="block text-[11px] text-muted">{f.width}×{f.depth}×{f.height} m</span>
          </span>
          <Plus className="w-4 h-4 text-primary shrink-0" />
        </button>
      ))}
    </div>
  )

  const tabBtn = (target: typeof view, label: string, icon: React.ReactNode, disabled = false) => (
    <button
      onClick={() => setView(target)}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium tracking-wide border-b-2 transition-colors ${
        view === target ? 'border-secondary text-secondary' : 'border-transparent text-muted hover:text-secondary'
      } disabled:opacity-40`}
    >
      {icon} {label}
    </button>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/buildings" className="p-2 rounded-lg hover:bg-gray-100 text-muted transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-secondary tracking-tight">{building.name}</h1>
            <p className="text-muted text-xs">
              {rooms.length} pièce(s) · {rooms.reduce((n, r) => n + r.objects.length, 0)} meuble(s)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addRoom}
            disabled={busy}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <Plus className="w-3.5 h-3.5" /> Pièce
          </button>
          <button
            onClick={simulateAll}
            disabled={busy || rooms.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 transition"
          >
            <Box className="w-3.5 h-3.5" /> Simuler la maison
          </button>
          <button
            onClick={simulate}
            disabled={busy || !selectedRoom}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition"
          >
            <Play className="w-3.5 h-3.5" /> Simuler
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-secondary">Catalogue</h2>
              <button onClick={() => setSheetOpen(true)} className="lg:hidden p-1.5 rounded hover:bg-gray-100">
                <Layers className="w-4 h-4 text-muted" />
              </button>
            </div>
            <div className="max-h-[560px] overflow-y-auto">{catalog}</div>
          </div>
        </div>

        <div className="lg:col-span-9">
          <div className="flex items-center justify-between border-b border-gray-100 mb-3">
            <div className="flex">
              {tabBtn('plan', 'Plan', <MapIcon className="w-3.5 h-3.5" />)}
              {tabBtn('3d', '3D', <Box className="w-3.5 h-3.5" />)}
              {tabBtn('furnish', 'Meubler', <PencilRuler className="w-3.5 h-3.5" />, !selectedRoom)}
            </div>
            <button
              onClick={() => setSheetOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-secondary"
            >
              <Layers className="w-4 h-4" /> Meubles
            </button>
          </div>

          {selectedRoom && view !== 'whole' && (
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <input
                value={selectedRoom.label}
                onChange={(e) => renameRoom(selectedRoom, e.target.value)}
                onBlur={() => saveRoomLabel(selectedRoom)}
                className="w-40 border border-gray-200 px-2 py-1 text-secondary text-sm font-semibold bg-white rounded"
                aria-label="Nom de la pièce"
              />
              {(['width', 'depth', 'height'] as const).map((k) => (
                <label key={k} className="flex items-center gap-1 text-[11px] text-muted">
                  {k === 'width' ? 'L' : k === 'depth' ? 'P' : 'H'}
                  <input
                    type="number" min={1} max={20} step={0.5}
                    value={selectedRoom[k]}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 1
                      patchRoom(selectedRoom, { [k]: v })
                    }}
                    className="w-16 border border-gray-200 px-2 py-1 text-secondary text-xs bg-white rounded"
                  />
                </label>
              ))}
              <label className="flex items-center gap-1 text-[11px] text-muted">
                Sol
                <select
                  value={selectedRoom.floor_material}
                  onChange={(e) => patchRoom(selectedRoom, { floor_material: e.target.value })}
                  className="border border-gray-200 px-2 py-1 text-secondary text-xs bg-white rounded"
                >
                  {materials.filter((m) => m.kind === 'floor').map((m) => (
                    <option key={m.slug} value={m.slug}>{m.name}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1 text-[11px] text-muted">
                Mur
                <select
                  value={selectedRoom.wall_material}
                  onChange={(e) => patchRoom(selectedRoom, { wall_material: e.target.value })}
                  className="border border-gray-200 px-2 py-1 text-secondary text-xs bg-white rounded"
                >
                  {materials.filter((m) => m.kind === 'wall').map((m) => (
                    <option key={m.slug} value={m.slug}>{m.name}</option>
                  ))}
                </select>
              </label>
              <button
                onClick={deleteRoom}
                disabled={busy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:border-red-400 hover:text-red-500 disabled:opacity-40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer
              </button>
            </div>
          )}

          {selectedRoom && view !== 'whole' && (
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <span className="text-[10px] uppercase tracking-wide text-muted">Portes</span>
              {selectedRoom.openings.map((o) => (
                <span key={o.id} className="inline-flex items-center gap-1 px-2 py-1 border border-gray-200 rounded">
                  {o.side} · {o.position}m · {o.width}m
                  <button onClick={() => removeOpening(o.id)} className="text-red-500" title="Supprimer">×</button>
                </span>
              ))}
              <select
                value={opening.side}
                onChange={(e) => setOpening({ ...opening, side: e.target.value as 'N' | 'S' | 'E' | 'W' })}
                className="border border-gray-200 rounded px-2 py-1 bg-white"
              >
                <option value="N">Nord</option>
                <option value="S">Sud</option>
                <option value="E">Est</option>
                <option value="W">Ouest</option>
              </select>
              <input
                type="number" step={0.5} value={opening.position}
                onChange={(e) => setOpening({ ...opening, position: parseFloat(e.target.value) || 0 })}
                className="w-16 border border-gray-200 rounded px-2 py-1" title="Position (m)"
              />
              <input
                type="number" step={0.1} value={opening.width}
                onChange={(e) => setOpening({ ...opening, width: parseFloat(e.target.value) || 0.9 })}
                className="w-16 border border-gray-200 rounded px-2 py-1" title="Largeur (m)"
              />
              <button
                onClick={addOpening}
                disabled={busy}
                className="inline-flex items-center gap-1 px-2.5 py-1 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                + Porte
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-[58vh] lg:h-[560px]">
              {view === 'plan' && (
                <Plan2D
                  rooms={planRooms}
                  selectedKey={selectedKey}
                  onSelect={setSelectedKey}
                  onMove={(key, x, z) => {
                    const room = rooms.find((r) => r.key === key)
                    if (room) patchRoom(room, { offset_x: x, offset_z: z })
                  }}
                  onResize={(key, size) => {
                    const room = rooms.find((r) => r.key === key)
                    if (room) patchRoom(room, size)
                  }}
                />
              )}
              {view === '3d' && <BuildingPreview rooms={previewRooms} materials={materialColors} />}
              {view === 'furnish' && selectedRoom && (
                <SceneEditor
                  scene={selectedRoom}
                  objects={selectedRoom.objects}
                  selectedId={selectedObjectId}
                  mode={mode}
                  onSelect={setSelectedObjectId}
                  onCommit={commitObject}
                />
              )}
              {view === 'furnish' && !selectedRoom && (
                <div className="flex items-center justify-center h-full text-sm text-muted">
                  Sélectionnez une pièce dans le plan.
                </div>
              )}
              {view === 'whole' && resultObjects && (
                <SceneCanvas objects={resultObjects} footerLabel="Maison entière" />
              )}
            </div>
          </div>

          {view === 'whole' && (
            <div className="mt-3">
              <button
                onClick={() => setView('3d')}
                className="text-xs text-primary hover:underline"
              >
                ← Retour à la maquette
              </button>
            </div>
          )}

          {view === 'furnish' && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
                <button
                  onClick={() => setMode('translate')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${mode === 'translate' ? 'bg-secondary text-white' : 'text-muted hover:text-secondary'}`}
                >
                  <Move3d className="w-3.5 h-3.5" /> Déplacer
                </button>
                <button
                  onClick={() => setMode('rotate')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${mode === 'rotate' ? 'bg-secondary text-white' : 'text-muted hover:text-secondary'}`}
                >
                  <RotateCw className="w-3.5 h-3.5" /> Pivoter
                </button>
              </div>
              <button
                onClick={deleteObject}
                disabled={selectedObjectId == null || busy}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs border border-gray-200 rounded-lg hover:border-red-400 hover:text-red-500 disabled:opacity-40 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Supprimer l&apos;objet
              </button>
            </div>
          )}

          <p className="text-[11px] text-muted mt-2">
            Plan : clique une pièce pour la sélectionner et la déplacer. Meubler : ajoute et place les meubles. Simuler : lance la physique réelle de la pièce.
          </p>
        </div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-[80] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSheetOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-secondary">Catalogue</h3>
              <button onClick={() => setSheetOpen(false)} className="p-2 text-muted">✕</button>
            </div>
            {catalog}
          </div>
        </div>
      )}
    </div>
  )
}

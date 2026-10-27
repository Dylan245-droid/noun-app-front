'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { Move3d, RotateCw, Trash2, Play, Plus, RefreshCw, CheckCircle, Layers, Map as MapIcon, Box, PencilRuler } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { physicsApi } from '@/services/physics'
import { buildObjects, generateColor } from '@/components/physics/SceneCanvas'
import type { CommitTransform } from '@/components/physics/SceneEditor'
import type { Preset } from '@/components/physics/FurnitureMesh'
import type { PlanRoom } from '@/components/physics/Plan2D'
import type { PreviewRoom } from '@/components/physics/BuildingPreview'
import { usePageContent } from '@/hooks/usePageContent'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { Hero } from '@/components/hero/Hero'
import { AnimatedSection } from '@/components/animated/AnimatedSection'
import { Sheet } from '@/components/ui/sheet'

const SceneEditor = dynamic(
  () => import('@/components/physics/SceneEditor').then((m) => m.SceneEditor),
  { ssr: false, loading: () => <Loader /> },
)
const SceneCanvas = dynamic(
  () => import('@/components/physics/SceneCanvas').then((m) => m.SceneCanvas),
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

function Loader() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function SectionHeader({ label, title, dark = false }: { label?: string; title?: string; dark?: boolean }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <span className={`w-8 h-[1px] ${dark ? 'bg-white/30' : 'bg-primary'}`} />
        {label && (
          <span className={`text-[10px] tracking-[0.3em] uppercase font-medium ${dark ? 'text-white/40' : 'text-muted'}`}>
            {label}
          </span>
        )}
      </div>
      {title && (
        <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight whitespace-pre-line ${dark ? 'text-white' : 'text-secondary'}`}>
          {title}
        </h2>
      )}
    </div>
  )
}

type TemplateRoom = {
  label: string
  label_en?: string
  width: number
  depth: number
  height: number
  offset_x: number
  offset_z: number
  floor_material: string
}
type Template = { id: string; name: string; name_en?: string; rooms: TemplateRoom[] }

type RoomObj = {
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
type RoomState = {
  key: string
  label: string
  width: number
  depth: number
  height: number
  offset_x: number
  offset_z: number
  floor_material: string
  wall_material: string
  objects: RoomObj[]
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

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

function roomsFromTemplate(t: Template): RoomState[] {
  return t.rooms.map((r, i) => ({
    key: `r${i}`,
    label: r.label,
    width: r.width,
    depth: r.depth,
    height: r.height,
    offset_x: r.offset_x,
    offset_z: r.offset_z,
    floor_material: r.floor_material,
    wall_material: 'plaster',
    objects: [],
  }))
}

export default function ConfigurateurClient() {
  const { t, i18n } = useTranslation()
  useHeaderTheme('dark')
  const { data } = usePageContent('configurateur')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = data?.content_json || {}
  const hero = c.hero || {}
  const intro = c.intro || {}
  const sections = c.sections || {}
  const form = c.form || {}
  const actions = c.actions || {}
  const isEn = i18n.language === 'en'
  const badgeText = hero.badge == null ? (isEn ? 'Beta version' : 'Version bêta') : hero.badge

  const [templates, setTemplates] = useState<Template[]>([])
  const [templateId, setTemplateId] = useState('')
  const [rooms, setRooms] = useState<RoomState[]>([])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [selectedObjectId, setSelectedObjectId] = useState<number | null>(null)
  const [view, setView] = useState<'plan' | '3d' | 'furnish' | 'test'>('plan')
  const [mode, setMode] = useState<'translate' | 'rotate'>('translate')
  const nextObjRef = useRef(1)

  const [furniture, setFurniture] = useState<Furniture[]>([])
  const [materials, setMaterials] = useState<{ slug: string; name: string; kind: string; color: string; roughness: number; texture: string | null }[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [resultObjects, setResultObjects] = useState<any[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const [lead, setLead] = useState({ name: '', email: '', phone: '', message: '' })
  const [leadSent, setLeadSent] = useState(false)

  const selectedRoom = rooms.find((r) => r.key === selectedKey) || null

  useEffect(() => {
    const load = async () => {
      try {
        const res = await physicsApi.getTemplates()
        const list: Template[] = Array.isArray(res) ? res : res.results || []
        setTemplates(list)
        if (list.length > 0) {
          const def = list.find((t) => t.id === 't2') || list[0]
          const rs = roomsFromTemplate(def)
          setTemplateId(def.id)
          setRooms(rs)
          setSelectedKey(rs[0]?.key ?? null)
        }
      } catch {
        setTemplates([])
      }
    }
    load()
  }, [])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await physicsApi.getFurniture()
        setFurniture(Array.isArray(res) ? res : res.results || [])
      } catch {
        setFurniture([])
      }
      try {
        const m = await physicsApi.getMaterials()
        setMaterials(Array.isArray(m) ? m : m.results || [])
      } catch {
        setMaterials([])
      }
    }
    load()
  }, [])

  const applyTemplate = (t: Template) => {
    const rs = roomsFromTemplate(t)
    setTemplateId(t.id)
    setRooms(rs)
    setSelectedKey(rs[0]?.key ?? null)
    setSelectedObjectId(null)
    setResultObjects(null)
    setView('plan')
  }

  const updateRoom = (key: string, patch: Partial<RoomState>) => {
    setRooms((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)))
    setResultObjects(null)
  }

  const addRoom = () => {
    let maxX = 0
    rooms.forEach((r) => {
      maxX = Math.max(maxX, r.offset_x + r.width / 2)
    })
    const key = `r${Date.now()}`
    const room: RoomState = {
      key,
      label: `Pièce ${rooms.length + 1}`,
      width: 3,
      depth: 3,
      height: 2.8,
      offset_x: maxX + 2,
      offset_z: 0,
      floor_material: 'wood',
      wall_material: 'plaster',
      objects: [],
    }
    setRooms((prev) => [...prev, room])
    setSelectedKey(key)
    setSelectedObjectId(null)
    setResultObjects(null)
    setView('plan')
  }

  const deleteRoom = () => {
    if (!selectedKey) return
    setRooms((prev) => prev.filter((r) => r.key !== selectedKey))
    setSelectedKey(null)
    setSelectedObjectId(null)
    setResultObjects(null)
    setView('plan')
  }

  const addFurniture = (f: Furniture) => {
    if (rooms.length === 0) return
    const key = selectedKey || rooms[0].key
    const room = rooms.find((r) => r.key === key)
    if (!room) return
    const id = nextObjRef.current++
    const count = room.objects.length
    const x = clamp(((count % 3) - 1) * 0.6, -room.width / 2 + f.width / 2, room.width / 2 - f.width / 2)
    const z = clamp((Math.floor(count / 3) - 0.5) * 0.6, -room.depth / 2 + f.depth / 2, room.depth / 2 - f.depth / 2)
    const obj: RoomObj = {
      id,
      furnitureId: f.id,
      furnitureTitle: f.title,
      preset: (f.preset || 'box') as Preset,
      modelUrl: f.model_3d || null,
      width: f.width,
      depth: f.depth,
      height: f.height,
      position_x: x,
      position_y: f.height / 2,
      position_z: z,
      rotation_y: 0,
      color: generateColor(id),
    }
    setRooms((prev) =>
      prev.map((r) => (r.key === key ? { ...r, objects: [...r.objects, obj] } : r)),
    )
    setSelectedKey(key)
    setSelectedObjectId(id)
    setView('furnish')
    setResultObjects(null)
    setSheetOpen(false)
  }

  const commitObject = (objId: number, t: CommitTransform) => {
    if (!selectedKey) return
    setRooms((prev) =>
      prev.map((r) => {
        if (r.key !== selectedKey) return r
        return {
          ...r,
          objects: r.objects.map((o) =>
            o.id !== objId
              ? o
              : {
                  ...o,
                  position_x: clamp(t.position_x, -r.width / 2 + o.width / 2, r.width / 2 - o.width / 2),
                  position_y: o.height / 2,
                  position_z: clamp(t.position_z, -r.depth / 2 + o.depth / 2, r.depth / 2 - o.depth / 2),
                  rotation_y: t.rotation_y,
                },
          ),
        }
      }),
    )
    setResultObjects(null)
  }

  const deleteObject = () => {
    if (!selectedKey || selectedObjectId == null) return
    setRooms((prev) =>
      prev.map((r) =>
        r.key === selectedKey
          ? { ...r, objects: r.objects.filter((o) => o.id !== selectedObjectId) }
          : r,
      ),
    )
    setSelectedObjectId(null)
    setResultObjects(null)
  }

  const reset = () => {
    const t = templates.find((x) => x.id === templateId) || templates[0]
    if (t) applyTemplate(t)
    nextObjRef.current = 1
    setLeadSent(false)
  }

  const testRoom = async () => {
    if (!selectedRoom || selectedRoom.objects.length === 0) return
    setBusy(true)
    try {
      const res = await physicsApi.publicSimulate({
        room: {
          width: selectedRoom.width,
          depth: selectedRoom.depth,
          height: selectedRoom.height,
          floor_material: selectedRoom.floor_material,
        },
        objects: selectedRoom.objects.map((o) => ({
          furniture_id: o.furnitureId,
          x: o.position_x,
          z: o.position_z,
          rotation_y: o.rotation_y,
        })),
        duration_seconds: 3,
      })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const snapshot: any[] = res.objects_snapshot || []
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const infoByRef = new Map(snapshot.map((it: any) => [it.ref, it]))
      setResultObjects(buildObjects(res.frames || [], infoByRef))
      setView('test')
    } catch (e) {
      alert(form.error || 'La simulation a échoué.')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const submit = async () => {
    if (!lead.email) return
    setBusy(true)
    try {
      await physicsApi.submitProject({
        name: `Projet ${lead.name || 'configurateur'}`,
        rooms: rooms.map((r) => ({
          label: r.label,
          width: r.width,
          depth: r.depth,
          height: r.height,
          offset_x: r.offset_x,
          offset_z: r.offset_z,
          floor_material: r.floor_material,
          objects: r.objects.map((o) => ({
            furniture_id: o.furnitureId,
            x: o.position_x,
            z: o.position_z,
            rotation_y: o.rotation_y,
          })),
        })),
        contact: {
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          message: lead.message,
        },
      })
      setLeadSent(true)
    } catch (e) {
      alert(form.error || "Échec de l'envoi")
      console.error(e)
    } finally {
      setBusy(false)
    }
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
      {furniture.length === 0 && <p className="text-xs text-muted">Chargement…</p>}
      {furniture.map((f) => (
        <button
          key={f.id}
          onClick={() => addFurniture(f)}
          className="w-full flex items-center justify-between gap-3 py-3 border-b border-secondary/5 text-left group hover:border-primary/30 transition-colors"
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

  const tabBtn = (id: typeof view, label: string, icon: React.ReactNode, disabled = false) => (
    <button
      onClick={() => setView(id)}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-medium tracking-wide border-b-2 transition-colors ${
        view === id ? 'border-secondary text-secondary' : 'border-transparent text-muted hover:text-secondary'
      } disabled:opacity-40`}
    >
      {icon} {label}
    </button>
  )

  return (
    <div>
      <Hero
        image={data?.hero_image || '/diapo6.jpg'}
        label={hero.label || 'Configurateur 3D'}
        badge={badgeText || undefined}
        title={hero.title || 'Aménagez votre espace'}
        subtitle={hero.subtitle}
        scrollLabel={t('common.scroll')}
      />

      {/* Intro + templates */}
      <section className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <AnimatedSection>
            <SectionHeader label={intro.label || 'En quelques gestes'} title={intro.title || 'Votre intérieur,\nen 3D'} />
            {intro.subtitle && <p className="text-muted max-w-xl text-sm leading-relaxed">{intro.subtitle}</p>}
          </AnimatedSection>

          <p className="mt-10 mb-3 text-[10px] tracking-[0.3em] uppercase text-muted">
            {sections.rooms || 'Choisissez un modèle'}
          </p>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => applyTemplate(t)}
                className={`shrink-0 px-5 py-3 text-sm font-medium tracking-wide transition-colors ${
                  templateId === t.id ? 'bg-secondary text-white' : 'border border-secondary/20 text-secondary hover:bg-secondary hover:text-white'
                }`}
              >
                {isEn ? t.name_en || t.name : t.name}
                <span className="opacity-50"> · {t.rooms.length} {isEn ? 'room(s)' : 'pièce(s)'}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Éditeur */}
      <section className="bg-accent">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4 mb-4">
            <SectionHeader label={sections.editor || 'Aménagement'} />
            <div className="flex gap-2">
              <button
                onClick={addRoom}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary text-xs font-medium tracking-wide hover:bg-secondary hover:text-white transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> {actions.add || 'Ajouter une pièce'}
              </button>
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-secondary/20 text-secondary text-xs font-medium tracking-wide hover:bg-secondary hover:text-white transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> {actions.reset || 'Réinitialiser'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            <aside className="hidden lg:block lg:col-span-3">
              <div className="bg-white rounded-2xl border border-secondary/10 p-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted mb-2">{sections.catalog || 'Meubles'}</p>
                <div className="max-h-[560px] overflow-y-auto pr-1">{catalog}</div>
              </div>
            </aside>

            <div className="lg:col-span-9">
              <div className="flex items-center justify-between border-b border-secondary/10 mb-3">
                <div className="flex">
                  {tabBtn('plan', 'Plan', <MapIcon className="w-3.5 h-3.5" />)}
                  {tabBtn('3d', '3D', <Box className="w-3.5 h-3.5" />)}
                  {tabBtn('furnish', isEn ? 'Furnish' : 'Meubler', <PencilRuler className="w-3.5 h-3.5" />, !selectedRoom)}
                </div>
                <button
                  onClick={() => setSheetOpen(true)}
                  className="lg:hidden inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-secondary"
                >
                  <Layers className="w-4 h-4" /> {sections.catalog || 'Meubles'}
                </button>
              </div>

              {selectedRoom && view !== 'test' && (
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <input
                    value={selectedRoom.label}
                    onChange={(e) => updateRoom(selectedRoom.key, { label: e.target.value })}
                    className="w-36 border border-secondary/20 px-2 py-1 text-secondary text-sm font-semibold bg-white"
                    aria-label="Nom de la pièce"
                  />
                  {(['width', 'depth', 'height'] as const).map((k) => (
                    <label key={k} className="flex items-center gap-1 text-[11px] text-muted">
                      {k === 'width' ? 'L' : k === 'depth' ? 'P' : 'H'}
                      <input
                        type="number" min={1} max={20} step={0.5}
                        value={selectedRoom[k]}
                        onChange={(e) => updateRoom(selectedRoom.key, { [k]: parseFloat(e.target.value) || 1 })}
                        className="w-16 border border-secondary/20 px-2 py-1 text-secondary text-xs bg-white"
                      />
                    </label>
                  ))}
                  {materials.filter((m) => m.kind === 'floor').length > 0 && (
                    <label className="flex items-center gap-1 text-[11px] text-muted">
                      Sol
                      <select
                        value={selectedRoom.floor_material}
                        onChange={(e) => updateRoom(selectedRoom.key, { floor_material: e.target.value })}
                        className="border border-secondary/20 px-2 py-1 text-secondary text-xs bg-white"
                      >
                        {materials.filter((m) => m.kind === 'floor').map((m) => (
                          <option key={m.slug} value={m.slug}>{m.name}</option>
                        ))}
                      </select>
                    </label>
                  )}
                  <button
                    onClick={deleteRoom}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-secondary/20 text-secondary hover:border-red-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {actions.delete || 'Supprimer'}
                  </button>
                </div>
              )}

              <div className="relative bg-white rounded-2xl border border-secondary/10 overflow-hidden">
                <div className="h-[58vh] lg:h-[560px]">
                  {view === 'plan' && (
                    <Plan2D
                      rooms={planRooms}
                      selectedKey={selectedKey}
                      onSelect={setSelectedKey}
                      onMove={(key, x, z) => updateRoom(key, { offset_x: x, offset_z: z })}
                      onResize={(key, size) => updateRoom(key, size)}
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
                  {view === 'test' && resultObjects && (
                    <SceneCanvas objects={resultObjects} footerLabel={actions.test || 'Résultat'} />
                  )}
                  {view === 'furnish' && !selectedRoom && (
                    <div className="flex items-center justify-center h-full text-sm text-muted">
                      Sélectionnez une pièce dans le plan.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {view === 'furnish' && (
                  <>
                    <div className="flex border border-secondary/20">
                      <button
                        onClick={() => setMode('translate')}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${mode === 'translate' ? 'bg-secondary text-white' : 'text-muted hover:text-secondary'}`}
                      >
                        <Move3d className="w-3.5 h-3.5" /> {actions.move || 'Déplacer'}
                      </button>
                      <button
                        onClick={() => setMode('rotate')}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-colors ${mode === 'rotate' ? 'bg-secondary text-white' : 'text-muted hover:text-secondary'}`}
                      >
                        <RotateCw className="w-3.5 h-3.5" /> {actions.rotate || 'Pivoter'}
                      </button>
                    </div>
                    <button
                      onClick={deleteObject}
                      disabled={selectedObjectId == null}
                      className="inline-flex items-center gap-2 px-4 py-2.5 border border-secondary/20 text-xs font-medium tracking-wide text-secondary hover:border-red-400 hover:text-red-500 disabled:opacity-40 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> {actions.delete || 'Supprimer'}
                    </button>
                  </>
                )}

                {view === 'test' ? (
                  <button
                    onClick={() => setView('furnish')}
                    className="ml-auto inline-flex items-center gap-2 px-5 py-3 border border-secondary/20 text-sm font-medium tracking-wide text-secondary hover:bg-secondary hover:text-white transition-colors"
                  >
                    {actions.back || "Revenir à l'édition"}
                  </button>
                ) : (
                  <button
                    onClick={testRoom}
                    disabled={busy || !selectedRoom || selectedRoom.objects.length === 0}
                    className="ml-auto inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white text-sm font-medium tracking-wide hover:bg-secondary/90 disabled:opacity-50 transition-colors"
                  >
                    <Play className="w-4 h-4" />
                    {busy ? (actions.searching || 'Calcul…') : (actions.test || 'Tester la pièce')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title={sections.catalog || 'Meubles'}>
        <div className="p-1">{catalog}</div>
      </Sheet>

      {/* Envoyer au studio */}
      <section className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            <AnimatedSection>
              <SectionHeader dark label={sections.contact || 'Être recontacté'} title={form.title || 'Envoyer au studio'} />
              <p className="text-white/50 text-sm leading-relaxed max-w-md">
                {form.subtitle || 'Envoyez-nous votre configuration, on vous répond.'}
              </p>
              <p className="text-white/30 text-xs mt-6">
                {rooms.length} pièce(s) · {rooms.reduce((n, r) => n + r.objects.length, 0)} meuble(s)
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              {leadSent ? (
                <div className="flex flex-col items-start gap-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                  <p className="text-white text-sm leading-relaxed">
                    {form.success || 'Merci, votre configuration a été envoyée.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); submit() }} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <label className="block">
                      <span className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">{form.name || 'Votre nom'}</span>
                      <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white text-sm focus:outline-none focus:border-white" />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">{form.email || 'Votre email'} *</span>
                      <input type="email" required value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white text-sm focus:outline-none focus:border-white" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">{form.phone || 'Téléphone (optionnel)'}</span>
                    <input value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white text-sm focus:outline-none focus:border-white" />
                  </label>
                  <label className="block">
                    <span className="block text-[10px] tracking-[0.2em] uppercase text-white/40 mb-3">{form.message || 'Votre projet (optionnel)'}</span>
                    <textarea rows={3} value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} className="w-full bg-transparent border-0 border-b border-white/20 px-0 py-2 text-white text-sm focus:outline-none focus:border-white resize-none" />
                  </label>
                  <button type="submit" disabled={busy} className="inline-flex items-center gap-3 px-8 py-4 border border-white text-white text-sm font-medium tracking-wide hover:bg-white hover:text-secondary disabled:opacity-50 transition-colors">
                    {form.submit || 'Envoyer'}
                  </button>
                </form>
              )}
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { Package, Plus, Pencil, Trash2, Upload, Ruler, RefreshCw, X } from 'lucide-react'
import { physicsApi } from '@/services/physics'
import { CatalogPreview } from '@/components/physics/CatalogPreview'
import type { Preset } from '@/components/physics/FurnitureMesh'

interface Furniture {
  id: number
  slug: string
  title: string
  title_en: string
  category: string
  preset: string
  description: string
  width: number
  depth: number
  height: number
  mass: number
  restitution: number
  friction: number
  model_3d: string | null
  thumbnail: string | null
  is_active: boolean
}

const CATEGORIES = [
  { value: 'seating', label: 'Assise' },
  { value: 'table', label: 'Table' },
  { value: 'storage', label: 'Rangement' },
  { value: 'lighting', label: 'Éclairage' },
  { value: 'decor', label: 'Décoration' },
  { value: 'other', label: 'Autre' },
]

const PRESETS = [
  { value: 'box', label: 'Boîte' },
  { value: 'chair', label: 'Chaise' },
  { value: 'table', label: 'Table' },
  { value: 'sofa', label: 'Canapé' },
  { value: 'shelf', label: 'Étagère' },
  { value: 'lamp', label: 'Lampe' },
  { value: 'rug', label: 'Tapis' },
  { value: 'plant', label: 'Plante' },
]

const emptyForm = {
  title: '', title_en: '', category: 'other', preset: 'box',
  description: '', width: 0.5, depth: 0.5, height: 0.5,
  mass: 10, restitution: 0.4, friction: 0.5, is_active: true,
}

export default function CatalogPage() {
  const [items, setItems] = useState<Furniture[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Furniture | null>(null)
  const [form, setForm] = useState({ ...emptyForm })
  const [modelFile, setModelFile] = useState<File | null>(null)
  const [thumbFile, setThumbFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const data = await physicsApi.getFurniture()
      setItems(Array.isArray(data) ? data : data.results || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const run = async () => {
      const data = await physicsApi.getFurniture()
      setItems(Array.isArray(data) ? data : data.results || [])
    }
    run()
  }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm })
    setModelFile(null)
    setThumbFile(null)
    setShowForm(true)
  }

  const openEdit = (f: Furniture) => {
    setEditing(f)
    setForm({
      title: f.title, title_en: f.title_en, category: f.category, preset: f.preset,
      description: f.description, width: f.width, depth: f.depth, height: f.height,
      mass: f.mass, restitution: f.restitution, friction: f.friction, is_active: f.is_active,
    })
    setModelFile(null)
    setThumbFile(null)
    setShowForm(true)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('title_en', form.title_en)
      fd.append('category', form.category)
      fd.append('preset', form.preset)
      fd.append('description', form.description)
      fd.append('width', String(form.width))
      fd.append('depth', String(form.depth))
      fd.append('height', String(form.height))
      fd.append('mass', String(form.mass))
      fd.append('restitution', String(form.restitution))
      fd.append('friction', String(form.friction))
      fd.append('is_active', form.is_active ? 'true' : 'false')
      if (modelFile) fd.append('model_3d', modelFile)
      if (thumbFile) fd.append('thumbnail', thumbFile)

      if (editing) {
        await physicsApi.updateFurniture(editing.slug, fd)
      } else {
        await physicsApi.createFurniture(fd)
      }
      setShowForm(false)
      await load()
    } catch (e) {
      alert('Erreur lors de l\u2019enregistrement')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (f: Furniture) => {
    if (!confirm(`Supprimer « ${f.title} » ?`)) return
    await physicsApi.deleteFurniture(f.slug)
    await load()
  }

  const compute = async (f: Furniture) => {
    try {
      await physicsApi.computeDimensions(f.slug)
      await load()
    } catch {
      alert('Impossible de calculer les dimensions (modèle 3D absent ou illisible).')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Catalogue mobilier</h1>
          <p className="text-muted text-sm mt-1">
            Meubles disponibles pour les simulations (formes, dimensions, physique).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={load}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" /> Nouveau meuble
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted">
            <Package className="w-10 h-10 opacity-20 mb-2" />
            <p className="text-sm">Aucun meuble. Créez-en un.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-muted">
              <tr>
                <th className="text-left p-3 font-medium">Aperçu</th>
                <th className="text-left p-3 font-medium">Titre</th>
                <th className="text-left p-3 font-medium">Catégorie</th>
                <th className="text-left p-3 font-medium">Forme</th>
                <th className="text-left p-3 font-medium">Dimensions (L×H×P)</th>
                <th className="text-left p-3 font-medium">Masse</th>
                <th className="text-left p-3 font-medium">3D</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/50">
                  <td className="p-3">
                    <CatalogPreview
                      preset={(f.preset as Preset) || 'box'}
                      width={f.width}
                      depth={f.depth}
                      height={f.height}
                      modelUrl={f.model_3d}
                    />
                  </td>
                  <td className="p-3 font-medium text-secondary">{f.title}</td>
                  <td className="p-3 text-muted capitalize">{f.category}</td>
                  <td className="p-3 text-muted">{f.preset}</td>
                  <td className="p-3 text-muted">
                    {f.width}×{f.height}×{f.depth}
                  </td>
                  <td className="p-3 text-muted">{f.mass} kg</td>
                  <td className="p-3">
                    {f.model_3d ? (
                      <span className="text-xs text-emerald-600">oui</span>
                    ) : (
                      <span className="text-xs text-muted">procédural</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      {f.model_3d && (
                        <button
                          onClick={() => compute(f)}
                          title="Calculer les dimensions depuis le modèle"
                          className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-secondary transition"
                        >
                          <Ruler className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => openEdit(f)}
                        className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-secondary transition"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => remove(f)}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-secondary">
                {editing ? 'Modifier le meuble' : 'Nouveau meuble'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-muted">Titre</span>
                  <input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">Titre (EN)</span>
                  <input
                    value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs text-muted">Catégorie</span>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs text-muted">Forme (si pas de modèle 3D)</span>
                  <select
                    value={form.preset}
                    onChange={(e) => setForm({ ...form, preset: e.target.value })}
                    className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                  >
                    {PRESETS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(['width', 'height', 'depth'] as const).map((k) => (
                  <label key={k} className="block">
                    <span className="text-xs text-muted">
                      {k === 'width' ? 'Largeur (m)' : k === 'height' ? 'Hauteur (m)' : 'Profondeur (m)'}
                    </span>
                    <input
                      type="number" step="0.01"
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: parseFloat(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4">
                {(['mass', 'restitution', 'friction'] as const).map((k) => (
                  <label key={k} className="block">
                    <span className="text-xs text-muted">
                      {k === 'mass' ? 'Masse (kg)' : k === 'restitution' ? 'Rebond (0-1)' : 'Frottement (0-1)'}
                    </span>
                    <input
                      type="number" step="0.05"
                      value={form[k]}
                      onChange={(e) => setForm({ ...form, [k]: parseFloat(e.target.value) })}
                      className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </label>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-xs text-muted">Modèle 3D (.glb/.gltf/.obj/.stl)</span>
                  <input
                    type="file" accept=".glb,.gltf,.obj,.stl"
                    onChange={(e) => setModelFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full text-xs"
                  />
                  {editing?.model_3d && !modelFile && (
                    <span className="text-[11px] text-emerald-600">Modèle existant conservé</span>
                  )}
                </label>
                <label className="block">
                  <span className="text-xs text-muted">Vignette (image)</span>
                  <input
                    type="file" accept="image/*"
                    onChange={(e) => setThumbFile(e.target.files?.[0] || null)}
                    className="mt-1 w-full text-xs"
                  />
                </label>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                <span className="text-sm text-secondary">Actif</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                Annuler
              </button>
              <button
                onClick={submit}
                disabled={saving || !form.title}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition"
              >
                <Upload className="w-4 h-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

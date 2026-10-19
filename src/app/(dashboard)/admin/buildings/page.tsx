'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, RefreshCw, Building2 } from 'lucide-react'
import { physicsApi } from '@/services/physics'

interface Building {
  id: number
  slug: string
  name: string
  name_en: string
  rooms_count: number
  is_public: boolean
  created_at: string
}

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      const data = await physicsApi.getBuildings()
      setBuildings(Array.isArray(data) ? data : data.results || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      await physicsApi.createBuilding({ name: name.trim() })
      setName('')
      setShowForm(false)
      await load()
    } catch (e) {
      alert('Erreur lors de la création')
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (b: Building) => {
    if (!confirm(`Supprimer « ${b.name} » (et ses pièces) ?`)) return
    await physicsApi.deleteBuilding(String(b.id))
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Projets 3D</h1>
          <p className="text-muted text-sm mt-1">
            Bâtiments et maisons : pièces, mobilier, simulations et partages.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition"
          >
            <Plus className="w-4 h-4" /> Nouveau projet 3D
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-wrap items-end gap-3">
          <label className="block flex-1 min-w-[220px]">
            <span className="text-xs text-muted">Nom du projet</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              placeholder="Ex. Maison Akébé"
            />
          </label>
          <button
            onClick={create}
            disabled={saving || !name.trim()}
            className="px-4 py-2 text-sm rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition"
          >
            {saving ? 'Création…' : 'Créer'}
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : buildings.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-muted">
            <Building2 className="w-10 h-10 opacity-20 mb-2" />
            <p className="text-sm">Aucun projet 3D. Créez-en un.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-muted">
              <tr>
                <th className="text-left p-3 font-medium">Nom</th>
                <th className="text-left p-3 font-medium">Pièces</th>
                <th className="text-left p-3 font-medium">Origine</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {buildings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="p-3 font-medium text-secondary">{b.name}</td>
                  <td className="p-3 text-muted">{b.rooms_count}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${b.is_public ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {b.is_public ? 'client' : 'studio'}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/buildings/${b.id}`}
                        className="p-2 rounded-lg hover:bg-gray-100 text-muted hover:text-secondary transition"
                        title="Éditer"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => remove(b)}
                        className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition"
                        title="Supprimer"
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
    </div>
  )
}

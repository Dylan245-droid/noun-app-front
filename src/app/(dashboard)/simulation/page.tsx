'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { Play, RefreshCw, Package, Layout, BarChart3, Trash2, Share2 } from 'lucide-react'
import { physicsApi } from '@/services/physics'

const PhysicsViewer = dynamic(
  () => import('@/components/physics/PhysicsViewer').then((m) => m.PhysicsViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  },
)

interface Simulation {
  id: number
  scene: number
  status: string
  total_frames: number
  duration_seconds: number
  started_at: string
}

interface Scene {
  id: number
  slug: string
  title: string
}

export default function SimulationPage() {
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [scenes, setScenes] = useState<Scene[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sceneSlug, setSceneSlug] = useState<string>('')
  const [duration, setDuration] = useState(5)
  const [loading, setLoading] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sim = params.get('sim')
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (sim) setSelectedId(sim)
  }, [])

  useEffect(() => {
    const load = async () => {
      const data = await physicsApi.getSimulations()
      setSimulations(Array.isArray(data) ? data : data.results || [])
    }
    load()
  }, [refreshKey])

  useEffect(() => {
    const loadScenes = async () => {
      const data = await physicsApi.getScenes()
      const list: Scene[] = Array.isArray(data) ? data : data.results || []
      setScenes(list)
      if (list.length > 0) setSceneSlug((s) => s || list[0].slug)
    }
    loadScenes()
  }, [])

  const runScene = async () => {
    if (!sceneSlug) return
    setLoading(true)
    try {
      const result = await physicsApi.runScene(sceneSlug, duration)
      setSelectedId(result.id.toString())
      setRefreshKey((k) => k + 1)
    } catch (e) {
      alert('Échec du lancement de la simulation')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const runDemo = async () => {
    setLoading(true)
    try {
      const result = await physicsApi.quickDemo()
      setSelectedId(result.simulation_id.toString())
      setRefreshKey((k) => k + 1)
    } finally {
      setLoading(false)
    }
  }

  const removeSimulation = async (sim: Simulation, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`Supprimer la simulation #${sim.id} ?`)) return
    await physicsApi.deleteSimulation(sim.id.toString())
    if (selectedId === sim.id.toString()) setSelectedId(null)
    setRefreshKey((k) => k + 1)
  }

  const shareSimulation = async () => {
    const sim = simulations.find((s) => s.id.toString() === selectedId)
    if (!sim) return
    try {
      const share = await physicsApi.createShare({
        scene: sim.scene,
        simulation: sim.id,
        client_name: '',
      })
      const url = `${window.location.origin}/espace/${share.token}`
      await navigator.clipboard.writeText(url).catch(() => {})
      alert(`Lien client copié :\n${url}`)
    } catch (e) {
      alert('Impossible de créer le lien de partage')
      console.error(e)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary tracking-tight">
          Simulation physique 3D
        </h1>
        <p className="text-muted text-sm mt-1">
          Aménagement intérieur — visualisation du mouvement des meubles
          (gravité, rebond, inertie, collisions).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-secondary mb-3">
              Nouvelle simulation
            </h2>
            <label className="block mb-3">
              <span className="text-xs text-muted">Scène</span>
              <select
                value={sceneSlug}
                onChange={(e) => setSceneSlug(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              >
                {scenes.length === 0 && <option value="">Aucune scène</option>}
                {scenes.map((s) => (
                  <option key={s.id} value={s.slug}>{s.title}</option>
                ))}
              </select>
            </label>
            <label className="block mb-4">
              <span className="text-xs text-muted">Durée (secondes)</span>
              <input
                type="number" min={1} max={20} step={1}
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 5)}
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
              />
            </label>
            <div className="flex gap-2">
              <button
                onClick={runScene}
                disabled={loading || !sceneSlug}
                className="flex-1 px-3 py-2 text-xs rounded-lg bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 transition"
              >
                {loading ? 'Lancement…' : 'Lancer'}
              </button>
              <button
                onClick={runDemo}
                disabled={loading}
                className="px-3 py-2 text-xs rounded-lg border border-gray-200 text-secondary font-medium hover:bg-gray-50 disabled:opacity-50 transition"
              >
                Démo
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-semibold text-secondary">Simulations</h2>
              </div>
              <button
                onClick={() => setRefreshKey((k) => k + 1)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-muted transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : simulations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted">
                <BarChart3 className="w-8 h-8 opacity-20 mb-2" />
                <p className="text-sm">Aucune simulation</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-50 max-h-[520px] overflow-y-auto">
                {simulations.map((s) => (
                  <li key={s.id}>
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedId(s.id.toString())}
                      className={`w-full flex items-center justify-between gap-2 p-3 rounded-lg text-left cursor-pointer transition-all ${
                        selectedId === s.id.toString()
                          ? 'bg-blue-50 border border-blue-100'
                          : 'bg-gray-50 border border-transparent hover:bg-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-secondary">
                          Simulation #{s.id}
                        </p>
                        <p className="text-xs text-muted">
                          {s.total_frames} frames • {s.duration_seconds}s
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            s.status === 'done'
                              ? 'bg-emerald-100 text-emerald-700'
                              : s.status === 'failed'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {s.status}
                        </span>
                        <button
                          onClick={(e) => removeSimulation(s, e)}
                          title="Supprimer"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="lg:col-span-8">
          {!selectedId ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 flex flex-col items-center justify-center h-[600px]">
              <Layout className="w-16 h-16 opacity-20 mb-4" />
              <h2 className="text-lg font-medium text-secondary">Sélectionnez une simulation</h2>
              <p className="text-muted text-sm mt-1">La visualisation 3D s&apos;affichera ici.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-0 h-[600px] flex flex-col">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary" />
                  <h2 className="text-sm font-semibold text-secondary">
                    Visualisation 3D — Simulation #{selectedId}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={shareSimulation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Partager (client)
                  </button>
                  <button
                    onClick={runScene}
                    disabled={loading || !sceneSlug}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
                  >
                    {loading ? 'Lancement…' : 'Relancer'}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                <PhysicsViewer simulationId={selectedId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

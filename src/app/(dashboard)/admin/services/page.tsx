'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Save, ArrowUp, ArrowDown } from 'lucide-react'
import { fetchApi } from '@/services/api'

interface Service {
  id: number
  category: 'architecture' | 'digital'
  category_display: string
  title: string
  title_en: string
  description: string
  description_en: string
  tags: string[]
  tags_en: string[]
  order: number
  is_active: boolean
}

const CATEGORIES = [
  { value: 'architecture', label: 'Architecture' },
  { value: 'digital', label: 'Digital' },
]

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)
  const [langTab, setLangTab] = useState<'fr' | 'en'>('fr')
  const [formData, setFormData] = useState({
    category: 'architecture' as 'architecture' | 'digital',
    title: '', title_en: '',
    description: '', description_en: '',
    tags: '', tags_en: '',
    order: 0, is_active: true,
  })

  const fetchServices = async () => {
    try {
      const data = await fetchApi('/services/?skip_translation=1')
      setServices(data.results || data)
    } catch { /* fallback */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchServices() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(';').map((t) => t.trim()).filter(Boolean).join(';'),
        tags_en: formData.tags_en.split(';').map((t) => t.trim()).filter(Boolean).join(';'),
      }
      if (editing) {
        await fetchApi(`/services/${editing.id}/`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        })
      } else {
        await fetchApi('/services/', {
          method: 'POST',
          body: JSON.stringify(payload)
        })
      }
      resetForm()
      fetchServices()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error(err)
      alert(err?.message ? err.message : 'Erreur')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce service ?')) return
    try { 
      await fetchApi(`/services/${id}/`, { method: 'DELETE' })
      fetchServices() 
    }
    catch { console.error('Failed to delete') }
  }

  const startEdit = (service: Service) => {
    setEditing(service)
    setFormData({
      category: service.category,
      title: service.title || '',
      title_en: service.title_en || '',
      description: service.description || '',
      description_en: service.description_en || '',
      tags: (service.tags || []).join('; '),
      tags_en: (service.tags_en || []).join('; '),
      order: service.order,
      is_active: service.is_active,
    })
    setLangTab('fr')
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null); setShowForm(false); setLangTab('fr')
    setFormData({
      category: 'architecture', title: '', title_en: '',
      description: '', description_en: '', tags: '', tags_en: '',
      order: 0, is_active: true,
    })
  }

  const moveService = async (service: Service, direction: 'up' | 'down') => {
    const filtered = services.filter((s) => s.category === service.category)
    const idx = filtered.findIndex((s) => s.id === service.id)
    if (direction === 'up' && idx === 0) return
    if (direction === 'down' && idx === filtered.length - 1) return

    const other = filtered[direction === 'up' ? idx - 1 : idx + 1]
    const currentOrder = service.order
    try {
      await fetchApi(`/services/${service.id}/`, { 
        method: 'PATCH', 
        body: JSON.stringify({ order: other.order }) 
      })
      await fetchApi(`/services/${other.id}/`, { 
        method: 'PATCH', 
        body: JSON.stringify({ order: currentOrder }) 
      })
      fetchServices()
    } catch { console.error('Failed to reorder') }
  }

  if (loading) return <p className="text-muted">Chargement...</p>

  const archServices = services.filter((s) => s.category === 'architecture')
  const digitalServices = services.filter((s) => s.category === 'digital')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Services</h1>
          <p className="text-muted text-sm mt-1">Gérez les services Architecture et Digital</p>
        </div>
        <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-white text-sm font-medium rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all">
          <Plus className="w-4 h-4" /> Nouveau service
        </button>
      </div>

      {/* Architecture services */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Architecture ({archServices.length})
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {archServices.map((service, i) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl font-bold text-secondary/5">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveService(service, 'up')} className="p-1 text-muted hover:text-secondary transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => moveService(service, 'down')} className="p-1 text-muted hover:text-secondary transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-bold text-secondary text-sm mb-1">{service.title}</h3>
              {service.title_en && <p className="text-xs text-muted italic mb-1">{service.title_en}</p>}
              <p className="text-xs text-muted line-clamp-2 mb-3">{service.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {service.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
                <button onClick={() => startEdit(service)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-secondary hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-3 h-3" /> Modifier</button>
                <button onClick={() => handleDelete(service.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3 h-3" /> Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Digital services */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-secondary mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Digital ({digitalServices.length})
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {digitalServices.map((service, i) => (
            <div key={service.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl font-bold text-secondary/5">{String(i + 1).padStart(2, '0')}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveService(service, 'up')} className="p-1 text-muted hover:text-secondary transition-colors"><ArrowUp className="w-3.5 h-3.5" /></button>
                  <button onClick={() => moveService(service, 'down')} className="p-1 text-muted hover:text-secondary transition-colors"><ArrowDown className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <h3 className="font-bold text-secondary text-sm mb-1">{service.title}</h3>
              {service.title_en && <p className="text-xs text-muted italic mb-1">{service.title_en}</p>}
              <p className="text-xs text-muted line-clamp-2 mb-3">{service.description}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {service.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded-full">{tag}</span>
                ))}
              </div>
              <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
                <button onClick={() => startEdit(service)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-secondary hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-3 h-3" /> Modifier</button>
                <button onClick={() => handleDelete(service.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3 h-3" /> Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 lg:pt-20 overflow-y-auto" onClick={resetForm}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl w-full max-w-2xl mb-12 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-secondary tracking-tight">{editing ? 'Modifier le service' : 'Nouveau service'}</h2>
                  <p className="text-xs text-muted mt-0.5">{editing ? 'Mettez à jour les informations' : 'Ajoutez un service'}</p>
                </div>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 text-muted transition-colors"><X className="w-5 h-5" /></button>
              </div>

              {/* Language tabs */}
              <div className="flex items-center gap-1 px-6 pt-4">
                <button type="button" onClick={() => setLangTab('fr')} className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${langTab === 'fr' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-secondary'}`}>🇫🇷 Français</button>
                <button type="button" onClick={() => setLangTab('en')} className={`flex items-center gap-1.5 px-4 py-2 rounded-t-xl text-xs font-semibold border-b-2 transition-all ${langTab === 'en' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-secondary'}`}>🇬🇧 English</button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">Catégorie</label>
                    <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as 'architecture' | 'digital' })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">Titre ({langTab === 'fr' ? 'FR' : 'EN'})</label>
                    <input type="text" value={langTab === 'fr' ? formData.title : formData.title_en} onChange={(e) => setFormData({ ...formData, [langTab === 'fr' ? 'title' : 'title_en']: e.target.value })} required className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Description ({langTab === 'fr' ? 'FR' : 'EN'})</label>
                  <textarea value={langTab === 'fr' ? formData.description : formData.description_en} onChange={(e) => setFormData({ ...formData, [langTab === 'fr' ? 'description' : 'description_en']: e.target.value })} required rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Tags ({langTab === 'fr' ? 'FR' : 'EN'}, séparés par des points-virgules)</label>
                  <input type="text" value={langTab === 'fr' ? formData.tags : formData.tags_en} onChange={(e) => setFormData({ ...formData, [langTab === 'fr' ? 'tags' : 'tags_en']: e.target.value })} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" placeholder="React / Next.js;Django / DRF;CMS sur mesure" />
                </div>

                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-secondary">Actif</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-medium text-secondary bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Annuler</button>
                  <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-medium bg-secondary text-white rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Save className="w-4 h-4 inline mr-1" />{saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

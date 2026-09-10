'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, Eye, EyeOff, Calendar, MapPin, Code, Star, Link as LinkIcon, ZoomIn, ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import Link from 'next/link'
import { fetchApi } from '@/services/api'

interface Client {
  id: number
  name: string
  logo?: string
  website?: string
}

interface ProjectImage {
  id: number
  image: string
  caption: string
  is_cover: boolean
}

interface Project {
  id: number
  slug: string
  title: string
  title_en: string
  short_description: string
  short_description_en: string
  description: string
  description_en: string
  category: 'architecture' | 'digital'
  status: 'draft' | 'published'
  is_featured: boolean
  client: Client | null
  client_name: string
  client_name_override: string
  delivery_date: string | null
  location: string
  location_en: string
  technologies: string
  technologies_en: string
  project_url: string
  images: ProjectImage[]
  cover_image: string | null
  created_at: string
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Project | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [langTab, setLangTab] = useState<'fr' | 'en'>('fr')
  const [formData, setFormData] = useState({
    title: '',
    title_en: '',
    short_description: '',
    short_description_en: '',
    description: '',
    description_en: '',
    category: 'architecture' as 'architecture' | 'digital',
    status: 'draft' as 'draft' | 'published',
    is_featured: false,
    client: null as number | null,
    client_name_override: '',
    delivery_date: '',
    location: '',
    location_en: '',
    technologies: '',
    technologies_en: '',
    project_url: '',
  })
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<ProjectImage[]>([])
  const [saving, setSaving] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [showClientModal, setShowClientModal] = useState(false)
  const [clientForm, setClientForm] = useState({ name: '', website: '' })
  const [clientLogoFile, setClientLogoFile] = useState<File | null>(null)
  const [savingClient, setSavingClient] = useState(false)

  const lang = langTab

  const langField = (base: string) => lang === 'fr' ? base : `${base}_en`

  const fetchProjects = async () => {
    try {
      const data = await fetchApi('/portfolio/projects/?skip_translation=1')
      setProjects(data.results || data)
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const data = await fetchApi('/portfolio/clients/')
      setClients(data.results || data)
    } catch {
      // Fallback
    }
  }

  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'client' && value) fd.append('client', String(value))
        else if (key === 'is_featured') fd.append('is_featured', String(value))
        else if (value) fd.append(key, String(value))
      })
      imageFiles.forEach((file) => fd.append('uploaded_images', file))

      if (editing) {
        await fetchApi(`/portfolio/projects/${editing.slug}/`, {
          method: 'PUT',
          body: fd,
          // Content-Type is intentionally omitted for FormData
        })
      } else {
        await fetchApi('/portfolio/projects/', {
          method: 'POST',
          body: fd,
        })
      }

      resetForm()
      fetchProjects()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (slug: string) => {
    if (!confirm('Supprimer ce projet ?')) return
    try {
      await fetchApi(`/portfolio/projects/${slug}/`, { method: 'DELETE' })
      fetchProjects()
    } catch {
      console.error('Failed to delete')
    }
  }

  const startEdit = async (project: Project) => {
    try {
      const data = await fetchApi(`/portfolio/projects/${project.slug}/?skip_translation=1`)
      setEditing(data)
      setExistingImages(data.images || [])
      setFormData({
        title: data.title || '',
        title_en: data.title_en || '',
        short_description: data.short_description || '',
        short_description_en: data.short_description_en || '',
        description: data.description || '',
        description_en: data.description_en || '',
        category: data.category,
        status: data.status,
        is_featured: data.is_featured,
        client: data.client?.id || null,
        client_name_override: data.client_name_override || '',
        delivery_date: data.delivery_date || '',
        location: data.location || '',
        location_en: data.location_en || '',
        technologies: data.technologies || '',
        technologies_en: data.technologies_en || '',
        project_url: data.project_url || '',
      })
      setLangTab('fr')
      setShowForm(true)
    } catch {
      console.error('Failed to fetch project details')
    }
  }

  const resetForm = () => {
    setEditing(null)
    setShowForm(false)
    setExistingImages([])
    setLangTab('fr')
    setFormData({
      title: '', title_en: '', short_description: '', short_description_en: '',
      description: '', description_en: '',
      category: 'architecture', status: 'draft', is_featured: false,
      client: null, client_name_override: '', delivery_date: '',
      location: '', location_en: '', technologies: '', technologies_en: '',
      project_url: '',
    })
    setImageFiles([])
  }

  const handleSetCover = async (imageId: number) => {
    if (!editing) return
    try {
      const data = await fetchApi(`/portfolio/projects/${editing.slug}/images/${imageId}/set-cover/`, { method: 'POST' })
      setExistingImages(data.images || [])
    } catch {
      console.error('Failed to set cover')
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!editing) return
    try {
      const data = await fetchApi(`/portfolio/projects/${editing.slug}/images/${imageId}/`, { method: 'DELETE' })
      setExistingImages(data.images || [])
    } catch {
      console.error('Failed to delete image')
    }
  }

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingClient(true)
    try {
      const fd = new FormData()
      fd.append('name', clientForm.name)
      fd.append('website', clientForm.website)
      fd.append('is_partner', 'false')
      if (clientLogoFile) fd.append('logo', clientLogoFile)
      const newClient = await fetchApi('/portfolio/clients/', { method: 'POST', body: fd })
      await fetchClients()
      setFormData({ ...formData, client: newClient.id })
      setShowClientModal(false)
      setClientForm({ name: '', website: '' })
      setClientLogoFile(null)
    } catch (err) {
      console.error(err)
    } finally {
      setSavingClient(false)
    }
  }

  const allLightboxImages = [...existingImages.map((img) => img.image), ...imageFiles.map((f) => URL.createObjectURL(f))]

  const handleLightboxNav = useCallback((dir: 'prev' | 'next') => {
    if (lightboxIndex === null) return
    if (dir === 'prev') setLightboxIndex((i) => (i! > 0 ? i! - 1 : allLightboxImages.length - 1))
    else setLightboxIndex((i) => (i! < allLightboxImages.length - 1 ? i! + 1 : 0))
  }, [lightboxIndex, allLightboxImages.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxIndex(null)
      if (e.key === 'ArrowLeft') handleLightboxNav('prev')
      if (e.key === 'ArrowRight') handleLightboxNav('next')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxIndex, handleLightboxNav])

  if (loading) return <p className="text-muted">Chargement...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Projets</h1>
          <p className="text-muted text-sm mt-1">{projects.length} projet{projects.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-white text-sm font-medium rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" /> Nouveau
        </button>
      </div>

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 lg:pt-20 overflow-y-auto"
            onClick={resetForm}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white rounded-2xl w-full max-w-3xl mx-4 mb-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-secondary tracking-tight">
                    {editing ? 'Modifier le projet' : 'Nouveau projet'}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {editing ? 'Mettez à jour les informations' : 'Remplissez les informations du projet'}
                  </p>
                </div>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 text-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Language tabs */}
                <div className="flex items-center gap-1 mb-4">
                  <button type="button" onClick={() => setLangTab('fr')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${langTab === 'fr' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-secondary'}`}>🇫🇷 Français</button>
                  <button type="button" onClick={() => setLangTab('en')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${langTab === 'en' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-secondary'}`}>🇬🇧 English</button>
                </div>

                {/* Title + Category */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-secondary mb-2">Titre du projet ({lang}) *</label>
                    <input
                      type="text"
                      value={formData[langField('title') as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [langField('title')]: e.target.value })}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="Nom du projet"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">Catégorie</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as 'architecture' | 'digital' })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    >
                      <option value="architecture">Architecture</option>
                      <option value="digital">Digital</option>
                    </select>
                  </div>
                </div>

                {/* Short description */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Description courte ({lang}) *</label>
                  <input
                    type="text"
                    value={formData[langField('short_description') as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [langField('short_description')]: e.target.value })}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Une phrase pour les cartes"
                  />
                </div>

                {/* Full description */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Description exhaustive ({lang}) *</label>
                  <textarea
                    value={formData[langField('description') as keyof typeof formData] as string}
                    onChange={(e) => setFormData({ ...formData, [langField('description')]: e.target.value })}
                    required
                    rows={5}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                    placeholder="Décrivez le projet en détail..."
                  />
                </div>

                {/* Client + Date + Location/Tech */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="min-w-0">
                    <label className="block text-xs font-semibold text-secondary mb-2">
                      Client
                    </label>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={formData.client || ''}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value ? Number(e.target.value) : null })}
                        className="min-w-0 flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all truncate"
                      >
                        <option value="">Aucun</option>
                        {clients.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowClientModal(true)}
                        className="shrink-0 w-9 h-9 flex items-center justify-center bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                        title="Créer un client"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2">
                      <Calendar className="w-3.5 h-3.5 text-muted" />
                      Date de livraison
                    </label>
                    <input
                      type="date"
                      value={formData.delivery_date || ''}
                      onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2">
                      {formData.category === 'architecture' ? <MapPin className="w-3.5 h-3.5 text-muted" /> : <Code className="w-3.5 h-3.5 text-muted" />}
                      {formData.category === 'architecture' ? `Lieu (${lang})` : `Technologies (${lang})`}
                    </label>
                    {formData.category === 'architecture' ? (
                      <input
                        type="text"
                        value={formData[langField('location') as keyof typeof formData] as string}
                        onChange={(e) => setFormData({ ...formData, [langField('location')]: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="Ville, pays"
                      />
                    ) : (
                      <input
                        type="text"
                        value={formData[langField('technologies') as keyof typeof formData] as string}
                        onChange={(e) => setFormData({ ...formData, [langField('technologies')]: e.target.value })}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        placeholder="React, Django, PostgreSQL..."
                      />
                    )}
                  </div>
                </div>

                {/* Project URL */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2">
                    <LinkIcon className="w-3.5 h-3.5 text-muted" />
                    Lien vers le projet <span className="text-muted font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.project_url}
                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://..."
                  />
                </div>

                {/* Status + Featured */}
                <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-secondary">Statut</span>
                    <div className="flex bg-white rounded-lg border border-gray-200 p-0.5">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'draft' })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          formData.status === 'draft' ? 'bg-secondary text-white' : 'text-muted hover:text-secondary'
                        }`}
                      >
                        <EyeOff className="w-3 h-3" /> Brouillon
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, status: 'published' })}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          formData.status === 'published' ? 'bg-primary text-white' : 'text-muted hover:text-primary'
                        }`}
                      >
                        <Eye className="w-3 h-3" /> Publié
                      </button>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.is_featured}
                        onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-secondary">Projet vedette</span>
                  </label>
                </div>

                {/* Image Gallery */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">
                    Galerie d&apos;images
                  </label>

                  {/* Existing images */}
                  {existingImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
                      {existingImages.map((img, idx) => (
                        <div key={img.id} className="relative group cursor-pointer" onClick={() => setLightboxIndex(idx)}>
                          <div className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                            img.is_cover ? 'border-primary shadow-md shadow-primary/10' : 'border-gray-100 group-hover:border-gray-200'
                          }`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.image} alt={img.caption || 'Project Image'} className="w-full h-full object-cover" />
                          </div>

                          {/* Zoom indicator */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                          </div>

                          {/* Cover badge */}
                          {img.is_cover && (
                            <div className="absolute -top-1.5 -left-1.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
                              <Star className="w-3 h-3 text-white fill-white" />
                            </div>
                          )}

                          {/* Hover actions */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2 pointer-events-none">
                            {!img.is_cover && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleSetCover(img.id) }}
                                className="p-1.5 bg-white rounded-lg text-secondary hover:bg-primary hover:text-white transition-colors pointer-events-auto"
                                title="Définir comme couverture"
                              >
                                <Star className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteImage(img.id) }}
                              className="p-1.5 bg-white rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-colors pointer-events-auto"
                              title="Supprimer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {img.is_cover && (
                            <span className="absolute bottom-1 left-1 right-1 text-center text-[9px] font-semibold text-white bg-primary/80 rounded-md py-0.5">
                              Couverture
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload zone — always visible */}
                  <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02] transition-all">
                    <Upload className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium text-muted">Ajouter des images</p>
                    <p className="text-xs text-muted/60 mt-0.5">PNG, JPG jusqu&apos;à 10MB</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = e.target.files
                        if (files) {
                          setImageFiles((prev) => [...prev, ...Array.from(files)])
                        }
                      }}
                    />
                  </label>

                  {/* New image previews */}
                  {imageFiles.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                      {imageFiles.map((file, i) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-primary/30 bg-primary/[0.02] cursor-pointer" onClick={() => setLightboxIndex(existingImages.length + i)}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-xl flex items-center justify-center">
                            <ZoomIn className="w-5 h-5 text-white opacity-0 hover:opacity-100 transition-opacity drop-shadow" />
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setImageFiles((prev) => prev.filter((_, idx) => idx !== i))
                            }}
                            className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-sm hover:bg-red-500 hover:text-white transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                          {i === 0 && existingImages.length === 0 && (
                            <span className="absolute bottom-1 left-1 right-1 text-center text-[9px] font-semibold text-white bg-primary/80 rounded-md py-0.5">
                              Couverture
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 text-sm font-medium text-secondary bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 text-sm font-medium bg-secondary text-white rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer le projet'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Projects list */}
      {projects.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-muted/30" />
          </div>
          <p className="text-muted font-medium">Aucun projet pour le moment</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-primary text-sm font-medium hover:underline"
          >
            Créer votre premier projet
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
              {project.cover_image ? (
                <div className="aspect-[4/3] overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={project.cover_image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                      project.status === 'published' ? 'bg-primary text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {project.status === 'published' ? 'Publié' : 'Brouillon'}
                    </span>
                    {project.is_featured && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700">★ Vedette</span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-muted/20" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                    project.category === 'architecture' ? 'bg-primary/10 text-primary' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {project.category}
                  </span>
                  {project.client_name && (
                    <span className="text-[10px] text-muted truncate">{project.client_name}</span>
                  )}
                </div>
                <h3 className="font-bold text-secondary text-sm mb-1 truncate">{project.title}</h3>
                <p className="text-xs text-muted line-clamp-2 mb-3">{project.short_description}</p>
                {project.technologies && project.category === 'digital' && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.technologies.split(',').slice(0, 3).map((tech) => (
                      <span key={tech.trim()} className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-md font-medium">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-1 pt-3 border-t border-gray-50">
                  <button
                    onClick={() => startEdit(project)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-secondary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(project.slug)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && allLightboxImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {allLightboxImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLightboxNav('prev') }}
                  className="absolute left-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors z-10"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleLightboxNav('next') }}
                  className="absolute right-4 p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors z-10"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-[90vw] max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={allLightboxImages[lightboxIndex]}
                alt="Fullscreen"
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
            </motion.div>

            {allLightboxImages.length > 1 && (
              <div className="absolute bottom-4 text-white/60 text-sm font-medium">
                {lightboxIndex + 1} / {allLightboxImages.length}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Inline client creation modal */}
      <AnimatePresence>
        {showClientModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
            onClick={() => setShowClientModal(false)}
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white rounded-2xl w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-secondary">Nouveau client</h3>
                  <p className="text-xs text-muted mt-0.5">Ajoutez un client depuis ici</p>
                </div>
                <button onClick={() => setShowClientModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-muted transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateClient} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Nom *</label>
                  <input
                    type="text"
                    value={clientForm.name}
                    onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Ex: IRT, CENAREST..."
                    autoFocus
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-secondary mb-1.5">
                    <Globe className="w-3 h-3 text-muted" />
                    Site web <span className="text-muted font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="url"
                    value={clientForm.website}
                    onChange={(e) => setClientForm({ ...clientForm, website: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1.5">Logo</label>
                  <div className="flex items-center gap-3">
                    {clientLogoFile && (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(clientLogoFile)} alt="Preview" className="w-12 h-12 object-cover rounded-lg border-2 border-primary/30" />
                        <button
                          type="button"
                          onClick={() => setClientLogoFile(null)}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-xs text-muted hover:text-secondary hover:border-gray-300 cursor-pointer transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      {clientLogoFile ? 'Changer' : 'Ajouter un logo'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setClientLogoFile(e.target.files[0]) }} />
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowClientModal(false)}
                    className="px-4 py-2 text-sm font-medium text-secondary bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingClient || !clientForm.name.trim()}
                    className="px-4 py-2 text-sm font-medium bg-secondary text-white rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingClient ? 'Création...' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

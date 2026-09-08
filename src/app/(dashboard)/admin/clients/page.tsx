'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, X, Upload, Globe, Star, ExternalLink, Users } from 'lucide-react'
import { fetchApi } from '@/services/api'

interface Client {
  id: number
  name: string
  logo?: string
  website: string
  is_partner: boolean
  created_at: string
  projects?: { id: number; title: string }[]
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Client | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    is_partner: false,
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const data = await fetchApi('/portfolio/clients/')
      setClients(data.results || data)
    } catch {
      // Fallback
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const fd = new FormData()
      fd.append('name', formData.name)
      fd.append('website', formData.website)
      fd.append('is_partner', String(formData.is_partner))
      if (logoFile) fd.append('logo', logoFile)

      if (editing) {
        await fetchApi(`/portfolio/clients/${editing.id}/`, {
          method: 'PUT',
          body: fd,
        })
      } else {
        await fetchApi('/portfolio/clients/', {
          method: 'POST',
          body: fd,
        })
      }

      resetForm()
      fetchClients()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce client ? Les projets associés ne seront pas supprimés.')) return
    try {
      await fetchApi(`/portfolio/clients/${id}/`, { method: 'DELETE' })
      fetchClients()
    } catch {
      console.error('Failed to delete')
    }
  }

  const startEdit = (client: Client) => {
    setEditing(client)
    setFormData({
      name: client.name,
      website: client.website || '',
      is_partner: client.is_partner,
    })
    setLogoFile(null)
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null)
    setShowForm(false)
    setFormData({ name: '', website: '', is_partner: false })
    setLogoFile(null)
  }

  if (loading) return <p className="text-muted">Chargement...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Clients & Partenaires</h1>
          <p className="text-muted text-sm mt-1">{clients.length} client{clients.length > 1 ? 's' : ''}</p>
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
              className="bg-white rounded-2xl w-full max-w-lg mb-12 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-secondary tracking-tight">
                    {editing ? 'Modifier le client' : 'Nouveau client'}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">
                    {editing ? 'Mettez à jour les informations' : 'Ajoutez un nouveau client ou partenaire'}
                  </p>
                </div>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 text-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Nom du client *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="Ex: IRT, CENAREST..."
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2">
                    <Globe className="w-3.5 h-3.5 text-muted" />
                    Site web <span className="text-muted font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="https://..."
                  />
                </div>

                {/* Logo */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Logo</label>
                  <div className="flex items-center gap-4">
                    {/* Current logo preview */}
                    {editing?.logo && !logoFile && (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={editing.logo} alt={editing.name} className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                      </div>
                    )}
                    {/* New logo preview */}
                    {logoFile && (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-16 h-16 object-cover rounded-xl border-2 border-primary/30" />
                        <button
                          type="button"
                          onClick={() => setLogoFile(null)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-muted hover:text-secondary hover:border-gray-300 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {logoFile ? 'Changer' : editing?.logo ? 'Remplacer' : 'Ajouter'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setLogoFile(e.target.files[0])
                      }}
                    />
                  </div>
                </div>

                {/* Partner toggle */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-secondary flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-500" />
                        Afficher comme partenaire
                      </p>
                      <p className="text-xs text-muted mt-0.5">Le client apparaîtra dans la section partenaires de la page d&apos;accueil</p>
                    </div>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.is_partner}
                        onChange={(e) => setFormData({ ...formData, is_partner: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                      <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
                    </div>
                  </label>
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
                    {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer le client'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clients list */}
      {clients.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-muted/30" />
          </div>
          <p className="text-muted font-medium">Aucun client pour le moment</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 text-primary text-sm font-medium hover:underline"
          >
            Ajouter votre premier client
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-white rounded-2xl border border-gray-100 p-5 group hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100">
                  {client.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={client.logo} alt={client.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-bold text-secondary/20">{client.name.charAt(0)}</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-secondary text-sm truncate">{client.name}</h3>
                    {client.is_partner && (
                      <span className="flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700">
                        Partenaire
                      </span>
                    )}
                  </div>
                  {client.website && (
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {client.website.replace(/^https?:\/\//, '')}
                    </a>
                  )}
                  <p className="text-[10px] text-muted mt-1">
                    Ajouté le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-50">
                <button
                  onClick={() => startEdit(client)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-secondary hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Modifier
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

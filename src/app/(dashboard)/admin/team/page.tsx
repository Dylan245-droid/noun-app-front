'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Edit2, Trash2, X, Upload, ExternalLink, Link as LinkIcon, GraduationCap, Sparkles } from 'lucide-react'
import { fetchApi } from '@/services/api'

const ROLES = [
  { value: 'pdg', label: 'PDG' },
  { value: 'dg', label: 'Directeur Général' },
  { value: 'ceo', label: 'CEO' },
  { value: 'cto', label: 'CTO' },
  { value: 'gerant', label: 'Gérant' },
  { value: 'co_gerant', label: 'Co-gérant' },
  { value: 'architecte', label: 'Architecte' },
  { value: 'ingenieur', label: 'Ingénieur' },
  { value: 'designer', label: 'Designer' },
  { value: 'developpeur', label: 'Développeur' },
]

interface TeamMember {
  id: number
  first_name: string
  last_name: string
  role: string
  custom_role: string
  bio: string
  bio_en: string
  photo: string | null
  skills: string
  skills_en: string
  education: string
  education_en: string
  linkedin: string
  github: string
  portfolio_url: string
  order: number
  is_founder: boolean
  is_active: boolean
  full_name: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<TeamMember | null>(null)
  const [langTab, setLangTab] = useState<'fr' | 'en'>('fr')
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', role: 'autre', custom_role: '',
    bio: '', bio_en: '', skills: '', skills_en: '', education: '', education_en: '',
    linkedin: '', github: '', portfolio_url: '',
    is_founder: false, is_active: true, order: 0,
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const lang = langTab
  const langField = (base: string) => lang === 'fr' ? base : `${base}_en`

  const fetchMembers = async () => {
    try {
      const data = await fetchApi('/team/?skip_translation=1')
      setMembers(data.results || data)
    } catch { setMembers([]) }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchMembers() }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'is_active' || k === 'is_founder') fd.append(k, String(v))
        else if (v) fd.append(k, String(v))
      })
      if (photoFile) fd.append('photo', photoFile)

      if (editing) {
        await fetchApi(`/team/${editing.id}/`, {
          method: 'PATCH',
          body: fd,
        })
      } else {
        await fetchApi('/team/', {
          method: 'POST',
          body: fd,
        })
      }
      resetForm()
      fetchMembers()
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce membre ?')) return
    try { await fetchApi(`/team/${id}/`, { method: 'DELETE' }); fetchMembers() } catch { console.error('Failed') }
  }

  const startEdit = (m: TeamMember) => {
    setEditing(m)
    setFormData({
      first_name: m.first_name, last_name: m.last_name, role: m.role,
      custom_role: m.custom_role || '',
      bio: m.bio || '', bio_en: (m as any).bio_en || '',
      skills: m.skills || '', skills_en: (m as any).skills_en || '',
      education: m.education || '', education_en: (m as any).education_en || '',
      linkedin: m.linkedin || '', github: m.github || '',
      portfolio_url: m.portfolio_url || '', is_founder: m.is_founder,
      is_active: m.is_active, order: m.order || 0,
    })
    setLangTab('fr')
    setPhotoFile(null)
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null); setShowForm(false); setPhotoFile(null); setLangTab('fr')
    setFormData({
      first_name: '', last_name: '', role: 'autre', custom_role: '',
      bio: '', bio_en: '', skills: '', skills_en: '', education: '', education_en: '',
      linkedin: '', github: '', portfolio_url: '',
      is_founder: false, is_active: true, order: 0,
    })
  }

  if (loading) return <p className="text-muted">Chargement...</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Équipe</h1>
          <p className="text-muted text-sm mt-1">{members.length} membre{members.length > 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-secondary text-white text-sm font-medium rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-4 h-4" /> Nouveau membre
        </button>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-12 lg:pt-20 overflow-y-auto"
            onClick={resetForm}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="bg-white rounded-2xl w-full max-w-2xl mb-12 shadow-2xl"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-secondary tracking-tight">{editing ? 'Modifier le membre' : 'Nouveau membre'}</h2>
                  <p className="text-xs text-muted mt-0.5">{editing ? 'Mettez à jour les informations' : 'Ajoutez un membre à l\'équipe'}</p>
                </div>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 text-muted"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Language tabs */}
                <div className="flex items-center gap-1 mb-2">
                  <button type="button" onClick={() => setLangTab('fr')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${langTab === 'fr' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-secondary'}`}>🇫🇷 Français</button>
                  <button type="button" onClick={() => setLangTab('en')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${langTab === 'en' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-secondary'}`}>🇬🇧 English</button>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">Prénom *</label>
                    <input type="text" value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Claude François" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">Nom *</label>
                    <input type="text" value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="EMANE MENGUE" />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">Rôle</label>
                    <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                      <option value="">— Sélectionner —</option>
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-2">Rôle personnalisé</label>
                    <input type="text" value={formData.custom_role} onChange={(e) => setFormData({ ...formData, custom_role: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="Ex: CEO, Directeur technique..." />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Bio ({lang})</label>
                  <textarea value={formData[langField('bio') as keyof typeof formData] as string} onChange={(e) => setFormData({ ...formData, [langField('bio')]: e.target.value })} rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="Courte biographie..." />
                </div>

                {/* Skills */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-muted" />
                    Compétences ({lang}) <span className="text-muted font-normal">(séparées par des ;)</span>
                  </label>
                  <input type="text" value={formData[langField('skills') as keyof typeof formData] as string} onChange={(e) => setFormData({ ...formData, [langField('skills')]: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="React; Django; Architecture d'intérieur; Design urbain..." />
                </div>

                {/* Education */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2">
                    <GraduationCap className="w-3.5 h-3.5 text-muted" />
                    Formation ({lang}) <span className="text-muted font-normal">(université, école...)</span>
                  </label>
                  <textarea value={formData[langField('education') as keyof typeof formData] as string} onChange={(e) => setFormData({ ...formData, [langField('education')]: e.target.value })} rows={2}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                    placeholder="ESAD, Université de Lorraine..." />
                </div>

                {/* Photo */}
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-2">Photo</label>
                  <div className="flex items-center gap-4">
                    {(editing?.photo && !photoFile) && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editing.photo} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                    )}
                    {photoFile && (
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={URL.createObjectURL(photoFile)} alt="" className="w-16 h-16 object-cover rounded-xl border-2 border-primary/30" />
                        <button type="button" onClick={() => setPhotoFile(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    <label className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-muted hover:text-secondary hover:border-gray-300 transition-colors cursor-pointer">
                      <Upload className="w-4 h-4" />
                      {photoFile ? 'Changer' : editing?.photo ? 'Remplacer' : 'Ajouter'}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { if (e.target.files?.[0]) setPhotoFile(e.target.files[0]) }} />
                    </label>
                  </div>
                </div>

                {/* Social links */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2"><LinkIcon className="w-3.5 h-3.5 text-muted" />LinkedIn</label>
                    <input type="url" value={formData.linkedin} onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2"><LinkIcon className="w-3.5 h-3.5 text-muted" />GitHub</label>
                    <input type="url" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://github.com/..." />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-xs font-semibold text-secondary mb-2"><ExternalLink className="w-3.5 h-3.5 text-muted" />Portfolio</label>
                    <input type="url" value={formData.portfolio_url} onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" placeholder="https://..." />
                  </div>
                </div>

                {/* Status toggles */}
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" checked={formData.is_founder} onChange={(e) => setFormData({ ...formData, is_founder: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-amber-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-secondary">Fondateur</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-primary transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-secondary">Membre actif</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-medium text-secondary bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Annuler</button>
                  <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-medium bg-secondary text-white rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all disabled:opacity-50">
                    {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Members list */}
      {members.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-muted/30" />
          </div>
          <p className="text-muted font-medium">Aucun membre dans l&apos;équipe</p>
          <button onClick={() => setShowForm(true)} className="mt-4 text-primary text-sm font-medium hover:underline">Ajouter un membre</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map((member) => {
            const skillsList = member.skills ? member.skills.split(';').map((s) => s.trim()).filter(Boolean) : []
            const roleLabel = member.role ? ROLES.find((r) => r.value === member.role)?.label : null
            const displayRole = [roleLabel, member.custom_role].filter(Boolean).join(' · ')

            return (
              <div key={member.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
                {/* Header with photo */}
                <div className="relative h-24 bg-gradient-to-br from-primary/10 to-primary/5">
                  <div className="absolute -bottom-8 left-4">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-md border-2 border-white overflow-hidden flex items-center justify-center">
                      {member.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.photo} alt={member.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl font-bold text-primary">{member.first_name.charAt(0)}{member.last_name.charAt(0)}</span>
                      )}
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-1.5">
                    {member.is_founder && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-100 text-amber-700">Fondateur</span>
                    )}
                    {!member.is_active && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white/80 text-gray-500">Inactif</span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="pt-12 px-4 pb-4">
                  <h3 className="font-bold text-secondary text-sm">{member.full_name}</h3>
                  {displayRole && <p className="text-xs text-primary font-medium mt-0.5">{displayRole}</p>}

                  {/* Education */}
                  {member.education && (
                    <div className="flex items-start gap-1.5 mt-3">
                      <GraduationCap className="w-3.5 h-3.5 text-muted mt-0.5 shrink-0" />
                      <p className="text-xs text-muted leading-relaxed">{member.education}</p>
                    </div>
                  )}

                  {/* Skills */}
                  {skillsList.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {skillsList.slice(0, 4).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-medium rounded-md">
                          {skill}
                        </span>
                      ))}
                      {skillsList.length > 4 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-muted text-[10px] rounded-md">+{skillsList.length - 4}</span>
                      )}
                    </div>
                  )}

                  {/* Social links */}
                  {(member.linkedin || member.github || member.portfolio_url) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
                      {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors"><LinkIcon className="w-3.5 h-3.5" /></a>}
                      {member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors"><LinkIcon className="w-3.5 h-3.5" /></a>}
                      {member.portfolio_url && <a href={member.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-50">
                    <button onClick={() => startEdit(member)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-secondary hover:bg-gray-50 rounded-lg transition-colors">
                      <Edit2 className="w-3 h-3" /> Modifier
                    </button>
                    <button onClick={() => handleDelete(member.id)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-3 h-3" /> Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

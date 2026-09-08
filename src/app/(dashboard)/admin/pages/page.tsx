'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, X, FileText, Save, Layout, ChevronDown, ChevronRight, Image as ImageIcon, Home, Building2, Monitor, Image, Users, Phone, FilePlus } from 'lucide-react'
import { fetchApi } from '@/services/api'

const PAGE_TYPES = [
  { value: 'home', label: 'Accueil' },
  { value: 'architecture', label: 'Architecture' },
  { value: 'digital', label: 'Digital' },
  { value: 'portfolio', label: 'Portfolio' },
  { value: 'about', label: 'À propos' },
  { value: 'contact', label: 'Contact' },
  { value: 'custom', label: 'Page personnalisée' },
]

const PAGE_ICONS: Record<string, typeof Home> = {
  home: Home,
  architecture: Building2,
  digital: Monitor,
  portfolio: Image,
  about: Users,
  contact: Phone,
  custom: FilePlus,
}

const PAGE_COLORS: Record<string, string> = {
  home: 'from-primary/20 to-primary/5',
  architecture: 'from-amber-500/20 to-amber-500/5',
  digital: 'from-emerald-500/20 to-emerald-500/5',
  portfolio: 'from-purple-500/20 to-purple-500/5',
  about: 'from-blue-500/20 to-blue-500/5',
  contact: 'from-rose-500/20 to-rose-500/5',
  custom: 'from-gray-400/20 to-gray-400/5',
}

const DEFAULT_HERO_IMAGES: Record<string, string> = {
  architecture: '/diapo4.jpg',
  digital: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80',
  portfolio: '/diapo3.jpg',
  about: '/diapo2.jpg',
  contact: '/diapo6.jpg',
}

interface DynamicPage {
  id: number
  title: string
  title_en: string
  slug: string
  subtitle: string
  subtitle_en: string
  hero_image: string | null
  page_type: string
  page_type_display: string
  content: string
  status: 'draft' | 'published'
  meta_title: string
  meta_title_en: string
  meta_description: string
  meta_description_en: string
  keywords: string
  keywords_en: string
  og_image: string | null
  noindex: boolean
  order: number
  show_in_nav: boolean
  nav_label: string
  nav_label_en: string
  content_json: string
  sections: string
  created_at: string
  updated_at: string
}

function safeParse(json: string | object): any {
  if (typeof json === 'object' && json !== null) return json
  try { return JSON.parse(json as string) } catch { return {} }
}

function Section({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
        <span className="text-sm font-semibold text-secondary">{title}</span>
        {open ? <ChevronDown className="w-4 h-4 text-muted" /> : <ChevronRight className="w-4 h-4 text-muted" />}
      </button>
      {open && <div className="p-4 space-y-4">{children}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-secondary mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
const textareaCls = (_r = 3) => `w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none`

export default function PagesPage() {
  const [pages, setPages] = useState<DynamicPage[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DynamicPage | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    title: '', title_en: '', subtitle: '', subtitle_en: '', page_type: 'custom' as string,
    status: 'draft' as 'draft' | 'published',
    order: 0, show_in_nav: false, nav_label: '', nav_label_en: '',
    meta_title: '', meta_title_en: '', meta_description: '', meta_description_en: '',
    keywords: '', keywords_en: '',
    content_json: '{}', content: '',
  })
  const [heroFile, setHeroFile] = useState<File | null>(null)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [langTab, setLangTab] = useState<'fr' | 'en'>('fr')

  useEffect(() => { fetchPages() }, [])

  const fetchPages = async () => {
    try {
      const data = await fetchApi('/pages/?skip_translation=1')
      setPages(data.results || data)
    } catch { /* fallback */ }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const fd = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'boolean') fd.append(key, String(value))
        else if (value !== undefined && value !== null) fd.append(key, String(value))
      })
      console.log('Submitting formData:', JSON.stringify(formData, null, 2))
      if (heroFile) fd.append('hero_image', heroFile)

      if (editing) {
        const updated = await fetchApi(`/pages/${editing.slug}/`, { method: "PUT", body: fd })
        setEditing(updated)
        if (updated.hero_image) setHeroFile(updated.hero_image)
      } else {
        await fetchApi('/pages/', { method: "POST", body: fd })
      }
      resetForm()
      fetchPages()
    } catch (err: any) {
      console.error(err)
      alert(err?.message ? err.message : 'Erreur inconnue')
    }
    finally { setSaving(false) }
  }

  const startEdit = async (page: DynamicPage) => {
    try {
      const data = await fetchApi(`/pages/${page.slug}/?skip_translation=1`)
      setEditing(data)
      setFormData({
        title: data.title || '',
        title_en: data.title_en || '',
        subtitle: data.subtitle || '',
        subtitle_en: data.subtitle_en || '',
        page_type: data.page_type || 'custom',
        status: data.status,
        order: data.order,
        show_in_nav: data.show_in_nav,
        nav_label: data.nav_label || '',
        nav_label_en: data.nav_label_en || '',
        meta_title: data.meta_title || '',
        meta_title_en: data.meta_title_en || '',
        meta_description: data.meta_description || '',
        meta_description_en: data.meta_description_en || '',
        keywords: data.keywords || '',
        keywords_en: data.keywords_en || '',
        content_json: (() => {
          const raw = typeof data.content_json === 'string' ? data.content_json : JSON.stringify(data.content_json || {})
          const parsed = safeParse(raw)
          if (parsed.fr && parsed.en) return JSON.stringify(parsed, null, 2)
          return JSON.stringify({ fr: parsed, en: parsed }, null, 2)
        })(),
        content: data.content || '',
      })
    } catch (err) {
      console.error('Failed to fetch full page data, using fallback:', err)
      setEditing(page)
      setFormData({
        title: page.title || '', title_en: (page as any).title_en || '',
        subtitle: page.subtitle || '', subtitle_en: (page as any).subtitle_en || '',
        page_type: page.page_type || 'custom',
        status: page.status, order: page.order,
        show_in_nav: page.show_in_nav, nav_label: page.nav_label || '', nav_label_en: (page as any).nav_label_en || '',
        meta_title: (page as any).meta_title || '', meta_title_en: (page as any).meta_title_en || '',
        meta_description: (page as any).meta_description || '', meta_description_en: (page as any).meta_description_en || '',
        keywords: (page as any).keywords || '', keywords_en: (page as any).keywords_en || '',
        content_json: ensureBilingualJson(page.content_json || '{}'), content: page.content || '',
      })
    }
    setLangTab('fr')
    setShowForm(true)
  }

  const resetForm = () => {
    setEditing(null); setShowForm(false); setLangTab('fr')
    setFormData({
      title: '', title_en: '', subtitle: '', subtitle_en: '', page_type: 'custom', status: 'draft',
      order: 0, show_in_nav: false, nav_label: '', nav_label_en: '',
      meta_title: '', meta_title_en: '', meta_description: '', meta_description_en: '',
      keywords: '', keywords_en: '',
        content_json: ensureBilingualJson('{}'), content: '',
    })
    setHeroFile(null)
  }

  const ensureBilingualJson = (raw: string) => {
    const parsed = safeParse(raw)
    if (parsed.fr && parsed.en) return JSON.stringify(parsed, null, 2)
    return JSON.stringify({ fr: parsed, en: parsed }, null, 2)
  }

  const cj = useCallback(() => {
    const parsed = safeParse(formData.content_json)
    if (parsed.fr && parsed.en) return parsed
    return { fr: parsed, en: parsed }
  }, [formData.content_json])

  const getCjLang = () => {
    const obj = cj()
    return obj[lang] || {}
  }

  const setCjLang = (langContent: Record<string, any>) => {
    const obj = cj()
    obj[lang] = langContent
    setFormData({ ...formData, content_json: JSON.stringify(obj, null, 2) })
  }

  const setNested = (path: string, value: any) => {
    const langContent = getCjLang()
    const keys = path.split('.')
    let current: any = langContent
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {}
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    setCjLang(langContent)
  }

  const getNested = (path: string, fallback: any = '') => {
    const langContent = getCjLang()
    const keys = path.split('.')
    let current: any = langContent
    for (const key of keys) {
      if (current == null) return fallback
      current = current[key]
    }
    return current ?? fallback
  }

  if (loading) return <p className="text-muted">Chargement...</p>

  const isStructured = formData.page_type !== 'custom'
  const lang = langTab === 'fr' ? 'fr' : 'en'

  const langField = (base: string) => lang === 'fr' ? base : `${base}_en`

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Pages CMS</h1>
          <p className="text-muted text-sm mt-1">{pages.length} page{pages.length > 1 ? 's' : ''} — Modifiez le contenu de chaque page</p>
        </div>
      </div>

      {pages.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4"><FileText className="w-8 h-8 text-muted/30" /></div>
          <p className="text-muted font-medium">Aucune page configurée</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => {
            return (
              <div key={page.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
                {(() => {
                  const heroSrc = page.hero_image || DEFAULT_HERO_IMAGES[page.page_type]
                  if (heroSrc) {
                    return (
                      <div className="aspect-[16/9] overflow-hidden relative">
                        <img src={heroSrc} alt={page.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      </div>
                    )
                  }
                  const gradient = PAGE_COLORS[page.page_type] || PAGE_COLORS.custom
                  const Icon = PAGE_ICONS[page.page_type] || FileText
                  return (
                    <div className={`aspect-[16/9] bg-gradient-to-br ${gradient} flex items-center justify-center relative`}>
                      <Icon className="w-12 h-12 text-secondary/10" />
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2 py-0.5 bg-white/80 backdrop-blur-sm rounded-md text-[10px] font-semibold text-secondary">{page.page_type_display || page.page_type}</span>
                      </div>
                    </div>
                  )
                })()}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wider">Publié</span>
                    {page.show_in_nav && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-100 text-blue-700">Navigation</span>
                    )}
                  </div>
                  <h3 className="font-bold text-secondary text-sm mb-1 truncate">{page.title}</h3>
                  {page.subtitle && <p className="text-xs text-muted line-clamp-1 mb-2">{page.subtitle}</p>}
                  <p className="text-[10px] text-muted font-mono">/{page.slug}</p>
                  <div className="flex items-center gap-1 pt-3 border-t border-gray-50 mt-3">
                    <button onClick={() => startEdit(page)} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium text-muted hover:text-secondary hover:bg-gray-50 rounded-lg transition-colors"><Edit2 className="w-3 h-3" /> Modifier</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Form modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-8 lg:pt-16 overflow-y-auto" onClick={resetForm}>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-2xl w-full max-w-5xl mb-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-secondary tracking-tight">{editing ? 'Modifier la page' : 'Nouvelle page'}</h2>
                  <p className="text-xs text-muted mt-0.5">{editing ? 'Mettez à jour les informations' : 'Créez une page'}</p>
                </div>
                <button onClick={resetForm} className="p-2 rounded-xl hover:bg-gray-100 text-muted transition-colors"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Basic info bar */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center gap-1 mb-4">
                    <button type="button" onClick={() => setLangTab('fr')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${langTab === 'fr' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-secondary'}`}>🇫🇷 Français</button>
                    <button type="button" onClick={() => setLangTab('en')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${langTab === 'en' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-secondary'}`}>🇬🇧 English</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><label className="block text-[10px] font-semibold text-secondary uppercase tracking-wider mb-1.5">Titre ({lang}) *</label><input type="text" value={formData[langField('title') as keyof typeof formData] as string} onChange={(e) => setFormData({ ...formData, [langField('title')]: e.target.value })} required className={inputCls} /></div>
                    <div><label className="block text-[10px] font-semibold text-secondary uppercase tracking-wider mb-1.5">Sous-titre ({lang})</label><input type="text" value={formData[langField('subtitle') as keyof typeof formData] as string} onChange={(e) => setFormData({ ...formData, [langField('subtitle')]: e.target.value })} className={inputCls} /></div>
                    <div><label className="block text-[10px] font-semibold text-secondary uppercase tracking-wider mb-1.5">Type</label><input type="text" value={PAGE_TYPES.find((t) => t.value === formData.page_type)?.label || formData.page_type} disabled className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-muted cursor-not-allowed" /></div>
                  </div>
                </div>

                {/* Tab label */}
                <div className="px-6 pt-4 flex gap-1">
                  <button type="button" className="flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-semibold border-b-2 border-primary text-primary"><Layout className="w-3.5 h-3.5" />Contenu</button>
                </div>

                {/* Scrollable content area */}
                <div className="px-6 py-6 max-h-[65vh] overflow-y-auto space-y-4">

                  {!isStructured && (
                    <div>
                      <label className="block text-xs font-semibold text-secondary mb-2">Contenu Markdown ({lang})</label>
                      <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} rows={12} className={`${textareaCls(12)} font-mono`} placeholder="# Titre\n\nContenu..." />
                    </div>
                  )}

                  {/* ====== HOME ====== */}
                  {formData.page_type === 'home' && (
                    <>
                      <Section title="Hero">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label={`Titre ligne 1 (${lang})`}><input type="text" value={getNested(`hero.title_line1`)} onChange={(e) => setNested(`hero.title_line1`, e.target.value)} className={inputCls} /></Field>
                          <Field label={`Titre highlight 1 (${lang})`}><input type="text" value={getNested(`hero.title_highlight1`)} onChange={(e) => setNested(`hero.title_highlight1`, e.target.value)} className={inputCls} /></Field>
                          <Field label={`Titre ligne 2 (${lang})`}><input type="text" value={getNested(`hero.title_line2`)} onChange={(e) => setNested(`hero.title_line2`, e.target.value)} className={inputCls} /></Field>
                          <Field label={`Titre highlight 2 (${lang})`}><input type="text" value={getNested(`hero.title_highlight2`)} onChange={(e) => setNested(`hero.title_highlight2`, e.target.value)} className={inputCls} /></Field>
                        </div>
                        <Field label={`Sous-titre (${lang})`}><textarea value={getNested('hero.subtitle')} onChange={(e) => setNested('hero.subtitle', e.target.value)} rows={2} className={textareaCls(2)} /></Field>
                      </Section>

                      <Section title="Slideshow (Hero diapos)">
                        <Field label="Chemins des images (un par ligne)">
                          <textarea
                            value={(getNested('diapos') as string[] || []).join('\n')}
                            onChange={(e) => setNested('diapos', e.target.value.split('\n').filter(Boolean))}
                            rows={6}
                            className={`${textareaCls(6)} font-mono text-xs`}
                          />
                        </Field>
                        <div>
                          <label className="inline-flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary text-xs font-medium rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                            <ImageIcon className="w-4 h-4" />
                            Uploader des images
                            <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                              const files = e.target.files
                              if (!files || files.length === 0) return
                              const fd = new FormData()
                              Array.from(files).forEach((f) => fd.append('images', f))
                              try {
                                const data = await fetchApi('/pages/upload_images/', {
                                  method: 'POST',
                                  body: fd,
                                })
                                const current = (getNested('diapos') as string[]) || []
                                setNested('diapos', [...current, ...data.urls])
                              } catch (err) {
                                console.error('Upload failed:', err)
                              }
                            }} />
                          </label>
                        </div>
                        {(getNested('diapos') as string[] || []).length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {(getNested('diapos') as string[]).map((url: string, i: number) => (
                              <div
                                key={i}
                                draggable
                                onDragStart={() => setDragIdx(i)}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('ring-2', 'ring-primary'); }}
                                onDragLeave={(e) => e.currentTarget.classList.remove('ring-2', 'ring-primary')}
                                onDrop={(e) => {
                                  e.preventDefault()
                                  e.currentTarget.classList.remove('ring-2', 'ring-primary')
                                  if (dragIdx === null || dragIdx === i) return
                                  const current = [...(getNested('diapos') as string[])]
                                  const [moved] = current.splice(dragIdx, 1)
                                  current.splice(i, 0, moved)
                                  setNested('diapos', current)
                                  setDragIdx(null)
                                }}
                                className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-primary/50 transition-all"
                              >
                                <img src={url} alt={`Diapo ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const current = (getNested('diapos') as string[]) || []
                                    setNested('diapos', current.filter((_: string, idx: number) => idx !== i))
                                  }}
                                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                  ×
                                </button>
                                <div className="absolute top-1 left-1 w-5 h-5 bg-black/50 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                  ⋮⋮
                                </div>
                                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5">{i + 1}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-muted">Les images sont uploadées dans /media/pages/diapos/. Tu peux aussi coller des URLs externes directement dans le champ texte ci-dessus.</p>
                      </Section>

                      <Section title="Manifesto (Notre vision)">
                        <Field label={`Label (${lang})`}><input type="text" value={getNested('manifesto.label')} onChange={(e) => setNested('manifesto.label', e.target.value)} className={inputCls} /></Field>
                        <Field label={`Mots (${lang}, un par ligne)`}><textarea value={(getNested('manifesto.words') as string[] || []).join('\n')} onChange={(e) => setNested('manifesto.words', e.target.value.split('\n').filter(Boolean))} rows={5} className={`${textareaCls(5)} font-mono text-xs`} /></Field>
                        <Field label={`Mots en surbrillance (${lang})`}><input type="text" value={(getNested('manifesto.highlights') as string[] || []).join(', ')} onChange={(e) => setNested('manifesto.highlights', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} className={`${inputCls} font-mono text-xs`} /></Field>
                      </Section>

                      <Section title="Pôles (Architecture / Digital)">
                        {([0, 1] as const).map((i) => (
                          <div key={i} className="p-3 bg-gray-50 rounded-lg space-y-3">
                            <p className="text-xs font-semibold text-secondary">Pôle {i + 1}</p>
                            <div className="grid sm:grid-cols-3 gap-3">
                              <Field label={`Titre (${lang})`}><input type="text" value={getNested(`poles.${i}.title`)} onChange={(e) => setNested(`poles.${i}.title`, e.target.value)} className={inputCls} /></Field>
                              <Field label={`Description (${lang})`}><input type="text" value={getNested(`poles.${i}.description`)} onChange={(e) => setNested(`poles.${i}.description`, e.target.value)} className={inputCls} /></Field>
                              <Field label="Lien"><input type="text" value={getNested(`poles.${i}.href`)} onChange={(e) => setNested(`poles.${i}.href`, e.target.value)} className={inputCls} /></Field>
                            </div>
                          </div>
                        ))}
                      </Section>

                      <Section title="CTA (section Contact en bas)">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label={`Label (${lang})`}><input type="text" value={getNested('cta.label')} onChange={(e) => setNested('cta.label', e.target.value)} className={inputCls} /></Field>
                          <Field label={`Titre (${lang})`}><textarea value={getNested('cta.title')} onChange={(e) => setNested('cta.title', e.target.value)} rows={2} className={textareaCls(2)} /></Field>
                        </div>
                        <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('cta.subtitle')} onChange={(e) => setNested('cta.subtitle', e.target.value)} className={inputCls} /></Field>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                            <p className="text-[10px] font-semibold text-secondary uppercase">Bouton principal</p>
                            <Field label={`Texte (${lang})`}><input type="text" value={getNested('cta.primary_btn.text')} onChange={(e) => setNested('cta.primary_btn.text', e.target.value)} className={inputCls} /></Field>
                            <Field label="Lien"><input type="text" value={getNested('cta.primary_btn.href')} onChange={(e) => setNested('cta.primary_btn.href', e.target.value)} className={inputCls} /></Field>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                            <p className="text-[10px] font-semibold text-secondary uppercase">Bouton secondaire</p>
                            <Field label={`Texte (${lang})`}><input type="text" value={getNested('cta.secondary_btn.text')} onChange={(e) => setNested('cta.secondary_btn.text', e.target.value)} className={inputCls} /></Field>
                            <Field label="Lien"><input type="text" value={getNested('cta.secondary_btn.href')} onChange={(e) => setNested('cta.secondary_btn.href', e.target.value)} className={inputCls} /></Field>
                          </div>
                        </div>
                      </Section>
                    </>
                  )}

                      {/* ====== ARCHITECTURE / DIGITAL ====== */}
                      {(formData.page_type === 'architecture' || formData.page_type === 'digital') && (
                        <>
                          <Section title="Hero">
                            <div className="grid sm:grid-cols-3 gap-4">
                              <Field label={`Label (${lang})`}><input type="text" value={getNested('hero.label')} onChange={(e) => setNested('hero.label', e.target.value)} className={inputCls} /></Field>
                              <div className="sm:col-span-2"><Field label={`Titre (${lang})`}><input type="text" value={getNested('hero.title')} onChange={(e) => setNested('hero.title', e.target.value)} className={inputCls} /></Field></div>
                            </div>
                            <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('hero.subtitle')} onChange={(e) => setNested('hero.subtitle', e.target.value)} className={inputCls} /></Field>
                            <div className="pt-2 border-t border-gray-100">
                              <Field label="Image Hero">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <input
                                      type="text"
                                      value={getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES[formData.page_type] || ''}
                                      onChange={(e) => setNested('hero.image', e.target.value)}
                                      className={`${inputCls} font-mono text-xs`}
                                      placeholder="/diapo4.jpg ou URL externe"
                                    />
                                  </div>
                                  <label className="shrink-0 inline-flex items-center gap-2 px-3 py-2.5 bg-primary/10 text-primary text-xs font-medium rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                      const files = e.target.files
                                      if (!files || files.length === 0) return
                                      const fd = new FormData()
                                      Array.from(files).forEach((f) => fd.append('images', f))
                                      try {
                                        const data = await fetchApi('/pages/upload_images/', { method: "POST", body: fd })
                                        if (data.urls?.[0]) setNested('hero.image', data.urls[0])
                                      } catch (err) { console.error('Upload failed:', err) }
                                    }} />
                                  </label>
                                </div>
                              </Field>
                              {(getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES[formData.page_type]) && (
                                <div className="mt-2 relative w-full aspect-[2/1] max-w-xs rounded-xl overflow-hidden border border-gray-200 group">
                                  <img src={getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES[formData.page_type]} alt="Hero" className="w-full h-full object-cover" />
                                  {getNested('hero.image') && (
                                    <button type="button" onClick={() => setNested('hero.image', '')} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                  )}
                                </div>
                              )}
                            </div>
                          </Section>

                      <Section title="Section Services">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label={`Label section (${lang})`}><input type="text" value={getNested('section_label')} onChange={(e) => setNested('section_label', e.target.value)} className={inputCls} /></Field>
                          <Field label={`Titre section (${lang})`}><textarea value={getNested('section_title')} onChange={(e) => setNested('section_title', e.target.value)} rows={2} className={textareaCls(2)} /></Field>
                        </div>
                      </Section>

                      <Section title="CTA">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label={`Titre (${lang})`}><input type="text" value={getNested('cta.title')} onChange={(e) => setNested('cta.title', e.target.value)} className={inputCls} /></Field>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label={`Texte bouton (${lang})`}><input type="text" value={getNested('cta.btn_text')} onChange={(e) => setNested('cta.btn_text', e.target.value)} className={inputCls} /></Field>
                            <Field label="Lien bouton"><input type="text" value={getNested('cta.btn_href')} onChange={(e) => setNested('cta.btn_href', e.target.value)} className={inputCls} /></Field>
                          </div>
                        </div>
                        <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('cta.subtitle')} onChange={(e) => setNested('cta.subtitle', e.target.value)} className={inputCls} /></Field>
                      </Section>
                    </>
                  )}

                      {/* ====== PORTFOLIO ====== */}
                      {formData.page_type === 'portfolio' && (
                        <>
                          <Section title="Hero">
                            <div className="grid sm:grid-cols-3 gap-4">
                              <Field label={`Label (${lang})`}><input type="text" value={getNested('hero.label')} onChange={(e) => setNested('hero.label', e.target.value)} className={inputCls} /></Field>
                              <div className="sm:col-span-2"><Field label={`Titre (${lang})`}><input type="text" value={getNested('hero.title')} onChange={(e) => setNested('hero.title', e.target.value)} className={inputCls} /></Field></div>
                            </div>
                            <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('hero.subtitle')} onChange={(e) => setNested('hero.subtitle', e.target.value)} className={inputCls} /></Field>
                            <div className="pt-2 border-t border-gray-100">
                              <Field label="Image Hero">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <input type="text" value={getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.portfolio || ''} onChange={(e) => setNested('hero.image', e.target.value)} className={`${inputCls} font-mono text-xs`} placeholder="/diapo3.jpg ou URL externe" />
                                  </div>
                                  <label className="shrink-0 inline-flex items-center gap-2 px-3 py-2.5 bg-primary/10 text-primary text-xs font-medium rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                      const files = e.target.files
                                      if (!files || files.length === 0) return
                                      const fd = new FormData()
                                      Array.from(files).forEach((f) => fd.append('images', f))
                                      try {
                                        const data = await fetchApi('/pages/upload_images/', { method: "POST", body: fd })
                                        if (data.urls?.[0]) setNested('hero.image', data.urls[0])
                                      } catch (err) { console.error('Upload failed:', err) }
                                    }} />
                                  </label>
                                </div>
                              </Field>
                              {(getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.portfolio) && (
                                <div className="mt-2 relative w-full aspect-[2/1] max-w-xs rounded-xl overflow-hidden border border-gray-200 group">
                                  <img src={getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.portfolio} alt="Hero" className="w-full h-full object-cover" />
                                  {getNested('hero.image') && (
                                    <button type="button" onClick={() => setNested('hero.image', '')} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                  )}
                                </div>
                              )}
                            </div>
                          </Section>

                      <Section title="Filtres">
                        <p className="text-xs text-muted mb-2">Les filtres affichés au-dessus de la grille de projets</p>
                        {(getNested('filters') as any[] || []).map((f: any, i: number) => (
                          <div key={i} className="grid sm:grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                            <Field label="Clé"><input type="text" value={f.key} onChange={(e) => setNested(`filters.${i}.key`, e.target.value)} className={inputCls} /></Field>
                            <Field label={`Label (${lang})`}><input type="text" value={f.label} onChange={(e) => setNested(`filters.${i}.label`, e.target.value)} className={inputCls} /></Field>
                          </div>
                        ))}
                      </Section>

                      <Section title="CTA">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label={`Titre (${lang})`}><input type="text" value={getNested('cta.title')} onChange={(e) => setNested('cta.title', e.target.value)} className={inputCls} /></Field>
                          <div className="grid grid-cols-2 gap-3">
                            <Field label={`Texte bouton (${lang})`}><input type="text" value={getNested('cta.btn_text')} onChange={(e) => setNested('cta.btn_text', e.target.value)} className={inputCls} /></Field>
                            <Field label="Lien"><input type="text" value={getNested('cta.btn_href')} onChange={(e) => setNested('cta.btn_href', e.target.value)} className={inputCls} /></Field>
                          </div>
                        </div>
                        <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('cta.subtitle')} onChange={(e) => setNested('cta.subtitle', e.target.value)} className={inputCls} /></Field>
                      </Section>
                    </>
                  )}

                      {/* ====== ABOUT ====== */}
                      {formData.page_type === 'about' && (
                        <>
                          <Section title="Hero">
                            <div className="grid sm:grid-cols-3 gap-4">
                              <Field label={`Label (${lang})`}><input type="text" value={getNested('hero.label')} onChange={(e) => setNested('hero.label', e.target.value)} className={inputCls} /></Field>
                              <div className="sm:col-span-2"><Field label={`Titre (${lang})`}><input type="text" value={getNested('hero.title')} onChange={(e) => setNested('hero.title', e.target.value)} className={inputCls} /></Field></div>
                            </div>
                            <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('hero.subtitle')} onChange={(e) => setNested('hero.subtitle', e.target.value)} className={inputCls} /></Field>
                            <div className="pt-2 border-t border-gray-100">
                              <Field label="Image Hero">
                                <div className="flex items-start gap-3">
                                  <div className="flex-1">
                                    <input type="text" value={getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.about || ''} onChange={(e) => setNested('hero.image', e.target.value)} className={`${inputCls} font-mono text-xs`} placeholder="/diapo2.jpg ou URL externe" />
                                  </div>
                                  <label className="shrink-0 inline-flex items-center gap-2 px-3 py-2.5 bg-primary/10 text-primary text-xs font-medium rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                                    <ImageIcon className="w-4 h-4" />
                                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                      const files = e.target.files
                                      if (!files || files.length === 0) return
                                      const fd = new FormData()
                                      Array.from(files).forEach((f) => fd.append('images', f))
                                      try {
                                        const data = await fetchApi('/pages/upload_images/', { method: "POST", body: fd })
                                        if (data.urls?.[0]) setNested('hero.image', data.urls[0])
                                      } catch (err) { console.error('Upload failed:', err) }
                                    }} />
                                  </label>
                                </div>
                              </Field>
                              {(getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.about) && (
                                <div className="mt-2 relative w-full aspect-[2/1] max-w-xs rounded-xl overflow-hidden border border-gray-200 group">
                                  <img src={getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.about} alt="Hero" className="w-full h-full object-cover" />
                                  {getNested('hero.image') && (
                                    <button type="button" onClick={() => setNested('hero.image', '')} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                  )}
                                </div>
                              )}
                            </div>
                          </Section>

                      <Section title="Notre histoire">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Field label={`Label (${lang})`}><input type="text" value={getNested('story.label')} onChange={(e) => setNested('story.label', e.target.value)} className={inputCls} /></Field>
                          <Field label={`Titre (${lang})`}><input type="text" value={getNested('story.title')} onChange={(e) => setNested('story.title', e.target.value)} className={inputCls} /></Field>
                        </div>
                        <Field label={`Paragraphes (${lang})`}><textarea value={(getNested('story.paragraphs') as string[] || []).join('\n\n')} onChange={(e) => setNested('story.paragraphs', e.target.value.split('\n\n').filter(Boolean))} rows={8} className={`${textareaCls(8)} text-sm leading-relaxed`} /></Field>
                      </Section>

                      <Section title="Piliers (Architecture & Design)">
                        <Field label={`Label section (${lang})`}><input type="text" value={getNested('pillars.label')} onChange={(e) => setNested('pillars.label', e.target.value)} className={inputCls} /></Field>
                        <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                          <p className="text-xs font-bold text-secondary">Architecture & Design</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label={`Titre (${lang})`}><input type="text" value={getNested('pillars.architecture.title')} onChange={(e) => setNested('pillars.architecture.title', e.target.value)} className={inputCls} /></Field>
                            <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('pillars.architecture.subtitle')} onChange={(e) => setNested('pillars.architecture.subtitle', e.target.value)} className={inputCls} /></Field>
                          </div>
                          {(getNested('pillars.architecture.items') as any[] || []).map((item: any, i: number) => (
                            <div key={i} className="grid sm:grid-cols-2 gap-3 p-2 bg-white rounded">
                              <Field label={`Item ${i + 1} - Titre (${lang})`}><input type="text" value={item.title} onChange={(e) => setNested(`pillars.architecture.items.${i}.title`, e.target.value)} className={inputCls} /></Field>
                              <Field label={`Description (${lang})`}><input type="text" value={item.desc} onChange={(e) => setNested(`pillars.architecture.items.${i}.desc`, e.target.value)} className={inputCls} /></Field>
                            </div>
                          ))}
                        </div>
                      </Section>

                      <Section title="Piliers (Digital & Logiciel)">
                        <div className="p-3 bg-gray-50 rounded-lg space-y-3">
                          <p className="text-xs font-bold text-secondary">Digital & Logiciel</p>
                          <div className="grid sm:grid-cols-2 gap-3">
                            <Field label={`Titre (${lang})`}><input type="text" value={getNested('pillars.digital.title')} onChange={(e) => setNested('pillars.digital.title', e.target.value)} className={inputCls} /></Field>
                            <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('pillars.digital.subtitle')} onChange={(e) => setNested('pillars.digital.subtitle', e.target.value)} className={inputCls} /></Field>
                          </div>
                          {(getNested('pillars.digital.items') as any[] || []).map((item: any, i: number) => (
                            <div key={i} className="grid sm:grid-cols-2 gap-3 p-2 bg-white rounded">
                              <Field label={`Item ${i + 1} - Titre (${lang})`}><input type="text" value={item.title} onChange={(e) => setNested(`pillars.digital.items.${i}.title`, e.target.value)} className={inputCls} /></Field>
                              <Field label={`Description (${lang})`}><input type="text" value={item.desc} onChange={(e) => setNested(`pillars.digital.items.${i}.desc`, e.target.value)} className={inputCls} /></Field>
                            </div>
                          ))}
                        </div>
                      </Section>

                      <Section title="Vision (citation)">
                        <Field label={`Label (${lang})`}><input type="text" value={getNested('vision.label')} onChange={(e) => setNested('vision.label', e.target.value)} className={inputCls} /></Field>
                        <Field label={`Citation (${lang})`}><textarea value={getNested('vision.quote')} onChange={(e) => setNested('vision.quote', e.target.value)} rows={4} className={textareaCls(4)} /></Field>
                        <Field label={`Mots en surbrillance (${lang})`}><input type="text" value={(getNested('vision.highlights') as string[] || []).join(', ')} onChange={(e) => setNested('vision.highlights', e.target.value.split(',').map((s: string) => s.trim()).filter(Boolean))} className={`${inputCls} font-mono text-xs`} /></Field>
                        <Field label={`Footer (${lang})`}><input type="text" value={getNested('vision.footer')} onChange={(e) => setNested('vision.footer', e.target.value)} className={inputCls} /></Field>
                      </Section>
                    </>
                  )}

                  {/* ====== CONTACT ====== */}
                  {formData.page_type === 'contact' && (
                    <Section title="Hero">
                      <div className="grid sm:grid-cols-3 gap-4">
                        <Field label={`Label (${lang})`}><input type="text" value={getNested('hero.label')} onChange={(e) => setNested('hero.label', e.target.value)} className={inputCls} /></Field>
                        <div className="sm:col-span-2"><Field label={`Titre (${lang})`}><input type="text" value={getNested('hero.title')} onChange={(e) => setNested('hero.title', e.target.value)} className={inputCls} /></Field></div>
                      </div>
                      <Field label={`Sous-titre (${lang})`}><input type="text" value={getNested('hero.subtitle')} onChange={(e) => setNested('hero.subtitle', e.target.value)} className={inputCls} /></Field>
                      <div className="pt-2 border-t border-gray-100">
                        <Field label="Image Hero">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <input type="text" value={getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.contact || ''} onChange={(e) => setNested('hero.image', e.target.value)} className={`${inputCls} font-mono text-xs`} placeholder="/diapo6.jpg ou URL externe" />
                            </div>
                            <label className="shrink-0 inline-flex items-center gap-2 px-3 py-2.5 bg-primary/10 text-primary text-xs font-medium rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                              <ImageIcon className="w-4 h-4" />
                              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                const files = e.target.files
                                if (!files || files.length === 0) return
                                const fd = new FormData()
                                Array.from(files).forEach((f) => fd.append('images', f))
                                try {
                                  const data = await fetchApi('/pages/upload_images/', { method: "POST", body: fd })
                                  if (data.urls?.[0]) setNested('hero.image', data.urls[0])
                                } catch (err) { console.error('Upload failed:', err) }
                              }} />
                            </label>
                          </div>
                        </Field>
                        {(getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.contact) && (
                          <div className="mt-2 relative w-full aspect-[2/1] max-w-xs rounded-xl overflow-hidden border border-gray-200 group">
                            <img src={getNested('hero.image') || editing?.hero_image || DEFAULT_HERO_IMAGES.contact} alt="Hero" className="w-full h-full object-cover" />
                            {getNested('hero.image') && (
                              <button type="button" onClick={() => setNested('hero.image', '')} className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-[10px] text-muted mt-3">Le formulaire et les coordonnées sont gérés automatiquement depuis les paramètres du site (/admin/settings).</p>
                    </Section>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                  <button type="button" onClick={resetForm} className="px-5 py-2.5 text-sm font-medium text-secondary bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Annuler</button>
                  <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-medium bg-secondary text-white rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"><Save className="w-4 h-4 inline mr-1" />{saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer la page'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

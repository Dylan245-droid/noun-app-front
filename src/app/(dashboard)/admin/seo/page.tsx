'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Image as ImageIcon, FileText, Code, AlertCircle } from 'lucide-react'
import { fetchApi } from '@/services/api'

interface PageSEO {
  id: number
  page: string
  page_display: string
  title: string
  title_en: string
  meta_description: string
  meta_description_en: string
  keywords: string
  keywords_en: string
  og_title: string
  og_title_en: string
  og_description: string
  og_description_en: string
  og_image: string | null
  canonical_url: string
  noindex: boolean
  custom_json_ld: string
  custom_json_ld_en: string
}

const defaultValues: Record<string, Partial<PageSEO>> = {
  home: { title: 'NOUN CONCEPT — Architecture & Digital à Libreville, Gabon', title_en: 'NOUN CONCEPT — Architecture & Digital in Libreville, Gabon', meta_description: "NOUN CONCEPT conçoit des espaces physiques et digitaux d'exception. Architecture, design d'intérieur, aménagement paysager et solutions logicielles sur mesure au Gabon.", meta_description_en: 'NOUN CONCEPT designs exceptional physical and digital spaces. Architecture, interior design, landscape planning and custom software solutions in Gabon.', og_title: 'NOUN CONCEPT', og_title_en: 'NOUN CONCEPT', og_description: "Concevoir l'espace. Coder l'avenir.", og_description_en: 'Designing space. Coding the future.' },
  architecture: { title: "Architecture & Design d'Espace — NOUN CONCEPT | Gabon", title_en: 'Architecture & Space Design — NOUN CONCEPT | Gabon', meta_description: "Aménagement paysager, design d'intérieur, mobilier sur mesure et œuvres d'art. NOUN CONCEPT crée des espaces qui inspirent, du concept à la réalisation au Gabon.", meta_description_en: 'Landscape planning, interior design, custom furniture and artworks. NOUN CONCEPT creates inspiring spaces, from concept to completion in Gabon.', og_title: 'Architecture — NOUN CONCEPT', og_title_en: 'Architecture — NOUN CONCEPT', og_description: 'Architecture et design d\'espace', og_description_en: 'Architecture and space design' },
  digital: { title: 'Solutions Digitales & Développement Logiciel — NOUN CONCEPT', title_en: 'Digital Solutions & Software Development — NOUN CONCEPT', meta_description: 'Applications web et mobiles, APIs, digitalisation de processus. NOUN CONCEPT développe des solutions logicielles robustes et sur mesure pour entreprises au Gabon.', meta_description_en: 'Web and mobile apps, APIs, process digitalization. NOUN CONCEPT develops robust and custom software solutions for businesses in Gabon.', og_title: 'Digital — NOUN CONCEPT', og_title_en: 'Digital — NOUN CONCEPT', og_description: 'Solutions digitales et développement', og_description_en: 'Digital solutions and development' },
  portfolio: { title: 'Portfolio & Réalisations — NOUN CONCEPT | Architecture & Digital', title_en: 'Portfolio & Projects — NOUN CONCEPT | Architecture & Digital', meta_description: "Découvrez nos réalisations en architecture et digital. Chaque projet, une histoire.", meta_description_en: 'Discover our architecture and digital projects. Every project, a story.', og_title: 'Portfolio — NOUN CONCEPT', og_title_en: 'Portfolio — NOUN CONCEPT', og_description: 'Nos projets et réalisations', og_description_en: 'Our projects and work' },
  about: { title: 'À Propos de NOUN CONCEPT — Notre Histoire & Notre Équipe', title_en: 'About NOUN CONCEPT — Our Story & Team', meta_description: 'Fondée par Claude François EMANE MENGUE et Dylan ONDO, NOUN CONCEPT allie architecture et digital. Découvrez notre vision, notre équipe et nos valeurs.', meta_description_en: 'Founded by Claude François EMANE MENGUE and Dylan ONDO, NOUN CONCEPT combines architecture and digital. Discover our vision, team and values.', og_title: 'À propos — NOUN CONCEPT', og_title_en: 'About — NOUN CONCEPT', og_description: 'Notre histoire, notre équipe', og_description_en: 'Our story, our team' },
  contact: { title: 'Contact — NOUN CONCEPT | Libreville, Gabon', title_en: 'Contact — NOUN CONCEPT | Libreville, Gabon', meta_description: "Contactez NOUN CONCEPT pour vos projets d'architecture, design ou solutions digitales. Email, téléphone ou formulaire. Basé à Libreville, Gabon.", meta_description_en: 'Contact NOUN CONCEPT for your architecture, design or digital projects. Email, phone or form. Based in Libreville, Gabon.', og_title: 'Contact — NOUN CONCEPT', og_title_en: 'Contact — NOUN CONCEPT', og_description: 'Prenez contact avec nous', og_description_en: 'Get in touch with us' },
}

export default function SEOPage() {
  const [pages, setPages] = useState<PageSEO[]>([])
  const [selectedPage, setSelectedPage] = useState<PageSEO | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [langTab, setLangTab] = useState<'fr' | 'en'>('fr')
  const [formData, setFormData] = useState({
    title: '', title_en: '',
    meta_description: '', meta_description_en: '',
    keywords: '', keywords_en: '',
    og_title: '', og_title_en: '',
    og_description: '', og_description_en: '',
    canonical_url: '',
    noindex: false,
    custom_json_ld: '', custom_json_ld_en: '',
  })
  const [ogFile, setOgFile] = useState<File | null>(null)
  const [ogPreview, setOgPreview] = useState<string | null>(null)

  const fetchPages = async () => {
    try {
      const data = await fetchApi('/seo/')
      setPages(data.results || data)
    } catch {
      // No pages yet
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const selectPage = (page: PageSEO) => {
    setSelectedPage(page)
    setOgFile(null)
    setOgPreview(null)
    setLangTab('fr')
    const defaults = defaultValues[page.page] || {}
    setFormData({
      title: page.title || defaults.title || '',
      title_en: page.title_en || defaults.title_en || '',
      meta_description: page.meta_description || defaults.meta_description || '',
      meta_description_en: page.meta_description_en || defaults.meta_description_en || '',
      keywords: page.keywords || '',
      keywords_en: page.keywords_en || '',
      og_title: page.og_title || defaults.og_title || '',
      og_title_en: page.og_title_en || defaults.og_title_en || '',
      og_description: page.og_description || defaults.og_description || '',
      og_description_en: page.og_description_en || defaults.og_description_en || '',
      canonical_url: page.canonical_url || '',
      noindex: page.noindex,
      custom_json_ld: page.custom_json_ld || '',
      custom_json_ld_en: page.custom_json_ld_en || '',
    })
  }

  const createPageSEO = async (pageKey: string) => {
    try {
      const defaults = defaultValues[pageKey] || {}
      const data = await fetchApi('/seo/', {
        method: 'POST',
        body: JSON.stringify({
          page: pageKey,
          title: defaults.title || '',
          title_en: defaults.title_en || '',
          meta_description: defaults.meta_description || '',
          meta_description_en: defaults.meta_description_en || '',
          og_title: defaults.og_title || '',
          og_title_en: defaults.og_title_en || '',
          og_description: defaults.og_description || '',
          og_description_en: defaults.og_description_en || '',
        })
      })
      setPages((prev) => [...prev, data])
      selectPage(data)
    } catch {
      console.error('Failed to create SEO config')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPage) return
    setSaving(true)
    setSaved(false)

    try {
      if (ogFile) {
        const fd = new FormData()
        Object.entries(formData).forEach(([key, value]) => {
          if (typeof value === 'boolean') fd.append(key, String(value))
          else if (value) fd.append(key, String(value))
        })
        fd.append('og_image', ogFile)
        const data = await fetchApi(`/seo/${selectedPage.id}/`, {
          method: 'PUT',
          body: fd,
        })
        setSelectedPage(data)
        setPages((prev) => prev.map((p) => (p.id === data.id ? data : p)))
      } else {
        const data = await fetchApi(`/seo/${selectedPage.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(formData)
        })
        setSelectedPage(data)
        setPages((prev) => prev.map((p) => (p.id === data.id ? data : p)))
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      console.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const allPages = [
    { key: 'home', label: 'Accueil' },
    { key: 'architecture', label: 'Architecture' },
    { key: 'digital', label: 'Digital' },
    { key: 'portfolio', label: 'Portfolio' },
    { key: 'about', label: 'À propos' },
    { key: 'contact', label: 'Contact' },
  ]

  if (loading) return <p className="text-muted">Chargement...</p>

  const lang = langTab === 'fr' ? 'fr' : 'en'
  const suffix = lang === 'en' ? '_en' : ''

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">SEO & Meta Tags</h1>
          <p className="text-muted text-sm mt-1">Configurez les meta tags de chaque page</p>
        </div>
        {saved && (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-3 py-1.5 bg-green-100 text-green-700 text-xs font-medium rounded-lg"
          >
            Enregistré ✓
          </motion.span>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Page selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <h2 className="text-sm font-semibold text-secondary mb-4">Pages du site</h2>
            <div className="space-y-2">
              {allPages.map((p) => {
                const existing = pages.find((s) => s.page === p.key)
                const isSelected = selectedPage?.page === p.key
                return (
                  <button
                    key={p.key}
                    onClick={() => existing ? selectPage(existing) : createPageSEO(p.key)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-sm transition-all ${
                      isSelected
                        ? 'bg-secondary text-white'
                        : 'bg-gray-50 text-secondary hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium">{p.label}</span>
                    </div>
                    {existing ? (
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-green-100 text-green-700'
                      }`}>
                        Configuré
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 font-medium">
                        À faire
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {!selectedPage ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted/30" />
              </div>
              <p className="text-muted font-medium">Sélectionnez une page pour configurer le SEO</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Language tabs */}
              <div className="flex items-center gap-1 bg-gray-50 rounded-xl p-1 w-fit">
                <button type="button" onClick={() => setLangTab('fr')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${langTab === 'fr' ? 'bg-white text-secondary shadow-sm' : 'text-muted hover:text-secondary'}`}>🇫🇷 Français</button>
                <button type="button" onClick={() => setLangTab('en')} className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${langTab === 'en' ? 'bg-white text-secondary shadow-sm' : 'text-muted hover:text-secondary'}`}>🇬🇧 English</button>
              </div>

              {/* Meta tags */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-secondary">Meta Tags</h2>
                    <p className="text-xs text-muted">{selectedPage.page_display} — {lang === 'fr' ? 'Français' : 'English'}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">
                      Title <span className="text-muted font-normal">{String(formData[`title${suffix}` as keyof typeof formData] || '').length}/60</span>
                    </label>
                    <input
                      type="text"
                      value={String(formData[`title${suffix}` as keyof typeof formData] || '')}
                      onChange={(e) => setFormData({ ...formData, [`title${suffix}`]: e.target.value })}
                      className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      style={{ borderColor: String(formData[`title${suffix}` as keyof typeof formData] || '').length > 60 ? '#fca5a5' : '#e5e7eb' }}
                      placeholder={lang === 'fr' ? 'Titre de la page (60 caractères max)' : 'Page title (60 chars max)'}
                    />
                    {String(formData[`title${suffix}` as keyof typeof formData] || '').length > 60 ? (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {lang === 'fr' ? 'Titre trop long' : 'Title too long'}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">
                      Meta Description <span className="text-muted font-normal">{String(formData[`meta_description${suffix}` as keyof typeof formData] || '').length}/160</span>
                    </label>
                    <textarea
                      value={String(formData[`meta_description${suffix}` as keyof typeof formData] || '')}
                      onChange={(e) => setFormData({ ...formData, [`meta_description${suffix}`]: e.target.value })}
                      rows={3}
                      className="w-full bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      style={{ borderColor: String(formData[`meta_description${suffix}` as keyof typeof formData] || '').length > 160 ? '#fca5a5' : '#e5e7eb' }}
                      placeholder={lang === 'fr' ? 'Description pour les moteurs de recherche (160 caractères max)' : 'Search engine description (160 chars max)'}
                    />
                    {String(formData[`meta_description${suffix}` as keyof typeof formData] || '').length > 160 ? (
                      <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {lang === 'fr' ? 'Description trop longue' : 'Description too long'}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">{lang === 'fr' ? 'Mots-clés' : 'Keywords'}</label>
                    <input
                      type="text"
                      value={formData[`keywords${suffix}` as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [`keywords${suffix}`]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="architecture, design, gabon..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">URL canonique</label>
                    <input
                      type="url"
                      value={formData.canonical_url}
                      onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder="https://nounconcept.com/architecture"
                    />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={formData.noindex}
                        onChange={(e) => setFormData({ ...formData, noindex: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-red-500 transition-colors" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm peer-checked:translate-x-4 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-secondary">{lang === 'fr' ? 'Noindex (empêcher l\'indexation)' : 'Noindex (prevent indexing)'}</span>
                  </label>
                </div>
              </div>

              {/* Open Graph */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-secondary">Open Graph</h2>
                    <p className="text-xs text-muted">{lang === 'fr' ? 'Apparence lors du partage sur les réseaux sociaux' : 'Appearance when shared on social media'}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">OG Title</label>
                    <input
                      type="text"
                      value={formData[`og_title${suffix}` as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [`og_title${suffix}`]: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      placeholder={lang === 'fr' ? 'Titre pour les réseaux sociaux' : 'Title for social media'}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">OG Description</label>
                    <textarea
                      value={formData[`og_description${suffix}` as keyof typeof formData] as string}
                      onChange={(e) => setFormData({ ...formData, [`og_description${suffix}`]: e.target.value })}
                      rows={2}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                      placeholder={lang === 'fr' ? 'Description pour les réseaux sociaux' : 'Description for social media'}
                    />
                  </div>

                  {/* OG Image */}
                  <div>
                    <label className="block text-xs font-medium text-secondary mb-2">Image OG (1200x630 recommandé)</label>
                    {(selectedPage.og_image && !ogFile) && (
                      <div className="mb-3 relative w-full aspect-[1.91/1] max-w-md rounded-xl overflow-hidden border border-gray-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={selectedPage.og_image} alt="OG" className="w-full h-full object-cover" />
                      </div>
                    )}
                    {ogPreview && (
                      <div className="mb-3 relative w-full aspect-[1.91/1] max-w-md rounded-xl overflow-hidden border-2 border-primary/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={ogPreview} alt="OG preview" className="w-full h-full object-cover" />
                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-primary text-white text-[10px] font-medium rounded-md">Nouvelle image</span>
                      </div>
                    )}
                    <label className="block border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary/30 hover:bg-primary/[0.02] transition-all">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium text-muted">{ogFile ? ogFile.name : 'Choisir une image OG'}</p>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) { setOgFile(file); setOgPreview(URL.createObjectURL(file)) }
                      }} />
                    </label>
                  </div>
                </div>
              </div>

              {/* JSON-LD */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Code className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-secondary">Structured Data (JSON-LD)</h2>
                    <p className="text-xs text-muted">{lang === 'fr' ? 'Données structurées pour Google' : 'Structured data for Google'}</p>
                  </div>
                </div>

                <textarea
                  value={formData[`custom_json_ld${suffix}` as keyof typeof formData] as string}
                  onChange={(e) => setFormData({ ...formData, [`custom_json_ld${suffix}`]: e.target.value })}
                  rows={8}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  placeholder='{"@context": "https://schema.org", "@type": "WebPage"}'
                />
              </div>

              {/* Save */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-secondary text-white text-sm font-medium rounded-xl hover:bg-secondary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

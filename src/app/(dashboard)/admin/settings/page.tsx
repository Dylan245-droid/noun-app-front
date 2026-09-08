'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Mail, Phone, MapPin, Clock, Building2, BarChart3, Share2 } from 'lucide-react'
import { fetchApi } from '@/services/api'

interface SiteSettings {
  id: number
  site_name: string
  site_name_en: string
  contact_email: string
  contact_phone: string
  contact_address: string
  working_hours: string
  working_hours_en: string
  default_og_image: string | null
  google_analytics_id: string
  google_tag_manager_id: string
  google_site_verification: string
  facebook_app_id: string
  twitter_handle: string
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [langTab, setLangTab] = useState<'fr' | 'en'>('fr')

  useEffect(() => {
    fetchApi('/settings/?skip_translation=1')
      .then((data) => setSettings(data))
      .catch(() => setSettings(null))
      .finally(() => setLoading(false))
  }, [])

  const lang = langTab
  const langField = (base: string) => lang === 'fr' ? base : `${base}_en`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!settings) return
    setSaving(true)
    setSaved(false)

    try {
      await fetchApi('/settings/', {
        method: 'PATCH',
        body: JSON.stringify(settings)
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      console.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-muted">Chargement...</p>
  if (!settings) return <p className="text-muted">Impossible de charger les paramètres</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-secondary tracking-tight">Paramètres du site</h1>
          <p className="text-muted text-sm mt-1">Coordonnées et informations de contact</p>
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

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Language tabs */}
        <div className="flex items-center gap-1 mb-2">
          <button type="button" onClick={() => setLangTab('fr')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${langTab === 'fr' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-secondary'}`}>🇫🇷 Français</button>
          <button type="button" onClick={() => setLangTab('en')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${langTab === 'en' ? 'bg-primary/10 text-primary' : 'text-muted hover:text-secondary'}`}>🇬🇧 English</button>
        </div>

        {/* Site name */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-secondary">Général</h2>
              <p className="text-xs text-muted">Nom du site</p>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Nom du site ({lang})</label>
            <input
              type="text"
              value={settings[langField('site_name') as keyof typeof settings] as string}
              onChange={(e) => setSettings({ ...settings, [langField('site_name')]: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-secondary">Coordonnées</h2>
              <p className="text-xs text-muted">Informations affichées sur le site public</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Email</label>
            <input
              type="email"
              value={settings.contact_email}
              onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-secondary mb-2">
                <Phone className="w-3.5 h-3.5 text-muted" />
                Téléphone
              </label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="+241 XX XX XX XX"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-xs font-medium text-secondary mb-2">
                <MapPin className="w-3.5 h-3.5 text-muted" />
                Adresse
              </label>
              <input
                type="text"
                value={settings.contact_address}
                onChange={(e) => setSettings({ ...settings, contact_address: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Libreville, Gabon"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-secondary mb-2">
              <Clock className="w-3.5 h-3.5 text-muted" />
              Horaires ({lang})
            </label>
            <textarea
              value={settings[langField('working_hours') as keyof typeof settings] as string}
              onChange={(e) => setSettings({ ...settings, [langField('working_hours')]: e.target.value })}
              rows={3}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              placeholder="Lundi - Vendredi : 8h - 17h&#10;Samedi : Sur rendez-vous"
            />
          </div>
        </div>

        {/* Analytics & Tracking */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-secondary">Analytics & Tracking</h2>
              <p className="text-xs text-muted">Google Analytics, Tag Manager, etc.</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary mb-2">Google Analytics ID</label>
              <input
                type="text"
                value={settings.google_analytics_id}
                onChange={(e) => setSettings({ ...settings, google_analytics_id: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-2">Google Tag Manager</label>
              <input
                type="text"
                value={settings.google_tag_manager_id}
                onChange={(e) => setSettings({ ...settings, google_tag_manager_id: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="GTM-XXXXXX"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Google Site Verification</label>
            <input
              type="text"
              value={settings.google_site_verification}
              onChange={(e) => setSettings({ ...settings, google_site_verification: e.target.value })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="Code de vérification Google"
            />
          </div>
        </div>

        {/* Social */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-secondary">Réseaux sociaux</h2>
              <p className="text-xs text-muted">Configuration Open Graph & Social</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-secondary mb-2">Facebook App ID</label>
              <input
                type="text"
                value={settings.facebook_app_id}
                onChange={(e) => setSettings({ ...settings, facebook_app_id: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="Facebook App ID"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-secondary mb-2">Twitter Handle</label>
              <input
                type="text"
                value={settings.twitter_handle}
                onChange={(e) => setSettings({ ...settings, twitter_handle: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                placeholder="@nounconcept"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Image OG par défaut</label>
            {settings.default_og_image && (
              <div className="mb-3 relative w-full aspect-[1.91/1] max-w-sm rounded-xl overflow-hidden border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.default_og_image} alt="Default OG" className="w-full h-full object-cover" />
              </div>
            )}
            <p className="text-xs text-muted">Image utilisée quand une page n&apos;a pas d&apos;image OG spécifique (1200x630 recommandé)</p>
          </div>
        </div>

        {/* Save button */}
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
    </div>
  )
}

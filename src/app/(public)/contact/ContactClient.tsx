'use client'
import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send, CheckCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fetchApi } from '@/services/api'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { usePageContent } from '@/hooks/usePageContent'

interface SiteSettings {
  contact_email: string
  contact_phone: string
  contact_address: string
  working_hours: string
}

export default function ContactClient({ initialData }: any) {
  const { t } = useTranslation()
  useHeaderTheme('dark')
  const heroRef = useRef<HTMLDivElement>(null)

  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const { data } = usePageContent('contact')
    const c: any = data?.content_json || {}
  const hero = c.hero || { label: t('nav.contact'), title: t('contact.title'), subtitle: '' }

  useEffect(() => {
    fetchApi('/settings/')
      .then((data) => setSettings(data))
      .catch(() => setSettings(null))
  }, [i18next.language])

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    try {
      await fetchApi('/contact/messages/', {
        method: 'POST',
        body: JSON.stringify(formData),
      })
      setSubmitted(true)
    } catch {
      setError(t('contact.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary">
        <div className="text-center">
          <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, type: 'spring' }}><CheckCircle className="w-16 h-16 text-white mx-auto mb-6" /></motion.div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tighter">{t('contact.sent')}</h1>
          <p className="text-white/50 mb-8 max-w-md mx-auto">{t('contact.sentDesc')}</p>
          <button onClick={() => { setSubmitted(false); setFormData({ name: '', email: '', phone: '', subject: '', message: '' }) }} className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white text-sm font-medium tracking-wide hover:bg-white hover:text-secondary transition-all duration-300">{t('contact.sendAnother')} <ArrowRight className="w-4 h-4" /></button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section ref={heroRef} className="relative h-screen flex items-end bg-secondary overflow-hidden">
        <div className="absolute inset-0">
          <img src="/diapo6.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-secondary/50" />
          <div className="absolute inset-0 bg-black/40" />
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '120px 120px' }} />
        <div className="relative z-10 w-full pb-48 lg:pb-64">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-[1px] bg-white/40" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-medium">{hero.label}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[0.9] mb-6">{hero.title}</h1>
              <p className="text-white/40 max-w-md text-sm leading-relaxed tracking-wide">{hero.subtitle}</p>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 right-8 lg:right-16 flex items-center gap-3 z-10">
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">{t('common.scroll')}</span>
          <div className="w-[1px] h-10 bg-white/20 relative">
            <div className="absolute top-0 w-[1px] h-3 bg-white/60 animate-pulse" />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="grid md:grid-cols-2 min-h-[80vh]">
          <div className="px-4 sm:px-6 lg:px-8 py-20 lg:py-24">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="name" className="block text-[10px] tracking-[0.2em] uppercase text-muted mb-3">{t('contact.name')} *</label>
                  <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder={t('contact.name')} className="border-0 border-b border-secondary/10 rounded-none px-0 focus:border-primary bg-transparent" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-[10px] tracking-[0.2em] uppercase text-muted mb-3">{t('contact.email')} *</label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="email@example.com" className="border-0 border-b border-secondary/10 rounded-none px-0 focus:border-primary bg-transparent" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <label htmlFor="phone" className="block text-[10px] tracking-[0.2em] uppercase text-muted mb-3">{t('contact.phone')}</label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="+241 ..." className="border-0 border-b border-secondary/10 rounded-none px-0 focus:border-primary bg-transparent" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-[10px] tracking-[0.2em] uppercase text-muted mb-3">{t('contact.subject')} *</label>
                  <Input id="subject" name="subject" value={formData.subject} onChange={handleChange} required placeholder={t('contact.subject')} className="border-0 border-b border-secondary/10 rounded-none px-0 focus:border-primary bg-transparent" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-[10px] tracking-[0.2em] uppercase text-muted mb-3">{t('contact.message')} *</label>
                <Textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows={5} placeholder={t('contact.message')} className="border-0 border-b border-secondary/10 rounded-none px-0 focus:border-primary bg-transparent resize-none" />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-3 px-8 py-4 bg-secondary text-white text-sm font-medium tracking-wide hover:bg-secondary/90 transition-colors disabled:opacity-50">{isSubmitting ? '...' : (<>{t('contact.send')} <Send className="w-4 h-4" /></>)}</button>
            </form>
          </div>

          <div className="bg-accent px-4 sm:px-6 lg:px-8 py-20 lg:py-24 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-12"><span className="w-8 h-[1px] bg-primary" /><span className="text-[10px] tracking-[0.3em] uppercase text-muted">{t('contact.info')}</span></div>
              <div className="space-y-8">
                <a href={`mailto:${settings?.contact_email || 'contact@nounconcept.com'}`} className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center group-hover:bg-primary transition-colors duration-300"><Mail className="w-5 h-5 text-secondary/40 group-hover:text-white transition-colors" /></div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted block mb-1">{t('contact.emailLabel')}</span>
                    <span className="text-secondary font-medium group-hover:text-primary transition-colors">{settings?.contact_email || 'contact@nounconcept.com'}</span>
                  </div>
                </a>
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center"><Phone className="w-5 h-5 text-secondary/40" /></div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted block mb-1">{t('contact.phoneLabel')}</span>
                    <span className="text-secondary font-medium">{settings?.contact_phone || '—'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center"><MapPin className="w-5 h-5 text-secondary/40" /></div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted block mb-1">{t('contact.address')}</span>
                    <span className="text-secondary font-medium">{settings?.contact_address || '—'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-secondary/5">
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted block mb-3">{t('contact.hours')}</span>
              {(settings?.working_hours || 'Lundi - Vendredi : 8h - 17h\nSamedi : Sur rendez-vous').split('\n').map((line, i) => (<p key={i} className="text-secondary/60 text-sm">{line}</p>))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

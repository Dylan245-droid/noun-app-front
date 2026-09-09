'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Phone, Send, CheckCircle, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { fetchApi } from '@/services/api'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { usePageContent } from '@/hooks/usePageContent'
import { Hero } from '@/components/hero/Hero'

interface SiteSettings {
  contact_email: string
  contact_phone: string
  contact_address: string
  working_hours: string
}

export default function ContactClient({ initialData }: any) {
  const { t } = useTranslation()
  useHeaderTheme('dark')

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
      <Hero
        image="/diapo6.jpg"
        label={hero.label}
        title={hero.title}
        subtitle={hero.subtitle}
        showGrid
        scrollLabel={t('common.scroll')}
        height="h-screen"
      />

      <section className="bg-white">
        <div className="grid md:grid-cols-2 min-h-[80vh]">
          <motion.div
            className="px-4 sm:px-6 lg:px-8 py-20 lg:py-24"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
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
              <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-3 px-8 py-4 bg-secondary text-white text-sm font-medium tracking-wide hover:bg-secondary/90 active:bg-secondary/90 transition-colors disabled:opacity-50">{isSubmitting ? '...' : (<>{t('contact.send')} <Send className="w-4 h-4" /></>)}</button>
            </form>
          </motion.div>

          <motion.div
            className="bg-accent px-4 sm:px-6 lg:px-8 py-20 lg:py-24 flex flex-col justify-between"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div>
              <div className="flex items-center gap-3 mb-12"><span className="w-8 h-[1px] bg-primary" /><span className="text-[10px] tracking-[0.3em] uppercase text-muted">{t('contact.info')}</span></div>
              <div className="space-y-8">
                <a href={`mailto:${settings?.contact_email || 'contact@nounconcept.com'}`} className="flex items-center gap-5 group">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center group-hover:group-active:bg-primary transition-colors duration-300"><Mail className="w-5 h-5 text-secondary/40 group-hover:group-active:text-white transition-colors" /></div>
                  <div>
                    <span className="text-[10px] tracking-[0.2em] uppercase text-muted block mb-1">{t('contact.emailLabel')}</span>
                    <span className="text-secondary font-medium group-hover:group-active:text-primary transition-colors">{settings?.contact_email || 'contact@nounconcept.com'}</span>
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
          </motion.div>
        </div>
      </section>
    </div>
  )
}

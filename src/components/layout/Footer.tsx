'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fetchApi } from '@/services/api'

interface SiteSettings {
  contact_email: string
  contact_phone: string
  contact_address: string
  site_name?: string
}

export default function Footer() {
  const { t } = useTranslation()
  const [settings, setSettings] = useState<SiteSettings | null>(null)

  useEffect(() => {
    fetchApi('/settings/')
      .then((data: any) => setSettings(data))
      .catch(() => setSettings(null))
  }, [])

  return (
    <footer className="bg-white border-t border-border-light text-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="NOUN CONCEPT" className="h-8 w-auto" />
            </div>
            <p className="text-secondary/60 max-w-sm mb-8 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
            <div className="flex flex-col gap-4">
              <a href={`mailto:${settings?.contact_email || 'contact@nounconcept.com'}`} className="flex items-center gap-3 text-secondary/60 hover:text-secondary transition-colors group">
                <div className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center group-hover:bg-surface transition-colors">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium">{settings?.contact_email || 'contact@nounconcept.com'}</span>
              </a>
              {settings?.contact_phone && (
                <div className="flex items-center gap-3 text-secondary/60">
                  <div className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center">
                    <Phone className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-sm font-medium">{settings.contact_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-secondary/60">
                <div className="w-8 h-8 rounded-full border border-border-light flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium">{settings?.contact_address || 'Libreville, Gabon'}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-secondary mb-6">{t('footer.poles')}</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/architecture" className="text-secondary/60 hover:text-secondary transition-colors text-sm font-medium">
                  {t('footer.architecture')}
                </Link>
              </li>
              <li>
                <Link href="/digital" className="text-secondary/60 hover:text-secondary transition-colors text-sm font-medium">
                  {t('footer.digital')}
                </Link>
              </li>
              <li>
                <Link href="/portfolio" className="text-secondary/60 hover:text-secondary transition-colors text-sm font-medium">
                  {t('footer.portfolio')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-secondary mb-6">{t('footer.company')}</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/about" className="text-secondary/60 hover:text-secondary transition-colors text-sm font-medium">
                  {t('footer.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-secondary/60 hover:text-secondary transition-colors text-sm font-medium">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border-light mt-16 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-secondary/40 text-xs font-medium">
          <p>&copy; {new Date().getFullYear()} {settings?.site_name || 'NOUN CONCEPT'}. {t('footer.rights')}</p>
          <div className="flex gap-6">
            <a href="https://www.instagram.com/noun.concept" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">Instagram</a>
            <a href="https://www.linkedin.com/company/noun-concept" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">LinkedIn</a>
          </div>
        </div>
      </div>
    </footer>
  )
}



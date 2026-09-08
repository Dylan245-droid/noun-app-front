'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowDownRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { usePageContent } from '@/hooks/usePageContent'

interface Service {
  id: number
  title: string
  description: string
  tags: string[]
}

interface ApiProject {
  id: number
  slug: string
  title: string
  short_description: string
  category: string
  cover_image: string | null
  client_name: string
}

export default function ArchitectureClient({ initialData, services: initialServices, projects: initialProjects }: any) {
  const { t } = useTranslation()
  useHeaderTheme('dark')
  const { data } = usePageContent('architecture')
    const heroRef = useRef<HTMLDivElement>(null)

  const [services, setServices] = useState<Service[]>(initialServices || [])
  const [projects, setProjects] = useState<ApiProject[]>(initialProjects || [])
  const [loading, setLoading] = useState(false)

  const c: any = data?.content_json || {}
  const hero = c.hero || {
    label: t('architecture.hero.label'),
    title: t('architecture.hero.title'),
    subtitle: t('architecture.hero.subtitle'),
  }
  const sectionLabel = c.section_label || t('architecture.section.label')
  const sectionTitle = c.section_title || t('architecture.section.title')
  const cta = c.cta || {
    title: t('architecture.cta.title'),
    subtitle: t('architecture.cta.subtitle'),
    btn_text: t('architecture.cta.btn'),
    btn_href: '/contact',
  }

  return (
    <div>
      <section ref={heroRef} className="relative min-h-screen flex items-end bg-secondary overflow-hidden">
        <div className="absolute inset-0">
          <img src="/diapo4.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-secondary/50" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 w-full pb-48 lg:pb-64">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-[1px] bg-white/40" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-medium">
                  {hero.label}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[0.9] mb-6 whitespace-pre-line">
                {hero.title}
              </h1>

              <p className="text-white/40 max-w-md text-sm leading-relaxed tracking-wide">
                {hero.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services — Bento Grid */}
      <section className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 lg:pt-24 pb-12 lg:pb-16">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-primary" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted font-medium">{sectionLabel}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary tracking-tight whitespace-pre-line">
              {sectionTitle}
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 lg:pb-24">
            {services.map((service, i) => (
              <div key={service.id} className="group relative bg-accent rounded-2xl p-6 lg:p-8 hover:bg-secondary transition-colors duration-500 overflow-hidden">
                <span className="absolute top-4 right-4 text-6xl font-bold text-secondary/5 group-hover:text-white/10 transition-colors duration-500">{String(i + 1).padStart(2, '0')}</span>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-secondary group-hover:text-white transition-colors duration-500 mb-2">{service.title}</h3>
                  <p className="text-sm text-muted group-hover:text-white/60 transition-colors duration-500 mb-4">{service.description}</p>
                  <div className="flex flex-wrap gap-2">{service.tags.map((tag) => (<span key={tag} className="px-2.5 py-1 bg-secondary/5 group-hover:bg-white/10 text-secondary/60 group-hover:text-white/70 text-[10px] font-medium rounded-full transition-colors duration-500">{tag}</span>))}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 lg:pt-24">
            <div className="flex items-center gap-3 mb-12">
              <span className="w-8 h-[1px] bg-white/30" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">{t('common.realizations')}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20"><p className="text-white/40 text-sm">{t('common.loading')}</p></div>
        ) : projects.length === 0 ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20"><p className="text-white/40 text-sm">{t('common.noProjects')}</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.slug}>
                <Link href={`/portfolio/${project.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center"><span className="text-white/20 text-sm">Aucune image</span></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <h3 className="text-lg font-bold text-white tracking-tight">{project.title}</h3>
                      <p className="text-white/70 text-sm mt-1 line-clamp-2">{project.short_description}</p>
                      {project.client_name && <p className="text-white/40 text-xs mt-1">{project.client_name}</p>}
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <ArrowDownRight className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <Link href="/portfolio?filter=architecture" className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white text-sm font-medium tracking-wide hover:bg-white hover:text-secondary transition-all duration-300 hover:scale-105">
            {t('common.seeAll')} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 lg:py-40 bg-primary relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[200px]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '40px 40px',
        }} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tighter whitespace-pre-line">
            {cta.title}
          </h2>
          <p className="text-white/60 max-w-xl mx-auto mb-10 text-lg">
            {cta.subtitle}
          </p>
          <Link href={cta.btn_href} className="group inline-flex items-center gap-3 px-8 py-4 border border-white text-white text-sm font-medium tracking-wide hover:bg-white hover:text-primary transition-all duration-300 hover:scale-105">
            {cta.btn_text} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>
    </div>
  )
}

'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowDownRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { usePageContent } from '@/hooks/usePageContent'
import { Hero } from '@/components/hero/Hero'

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

export default function DigitalClient({ initialData, services: initialServices, projects: initialProjects }: any) {
  const { t } = useTranslation()
  useHeaderTheme('dark')
  const { data } = usePageContent('digital')
  const [services, setServices] = useState<Service[]>(initialServices || [])
  const [projects, setProjects] = useState<ApiProject[]>(initialProjects || [])
  const [loading, setLoading] = useState(false)

  const c: any = data?.content_json || {}
  const hero = c.hero || {
    label: t('digital.hero.label'),
    title: t('digital.hero.title'),
    subtitle: t('digital.hero.subtitle'),
  }
  const sectionLabel = c.section_label || t('digital.section.label')
  const sectionTitle = c.section_title || t('digital.section.title')
  const cta = c.cta || {
    title: t('digital.cta.title'),
    subtitle: t('digital.cta.subtitle'),
    btn_text: t('digital.cta.btn'),
    btn_href: '/contact',
  }

  return (
    <div>
      <Hero
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1600&q=80"
        label={hero.label}
        title={hero.title}
        subtitle={hero.subtitle}
        scrollLabel={t('common.scroll')}
      />

      <section className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="pt-20 lg:pt-24 pb-12 lg:pb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="w-8 h-[1px] bg-primary" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted font-medium">{sectionLabel}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary tracking-tight whitespace-pre-line">{sectionTitle}</h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 lg:pb-24">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                className="group relative bg-accent rounded-2xl p-6 lg:p-8 hover:bg-secondary active:bg-secondary transition-colors duration-500 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="absolute top-4 right-4 text-6xl font-bold text-secondary/5 group-hover:group-active:text-white/10 transition-colors duration-500">{String(i + 1).padStart(2, '0')}</span>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-secondary group-hover:group-active:text-white transition-colors duration-500 mb-2">{service.title}</h3>
                  <p className="text-sm text-muted group-hover:group-active:text-white/60 transition-colors duration-500 mb-4">{service.description}</p>
                  <div className="flex flex-wrap gap-2">{service.tags.map((tag) => (<span key={tag} className="px-2.5 py-1 bg-secondary/5 group-hover:group-active:bg-white/10 text-secondary/60 group-hover:group-active:text-white/70 text-[10px] font-medium rounded-full transition-colors duration-500">{tag}</span>))}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="pt-20 lg:pt-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-12">
              <span className="w-8 h-[1px] bg-white/30" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">{t('common.realizations')}</span>
            </div>
          </motion.div>
        </div>
        {loading ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20"><p className="text-white/40 text-sm">{t('common.loading')}</p></div>
        ) : projects.length === 0 ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-20"><p className="text-white/40 text-sm">{t('common.noProjects')}</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <motion.div
                key={project.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <Link href={`/portfolio/${project.slug}`} className="group block">
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    {project.cover_image ? (<img src={project.cover_image} alt={project.title} className="absolute inset-0 w-full h-full object-cover group-hover:group-active:scale-105 transition-transform duration-700" />) : (<div className="absolute inset-0 flex items-center justify-center"><span className="text-white/20 text-sm">Aucune image</span></div>)}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent sm:opacity-0 sm:group-hover:sm:group-active:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:translate-y-4 sm:opacity-0 sm:group-hover:sm:group-active:translate-y-0 sm:group-hover:sm:group-active:opacity-100 transition-all duration-500">
                      <h3 className="text-lg font-bold text-white tracking-tight">{project.title}</h3>
                      <p className="text-white/70 text-sm mt-1 line-clamp-2">{project.short_description}</p>
                      {project.client_name && <p className="text-white/40 text-xs mt-1">{project.client_name}</p>}
                    </div>
                    <div className="absolute top-4 right-4 hidden sm:block opacity-0 group-hover:group-active:opacity-100 transition-opacity duration-500"><ArrowDownRight className="w-6 h-6 text-white" /></div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 text-center">
          <Link href="/portfolio?filter=digital" className="group inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white text-sm font-medium tracking-wide hover:bg-white hover:text-secondary active:bg-white active:text-secondary transition-all duration-300 hover:active:scale-105">{t('common.seeAll')} <ArrowRight className="w-4 h-4 group-hover:group-active:translate-x-1 transition-transform" /></Link>
        </div>
      </section>

      <section className="py-32 lg:py-40 bg-primary relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[200px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tighter whitespace-pre-line"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >{cta.title}</motion.h2>
          <motion.p
            className="text-white/60 max-w-xl mx-auto mb-10 text-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >{cta.subtitle}</motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <Link href={cta.btn_href} className="group inline-flex items-center gap-3 px-8 py-4 border border-white text-white text-sm font-medium tracking-wide hover:bg-white hover:text-primary active:bg-white active:text-primary transition-all duration-300 hover:active:scale-105">{cta.btn_text} <ArrowRight className="w-4 h-4 group-hover:group-active:translate-x-1 transition-transform" /></Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

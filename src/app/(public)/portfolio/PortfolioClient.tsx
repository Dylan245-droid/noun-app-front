'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import { ArrowRight, ArrowDownRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { usePageContent } from '@/hooks/usePageContent'
import { fetchApi } from '@/services/api'
import { Hero } from '@/components/hero/Hero'

interface ProjectImage {
  id: number
  image: string
  caption: string
  is_cover: boolean
}

interface Project {
  id: number
  slug: string
  title: string
  short_description: string
  description: string
  category: 'architecture' | 'digital'
  status: 'draft' | 'published'
  is_featured: boolean
  client_name: string
  cover_image: string | null
  images: ProjectImage[]
  delivery_date: string | null
  location: string
  technologies: string
  project_url: string
  created_at: string
}

function ProjectLarge({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const imgUrl = project.cover_image || project.images?.[0]?.image

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 60 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }} className="lg:col-span-2">
      <Link href={`/portfolio/${project.slug}`} className="group block">
        <div className="relative h-[50vh] lg:h-[70vh] overflow-hidden">
          {imgUrl ? (<motion.img src={imgUrl} alt={project.title} className="w-full h-full object-cover" initial={{ scale: 1.08 }} animate={inView ? { scale: 1 } : {}} transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }} />) : (<div className="w-full h-full bg-gray-100" />)}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-white/50">{project.category}</span>
                  <span className="w-6 h-[1px] bg-white/20" />
                  {project.client_name && <span className="text-[10px] tracking-[0.2em] uppercase text-white/40">{project.client_name}</span>}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tighter">{project.title}</h3>
                <p className="text-white/60 max-w-sm mt-2 text-sm line-clamp-2">{project.short_description}</p>
              </div>
              <ArrowDownRight className="w-8 h-8 text-white/30 group-hover:text-white group-hover:translate-x-2 group-hover:translate-y-2 transition-all duration-500 hidden sm:block" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function ProjectSmall({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const imgUrl = project.cover_image || project.images?.[0]?.image

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}>
      <Link href={`/portfolio/${project.slug}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden">
          {imgUrl ? (<img src={imgUrl} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />) : (<div className="w-full h-full bg-gray-100" />)}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <span className="text-[10px] tracking-[0.2em] uppercase text-white/50 mb-2 block">{project.category}</span>
            <h3 className="text-lg font-bold text-white tracking-tight">{project.title}</h3>
            {project.client_name && <p className="text-white/50 text-xs mt-1">{project.client_name}</p>}
          </div>
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"><ArrowDownRight className="w-5 h-5 text-white" /></div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function PortfolioClient({ initialData, initialProjects, initialFilter }: any) {
  const { t } = useTranslation()
  useHeaderTheme('dark')
  const searchParams = useSearchParams()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>(searchParams.get('filter') || 'all')

  const { data } = usePageContent('portfolio')
    const c: any = data?.content_json || {}
  const hero = c.hero || {
    label: t('portfolio.hero.label'),
    title: t('portfolio.hero.title'),
    subtitle: t('portfolio.hero.subtitle'),
  }
  const filters = c.filters || [
    { key: 'all', label: t('portfolio.filters.all') },
    { key: 'architecture', label: t('portfolio.filters.architecture') },
    { key: 'digital', label: t('portfolio.filters.digital') },
  ]
  const cta = c.cta || {
    title: t('portfolio.cta.title'),
    subtitle: t('portfolio.cta.subtitle'),
    btn_text: t('portfolio.cta.btn'),
    btn_href: '/contact',
  }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const endpoint = filter === 'all' ? '/portfolio/projects/published/' : `/portfolio/projects/?status=published&category=${filter}`
        const data = await fetchApi(endpoint)
        setProjects(data.results || data)
      } catch { setProjects([]) } finally { setLoading(false) }
    }
    fetchProjects()
  }, [filter])

  const getLayout = (items: Project[]) => {
    const result: { type: 'large' | 'small'; project: Project; index: number }[] = []
    items.forEach((p, i) => {
      if (i % 3 === 0) result.push({ type: 'large', project: p, index: i })
      else result.push({ type: 'small', project: p, index: i })
    })
    return result
  }

  const layout = getLayout(projects)

  return (
    <div>
      <Hero
        image="/diapo3.jpg"
        label={hero.label}
        title={hero.title}
        subtitle={hero.subtitle}
        showGrid
        scrollLabel={t('common.scroll')}
        height="h-screen"
      />

      <section className="bg-white border-b sticky top-16 lg:top-20 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6 py-4">
            {filters.map((f: { key: string; label: string }) => (
              <button key={f.key} onClick={() => setFilter(f.key)} className={`text-xs tracking-[0.15em] uppercase transition-all duration-300 relative pb-4 -mb-4 ${filter === f.key ? 'text-secondary' : 'text-secondary/30 hover:text-secondary/60'}`}>
                {f.label}
                {filter === f.key && <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-secondary" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white">
        {loading ? (<div className="text-center py-32"><p className="text-muted">{t('common.loading')}</p></div>) : (
          <AnimatePresence mode="wait">
            <motion.div 
              key={filter} 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }} 
              transition={{ duration: 0.5 }} 
              className="grid sm:grid-cols-2 lg:grid-cols-3"
            >
              {projects.length === 0 ? (<div className="col-span-full text-center py-32"><p className="text-muted text-lg">{t('common.noProjects')}</p></div>) : (
                layout.map((item) => (item.type === 'large' ? <ProjectLarge key={item.project.id} project={item.project} index={item.index} /> : <ProjectSmall key={item.project.id} project={item.project} index={item.index} />))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </section>

      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-20%' }}
        transition={{ duration: 1 }}
        className="py-32 lg:py-40 bg-secondary relative overflow-hidden"
      >
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-10%' }} transition={{ duration: 0.8 }} className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tighter whitespace-pre-line">{cta.title}</h2>
          <p className="text-white/50 max-w-md mx-auto mb-10 text-sm leading-relaxed">{cta.subtitle}</p>
          <Link href={cta.btn_href} className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-secondary text-sm font-medium tracking-wide hover:bg-white/90 transition-all hover:scale-105 hover:shadow-xl hover:shadow-primary/10">{cta.btn_text} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
        </motion.div>
      </motion.section>
    </div>
  )
}

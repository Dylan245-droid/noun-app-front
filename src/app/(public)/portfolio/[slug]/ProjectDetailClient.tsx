'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Calendar, Code, ExternalLink, Building2, ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { fetchApi } from '@/services/api'

interface ProjectImage {
  id: number
  image: string
  caption: string
  is_cover: boolean
}

interface Client {
  id: number
  name: string
  logo: string | null
  website: string
}

interface Project {
  id: number
  slug: string
  title: string
  short_description: string
  description: string
  category: 'architecture' | 'digital'
  status: string
  is_featured: boolean
  client: Client | null
  client_name: string
  client_name_override: string
  delivery_date: string | null
  location: string
  technologies: string
  project_url: string
  images: ProjectImage[]
  created_at: string
}

export default function ProjectDetailClient({ initialProject }: { initialProject: any }) {
  const slug = initialProject?.slug
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.4], [0, 100])
    useHeaderTheme('dark')

  useEffect(() => {
    if (!slug) return
    fetchApi(`/portfolio/projects/${slug}/`)
      .then((data) => {
        setProject(data)
        setMeta({
          title: `${data.title} — NOUN CONCEPT`,
          description: data.short_description,
          keywords: `${data.category}, ${data.location || ''}, ${data.technologies || ''}, projet ${data.category}`,
          ogTitle: data.title,
          ogDescription: data.short_description,
          ogImage: data.images?.find((i: ProjectImage) => i.is_cover)?.image || data.cover_image || data.images?.[0]?.image || null,
          canonicalUrl: `/portfolio/${data.slug}`,
        })
      })
      .catch(() => setProject(null))
      .finally(() => setLoading(false))
  }, [slug])

  const openLightbox = (index: number) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  const navigateLightbox = (dir: number) => {
    if (!project) return
    setLightboxIndex((prev) => {
      const next = prev + dir
      if (next < 0) return project.images.length - 1
      if (next >= project.images.length) return 0
      return next
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <p className="text-white/40 text-sm">Chargement...</p>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4 tracking-tight">Projet non trouvé</h1>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Retour au portfolio
          </Link>
        </div>
      </div>
    )
  }

  const allImages = project.images.length > 0 ? project.images : []
  const techList = project.technologies ? project.technologies.split(',').map((t) => t.trim()).filter(Boolean) : []

  return (
    <div className="bg-white">
      {/* Hero */}
      <section ref={heroRef} className="relative h-screen overflow-hidden bg-secondary">
        {allImages.length > 0 ? (
          <motion.img
            src={allImages.find((i) => i.is_cover)?.image || allImages[0].image}
            alt={project.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: heroOpacity, y: heroY }}
          />
        ) : (
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary"
            style={{ opacity: heroOpacity, y: heroY }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/80 to-secondary/60" />

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="absolute bottom-0 left-0 right-0 z-10 pb-16 lg:pb-24"
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              href="/portfolio"
              className="inline-flex items-center text-white/50 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Retour au portfolio
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-semibold rounded-md ${
                project.category === 'architecture' ? 'bg-primary/20 text-primary-light' : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {project.category === 'architecture' ? 'Architecture' : 'Digital'}
              </span>
              {project.location && (
                <span className="text-white/40 text-xs">{project.location}</span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter leading-[0.9] max-w-4xl">
              {project.title}
            </h1>

            <p className="text-white/50 max-w-xl mt-4 text-sm leading-relaxed">
              {project.short_description}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 right-8 lg:right-16 z-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-[1px] h-10 bg-white/20 relative"
          >
            <motion.div className="absolute top-0 w-[1px] h-3 bg-white/60" animate={{ height: [4, 16, 4] }} transition={{ duration: 1.5, repeat: Infinity }} />
          </motion.div>
        </motion.div>
      </section>

      {/* Info bar */}
      <section className="bg-secondary border-t border-white/5">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
            {project.delivery_date && (
              <div className="px-6 py-6 lg:py-8">
                <div className="flex items-center gap-2 text-white/30 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-[10px] tracking-[0.2em] uppercase">Livraison</span>
                </div>
                <p className="text-white text-sm font-medium">
                  {new Date(project.delivery_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toUpperCase()}
                </p>
              </div>
            )}
            {project.client && (
              <div className="px-6 py-6 lg:py-8">
                <div className="flex items-center gap-2 text-white/30 mb-3">
                  <Building2 className="w-4 h-4" />
                  <span className="text-[10px] tracking-[0.2em] uppercase">Client</span>
                </div>
                {project.client.website ? (
                  <a
                    href={project.client.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 group"
                  >
                    {project.client.logo ? (
                      <img
                        src={project.client.logo}
                        alt={project.client.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white/5 group-hover:ring-2 ring-primary/30 transition-all"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <span className="text-white/50 text-sm font-bold">{project.client.name.charAt(0)}</span>
                      </div>
                    )}
                    <div>
                      <p className="text-white text-sm font-medium group-hover:text-primary-light transition-colors">{project.client.name}</p>
                      <p className="text-white/30 text-[10px] group-hover:text-white/50 transition-colors">Visiter le site →</p>
                    </div>
                  </a>
                ) : (
                  <div className="flex items-center gap-3">
                    {project.client.logo ? (
                      <img
                        src={project.client.logo}
                        alt={project.client.name}
                        className="w-10 h-10 rounded-lg object-cover bg-white/5"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                        <span className="text-white/50 text-sm font-bold">{project.client.name.charAt(0)}</span>
                      </div>
                    )}
                    <p className="text-white text-sm font-medium">{project.client.name}</p>
                  </div>
                )}
              </div>
            )}
            {techList.length > 0 && (
              <div className="px-6 py-6 lg:py-8 col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-white/30 mb-2">
                  <Code className="w-4 h-4" />
                  <span className="text-[10px] tracking-[0.2em] uppercase">Technologies</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {techList.map((tech) => (
                    <span key={tech} className="px-2 py-0.5 bg-white/5 text-white/60 text-xs rounded-md">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {project.project_url && (
              <div className="px-6 py-6 lg:py-8 flex items-center">
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary-light hover:text-white text-sm font-medium transition-colors"
                >
                  Voir le projet <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Description */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="w-8 h-[1px] bg-primary" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-muted">À propos du projet</span>
              </div>
              <p className="text-secondary/70 leading-relaxed text-lg whitespace-pre-line">
                {project.description}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {allImages.length > 0 && (
        <section className="bg-accent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.8 }}
              className="flex items-center gap-3 mb-12"
            >
              <span className="w-8 h-[1px] bg-primary" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-muted">Galerie</span>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allImages.map((img, i) => (
                <motion.button
                  key={img.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-10%' }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  onClick={() => openLightbox(i)}
                  className={`group relative overflow-hidden rounded-lg cursor-pointer ${
                    i === 0 && allImages.length > 2 ? 'sm:col-span-2 sm:row-span-2 aspect-square sm:aspect-auto' : 'aspect-[4/3]'
                  }`}
                >
                  <img
                    src={img.image}
                    alt={img.caption || project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </motion.button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-32 lg:py-40 bg-secondary relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px]" />
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-10%' }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 tracking-tighter">
            Un projet similaire en tête ?
          </h2>
          <p className="text-white/50 max-w-md mx-auto mb-10 text-sm leading-relaxed">
            Contactez-nous pour discuter de votre vision.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 px-8 py-4 bg-white text-secondary text-sm font-medium tracking-wide hover:bg-white/90 transition-colors"
          >
            Contactez-nous <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && allImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 p-2 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1) }}
              className="absolute left-4 lg:left-8 p-3 text-white/60 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.img
              key={lightboxIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              src={allImages[lightboxIndex].image}
              alt={allImages[lightboxIndex].caption || project.title}
              className="max-w-[90vw] max-h-[85vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <button
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1) }}
              className="absolute right-4 lg:right-8 p-3 text-white/60 hover:text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40 text-sm">
              {lightboxIndex + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
function setMeta(arg0: { title: string; description: any; keywords: string; ogTitle: any; ogDescription: any; ogImage: any; canonicalUrl: string }) {
  throw new Error('Function not implemented.')
}


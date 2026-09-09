'use client'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, ArrowDownRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { usePageContent } from '@/hooks/usePageContent'
import { fetchApi } from '@/services/api'

/* ─── Default content (fallback if CMS not loaded) ─── */
const DEFAULTS = {
  hero: {
    title_line1: 'Concevoir',
    title_highlight1: "l'espace.",
    title_line2: 'Coder',
    title_highlight2: "l'avenir.",
    subtitle: "Design d'espace, aménagement paysager & urbain.\nDéveloppement logiciel et solutions digitales sur mesure.",
  },
  diapos: ['/diapo1.jpg', '/diapo2.jpg', '/diapo3.jpg', '/diapo4.jpg', '/diapo5.jpg', '/diapo6.jpg'],
  manifesto: {
    label: 'Notre vision',
    words: ["Nous", "croyons", "que", "l'espace", "—", "qu'il", "soit", "physique", "ou", "digital", "—", "mérite", "d'être", "pensé,", "ressenti,", "vécu.", "Chaque", "ligne", "tracée,", "chaque", "pixel", "placé", "est", "un", "acte", "de", "création."],
    highlights: ["l'espace", "pensé,", "ressenti,", "vécu.", "création."],
  },
  poles: [
    { title: 'Architecture', description: "Aménagement paysager & urbain, mobiliers, œuvres d'art.", href: '/architecture' },
    { title: 'Digital', description: 'Applications web, plateformes, consulting technique.', href: '/digital' },
  ],
  stats: {
    label: 'Nos chiffres',
    items: [
      { value: 2, label: "Pôles d'expertise" },
      { value: 2, suffix: '+', label: 'Projets livrés' },
      { value: 0, label: 'Partenaires' },
      { value: 100, suffix: '%', label: 'Sur mesure' },
    ],
  },
  cta: {
    label: 'Contact',
    title: 'Un projet\nen tête ?',
    subtitle: 'Discutons de votre vision et voyons comment nous pouvons la concrétiser ensemble.',
    primary_btn: { text: 'Contactez-nous', href: '/contact' },
    secondary_btn: { text: 'Voir le portfolio', href: '/portfolio' },
  },
}


interface HomeProject {
  id: number
  slug: string
  title: string
  short_description: string
  category: string
  cover_image: string | null
  client_name: string
}

interface HomePartner {
  name: string
  logo: string | null
  website: string
}

/* ─── Animated Counter ─── */
function Counter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })
  const [n, setN] = useState(0)

  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = Math.max(1, Math.floor(value / 50))
    const id = setInterval(() => {
      start += step
      if (start >= value) { setN(value); clearInterval(id) }
      else setN(start)
    }, 25)
    return () => clearInterval(id)
  }, [inView, value])

  return <span ref={ref}>{n}{suffix}</span>
}

/* ─── Hero Slideshow ─── */
function HeroSlideshow({ images, delayStart = 1500 }: { images: string[]; delayStart?: number }) {
  const [current, setCurrent] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setStarted(true), delayStart)
    return () => clearTimeout(timer)
  }, [delayStart])

  useEffect(() => {
    if (!started) return
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, 5000)
    return () => clearInterval(id)
  }, [started, images.length])

  return (
    <div className="absolute inset-0">
      {images.map((src: string, i: number) => (
        <motion.div
          key={i}
          className="absolute inset-0"
          initial={i === 0 ? { opacity: 0 } : false}
          animate={{ opacity: i === current ? 1 : 0 }}
          transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <motion.img
            src={src}
            alt=""
            className="w-full h-full object-cover"
            initial={{ scale: 1.08 }}
            animate={{ scale: i === current ? 1 : 1.08 }}
            transition={{ duration: started ? 8 : 1.2, ease: 'linear' }}
          />
        </motion.div>
      ))}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-secondary/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
      />

      <motion.div
        className="absolute bottom-8 left-8 lg:left-16 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: started ? 1 : 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {images.map((_: string, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="relative h-[1px] bg-white/20 overflow-hidden"
            style={{ width: 32 }}
          >
            {i === current && started && (
              <motion.div
                key={current}
                className="absolute inset-0 bg-white"
                initial={{ scaleX: 0, transformOrigin: 'left' }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            )}
          </button>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Manifesto Text ─── */
function ManifestoText({ content }: { content: typeof DEFAULTS.manifesto }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inView = useInView(containerRef, { once: true, margin: '-10%' })

  const highlights = new Set(content.highlights)

  return (
    <div ref={containerRef} className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center gap-3 mb-12 lg:mb-16"
      >
        <span className="w-8 h-[1px] bg-primary-light/60" />
        <span className="text-[10px] tracking-[0.3em] uppercase text-white/30 font-medium">
          {content.label}
        </span>
      </motion.div>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        {content.words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.025, ease: [0.25, 0.1, 0.25, 1] }}
            className={`inline-block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light tracking-tight leading-[1.3] ${
              highlights.has(word) ? 'text-white font-medium' : 'text-white/40'
            }`}
          >
            {word}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-12 lg:mt-16 h-[1px] bg-gradient-to-r from-primary-light/40 via-primary-light/20 to-transparent origin-left"
      />
    </div>
  )
}

/* ─── Pole Section ─── */
function PoleSection({ title, description, href }: {
  title: string
  description: string
  href: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imageY = useTransform(scrollYProgress, [0, 1], [-40, 40])

  const images: Record<string, string> = {
    'Architecture': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80',
    'Digital': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80',
  }
  const image = images[title] || '/diapo1.jpg'

  return (
    <Link href={href} className="group block relative">
      <div ref={ref} className="relative h-[80vh] lg:h-screen overflow-hidden">
        <motion.img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:group-active:scale-105 transition-transform duration-700"
          style={{ y: imageY }}
        />
        <div className="absolute inset-0 bg-black/40 group-hover:group-active:bg-black/30 transition-colors duration-500" />
        <div className="absolute inset-0 flex items-end z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16 lg:pb-24">
            <div className="flex items-end justify-between">
              <div>
                <motion.h2
                  className="text-5xl sm:text-6xl lg:text-8xl font-bold text-white tracking-tighter mb-4"
                  initial={{ opacity: 0, y: 40 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {title}
                </motion.h2>
                <motion.p
                  className="text-white/60 max-w-md text-sm leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {description}
                </motion.p>
              </div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <ArrowDownRight className="w-10 h-10 text-white/40 group-hover:text-white group-hover:translate-x-2 group-hover:translate-y-2 transition-all duration-500 hidden sm:block" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ─── Partners Carousel ─── */
function PartnersCarousel() {
  const { t } = useTranslation()
  const [paused, setPaused] = useState(false)
  const [partners, setPartners] = useState<HomePartner[]>([])

  useEffect(() => {
    fetchApi('/portfolio/clients/partners/')
      .then((data) => setPartners(data.results || data))
      .catch(() => setPartners([]))
  }, [])

  if (!partners.length) return null

  const shouldAnimate = partners.length >= 3
  const items = shouldAnimate ? [...partners, ...partners] : partners

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => shouldAnimate && setPaused(true)}
      onMouseLeave={() => shouldAnimate && setPaused(false)}
      onTouchStart={() => shouldAnimate && setPaused(true)}
      onTouchEnd={() => setTimeout(() => shouldAnimate && setPaused(false), 3000)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-white to-transparent z-10" />
      <motion.div
        className="flex gap-6"
        animate={shouldAnimate && !paused ? { x: [0, -1400] } : {}}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((partner, i) => {
          const content = (
            <div className="flex-shrink-0 w-64 group cursor-pointer">
              <div className="flex items-center gap-4 py-4">
                <div className="w-14 h-14 rounded-full bg-secondary/5 flex items-center justify-center group-hover:bg-primary transition-colors duration-300 shrink-0 overflow-hidden">
                  {partner.logo ? (
                    <img src={partner.logo} alt={partner.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <span className="text-secondary/30 font-bold text-sm group-hover:text-white transition-colors">
                      {partner.name.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-secondary text-sm">{partner.name}</h4>
                  {partner.website && (
                    <span className="text-[10px] tracking-[0.15em] uppercase text-muted group-hover:text-primary transition-colors">
                      {t('common.viewPortfolio').replace('portfolio', 'site').replace('Voir', 'Visiter')}
                    </span>
                  )}
                </div>
              </div>
              <div className="h-[1px] bg-secondary/5 group-hover:bg-primary/20 transition-colors" />
            </div>
          )

          if (partner.website) {
            return (
              <a key={i} href={partner.website} target="_blank" rel="noopener noreferrer" className="block">
                {content}
              </a>
            )
          }

          return <div key={i}>{content}</div>
        })}
      </motion.div>
    </div>
  )
}

/* ─── Projects Carousel ─── */
function ProjectsCarousel() {
  const [paused, setPaused] = useState(false)
  const [projects, setProjects] = useState<HomeProject[]>([])

  useEffect(() => {
    fetchApi('/portfolio/projects/published/')
      .then((data) => setProjects((data.results || data).slice(0, 8)))
      .catch(() => setProjects([]))
  }, [])

  if (!projects.length) return null

  const shouldAnimate = projects.length >= 3
  const items = shouldAnimate ? [...projects, ...projects] : projects

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => shouldAnimate && setPaused(true)}
      onMouseLeave={() => shouldAnimate && setPaused(false)}
      onTouchStart={() => shouldAnimate && setPaused(true)}
      onTouchEnd={() => setTimeout(() => shouldAnimate && setPaused(false), 3000)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-secondary to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-secondary to-transparent z-10" />
      <motion.div
        className="flex gap-6"
        animate={shouldAnimate && !paused ? { x: [0, -1600] } : {}}
        transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
      >
        {items.map((p, i) => (
          <Link
            key={`${p.id}-${i}`}
            href={`/portfolio/${p.slug}`}
            className="group flex-shrink-0 w-64 sm:w-80 lg:w-96 block"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white/5">
              {p.cover_image ? (
                <img
                  src={p.cover_image}
                  alt={p.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:group-active:scale-105 transition-transform duration-700"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white/20 text-sm">No image</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">{p.category}</span>
                  {p.client_name && (
                    <>
                      <span className="w-4 h-[1px] bg-white/20" />
                      <span className="text-[10px] tracking-[0.2em] uppercase text-white/50">{p.client_name}</span>
                    </>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-white/80 transition-colors">
                  {p.title}
                </h3>
              </div>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  )
}

/* ─── Stats Section ─── */
function StatsSection({ stats }: { stats: typeof DEFAULTS.stats }) {
  const { t } = useTranslation()
  const [liveStats, setLiveStats] = useState({ projects: 0, partners: 0 })
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })

  useEffect(() => {
    Promise.all([
      fetchApi('/portfolio/projects/published/').then((data) => (data.results || data).length || 0).catch(() => 0),
      fetchApi('/portfolio/clients/partners/').then((data) => (data.results || data).length || 0).catch(() => 0),
    ]).then(([projects, partners]) => setLiveStats({ projects, partners }))
  }, [])

  const items = stats.items.map((item) => {
    if (item.label === 'Projets livrés' || item.label === 'Projects delivered') return { ...item, value: liveStats.projects, label: t('home.stats.projects') }
    if (item.label === 'Partenaires' || item.label === 'Partners') return { ...item, value: liveStats.partners, label: t('home.stats.partners') }
    if (item.label === "Pôles d'expertise" || item.label === 'Areas of expertise') return { ...item, label: t('home.stats.poles') }
    if (item.label === 'Sur mesure' || item.label === 'Custom-built') return { ...item, label: t('home.stats.custom') }
    return item
  })

  return (
    <section ref={ref} className="py-32 lg:py-40 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px',
      }} />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
          {items.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tighter tabular-nums">
                <Counter value={stat.value} suffix={stat.suffix || ''} />
              </div>
              <div className="text-white/40 text-xs tracking-[0.2em] uppercase mt-3 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ─── MAIN PAGE ─── */
export default function HomePageClient({ initialData, initialFeaturedProjects }: any) {
  const { t } = useTranslation()
  useHeaderTheme('dark')
  const { data } = usePageContent('home')
    const c: any = data?.content_json || {}
  const hero = c.hero || {
    title_line1: t('home.hero.line1'),
    title_highlight1: t('home.hero.highlight1'),
    title_line2: t('home.hero.line2'),
    title_highlight2: t('home.hero.highlight2'),
    subtitle: t('home.hero.subtitle'),
  }
  const diapos = (c.diapos as string[]) || DEFAULTS.diapos
  const manifesto = c.manifesto || DEFAULTS.manifesto
  const poles = c.poles || DEFAULTS.poles
  const stats = c.stats || DEFAULTS.stats
  const cta = c.cta || {
    label: t('home.cta.label'),
    title: t('home.cta.title'),
    subtitle: t('home.cta.subtitle'),
    primary_btn: { text: t('home.cta.primary'), href: '/contact' },
    secondary_btn: { text: t('home.cta.secondary'), href: '/portfolio' },
  }

  return (
    <div>

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative h-screen flex items-end bg-secondary overflow-hidden">
        <HeroSlideshow images={diapos} />
        <motion.div
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '120px 120px',
          }}
        />

        <div className="relative z-10 w-full pb-20 lg:pb-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl">
              <motion.h1
                className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white tracking-tighter leading-[0.9] lg:leading-[0.85]"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {hero.title_line1} <span className="text-white/80">{hero.title_highlight1}</span><br/>
                <motion.span
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {hero.title_line2} <span className="text-white/80">{hero.title_highlight2}</span>
                </motion.span>
              </motion.h1>
              <motion.p
                className="text-white/40 max-w-md mt-8 text-sm leading-relaxed tracking-wide whitespace-pre-line"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {hero.subtitle}
              </motion.p>
            </div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 right-8 lg:right-16 flex items-center gap-3 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">{t('common.scroll')}</span>
          <div className="w-[1px] h-10 bg-white/20 relative">
            <motion.div
              className="absolute top-0 w-[1px] h-3 bg-white/60"
              animate={{ height: [4, 16, 4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            />
          </div>
        </motion.div>
      </section>

      {/* ═══════════ MANIFESTO ═══════════ */}
      <section className="relative min-h-screen flex items-center bg-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '60px 60px',
        }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent via-primary-light to-transparent" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ManifestoText content={manifesto} />
        </div>
      </section>

      {/* ═══════════ TWO POLES ═══════════ */}
      <section className="bg-white">
        {poles.map((pole: any) => (
          <PoleSection
            key={pole.title}
            title={pole.title}
            description={pole.description}
            href={pole.href}
          />
        ))}
      </section>

      {/* ═══════════ PROJETS ═══════════ */}
      <section className="bg-secondary relative overflow-hidden">
        <div className="py-20 lg:py-24 px-4 sm:px-6 lg:px-16">
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-xs tracking-[0.3em] uppercase text-white/30 mb-4 block">{t('common.seeAll').replace('Voir', 'Sélection')}</span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tighter">
                {t('nav.portfolio')}
              </h2>
            </div>
            <Link href="/portfolio" className="hidden sm:flex items-center gap-2 text-white/40 hover:text-white text-sm tracking-wide transition-colors">
              {t('common.seeAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <ProjectsCarousel />
      </section>

      {/* ═══════════ PARTENAIRES ═══════════ */}
      <section className="py-32 lg:py-40 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-16">
            <span className="w-10 h-[1px] bg-primary" />
            <span className="text-xs tracking-[0.3em] uppercase text-muted">{t('footer.poles').replace('Pôles', 'Partenaires').replace('Poles', 'Partners')}</span>
          </div>
          <PartnersCarousel />
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <StatsSection stats={stats} />

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-32 lg:py-48 bg-secondary relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[200px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.span
              className="text-xs tracking-[0.3em] uppercase text-white/30 mb-8 block"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {cta.label}
            </motion.span>
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white tracking-tighter leading-[0.9] mb-8 whitespace-pre-line"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {cta.title}
            </motion.h2>
            <motion.p
              className="text-white/40 max-w-md text-sm leading-relaxed mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {cta.subtitle}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <Link href={cta.primary_btn.href} className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-secondary text-sm font-medium tracking-wide hover:bg-white/90 transition-colors">
                {cta.primary_btn.text} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href={cta.secondary_btn.href} className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 text-white text-sm font-medium tracking-wide hover:bg-white/10 transition-colors">
                {cta.secondary_btn.text}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  )
}

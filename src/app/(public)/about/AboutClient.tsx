'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Building2, Code, GraduationCap, Globe, ExternalLink, ArrowUpRight, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useHeaderTheme } from '@/hooks/useHeaderTheme'
import { usePageContent } from '@/hooks/usePageContent'
import { fetchApi } from '@/services/api'
import { Hero } from '@/components/hero/Hero'

interface TeamMember {
  id: number
  first_name: string
  last_name: string
  role: string
  custom_role: string
  bio: string
  photo: string | null
  skills: string
  education: string
  linkedin: string
  github: string
  portfolio_url: string
  is_founder: boolean
  is_active: boolean
  full_name: string
}

const ROLES = [
  { value: 'pdg', label: 'PDG' },
  { value: 'dg', label: 'Directeur Général' },
  { value: 'ceo', label: 'CEO' },
  { value: 'cto', label: 'CTO' },
  { value: 'gerant', label: 'Gérant' },
  { value: 'co_gerant', label: 'Co-gérant' },
  { value: 'architecte', label: 'Architecte' },
  { value: 'ingenieur', label: 'Ingénieur' },
  { value: 'designer', label: 'Designer' },
  { value: 'developpeur', label: 'Développeur' },
]

function FounderCard({ member, index }: { member: TeamMember; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const skillsList = member.skills ? member.skills.split(';').map((s) => s.trim()).filter(Boolean) : []
  const roleLabel = member.role ? ROLES.find((r) => r.value === member.role)?.label : null
  const displayRole = [roleLabel, member.custom_role].filter(Boolean).join(' · ')

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 80 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1, delay: index * 0.2, ease: [0.25, 0.1, 0.25, 1] }} className="relative">
      <div className="relative group">
        <div className="absolute -top-8 -left-4 text-[10rem] leading-none font-bold text-secondary/[0.03] select-none pointer-events-none z-0">{String(index + 1).padStart(2, '0')}</div>
        <div className="relative z-10 mb-6">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
            {member.photo ? (<>
              <motion.img src={member.photo} alt={member.full_name} className="w-full h-full object-cover" initial={{ scale: 1.1 }} animate={inView ? { scale: 1 } : {}} transition={{ duration: 1.2, delay: index * 0.2 + 0.3, ease: [0.25, 0.1, 0.25, 1] }} />
              <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/20 to-transparent" />
            </>) : (<div className="w-full h-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center"><span className="text-6xl font-bold text-white/20">{member.first_name.charAt(0)}{member.last_name.charAt(0)}</span></div>)}
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-3"><div className="w-8 h-[1px] bg-amber-400" /><span className="text-[10px] tracking-[0.3em] uppercase text-amber-400 font-semibold">Fondateur</span></div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">{member.full_name}</h3>
              {displayRole && <p className="text-white/60 text-sm mt-1 tracking-wide">{displayRole}</p>}
            </div>
          </div>
        </div>
        <div className="relative z-10 pl-0 lg:pl-4">
          {member.education && <div className="flex items-center gap-2 mb-4"><GraduationCap className="w-4 h-4 text-white/40" /><span className="text-sm text-white/60">{member.education}</span></div>}
          {member.bio && <p className="text-white/50 leading-relaxed text-sm mb-5">{member.bio}</p>}
          {skillsList.length > 0 && <div className="flex flex-wrap gap-2 mb-5">{skillsList.map((skill) => (<span key={skill} className="px-3 py-1.5 bg-white/10 text-white/80 text-xs font-medium rounded-full">{skill}</span>))}</div>}
          {(member.linkedin || member.github || member.portfolio_url) && (
            <div className="flex items-center gap-4 pt-5 border-t border-white/10">
              {member.linkedin && (<a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white active:text-white transition-colors group"><ArrowUpRight className="w-3.5 h-3.5 group-hover:group-active:translate-x-0.5 group-hover:group-active:-translate-y-0.5 transition-transform" /><span>LinkedIn</span></a>)}
              {member.github && (<a href={member.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white active:text-white transition-colors group"><Globe className="w-3.5 h-3.5 group-hover:group-active:translate-x-0.5 group-hover:group-active:-translate-y-0.5 transition-transform" /><span>GitHub</span></a>)}
              {member.portfolio_url && (<a href={member.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white active:text-white transition-colors group"><ExternalLink className="w-3.5 h-3.5 group-hover:group-active:translate-x-0.5 group-hover:group-active:-translate-y-0.5 transition-transform" /><span>Portfolio</span></a>)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function TeamMemberCard({ member, index }: { member: TeamMember; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  const skillsList = member.skills ? member.skills.split(';').map((s) => s.trim()).filter(Boolean) : []
  const roleLabel = member.role ? ROLES.find((r) => r.value === member.role)?.label : null
  const displayRole = [roleLabel, member.custom_role].filter(Boolean).join(' · ')

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}>
      <div className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md hover:shadow-gray-100 active:shadow-md active:shadow-gray-100 transition-all duration-300">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gray-50 overflow-hidden border border-gray-100 flex items-center justify-center shrink-0">
            {member.photo ? (<img src={member.photo} alt={member.full_name} className="w-full h-full object-cover" />) : (<span className="text-lg font-bold text-primary">{member.first_name.charAt(0)}{member.last_name.charAt(0)}</span>)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-secondary text-sm truncate">{member.full_name}</h3>
            {displayRole && <p className="text-xs text-primary font-medium mt-0.5">{displayRole}</p>}
            {member.education && <p className="text-xs text-muted mt-1 flex items-center gap-1"><GraduationCap className="w-3 h-3" />{member.education}</p>}
            {skillsList.length > 0 && (<div className="flex flex-wrap gap-1 mt-2">{skillsList.slice(0, 3).map((skill) => (<span key={skill} className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-medium rounded-md">{skill}</span>))}{skillsList.length > 3 && (<span className="px-2 py-0.5 bg-gray-100 text-muted text-[10px] rounded-md">+{skillsList.length - 3}</span>)}</div>)}
            {(member.linkedin || member.github || member.portfolio_url) && (<div className="flex items-center gap-2 mt-2">{member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors"><ArrowUpRight className="w-3.5 h-3.5" /></a>}{member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors"><Globe className="w-3.5 h-3.5" /></a>}{member.portfolio_url && <a href={member.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>}</div>)}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function AboutClient({ initialData }: any) {
  const { t } = useTranslation()
  useHeaderTheme('dark')

  const [founders, setFounders] = useState<TeamMember[]>([])
  const [team, setTeam] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)

  const { data } = usePageContent('about')
    const c: any = data?.content_json || {}
  const hero = c.hero || { label: t('about.hero.label'), title: t('about.hero.title'), subtitle: t('about.hero.subtitle') }
  const story = c.story || {
    label: t('about.story.label'),
    title: t('about.story.title'),
    paragraphs: [
      "NOUN CONCEPT est née de la vision de Claude François EMANE MENGUE, architecte d'intérieur, artiste plasticien et médiateur culturel. Trois casquettes qui convergent vers un profil unique : le designer d'espaces culturels, dont la mission est de revaloriser la culture d'un espace et d'un peuple par une approche architecturale.",
      "Dylan ONDO, ingénieur logiciel et architecte de systèmes, a rejoint l'aventure par concours de circonstances — mais les meilleures rencontres sont souvent celles qu'on ne prévoit pas. Fort de son expertise en développement d'applications et en digitalisation de processus, il a apporté la dimension technique qui manquait à la structure.",
      "Aujourd'hui co-gérants, Claude et Dylan partagent la même conviction : architecture et digital ne s'opposent pas, ils se nourrissent mutuellement. Chaque projet porte la même exigence de beauté, de fonctionnalité et de sens.",
    ],
  }
  const pillars = c.pillars || {
    label: t('about.pillars.label'),
    architecture: {
      title: t('about.pillars.architecture.title'),
      subtitle: t('about.pillars.architecture.subtitle'),
      items: [
        { title: 'Aménagement intérieur', desc: "Conception d'espaces fonctionnels et esthétiques, de la programmation à la livraison." },
        { title: 'Aménagement paysager', desc: "Création d'espaces verts qui dialoguent avec l'environnement et le bâti." },
        { title: 'Mobilier & objets', desc: 'Pièces uniques et accessoires urbains conçus sur mesure.' },
        { title: "Œuvres d'art", desc: "Créations artistiques qui transforment les espaces en expériences." },
      ],
    },
    digital: {
      title: t('about.pillars.digital.title'),
      subtitle: t('about.pillars.digital.subtitle'),
      items: [
        { title: 'Applications web', desc: 'Plateformes SaaS, CMS et portails institutionnels sur mesure.' },
        { title: 'Architecture système', desc: 'APIs performantes, architectures scalables et solutions offline-first.' },
        { title: 'Transformation digitale', desc: 'Digitalisation de processus métiers complexes et gestion de données.' },
        { title: 'Consulting technique', desc: 'Accompagnement stratégique, documentation et pilotage de projet.' },
      ],
    },
  }
  const vision = c.vision || {
    label: t('about.vision.label'),
    quote: t('about.vision.quote'),
    highlights: ['concevoir quelque chose qui dure', 'donne envie de rester'],
    footer: t('about.vision.footer'),
  }

  useEffect(() => {
    fetchApi('/team/')
      .then((data) => {
        const members = (data.results || data).filter((m: TeamMember) => m.is_active)
        setFounders(members.filter((m: TeamMember) => m.is_founder))
        setTeam(members.filter((m: TeamMember) => !m.is_founder))
      })
      .catch(() => { setFounders([]); setTeam([]) })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* Hero */}
      <Hero
        image="/diapo2.jpg"
        label={hero.label}
        title={hero.title}
        subtitle={hero.subtitle}
        showGrid
        scrollLabel="Scroll"
        height="h-screen"
      />

      {/* Story */}
      <section className="bg-white">
        <div className="grid md:grid-cols-2 min-h-[80vh]">
          <div className="hidden md:flex items-start pt-32 lg:pt-40 px-4 sm:px-6 lg:px-8 border-r border-secondary/5">
            <div className="sticky top-32">
              <div className="flex items-center gap-3 mb-6"><span className="w-8 h-[1px] bg-primary" /><span className="text-[10px] tracking-[0.3em] uppercase text-muted">{story.label}</span></div>
              <p className="text-2xl lg:text-3xl font-light text-secondary leading-snug tracking-tight max-w-xs">{story.title}</p>
            </div>
          </div>
          <div className="divide-y divide-secondary/5">
            <motion.div
              className="md:hidden px-4 sm:px-6 lg:px-8 pt-20 lg:pt-24 pb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[1px] bg-primary" /><span className="text-[10px] tracking-[0.3em] uppercase text-muted">{story.label}</span></div>
              <p className="text-2xl font-light text-secondary leading-snug tracking-tight">{story.title}</p>
            </motion.div>
            {story?.paragraphs?.map((paragraph: string, i: number) => (
              <motion.div
                key={i}
                className="px-4 sm:px-6 lg:px-8 py-16 lg:py-20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-10%' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="text-[10px] tracking-[0.3em] uppercase text-muted mb-4 block">0{i + 1}</span>
                <p className="text-muted leading-relaxed text-lg">{paragraph}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      {!loading && founders.length > 0 && (
        <section className="bg-secondary">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="pt-20 lg:pt-24 pb-12 lg:pb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center gap-3 mb-4"><Star className="w-5 h-5 text-amber-400" /><span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-medium">{t('about.founders.label')}</span></div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight whitespace-pre-line">{t('about.founders.title')}</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 pb-20 lg:pb-24">
              {founders.map((member, i) => (<FounderCard key={member.id} member={member} index={i} />))}
            </div>
          </div>
        </section>
      )}

      {/* Team */}
      {!loading && team.length > 0 && (
        <section className="bg-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              className="pt-20 lg:pt-24 pb-12 lg:pb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="flex items-center gap-3 mb-4"><span className="w-8 h-[1px] bg-primary" /><span className="text-[10px] tracking-[0.3em] uppercase text-muted font-medium">{t('about.team.label')}</span></div>
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary tracking-tight">{t('about.team.title')}</h2>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-20 lg:pb-24">
              {team.map((member, i) => (<TeamMemberCard key={member.id} member={member} index={i} />))}
            </div>
          </div>
        </section>
      )}

      {/* Two Pillars */}
      <section className="bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="pt-20 lg:pt-24"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10%' }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex items-center gap-3 mb-16"><span className="w-8 h-[1px] bg-white/30" /><span className="text-[10px] tracking-[0.3em] uppercase text-white/40">{pillars.label}</span></div>
          </motion.div>
        </div>

        {/* Architecture pillar */}
        <div className="border-t border-white/5">
          <div className="grid md:grid-cols-12">
            <motion.div
              className="md:col-span-4 px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-b md:border-b-0 md:border-r border-white/5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="sticky top-32">
                <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center mb-6"><Building2 className="w-7 h-7 text-white/40" /></div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tighter mb-4">{pillars.architecture.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{pillars.architecture.subtitle}</p>
              </div>
            </motion.div>
            <div className="md:col-span-8 px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                {pillars.architecture?.items?.map((item: { title: string; desc: string }, i: number) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10%' }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 mb-2 block">0{i + 1}</span>
                    <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Digital pillar */}
        <div className="border-t border-white/5">
          <div className="grid md:grid-cols-12">
            <motion.div
              className="md:col-span-4 px-4 sm:px-6 lg:px-8 py-16 lg:py-24 border-b md:border-b-0 md:border-r border-white/5"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="sticky top-32">
                <div className="w-14 h-14 rounded-lg bg-white/5 flex items-center justify-center mb-6"><Code className="w-7 h-7 text-white/40" /></div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white tracking-tighter mb-4">{pillars.digital.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{pillars.digital.subtitle}</p>
              </div>
            </motion.div>
            <div className="md:col-span-8 px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
              <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
                {pillars.digital?.items?.map((item: { title: string; desc: string }, i: number) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10%' }}
                    transition={{ duration: 0.5, delay: i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <span className="text-[10px] tracking-[0.3em] uppercase text-white/20 mb-2 block">0{i + 1}</span>
                    <h4 className="text-white font-semibold mb-1">{item.title}</h4>
                    <p className="text-white/40 text-sm leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-40 lg:py-56 bg-primary overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-light/10 rounded-full blur-[200px]" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              className="flex items-center justify-center gap-3 mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="w-8 h-[1px] bg-white/30" /><span className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-medium">{vision.label}</span><span className="w-8 h-[1px] bg-white/30" />
            </motion.div>
            <motion.blockquote
              className="text-2xl sm:text-3xl lg:text-4xl font-light text-white leading-snug tracking-tight mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {vision.quote?.split(vision.highlights?.[0]).map((part: string, i: number) => (
                <span key={i}>
                  {part}
                  {i === 0 && vision.highlights[0] && <span className="font-medium text-white">{vision.highlights[0]}</span>}
                </span>
              ))}
            </motion.blockquote>
            <motion.p
              className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >{vision.footer}</motion.p>
          </div>
        </div>
      </section>
    </div>
  )
}

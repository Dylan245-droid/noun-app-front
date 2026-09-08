'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FolderOpen, Mail, ArrowRight, FileText, Search, Users, Settings, MessageSquare, CheckCircle, AlertCircle, ExternalLink, Briefcase } from 'lucide-react'
import { fetchApi } from '@/services/api'

interface DashboardStats {
  projects: number
  messages: number
  unreadMessages: number
  teamMembers: number
  seoPages: number
  cmsPages: number
  services: number
}

interface RecentMessage {
  id: number
  name: string
  email: string
  subject: string
  created_at: string
}

interface RecentProject {
  id: number
  slug: string
  title: string
  category: string
  status: string
  created_at: string
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diff < 60) return "À l'instant"
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0, messages: 0, unreadMessages: 0,
    teamMembers: 0, seoPages: 0, cmsPages: 0, services: 0,
  })
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([])
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentServices, setRecentServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, messagesRes, teamRes, seoRes, cmsRes, servicesRes] = await Promise.all([
          fetchApi('/portfolio/projects/'),
          fetchApi('/contact/messages/'),
          fetchApi('/team/'),
          fetchApi('/seo/'),
          fetchApi('/pages/'),
          fetchApi('/services/'),
        ])

        const projects = projectsRes.results || projectsRes || []
        const messages = messagesRes.results || messagesRes || []
        const team = teamRes.results || teamRes || []
        const seo = seoRes.results || seoRes || []
        const cms = cmsRes.results || cmsRes || []
        const services = servicesRes.results || servicesRes || []

        setStats({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          projects: projects.filter((p: any) => p.status === 'published').length,
          messages: messages.length,
          unreadMessages: messages.length,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          teamMembers: team.filter((m: any) => m.is_active).length,
          seoPages: seo.length,
          cmsPages: cms.length,
          services: services.length,
        })

        setRecentMessages(messages.slice(0, 5))
        setRecentProjects(projects.slice(0, 5))
        setRecentServices(services.slice(0, 4))
      } catch {
        // Fallback
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const quickLinks = [
    { label: 'Nouveau projet', href: '/admin/projects', icon: FolderOpen, color: 'bg-primary text-white hover:bg-primary/90' },
    { label: 'Messages', href: '/admin/messages', icon: Mail, color: 'bg-white border border-gray-200 text-secondary hover:bg-gray-50' },
    { label: 'SEO', href: '/admin/seo', icon: Search, color: 'bg-white border border-gray-200 text-secondary hover:bg-gray-50' },
    { label: 'Pages CMS', href: '/admin/pages', icon: FileText, color: 'bg-white border border-gray-200 text-secondary hover:bg-gray-50' },
    { label: 'Services', href: '/admin/services', icon: Briefcase, color: 'bg-white border border-gray-200 text-secondary hover:bg-gray-50' },
    { label: 'Équipe', href: '/admin/team', icon: Users, color: 'bg-white border border-gray-200 text-secondary hover:bg-gray-50' },
    { label: 'Paramètres', href: '/admin/settings', icon: Settings, color: 'bg-white border border-gray-200 text-secondary hover:bg-gray-50' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-secondary tracking-tight">Tableau de bord</h1>
        <p className="text-muted text-sm mt-1">Vue d&apos;ensemble de votre activité</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: 'Projets publiés', value: stats.projects, icon: FolderOpen, color: 'text-primary', bg: 'bg-primary/10', href: '/admin/projects' },
          { label: 'Messages', value: stats.messages, icon: Mail, color: 'text-emerald-600', bg: 'bg-emerald-100', href: '/admin/messages' },
          { label: 'Services', value: stats.services, icon: Briefcase, color: 'text-amber-600', bg: 'bg-amber-100', href: '/admin/services' },
          { label: 'Équipe', value: stats.teamMembers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', href: '/admin/team' },
          { label: 'Pages CMS', value: stats.cmsPages, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100', href: '/admin/pages' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link href={stat.href} className="block bg-white p-5 rounded-2xl border border-gray-100 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <ArrowRight className="w-4 h-4 text-muted group-hover:text-secondary group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-2xl font-bold text-secondary">{stat.value}</p>
              <p className="text-muted text-xs mt-0.5">{stat.label}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Recent messages */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <Mail className="w-4 h-4 text-emerald-600" />
              </div>
              <h2 className="text-sm font-semibold text-secondary">Derniers messages</h2>
            </div>
            <Link href="/admin/messages" className="text-xs text-primary hover:underline">Voir tout</Link>
          </div>
          {recentMessages.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-8 h-8 text-muted/20 mx-auto mb-2" />
              <p className="text-muted text-sm">Aucun message</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentMessages.map((msg) => (
                <Link key={msg.id} href="/admin/messages" className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">{msg.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-secondary truncate">{msg.name}</p>
                      <span className="text-[10px] text-muted shrink-0">{timeAgo(msg.created_at)}</span>
                    </div>
                    <p className="text-xs text-muted truncate">{msg.subject}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent projects */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FolderOpen className="w-4 h-4 text-primary" />
              </div>
              <h2 className="text-sm font-semibold text-secondary">Derniers projets</h2>
            </div>
            <Link href="/admin/projects" className="text-xs text-primary hover:underline">Voir tout</Link>
          </div>
          {recentProjects.length === 0 ? (
            <div className="p-8 text-center">
              <FolderOpen className="w-8 h-8 text-muted/20 mx-auto mb-2" />
              <p className="text-muted text-sm">Aucun projet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentProjects.map((project) => (
                <Link key={project.id} href={`/portfolio/${project.slug}`} target="_blank" className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <span className={`w-2 h-2 rounded-full ${project.status === 'published' ? 'bg-primary' : 'bg-amber-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary truncate">{project.title}</p>
                    <p className="text-xs text-muted capitalize">{project.category}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-muted group-hover:text-secondary transition-colors opacity-0 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Services overview */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-amber-600" />
            </div>
            <h2 className="text-sm font-semibold text-secondary">Services</h2>
          </div>
          <Link href="/admin/services" className="text-xs text-primary hover:underline">Gérer</Link>
        </div>
        {recentServices.length === 0 ? (
          <div className="p-8 text-center">
            <Briefcase className="w-8 h-8 text-muted/20 mx-auto mb-2" />
            <p className="text-muted text-sm">Aucun service configuré</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-50">
            {recentServices.map((svc) => (
              <div key={svc.id} className="p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`w-2 h-2 rounded-full ${svc.category === 'architecture' ? 'bg-primary' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-semibold text-muted uppercase">{svc.category_display || svc.category}</span>
                </div>
                <p className="text-sm font-semibold text-secondary truncate">{svc.title}</p>
                <p className="text-xs text-muted line-clamp-2 mt-0.5">{svc.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEO Status */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8">
        <div className="flex items-center justify-between p-5 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Search className="w-4 h-4 text-purple-600" />
            </div>
            <h2 className="text-sm font-semibold text-secondary">État du SEO</h2>
          </div>
          <Link href="/admin/seo" className="text-xs text-primary hover:underline">Configurer</Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-gray-50">
          {[
            { page: 'Accueil', slug: 'home' },
            { page: 'Architecture', slug: 'architecture' },
            { page: 'Digital', slug: 'digital' },
            { page: 'Portfolio', slug: 'portfolio' },
            { page: 'À propos', slug: 'about' },
            { page: 'Contact', slug: 'contact' },
          ].map((p) => {
            const configured = stats.seoPages > 0
            return (
              <div key={p.slug} className="p-4 flex flex-col items-center gap-2">
                {configured ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                )}
                <span className="text-xs font-medium text-secondary">{p.page}</span>
                <span className={`text-[10px] ${configured ? 'text-primary' : 'text-amber-500'}`}>
                  {configured ? 'Configuré' : 'À faire'}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-secondary mb-4">Actions rapides</h2>
        <div className="flex flex-wrap gap-2">
          {quickLinks.map((link) => (
            <Link key={link.label} href={link.href} className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-all ${link.color}`}>
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, FolderOpen, Users, Mail, UserCircle, LogOut, Menu, X, ExternalLink, ChevronDown, Settings, FileText, Search, Briefcase } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import logo from '/logo.png'

const navItems = [
  { label: 'Tableau de bord', href: '/admin', icon: LayoutDashboard },
  { label: 'Projets', href: '/admin/projects', icon: FolderOpen },
  { label: 'Clients', href: '/admin/clients', icon: Users },
  { label: 'Messages', href: '/admin/messages', icon: Mail },
  { label: 'Services', href: '/admin/services', icon: Briefcase },
  { label: 'Équipe', href: '/admin/team', icon: UserCircle },
  { label: 'Pages CMS', href: '/admin/pages', icon: FileText },
  { label: 'SEO', href: '/admin/seo', icon: Search },
  { label: 'Paramètres', href: '/admin/settings', icon: Settings },
]

function UserAvatar({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }

  return (
    <div className={`${sizes[size]} rounded-full bg-primary flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  )
}

export default function DashboardLayoutClient({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!isLoading && !isAuthenticated && pathname !== '/admin/login') {
      router.push('/admin/login')
    }
  }, [isLoading, isAuthenticated, pathname, router])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'Admin'

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="h-screen bg-[#F8F9FA] flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed lg:relative top-0 left-0 h-screen w-72 bg-secondary z-50 flex flex-col shrink-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between mb-1">
            <img src="/logo.png" alt="NOUN" className="h-7 w-auto brightness-0 invert" />
            <button
              className="lg:hidden text-white/40 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-white/25 text-[10px] tracking-[0.25em] uppercase font-medium">Administration</p>
        </div>

        {/* User card */}
        <div className="px-4 mb-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <UserAvatar name={displayName} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{displayName}</p>
              <p className="text-white/35 text-[11px]">Administrateur</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          <p className="text-white/20 text-[10px] tracking-[0.2em] uppercase font-medium px-3 mb-2">Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white text-secondary shadow-lg shadow-white/5'
                    : 'text-white/45 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className={`w-[18px] h-[18px] ${isActive ? 'text-secondary' : ''}`} />
                {item.label}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary"
                  />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-4 pb-6 space-y-1">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-white/60 hover:bg-white/5 transition-colors"
          >
            <ExternalLink className="w-[18px] h-[18px]" />
            Voir le site
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/35 hover:text-red-400 hover:bg-red-500/5 w-full transition-colors"
          >
            <LogOut className="w-[18px] h-[18px]" />
            Déconnexion
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="shrink-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            <button
              className="lg:hidden text-secondary/50 hover:text-secondary p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex-1" />

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-secondary leading-tight">{displayName}</p>
                  <p className="text-[11px] text-muted">Administrateur</p>
                </div>
                <UserAvatar name={displayName} size="sm" />
                <ChevronDown className={`w-4 h-4 text-muted transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-50">
                      <p className="text-sm font-semibold text-secondary">{displayName}</p>
                      <p className="text-xs text-muted mt-0.5">{user?.email}</p>
                    </div>
                    <div className="p-2">
                      <a
                        href="/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-secondary/60 hover:text-secondary hover:bg-gray-50 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Voir le site
                      </a>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

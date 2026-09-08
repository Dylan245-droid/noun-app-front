'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowUpRight, LogIn, LayoutDashboard, LogOut, Globe } from 'lucide-react'
import { subscribeToHeaderTheme, type HeaderTheme } from '@/hooks/useHeaderTheme'
import { useAuth } from '@/context/AuthContext'
import { useTranslation } from 'react-i18next'
import { fetchApi } from '@/services/api'

const LANGUAGES = [
  { code: 'fr', label: 'FR', name: 'Français' },
  { code: 'en', label: 'EN', name: 'English' },
]

function UserAvatar({ name, size = 'sm' }: { name: string; size?: 'xs' | 'sm' }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const sizes = { xs: 'w-7 h-7 text-[10px]', sm: 'w-8 h-8 text-xs' }

  return (
    <div className={`${sizes[size]} rounded-full bg-primary flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  )
}

export default function Header() {
  const { t, i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<HeaderTheme>('dark')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [langMenuOpen, setLangMenuOpen] = useState(false)
  const [navPages, setNavPages] = useState<{title: string, nav_label?: string, slug: string}[]>([])
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const menuRef = useRef<HTMLDivElement>(null)
  const langRef = useRef<HTMLDivElement>(null)

  const isDark = theme === 'dark' && !scrolled

  const allNavLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.architecture'), href: '/architecture' },
    { label: t('nav.digital'), href: '/digital' },
    { label: t('nav.portfolio'), href: '/portfolio' },
    { label: t('nav.about'), href: '/about' },
    { label: t('nav.contact'), href: '/contact' },
    ...navPages.map((p) => ({ label: p.nav_label || p.title, href: `/p/${p.slug}` })),
  ]

  const displayName = user?.first_name && user?.last_name
    ? `${user.first_name} ${user.last_name}`
    : user?.username || 'Admin'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    fetchApi('/pages/nav_pages/')
      .then((data: any) => setNavPages(data))
      .catch(() => {})
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false)
    setScrolled(false)
    setUserMenuOpen(false)
    setLangMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const unsubscribe = subscribeToHeaderTheme((t) => setTheme(t))
    return unsubscribe
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    router.push('/')
  }

  const switchLang = (code: string) => {
    i18n.changeLanguage(code)
    setLangMenuOpen(false)
  }

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-white border-b border-border-light shadow-sm'
            : isDark
            ? 'bg-transparent'
            : 'bg-white'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group relative">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="NOUN CONCEPT"
                  className={`h-9 w-auto transition-all duration-500 group-hover:scale-105 ${
                    isDark && !scrolled ? 'brightness-0 invert' : ''
                  }`}
                />
              </div>
            </Link>

            {/* Desktop Nav - XL */}
            <div className="hidden xl:flex items-center gap-6">
              {allNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase transition-all duration-300 ${
                    pathname === link.href
                      ? isDark && !scrolled ? 'text-white' : 'text-secondary'
                      : isDark && !scrolled ? 'text-white/60 hover:text-white' : 'text-secondary/60 hover:text-secondary'
                  }`}
                >
                  {link.label}
                  {pathname === link.href && (
                    <motion.div layoutId="activeNav" className={`absolute -bottom-1 left-0 right-0 h-[2px] ${isDark && !scrolled ? 'bg-white' : 'bg-secondary'}`} />
                  )}
                </Link>
              ))}
            </div>

            {/* Desktop Nav - LG to XL */}
            <div className="hidden lg:flex xl:hidden items-center gap-0.5">
              {allNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-2 py-1 text-[9px] font-medium tracking-[0.05em] uppercase transition-all duration-300 ${
                    pathname === link.href
                      ? isDark ? 'text-white' : 'text-primary'
                      : isDark ? 'text-white/50 hover:text-white/90' : 'text-secondary/50 hover:text-secondary/90'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side: Lang + CTA + Auth */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language switcher */}
              <div className="relative" ref={langRef}>
                <button
                  onClick={() => setLangMenuOpen(!langMenuOpen)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all ${
                    isDark && !scrolled
                      ? 'text-white/60 hover:text-white'
                      : 'text-secondary/60 hover:text-secondary'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  {currentLang.label}
                </button>
                <AnimatePresence>
                  {langMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-40 bg-white rounded-none border border-border-light shadow-lg overflow-hidden"
                    >
                      {LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => switchLang(lang.code)}
                          className={`flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors ${
                            lang.code === currentLang.code
                              ? 'bg-surface text-secondary font-semibold'
                              : 'text-secondary/60 hover:bg-surface'
                          }`}
                        >
                          <span className="text-xs font-bold">{lang.label}</span>
                          <span>{lang.name}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href="/contact"
                className={`flex items-center gap-2 px-5 py-2.5 text-[9px] tracking-[0.15em] uppercase font-bold transition-all duration-300 group ${
                  isDark && !scrolled
                    ? 'bg-white text-secondary hover:bg-white/90'
                    : 'bg-secondary text-white hover:bg-secondary/90'
                }`}
              >
                <span>{t('nav.contact')}</span>
              </Link>

              {/* Divider */}
              <div className={`w-px h-6 ${isDark ? 'bg-white/10' : 'bg-secondary/10'}`} />

              {/* Auth */}
              {isAuthenticated ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-2 pl-1 pr-1 py-1 rounded-full transition-colors ${
                      isDark
                        ? 'hover:bg-white/10'
                        : 'hover:bg-secondary/5'
                    }`}
                  >
                    <UserAvatar name={displayName} size="xs" />
                    <span className={`text-xs font-medium ${isDark ? 'text-white/70' : 'text-secondary/70'}`}>
                      {user?.first_name || user?.username || 'Admin'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden"
                      >
                        <div className="p-3 border-b border-gray-50">
                          <p className="text-sm font-semibold text-secondary">{displayName}</p>
                          <p className="text-xs text-muted mt-0.5">{user?.email}</p>
                        </div>
                        <div className="p-1.5">
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-secondary/60 hover:text-secondary hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 w-full transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            {i18n.language === 'fr' ? 'Déconnexion' : 'Logout'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/admin/login"
                  className={`flex items-center gap-2 px-2 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                    isDark
                      ? 'text-white/40 hover:text-white hover:bg-white/10'
                      : 'text-secondary/40 hover:text-secondary hover:bg-secondary/5'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              className={`lg:hidden p-2 transition-colors ${
                isDark
                  ? 'text-white hover:bg-white/10'
                  : 'text-secondary hover:bg-black/5'
              }`}
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <div className="w-6 h-6 relative flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className={`fixed inset-0 z-40 ${
              isDark ? 'bg-secondary/98' : 'bg-white/98'
            } backdrop-blur-xl`}
          >
            <div className="flex flex-col h-full pt-24 px-6">
              <div className="flex-1 flex flex-col justify-center">
              {allNavLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block py-4 text-3xl font-bold tracking-tight transition-colors ${
                        pathname === link.href
                          ? isDark
                            ? 'text-white'
                            : 'text-primary'
                          : isDark
                          ? 'text-white/30 hover:text-white/70'
                          : 'text-secondary/30 hover:text-secondary/70'
                      }`}
                    >
                      <span className="text-[10px] tracking-[0.3em] uppercase font-normal mr-4 opacity-40">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {link.label}
                    </Link>
                    <div className={`h-[1px] ${isDark ? 'bg-white/5' : 'bg-secondary/5'}`} />
                  </motion.div>
                ))}

                {/* Mobile language switcher */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className="flex items-center gap-2 mt-6 mb-2"
                >
                  <Globe className={`w-4 h-4 ${isDark ? 'text-white/30' : 'text-secondary/30'}`} />
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLang(lang.code)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                        lang.code === currentLang.code
                          ? isDark
                            ? 'bg-white/10 text-white'
                            : 'bg-secondary/10 text-secondary'
                          : isDark
                          ? 'text-white/30 hover:text-white/60'
                          : 'text-secondary/30 hover:text-secondary/60'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </motion.div>

                {/* Mobile auth */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                  className={`mt-4 pt-6 border-t ${isDark ? 'border-white/5' : 'border-secondary/5'}`}
                >
                  {isAuthenticated ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar name={displayName} />
                        <div>
                          <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-secondary'}`}>{displayName}</p>
                          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-secondary/40'}`}>{user?.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-colors ${
                            isDark
                              ? 'bg-white/5 text-white hover:bg-white/10'
                              : 'bg-secondary/5 text-secondary hover:bg-secondary/10'
                          }`}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <button
                          onClick={() => { handleLogout(); setIsOpen(false) }}
                          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-red-500 bg-red-500/5 hover:bg-red-500/10 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          {i18n.language === 'fr' ? 'Déconnexion' : 'Logout'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Link
                      href="/admin/login"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium transition-colors ${
                        isDark
                          ? 'bg-white/5 text-white hover:bg-white/10'
                          : 'bg-secondary/5 text-secondary hover:bg-secondary/10'
                      }`}
                    >
                      <LogIn className="w-4 h-4" />
                      {i18n.language === 'fr' ? 'Accéder à l\'administration' : 'Access admin'}
                    </Link>
                  )}
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`pb-8 ${isDark ? 'text-white/30' : 'text-secondary/30'}`}
              >
                <p className="text-xs tracking-[0.2em] uppercase">contact@nounconcept.com</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}



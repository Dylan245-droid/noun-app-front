'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

interface PageData {
  id: number
  title: string
  slug: string
  subtitle: string
  hero_image: string | null
  content: string
  meta_title: string
  meta_description: string
  noindex: boolean
  created_at: string
  updated_at: string
}

interface DynamicPageViewClientProps {
  initialPage: PageData | null
}

export default function DynamicPageViewClient({ initialPage }: DynamicPageViewClientProps) {
  const [page] = useState<PageData | null>(initialPage)

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">Page introuvable</h1>
          <Link href="/" className="text-primary hover:underline">Retour à l&apos;accueil</Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero */}
      {page.hero_image && (
        <div className="relative h-[50vh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={page.hero_image} alt={page.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-16">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2"
            >
              {page.title}
            </motion.h1>
            {page.subtitle && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg text-white/80"
              >
                {page.subtitle}
              </motion.p>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!page.hero_image && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-8"
          >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-secondary mb-2">{page.title}</h1>
            {page.subtitle && <p className="text-lg text-muted">{page.subtitle}</p>}
          </motion.div>
        )}

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="prose prose-lg max-w-none prose-headings:text-secondary prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br />') }}
        />

        <div className="mt-12 pt-6 border-t border-gray-100">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted hover:text-secondary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

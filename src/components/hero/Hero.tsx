'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface HeroProps {
  image: string
  label?: string
  title: string
  subtitle?: string
  showGrid?: boolean
  showScroll?: boolean
  scrollLabel?: string
  height?: string
  children?: React.ReactNode
}

export function Hero({
  image,
  label,
  title,
  subtitle,
  showGrid = false,
  showScroll = true,
  scrollLabel = 'SCROLL',
  height = 'min-h-screen',
  children,
}: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  const imageScale = useTransform(scrollYProgress, [0, 1], [1, 1.15])
  const imageOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const contentY = useTransform(scrollYProgress, [0, 0.5], [0, 80])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])

  return (
    <section ref={heroRef} className={`relative ${height} flex items-end bg-secondary overflow-hidden`}>
      {/* Image background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <motion.img
          src={image}
          alt=""
          className="w-full h-full object-cover"
          style={{ scale: imageScale, opacity: imageOpacity }}
        />
      </motion.div>

      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/70 to-secondary/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
      />

      {/* Dark overlay */}
      <motion.div
        className="absolute inset-0 bg-black/40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
      />

      {/* Grid pattern */}
      {showGrid && (
        <motion.div
          className="absolute inset-0 opacity-[0.03] pointer-events-none z-[1]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.03 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '120px 120px',
          }}
        />
      )}

      {/* Text content */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full pb-48 lg:pb-64"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl">
            {label && (
              <motion.div
                className="flex items-center gap-3 mb-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="w-8 h-[1px] bg-white/40" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-white/50 font-medium">
                  {label}
                </span>
              </motion.div>
            )}

            <motion.h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[0.9] mb-6 whitespace-pre-line"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {title}
            </motion.h1>

            {subtitle && (
              <motion.p
                className="text-white/40 max-w-md text-sm leading-relaxed tracking-wide"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.85, ease: [0.25, 0.1, 0.25, 1] }}
              >
                {subtitle}
              </motion.p>
            )}

            {children}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      {showScroll && (
        <motion.div
          className="absolute bottom-8 right-8 lg:right-16 flex items-center gap-3 z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/30">{scrollLabel}</span>
          <div className="w-[1px] h-10 bg-white/20 relative">
            <motion.div
              className="absolute top-0 w-[1px] h-3 bg-white/60"
              animate={{ height: [4, 16, 4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </section>
  )
}

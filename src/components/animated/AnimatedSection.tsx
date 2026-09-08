import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  distance?: number
  duration?: number
}

export function AnimatedSection({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 60,
  duration = 0.8,
}: AnimatedSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.85', 'start 0.25'],
  })

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1])
  const upY = useTransform(scrollYProgress, [0, 1], [distance, 0])
  const downY = useTransform(scrollYProgress, [0, 1], [-distance, 0])
  const finalY = direction === 'down' ? downY : (direction === 'up' ? upY : 0)
  const x = useTransform(scrollYProgress, [0, 1], [direction === 'left' ? distance : direction === 'right' ? -distance : 0, 0])

  return (
    <motion.div
      ref={ref}
      style={{
        opacity,
        y: finalY,
        x,
      }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

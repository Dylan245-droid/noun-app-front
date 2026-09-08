'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useSpring } from 'framer-motion'

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isClicking, setIsClicking] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 }
  const x = useSpring(0, springConfig)
  const y = useSpring(0, springConfig)
  const scale = useSpring(1, springConfig)

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      setIsVisible(true)
    }

    const handleHover = () => setIsHovering(true)
    const handleHoverOut = () => setIsHovering(false)
    const handleMouseDown = () => setIsClicking(true)
    const handleMouseUp = () => setIsClicking(false)
    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('mouseenter', handleMouseEnter)

    const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select')
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleHover)
      el.addEventListener('mouseleave', handleHoverOut)
    })

    const observer = new MutationObserver(() => {
      const elements = document.querySelectorAll('a, button, [role="button"], input, textarea, select')
      elements.forEach((el) => {
        el.removeEventListener('mouseenter', handleHover)
        el.removeEventListener('mouseleave', handleHoverOut)
        el.addEventListener('mouseenter', handleHover)
        el.addEventListener('mouseleave', handleHoverOut)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      window.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('mouseenter', handleMouseEnter)
      observer.disconnect()
    }
  }, [x, y])

  useEffect(() => {
    scale.set(isHovering ? 2.5 : isClicking ? 0.8 : 1)
  }, [isHovering, isClicking, scale])

  if (typeof window !== 'undefined' && 'ontouchstart' in window) return null

  return (
    <motion.div
      ref={cursorRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x,
        y,
        width: 18,
        height: 18,
        borderRadius: '50%',
        backgroundColor: isHovering ? 'rgba(30, 58, 95, 0.15)' : 'rgba(30, 58, 95, 0.8)',
        border: isHovering ? '2px solid rgba(30, 58, 95, 0.3)' : 'none',
        zIndex: 99999,
        pointerEvents: 'none',
        mixBlendMode: isHovering ? 'normal' : 'difference',
        opacity: isVisible ? 1 : 0,
        scale,
        transition: 'background-color 0.2s, border 0.2s',
      }}
    />
  )
}

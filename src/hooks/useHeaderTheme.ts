'use client'

import { useEffect, useRef } from 'react'

export type HeaderTheme = 'dark' | 'light'

let currentTheme: HeaderTheme = 'dark'
const listeners = new Set<(theme: HeaderTheme) => void>()

export function setHeaderTheme(theme: HeaderTheme) {
  currentTheme = theme
  listeners.forEach((fn) => fn(theme))
}

export function getHeaderTheme() {
  return currentTheme
}

export function useHeaderTheme(theme: HeaderTheme) {
  const themeRef = useRef(theme)

  useEffect(() => {
    themeRef.current = theme
    setHeaderTheme(theme)
    return () => {
      // Reset to dark when unmounting (default for home)
      if (currentTheme === theme) {
        setHeaderTheme('dark')
      }
    }
  }, [theme])
}

export function subscribeToHeaderTheme(listener: (theme: HeaderTheme) => void) {
  listeners.add(listener)
  listener(currentTheme)
  return () => {
    listeners.delete(listener)
  }
}

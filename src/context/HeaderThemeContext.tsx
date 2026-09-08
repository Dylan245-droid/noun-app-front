import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

type HeaderTheme = 'dark' | 'light'

interface HeaderThemeContextType {
  theme: HeaderTheme
  setTheme: (theme: HeaderTheme) => void
}

const HeaderThemeContext = createContext<HeaderThemeContextType>({
  theme: 'dark',
  setTheme: () => {},
})

export function HeaderThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<HeaderTheme>('dark')
  const setThemeSafe = useCallback((t: HeaderTheme) => setTheme(t), [])
  return (
    <HeaderThemeContext.Provider value={{ theme, setTheme: setThemeSafe }}>
      {children}
    </HeaderThemeContext.Provider>
  )
}

export function useHeaderTheme() {
  return useContext(HeaderThemeContext)
}

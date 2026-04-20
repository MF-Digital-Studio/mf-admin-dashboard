'use client'

import * as React from 'react'

type Theme = 'light' | 'dark' | 'system'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  enableSystem?: boolean
  enableColorScheme?: boolean
  storageKey?: string
  attribute?: 'class' | string
}

type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: 'light' | 'dark'
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') {
    return 'dark'
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme({
  attribute,
  resolvedTheme,
  enableColorScheme,
}: {
  attribute: 'class' | string
  resolvedTheme: 'light' | 'dark'
  enableColorScheme: boolean
}) {
  const root = document.documentElement
  if (attribute === 'class') {
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
  } else {
    root.setAttribute(attribute, resolvedTheme)
  }

  if (enableColorScheme) {
    root.style.colorScheme = resolvedTheme
  }
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  enableColorScheme = true,
  storageKey = 'theme',
  attribute = 'class',
}: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [resolvedTheme, setResolvedTheme] = React.useState<'light' | 'dark'>('dark')

  React.useEffect(() => {
    const stored = window.localStorage.getItem(storageKey) as Theme | null
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setThemeState(stored)
      return
    }
    setThemeState(defaultTheme)
  }, [defaultTheme, storageKey])

  React.useEffect(() => {
    const effectiveTheme = theme === 'system'
      ? (enableSystem ? getSystemTheme() : 'dark')
      : theme

    setResolvedTheme(effectiveTheme)
    applyTheme({
      attribute,
      resolvedTheme: effectiveTheme,
      enableColorScheme,
    })

    if (theme === 'system' && enableSystem) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => {
        const systemTheme = getSystemTheme()
        setResolvedTheme(systemTheme)
        applyTheme({
          attribute,
          resolvedTheme: systemTheme,
          enableColorScheme,
        })
      }
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }

    return
  }, [attribute, enableColorScheme, enableSystem, theme])

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    window.localStorage.setItem(storageKey, nextTheme)
  }, [storageKey])

  const value = React.useMemo<ThemeContextValue>(() => ({
    theme,
    setTheme,
    resolvedTheme,
  }), [resolvedTheme, setTheme, theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

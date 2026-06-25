import { useCallback, useState } from 'react'

export type Theme = 'light' | 'dark'

/** Reads the theme the no-FOUC bootstrap script in index.html set on <html>. */
function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === 'dark' ? 'light' : 'dark'
      document.documentElement.dataset.theme = next
      try {
        localStorage.setItem('theme', next)
      } catch {
        // storage unavailable (e.g. private mode); theme still applies this session
      }
      return next
    })
  }, [])

  return { theme, toggleTheme }
}

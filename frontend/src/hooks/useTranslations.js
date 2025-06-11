'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export function useTranslations() {
  const pathname = usePathname()
  const [translations, setTranslations] = useState({})
  const [currentLocale, setCurrentLocale] = useState('uk')

  useEffect(() => {
    // Extract locale from pathname (should be like /uk/... or /en/...)
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'uk'
    setCurrentLocale(locale)
    
    // Load translations
    const loadTranslations = async () => {
      try {
        const response = await fetch(`/locales/${locale}/common.json`)
        if (response.ok) {
          const data = await response.json()
          setTranslations(data)
        } else {
          // Fallback to Ukrainian
          const fallbackResponse = await fetch(`/locales/uk/common.json`)
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            setTranslations(fallbackData)
          }
        }
      } catch (error) {
        console.error('Failed to load translations:', error)
        // Use empty object as fallback
        setTranslations({})
      }
    }

    loadTranslations()
  }, [pathname])

  const t = (key) => {
    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    return value || key
  }

  return { t, currentLocale, translations }
} 
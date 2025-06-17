// frontend/src/components/TranslationPreloader.jsx
'use client'

import { useEffect } from 'react'
import { preloadTranslations } from '@/hooks/useTranslations'

export default function TranslationPreloader({ locale = 'uk', enabled = true }) {
  useEffect(() => {
    if (!enabled) return
    
    // Попередньо завантажуємо переклади для поточної локалі
    preloadTranslations(locale, true)
    
    // Попередньо завантажуємо для альтернативної локалі
    const altLocale = locale === 'uk' ? 'en' : 'uk'
    setTimeout(() => {
      preloadTranslations(altLocale, true)
    }, 1000) // Затримка щоб не перевантажити сервер
    
  }, [locale, enabled])

  return null // Цей компонент нічого не рендерить
}

// Використання в layout або app:
/*
// frontend/src/app/layout.js або в RootLayout.jsx

import TranslationPreloader from '@/components/TranslationPreloader'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <TranslationPreloader />
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  )
}
*/
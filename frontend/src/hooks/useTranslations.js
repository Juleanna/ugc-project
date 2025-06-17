'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import apiService from '@/lib/api'

export function useTranslations(options = {}) {
  const {
    fallbackToStatic = true,  // Чи використовувати статичні файли як fallback
    useBackend = true,        // Чи завантажувати переклади з бекенду
    cacheTime = 1000 * 60 * 15, // Час кешування (15 хвилин)
  } = options

  const pathname = usePathname()
  const [translations, setTranslations] = useState({})
  const [currentLocale, setCurrentLocale] = useState('uk')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Кеш для перекладів
  const [translationsCache, setTranslationsCache] = useState(new Map())

  useEffect(() => {
    // Витягуємо локаль з pathname
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'uk'
    setCurrentLocale(locale)
    
    loadTranslations(locale)
  }, [pathname, useBackend, fallbackToStatic])

  const loadTranslations = useCallback(async (locale) => {
    try {
      setLoading(true)
      setError(null)

      // Перевіряємо кеш
      const cacheKey = `${locale}_${useBackend ? 'backend' : 'static'}`
      const cached = translationsCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        setTranslations(cached.data)
        setLoading(false)
        return
      }

      let translationsData = {}

      if (useBackend) {
        try {
          // Спочатку намагаємося завантажити з бекенду
          const backendTranslations = await apiService.getAllTranslations(locale)
          translationsData = backendTranslations.translations || {}
          
          console.log(`Завантажено ${Object.keys(translationsData).length} перекладів з бекенду для ${locale}`)
          
        } catch (backendError) {
          console.warn('Помилка завантаження з бекенду:', backendError)
          
          if (fallbackToStatic) {
            // Fallback до статичних файлів
            translationsData = await loadStaticTranslations(locale)
          }
        }
      } else {
        // Завантажуємо тільки статичні файли
        translationsData = await loadStaticTranslations(locale)
      }

      // Кешуємо результат
      const newCache = new Map(translationsCache)
      newCache.set(cacheKey, {
        data: translationsData,
        timestamp: Date.now()
      })
      setTranslationsCache(newCache)

      setTranslations(translationsData)
      
    } catch (error) {
      console.error('Помилка завантаження перекладів:', error)
      setError(error.message)
      
      // У випадку помилки намагаємося завантажити з статичних файлів
      if (useBackend && fallbackToStatic) {
        try {
          const fallbackTranslations = await loadStaticTranslations(locale)
          setTranslations(fallbackTranslations)
        } catch (fallbackError) {
          console.error('Помилка завантаження fallback перекладів:', fallbackError)
          setTranslations({})
        }
      }
    } finally {
      setLoading(false)
    }
  }, [useBackend, fallbackToStatic, cacheTime, translationsCache])

  const loadStaticTranslations = async (locale) => {
    try {
      const response = await fetch(`/locales/${locale}/common.json`)
      if (response.ok) {
        const data = await response.json()
        console.log(`Завантажено ${Object.keys(data).length} статичних перекладів для ${locale}`)
        return data
      } else {
        // Fallback до української мови
        if (locale !== 'uk') {
          const fallbackResponse = await fetch(`/locales/uk/common.json`)
          if (fallbackResponse.ok) {
            const fallbackData = await fallbackResponse.json()
            console.log('Використано fallback до української мови')
            return fallbackData
          }
        }
        return {}
      }
    } catch (error) {
      console.error('Помилка завантаження статичних перекладів:', error)
      return {}
    }
  }

  const t = useCallback((key, fallback = null) => {
    if (!key) return fallback || key

    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    // Якщо переклад не знайдено, повертаємо fallback або ключ
    if (value === undefined) {
      return fallback || key
    }
    
    return value
  }, [translations])

  // Функція для очищення кешу
  const clearCache = useCallback(() => {
    setTranslationsCache(new Map())
  }, [])

  // Функція для примусового перезавантаження перекладів
  const reloadTranslations = useCallback(() => {
    clearCache()
    loadTranslations(currentLocale)
  }, [currentLocale, loadTranslations, clearCache])

  return { 
    t, 
    currentLocale, 
    translations, 
    loading, 
    error,
    reloadTranslations,
    clearCache
  }
}

// Хук для роботи тільки з бекенд перекладами
export function useBackendTranslations(locale = null) {
  return useTranslations({
    useBackend: true,
    fallbackToStatic: false
  })
}

// Хук для роботи тільки з статичними перекладами
export function useStaticTranslations(locale = null) {
  return useTranslations({
    useBackend: false,
    fallbackToStatic: true
  })
}
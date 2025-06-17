// frontend/src/hooks/useTranslations.js
'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { usePathname } from 'next/navigation'
import apiService from '@/lib/api'

// Глобальний кеш та стан для запобігання дублюванню запитів
const globalCache = new Map()
const activeRequests = new Map()
const requestQueue = new Map()

// Debounce функція
function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function useTranslations(options = {}) {
  const {
    fallbackToStatic = true,
    useBackend = true,
    cacheTime = 1000 * 60 * 15, // 15 хвилин
    debounceTime = 300, // 300ms debounce
  } = options

  const pathname = usePathname()
  const [translations, setTranslations] = useState({})
  const [currentLocale, setCurrentLocale] = useState('uk')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)

  // Cleanup при unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // Витягуємо локаль з pathname
  useEffect(() => {
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'uk'
    
    if (locale !== currentLocale) {
      setCurrentLocale(locale)
    }
  }, [pathname, currentLocale])

  // Debounced function для завантаження перекладів
  const debouncedLoadTranslations = useCallback(
    debounce((locale) => {
      if (!mountedRef.current || loadingRef.current) return
      loadTranslationsWithDeduplication(locale)
    }, debounceTime),
    [useBackend, fallbackToStatic, cacheTime]
  )

  // Завантажуємо переклади при зміні локалі
  useEffect(() => {
    debouncedLoadTranslations(currentLocale)
  }, [currentLocale, debouncedLoadTranslations])

  const loadTranslationsWithDeduplication = async (locale) => {
    if (!mountedRef.current) return
    
    const cacheKey = `${locale}_${useBackend ? 'backend' : 'static'}`
    
    // Перевіряємо глобальний кеш
    const cached = globalCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      if (mountedRef.current) {
        setTranslations(cached.data)
        setLoading(false)
        setError(null)
      }
      return
    }

    // Перевіряємо чи вже є активний запит
    if (activeRequests.has(cacheKey)) {
      // Додаємо себе до черги очікування
      return new Promise((resolve) => {
        if (!requestQueue.has(cacheKey)) {
          requestQueue.set(cacheKey, [])
        }
        requestQueue.get(cacheKey).push({ resolve, component: mountedRef })
      })
    }

    // Позначаємо що запит активний
    activeRequests.set(cacheKey, true)
    loadingRef.current = true
    
    if (mountedRef.current) {
      setLoading(true)
      setError(null)
    }

    try {
      let translationsData = {}

      if (useBackend) {
        try {
          // Додаємо затримку між запитами
          await new Promise(resolve => setTimeout(resolve, Math.random() * 200))
          
          const backendResponse = await apiService.getAllTranslations(locale)
          translationsData = backendResponse.translations || {}
          
          console.log(`✅ Завантажено ${Object.keys(translationsData).length} перекладів з бекенду для ${locale}`)
          
        } catch (backendError) {
          console.warn('⚠️ Помилка підключення до бекенду:', backendError.message)
          
          if (fallbackToStatic) {
            translationsData = await loadStaticTranslations(locale)
          } else {
            throw backendError
          }
        }
      } else {
        translationsData = await loadStaticTranslations(locale)
      }

      // Зберігаємо в глобальний кеш
      globalCache.set(cacheKey, {
        data: translationsData,
        timestamp: Date.now()
      })

      // Оновлюємо стан якщо компонент ще змонтований
      if (mountedRef.current) {
        setTranslations(translationsData)
        setLoading(false)
        setError(null)
      }

      // Сповіщаємо всіх в черзі
      const queue = requestQueue.get(cacheKey) || []
      queue.forEach(({ resolve, component }) => {
        if (component.current) {
          resolve(translationsData)
        }
      })
      requestQueue.delete(cacheKey)

    } catch (error) {
      console.error('❌ Критична помилка завантаження перекладів:', error)
      
      if (mountedRef.current) {
        setError(error.message)
        setLoading(false)
        
        // Fallback до статичних файлів при помилці
        if (useBackend && fallbackToStatic) {
          try {
            const fallbackTranslations = await loadStaticTranslations(locale)
            setTranslations(fallbackTranslations)
          } catch (fallbackError) {
            console.error('Помилка fallback перекладів:', fallbackError)
            setTranslations({})
          }
        } else {
          setTranslations({})
        }
      }

      // Сповіщаємо чергу про помилку
      const queue = requestQueue.get(cacheKey) || []
      queue.forEach(({ resolve, component }) => {
        if (component.current) {
          resolve({})
        }
      })
      requestQueue.delete(cacheKey)
      
    } finally {
      // Видаляємо активний запит
      activeRequests.delete(cacheKey)
      loadingRef.current = false
    }
  }

  const loadStaticTranslations = async (locale) => {
    try {
      const response = await fetch(`/locales/${locale}/common.json`)
      if (response.ok) {
        const data = await response.json()
        console.log(`📁 Завантажено ${Object.keys(data).length} статичних перекладів для ${locale}`)
        return data
      } else if (locale !== 'uk') {
        const fallbackResponse = await fetch(`/locales/uk/common.json`)
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          console.log('🔄 Використано fallback до української мови')
          return fallbackData
        }
      }
      return {}
    } catch (error) {
      console.error('Помилка завантаження статичних файлів:', error)
      return {}
    }
  }

  const t = useCallback((key, fallback = null, interpolation = {}) => {
    if (!key) return fallback || key

    const keys = key.split('.')
    let value = translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    if (value === undefined) {
      return fallback || key
    }

    // Підтримка інтерполяції
    if (typeof value === 'string' && Object.keys(interpolation).length > 0) {
      return Object.keys(interpolation).reduce((result, key) => {
        return result.replace(new RegExp(`{{${key}}}`, 'g'), interpolation[key])
      }, value)
    }
    
    return value
  }, [translations])

  // Функція для примусового перезавантаження
  const reloadTranslations = useCallback(() => {
    const cacheKey = `${currentLocale}_${useBackend ? 'backend' : 'static'}`
    globalCache.delete(cacheKey)
    activeRequests.delete(cacheKey)
    loadTranslationsWithDeduplication(currentLocale)
  }, [currentLocale, useBackend, loadTranslationsWithDeduplication])

  // Функція для очищення кешу
  const clearCache = useCallback(() => {
    globalCache.clear()
    activeRequests.clear()
    requestQueue.clear()
  }, [])

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
export function useBackendTranslations() {
  return useTranslations({
    useBackend: true,
    fallbackToStatic: false
  })
}

// Хук для роботи тільки з статичними перекладами
export function useStaticTranslations() {
  return useTranslations({
    useBackend: false,
    fallbackToStatic: true
  })
}

// Функція для попереднього завантаження перекладів
export async function preloadTranslations(locale, useBackend = true) {
  const cacheKey = `${locale}_${useBackend ? 'backend' : 'static'}`
  
  if (!globalCache.has(cacheKey) && !activeRequests.has(cacheKey)) {
    try {
      let translationsData = {}
      
      if (useBackend) {
        const backendResponse = await apiService.getAllTranslations(locale)
        translationsData = backendResponse.translations || {}
      } else {
        const response = await fetch(`/locales/${locale}/common.json`)
        if (response.ok) {
          translationsData = await response.json()
        }
      }
      
      globalCache.set(cacheKey, {
        data: translationsData,
        timestamp: Date.now()
      })
      
      console.log(`🚀 Попередньо завантажено переклади для ${locale}`)
      
    } catch (error) {
      console.error(`Помилка попереднього завантаження для ${locale}:`, error)
    }
  }
}
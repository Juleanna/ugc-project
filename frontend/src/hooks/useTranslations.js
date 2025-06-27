// frontend/src/hooks/useTranslations.js - ВИПРАВЛЕНА ВЕРСІЯ БЕЗ ГІДРАТАЦІЙНИХ ПРОБЛЕМ
'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import apiService from '@/lib/api'

// ============================= УТИЛІТИ =============================

const debounce = (func, wait) => {
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

// Хук для перевірки клієнтського середовища
function useIsClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

// ============================= КЕШ МЕНЕДЖЕР =============================

class TranslationsCacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.maxSize = 50
    this.defaultTTL = 1000 * 60 * 15 // 15 хвилин
  }

  set(key, value, ttl = this.defaultTTL) {
    if (this.memoryCache.size >= this.maxSize) {
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
    }

    this.memoryCache.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key) {
    const cached = this.memoryCache.get(key)
    
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.memoryCache.delete(key)
      return null
    }
    
    return cached.data
  }

  delete(key) {
    this.memoryCache.delete(key)
  }

  clear() {
    this.memoryCache.clear()
  }

  getStats() {
    return {
      size: this.memoryCache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.memoryCache.keys())
    }
  }
}

const cacheManager = new TranslationsCacheManager()

// ============================= ГОЛОВНИЙ ХУК =============================

export function useTranslations(options = {}) {
  const {
    fallbackToStatic = true,
    useBackend = true,
    namespace = null,
    cacheTime = 1000 * 60 * 15,
    debounceTime = 300,
  } = options

  const isClient = useIsClient()
  const pathname = usePathname()
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)

  // ============================= СТАН =============================

  const [state, setState] = useState(() => ({
    translations: {},
    currentLocale: null,
    loading: false,
    error: null,
    source: null,
    lastUpdated: null,
  }))

  // ============================= ВИЗНАЧЕННЯ ПОТОЧНОЇ ЛОКАЛІ =============================

  const currentLocale = useMemo(() => {
    if (!isClient || !pathname) return 'uk' // Фолбек для SSR
    
    const segments = pathname.split('/').filter(Boolean)
    const localeFromPath = segments[0]
    
    return ['uk', 'en'].includes(localeFromPath) ? localeFromPath : 'uk'
  }, [pathname, isClient])

  // ============================= ЗАВАНТАЖЕННЯ СТАТИЧНИХ ПЕРЕКЛАДІВ =============================

  const loadStaticTranslations = useCallback(async (locale) => {
    try {
      const fileName = namespace ? `${namespace}.json` : 'common.json'
      const response = await fetch(`/locales/${locale}/${fileName}`)
      
      if (!response.ok) {
        throw new Error(`Статичні переклади не знайдено: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.warn(`Не вдалося завантажити статичні переклади для ${locale}:`, error)
      return {}
    }
  }, [namespace])

  // ============================= ГОЛОВНА ФУНКЦІЯ ЗАВАНТАЖЕННЯ =============================

  const loadTranslations = useCallback(async (locale) => {
    if (loadingRef.current || !isClient) return state.translations

    const cacheKey = `${locale}_${useBackend ? 'backend' : 'static'}_${namespace || 'all'}`
    
    // Перевіряємо кеш
    const cached = cacheManager.get(cacheKey)
    if (cached) {
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          translations: cached,
          currentLocale: locale,
          source: 'cache',
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        }))
      }
      return cached
    }

    loadingRef.current = true

    if (mountedRef.current) {
      setState(prev => ({
        ...prev,
        loading: true,
        error: null,
        currentLocale: locale
      }))
    }

    try {
      let translationsData = {}
      let sourceType = 'static'

      if (useBackend) {
        try {
          const params = new URLSearchParams()
          if (namespace) params.append('namespace', namespace)
          params.append('source', 'all')
          
          const response = await apiService.get(`/translations/${locale}/?${params}`)
          translationsData = response.translations || {}
          sourceType = 'backend'
        } catch (backendError) {
          console.warn('Backend переклади недоступні, використовуємо статичні:', backendError)
          
          if (fallbackToStatic) {
            translationsData = await loadStaticTranslations(locale)
            sourceType = 'static-fallback'
          }
        }
      } else {
        translationsData = await loadStaticTranslations(locale)
      }

      // Зберігаємо в кеш
      cacheManager.set(cacheKey, translationsData, cacheTime)

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          translations: translationsData,
          currentLocale: locale,
          source: sourceType,
          loading: false,
          error: null,
          lastUpdated: new Date().toISOString()
        }))
      }

      return translationsData

    } catch (error) {
      console.error('❌ Критична помилка завантаження перекладів:', error)
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
          translations: {},
          currentLocale: locale,
          lastUpdated: new Date().toISOString()
        }))
      }

      return {}
    } finally {
      loadingRef.current = false
    }
  }, [useBackend, fallbackToStatic, namespace, cacheTime, loadStaticTranslations, isClient, state.translations])

  // ============================= DEBOUNCED ЗАВАНТАЖЕННЯ =============================

  const debouncedLoadTranslations = useMemo(
    () => debounce(loadTranslations, debounceTime),
    [loadTranslations, debounceTime]
  )

  // ============================= ЕФЕКТИ =============================

  // Завантаження при зміні локалі
  useEffect(() => {
    if (!isClient) return

    if (currentLocale && currentLocale !== state.currentLocale) {
      debouncedLoadTranslations(currentLocale)
    }
  }, [currentLocale, debouncedLoadTranslations, state.currentLocale, isClient])

  // Очищення при unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // ============================= ФУНКЦІЯ ПЕРЕКЛАДУ =============================

  const t = useCallback((key, fallback = null, interpolation = {}) => {
    if (!key) return fallback || key

    const keys = key.split('.')
    let value = state.translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    if (value === undefined) {
      return fallback || key
    }

    // Інтерполяція змінних
    if (typeof value === 'string' && Object.keys(interpolation).length > 0) {
      return Object.keys(interpolation).reduce((result, key) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
        return result.replace(regex, interpolation[key])
      }, value)
    }
    
    return value
  }, [state.translations])

  // ============================= ДОДАТКОВІ ФУНКЦІЇ =============================

  const reloadTranslations = useCallback((force = false) => {
    if (!isClient) return
    
    if (force) {
      const cacheKey = `${state.currentLocale}_${useBackend ? 'backend' : 'static'}_${namespace || 'all'}`
      cacheManager.delete(cacheKey)
    }
    loadTranslations(state.currentLocale)
  }, [loadTranslations, state.currentLocale, useBackend, namespace, isClient])

  const preloadLocale = useCallback(async (locale) => {
    if (!isClient) return {}
    return await loadTranslations(locale)
  }, [loadTranslations, isClient])

  const clearCache = useCallback(() => {
    cacheManager.clear()
    if (mountedRef.current) {
      setState(prev => ({ ...prev, translations: {}, source: null }))
    }
  }, [])

  const getCacheStats = useCallback(() => {
    return cacheManager.getStats()
  }, [])

  // Функція для перевірки чи переклад існує
  const hasTranslation = useCallback((key) => {
    const keys = key.split('.')
    let value = state.translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) return false
    }
    
    return true
  }, [state.translations])

  // ============================= ПОВЕРНЕННЯ =============================

  return {
    // Основні функції
    t,
    hasTranslation,
    
    // Стан
    translations: state.translations,
    currentLocale: currentLocale || 'uk', // Завжди повертаємо валідну локаль
    loading: state.loading,
    error: state.error,
    source: state.source,
    lastUpdated: state.lastUpdated,
    
    // Управління
    reloadTranslations,
    preloadLocale,
    clearCache,
    getCacheStats,
    
    // Мета-дані
    isFromCache: state.source === 'cache',
    isReady: !state.loading && !state.error && isClient,
    translationsCount: Object.keys(state.translations).length,
    isClient, // Додаємо для умовного рендерингу
  }
}

// ============================= ЕКСПОРТ УТИЛІТАРНИХ ФУНКЦІЙ =============================

export { cacheManager }

// Функція для попереднього завантаження
export const preloadTranslations = async (locale, useBackend = true, namespace = null) => {
  const cacheKey = `${locale}_${useBackend ? 'backend' : 'static'}_${namespace || 'all'}`
  
  if (cacheManager.get(cacheKey)) {
    return // Вже є в кеші
  }

  try {
    if (useBackend) {
      const params = new URLSearchParams()
      if (namespace) params.append('namespace', namespace)
      params.append('source', 'all')
      
      const response = await apiService.get(`/translations/${locale}/?${params}`)
      const translations = response.translations || {}
      
      cacheManager.set(cacheKey, translations)
      return translations
    } else {
      // Завантажуємо статичні файли
      const fileName = namespace ? `${namespace}.json` : 'common.json'
      const response = await fetch(`/locales/${locale}/${fileName}`)
      
      if (response.ok) {
        const translations = await response.json()
        cacheManager.set(cacheKey, translations)
        return translations
      }
    }
  } catch (error) {
    console.warn(`Помилка попереднього завантаження для ${locale}:`, error)
  }
  
  return {}
}
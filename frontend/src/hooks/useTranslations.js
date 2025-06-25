// frontend/src/hooks/useTranslations.js - ПОВНИЙ РЕФАКТОРИНГ
'use client'

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import apiService from '@/lib/api'

// ============================= КОНФІГУРАЦІЇ =============================

const CACHE_CONFIG = {
  defaultTTL: 1000 * 60 * 15, // 15 хвилин
  maxSize: 50,
  storageKey: 'translations_cache_v2'
}

const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
}

const DEFAULT_OPTIONS = {
  fallbackToStatic: true,
  useBackend: true,
  namespace: null,
  cacheTime: CACHE_CONFIG.defaultTTL,
  enableAnalytics: false,
  enableLocalStorage: true,
  debounceTime: 300,
}

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

const retryWithBackoff = async (fn, attempts = RETRY_CONFIG.maxAttempts) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn()
    } catch (error) {
      if (i === attempts - 1) throw error
      
      const delay = Math.min(
        RETRY_CONFIG.baseDelay * Math.pow(2, i),
        RETRY_CONFIG.maxDelay
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}

// ============================= КЕША МЕНЕДЖЕР =============================

class TranslationCacheManager {
  constructor() {
    this.memoryCache = new Map()
    this.requestQueue = new Map()
    this.activeRequests = new Set()
    this.loadFromStorage()
  }

  // Завантаження з localStorage
  loadFromStorage() {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem(CACHE_CONFIG.storageKey)
      if (stored) {
        const parsedData = JSON.parse(stored)
        // Перевіряємо чи не застарілі дані
        Object.entries(parsedData).forEach(([key, value]) => {
          if (Date.now() - value.timestamp < value.ttl) {
            this.memoryCache.set(key, value)
          }
        })
      }
    } catch (error) {
      console.warn('Помилка завантаження з localStorage:', error)
    }
  }

  // Збереження в localStorage
  saveToStorage() {
    if (typeof window === 'undefined') return
    
    try {
      const dataToStore = {}
      this.memoryCache.forEach((value, key) => {
        dataToStore[key] = value
      })
      localStorage.setItem(CACHE_CONFIG.storageKey, JSON.stringify(dataToStore))
    } catch (error) {
      console.warn('Помилка збереження в localStorage:', error)
    }
  }

  get(key) {
    const cached = this.memoryCache.get(key)
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data
    }
    this.memoryCache.delete(key)
    return null
  }

  set(key, data, ttl = CACHE_CONFIG.defaultTTL) {
    // Обмежуємо розмір кешу
    if (this.memoryCache.size >= CACHE_CONFIG.maxSize) {
      const firstKey = this.memoryCache.keys().next().value
      this.memoryCache.delete(firstKey)
    }

    const cacheItem = {
      data,
      timestamp: Date.now(),
      ttl,
    }

    this.memoryCache.set(key, cacheItem)
    this.saveToStorage()
  }

  clear() {
    this.memoryCache.clear()
    this.requestQueue.clear()
    this.activeRequests.clear()
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CACHE_CONFIG.storageKey)
    }
  }

  // Очищення застарілих даних
  cleanup() {
    const now = Date.now()
    const keysToDelete = []
    
    this.memoryCache.forEach((value, key) => {
      if (now - value.timestamp >= value.ttl) {
        keysToDelete.push(key)
      }
    })
    
    keysToDelete.forEach(key => this.memoryCache.delete(key))
    
    if (keysToDelete.length > 0) {
      this.saveToStorage()
    }
  }

  // Статистика кешу
  getStats() {
    return {
      size: this.memoryCache.size,
      activeRequests: this.activeRequests.size,
      queueSize: this.requestQueue.size
    }
  }
}

// Глобальний екземпляр
const cacheManager = new TranslationCacheManager()

// Очищення кешу кожні 5 хвилин
if (typeof window !== 'undefined') {
  setInterval(() => cacheManager.cleanup(), 5 * 60 * 1000)
}

// ============================= АНАЛІТИКА =============================

const Analytics = {
  track: (event, data = {}) => {
    if (typeof window === 'undefined') return
    
    // Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event, data)
    }
    
    // Custom analytics можна додати тут
    console.log(`📊 Analytics: ${event}`, data)
  },

  trackTranslationLoad: (source, locale, count) => {
    Analytics.track('translation_loaded', {
      source,
      locale,
      translations_count: count,
      page: window.location.pathname
    })
  },

  trackMissingTranslation: (key, locale) => {
    Analytics.track('missing_translation', {
      translation_key: key,
      locale,
      page: window.location.pathname
    })
  },

  trackError: (error, locale) => {
    Analytics.track('translation_error', {
      error: error.message,
      locale,
      page: window.location.pathname
    })
  }
}

// ============================= ОСНОВНИЙ ХУК =============================

export function useTranslations(options = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  const {
    fallbackToStatic,
    useBackend,
    namespace,
    cacheTime,
    enableAnalytics,
    enableLocalStorage,
    debounceTime,
  } = config

  const pathname = usePathname()
  const [state, setState] = useState({
    translations: {},
    currentLocale: 'uk',
    loading: true,
    error: null,
    source: null,
    lastUpdated: null,
  })
  
  const mountedRef = useRef(true)
  const loadingRef = useRef(false)

  // Витягуємо локаль з pathname
  const currentLocale = useMemo(() => {
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    return localeMatch ? localeMatch[1] : 'uk'
  }, [pathname])

  // Cleanup при unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false
    }
  }, [])

  // ============================= ОСНОВНІ ФУНКЦІЇ =============================

  // Завантаження статичних файлів
  const loadStaticTranslations = useCallback(async (locale, namespace) => {
    try {
      const fileName = namespace ? `${namespace}.json` : 'common.json'
      const response = await fetch(`/locales/${locale}/${fileName}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log(`📁 Статичні переклади: ${Object.keys(data).length} для ${locale}`)
        return data
      } else if (locale !== 'uk') {
        // Fallback до української
        const fallbackResponse = await fetch(`/locales/uk/${fileName}`)
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json()
          console.log('🔄 Fallback до української мови')
          return fallbackData
        }
      }
      return {}
    } catch (error) {
      console.error('Помилка завантаження статичних файлів:', error)
      return {}
    }
  }, [])

  // Основна функція завантаження
  const loadTranslations = useCallback(async (locale) => {
    if (!mountedRef.current || loadingRef.current) return

    const cacheKey = `${locale}_${useBackend ? 'backend' : 'static'}_${namespace || 'all'}`
    
    // Перевіряємо кеш
    const cached = cacheManager.get(cacheKey)
    if (cached) {
      setState(prev => ({
        ...prev,
        translations: cached,
        currentLocale: locale,
        loading: false,
        error: null,
        source: 'cache',
        lastUpdated: new Date().toISOString()
      }))
      return cached
    }

    // Перевіряємо активні запити (deduplication)
    if (cacheManager.activeRequests.has(cacheKey)) {
      return new Promise((resolve) => {
        if (!cacheManager.requestQueue.has(cacheKey)) {
          cacheManager.requestQueue.set(cacheKey, [])
        }
        cacheManager.requestQueue.get(cacheKey).push(resolve)
      })
    }

    // Позначаємо запит як активний
    cacheManager.activeRequests.add(cacheKey)
    loadingRef.current = true

    if (mountedRef.current) {
      setState(prev => ({ ...prev, loading: true, error: null }))
    }

    try {
      let translationsData = {}
      let source = 'static'

      if (useBackend) {
        try {
          const response = await retryWithBackoff(async () => {
            const params = new URLSearchParams()
            if (namespace) params.append('namespace', namespace)
            params.append('source', 'all')
            
            return await apiService.get(`/translations/${locale}/?${params}`)
          })
          
          translationsData = response.translations || {}
          source = response.source || 'backend'
          
          // Аналітика успішного завантаження
          if (enableAnalytics) {
            Analytics.trackTranslationLoad(source, locale, Object.keys(translationsData).length)
          }
          
        } catch (error) {
          console.warn('⚠️ Помилка бекенду, використовуємо fallback:', error.message)
          
          if (fallbackToStatic) {
            translationsData = await loadStaticTranslations(locale, namespace)
            source = 'static_fallback'
          } else {
            throw error
          }
        }
      } else {
        translationsData = await loadStaticTranslations(locale, namespace)
      }

      // Зберігаємо в кеш
      if (enableLocalStorage) {
        cacheManager.set(cacheKey, translationsData, cacheTime)
      }

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          translations: translationsData,
          currentLocale: locale,
          loading: false,
          error: null,
          source,
          lastUpdated: new Date().toISOString()
        }))
      }

      // Сповіщаємо чергу
      const queue = cacheManager.requestQueue.get(cacheKey) || []
      queue.forEach(resolve => resolve(translationsData))
      cacheManager.requestQueue.delete(cacheKey)

      return translationsData

    } catch (error) {
      console.error('❌ Критична помилка:', error)
      
      if (enableAnalytics) {
        Analytics.trackError(error, locale)
      }
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
          translations: {},
          lastUpdated: new Date().toISOString()
        }))
      }

      return {}
    } finally {
      cacheManager.activeRequests.delete(cacheKey)
      loadingRef.current = false
    }
  }, [useBackend, fallbackToStatic, namespace, cacheTime, enableAnalytics, enableLocalStorage, loadStaticTranslations])

  // Debounced завантаження
  const debouncedLoadTranslations = useMemo(
    () => debounce(loadTranslations, debounceTime),
    [loadTranslations, debounceTime]
  )

  // Ефект для завантаження при зміні локалі
  useEffect(() => {
    if (currentLocale !== state.currentLocale) {
      debouncedLoadTranslations(currentLocale)
    }
  }, [currentLocale, debouncedLoadTranslations, state.currentLocale])

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
      // Аналітика відсутніх перекладів
      if (enableAnalytics) {
        Analytics.trackMissingTranslation(key, state.currentLocale)
      }
      
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
  }, [state.translations, state.currentLocale, enableAnalytics])

  // ============================= ДОДАТКОВІ ФУНКЦІЇ =============================

  const reloadTranslations = useCallback((force = false) => {
    if (force) {
      const cacheKey = `${state.currentLocale}_${useBackend ? 'backend' : 'static'}_${namespace || 'all'}`
      cacheManager.memoryCache.delete(cacheKey)
    }
    loadTranslations(state.currentLocale)
  }, [loadTranslations, state.currentLocale, useBackend, namespace])

  const preloadLocale = useCallback(async (locale) => {
    return await loadTranslations(locale)
  }, [loadTranslations])

  const clearCache = useCallback(() => {
    cacheManager.clear()
    setState(prev => ({ ...prev, translations: {}, source: null }))
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
    currentLocale: state.currentLocale,
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
    isReady: !state.loading && !state.error,
    translationsCount: Object.keys(state.translations).length,
  }
}

// ============================= ЕКСПОРТ УТИЛІТАРНИХ ФУНКЦІЙ =============================

export { cacheManager, Analytics }

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
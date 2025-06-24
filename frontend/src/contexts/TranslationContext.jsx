// frontend/src/contexts/TranslationContext.jsx
'use client'

import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import apiService from '@/lib/api'

// Початковий стан
const initialState = {
  translations: {},
  currentLocale: 'uk',
  loading: false,
  error: null,
  isBackendConnected: true,
  cache: new Map(),
}

// Типи дій
const ACTIONS = {
  SET_LOCALE: 'SET_LOCALE',
  SET_LOADING: 'SET_LOADING',
  SET_TRANSLATIONS: 'SET_TRANSLATIONS',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_BACKEND_STATUS: 'SET_BACKEND_STATUS',
  CLEAR_CACHE: 'CLEAR_CACHE',
  UPDATE_CACHE: 'UPDATE_CACHE',
}

// Reducer для управління станом
function translationReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOCALE:
      return {
        ...state,
        currentLocale: action.payload,
      }
    
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      }
    
    case ACTIONS.SET_TRANSLATIONS:
      return {
        ...state,
        translations: action.payload,
        loading: false,
        error: null,
      }
    
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    
    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }
    
    case ACTIONS.SET_BACKEND_STATUS:
      return {
        ...state,
        isBackendConnected: action.payload,
      }
    
    case ACTIONS.CLEAR_CACHE:
      return {
        ...state,
        cache: new Map(),
      }
    
    case ACTIONS.UPDATE_CACHE:
      const newCache = new Map(state.cache)
      newCache.set(action.payload.key, action.payload.data)
      return {
        ...state,
        cache: newCache,
      }
    
    default:
      return state
  }
}

// Контекст
const TranslationContext = createContext()

// Провайдер
export function TranslationProvider({ children, options = {} }) {
  const {
    cacheTime = 15 * 60 * 1000, // 15 хвилин
    fallbackToStatic = true,
    enableBackend = true,
    maxRetries = 2,
  } = options

  const [state, dispatch] = useReducer(translationReducer, {
    ...initialState,
    isBackendConnected: enableBackend,
  })
  
  const pathname = usePathname()
  let loadingTimeoutRef = React.useRef()
  const requestInProgress = React.useRef(false)

  // Витягуємо локаль з URL
  useEffect(() => {
    const localeMatch = pathname.match(/^\/([a-z]{2})(\/|$)/)
    const locale = localeMatch ? localeMatch[1] : 'uk'
    
    if (locale !== state.currentLocale) {
      dispatch({ type: ACTIONS.SET_LOCALE, payload: locale })
    }
  }, [pathname, state.currentLocale])

  // Завантажуємо переклади при зміні локалі
  useEffect(() => {
    if (state.currentLocale) {
      loadTranslations(state.currentLocale)
    }
  }, [state.currentLocale])

  const loadTranslations = useCallback(async (locale) => {
    // Запобігаємо множинним одночасним запитам
    if (requestInProgress.current) {
      console.log('🔄 Запит вже виконується, пропускаємо...')
      return
    }

    // Перевіряємо кеш спочатку
    const cacheKey = `${locale}_${enableBackend ? 'backend' : 'static'}`
    const cached = state.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      console.log(`💾 Використовуємо кеш для ${locale}`)
      dispatch({ type: ACTIONS.SET_TRANSLATIONS, payload: cached.data })
      return
    }

    requestInProgress.current = true
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: ACTIONS.CLEAR_ERROR })

    // Додаємо timeout для loading стану
    loadingTimeoutRef.current = setTimeout(() => {
      if (requestInProgress.current) {
        console.warn('⚠️ Запит занадто довгий, показуємо fallback')
        dispatch({ type: ACTIONS.SET_LOADING, payload: false })
      }
    }, 5000) // 5 секунд timeout

    try {
      let translationsData = {}
      let retryCount = 0

      if (enableBackend && state.isBackendConnected) {
        while (retryCount < maxRetries) {
          try {
            console.log(`🌐 Завантажуємо переклади з бекенду для ${locale} (спроба ${retryCount + 1})`)
            
            // Додаємо затримку між спробами
            if (retryCount > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000 * retryCount))
            }
            
            const backendResponse = await apiService.getAllTranslations(locale)
            translationsData = backendResponse.translations || {}
            
            console.log(`✅ Завантажено ${Object.keys(translationsData).length} перекладів з бекенду`)
            break // Успішно завантажили, виходимо з циклу
            
          } catch (backendError) {
            retryCount++
            console.warn(`⚠️ Спроба ${retryCount} не вдалася:`, backendError.message)
            
            if (retryCount >= maxRetries) {
              console.warn('❌ Всі спроби завантаження з бекенду не вдалися')
              dispatch({ type: ACTIONS.SET_BACKEND_STATUS, payload: false })
              
              if (fallbackToStatic) {
                translationsData = await loadStaticTranslations(locale)
              } else {
                throw new Error('Неможливо завантажити переклади з бекенду')
              }
            }
          }
        }
      } else {
        // Завантажуємо статичні файли
        translationsData = await loadStaticTranslations(locale)
      }

      // Оновлюємо кеш
      dispatch({
        type: ACTIONS.UPDATE_CACHE,
        payload: {
          key: cacheKey,
          data: {
            data: translationsData,
            timestamp: Date.now(),
          }
        }
      })

      dispatch({ type: ACTIONS.SET_TRANSLATIONS, payload: translationsData })
      
    } catch (error) {
      console.error('❌ Критична помилка завантаження перекладів:', error)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      
      // Останній fallback до порожнього об'єкта
      dispatch({ type: ACTIONS.SET_TRANSLATIONS, payload: {} })
    } finally {
      requestInProgress.current = false
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }, [enableBackend, state.isBackendConnected, fallbackToStatic, cacheTime, maxRetries, state.cache])

  const loadStaticTranslations = async (locale) => {
    try {
      console.log(`📁 Завантажуємо статичні переклади для ${locale}`)
      const response = await fetch(`/locales/${locale}/common.json`)
      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Завантажено ${Object.keys(data).length} статичних перекладів`)
        return data
      } else if (locale !== 'uk') {
        // Fallback до української
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

  // Функція перекладу
  const t = useCallback((key, fallback = null, interpolation = {}) => {
    if (!key) return fallback || key

    const keys = key.split('.')
    let value = state.translations
    
    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }
    
    if (value === undefined) {
      // В development режимі показуємо відсутні ключі
      if (process.env.NODE_ENV === 'development') {
        console.warn(`🔍 Переклад не знайдено: "${key}" для локалі "${state.currentLocale}"`)
      }
      return fallback || key
    }

    // Підтримка інтерполяції
    if (typeof value === 'string' && Object.keys(interpolation).length > 0) {
      return Object.keys(interpolation).reduce((result, key) => {
        return result.replace(new RegExp(`{{${key}}}`, 'g'), interpolation[key])
      }, value)
    }
    
    return value
  }, [state.translations, state.currentLocale])

  // Додаткові функції
  const reloadTranslations = useCallback(() => {
    console.log('🔄 Примусове перезавантаження перекладів')
    loadTranslations(state.currentLocale)
  }, [state.currentLocale, loadTranslations])

  const clearCache = useCallback(() => {
    console.log('🗑️ Очищення кешу перекладів')
    dispatch({ type: ACTIONS.CLEAR_CACHE })
  }, [])

  const switchLocale = useCallback((newLocale) => {
    if (newLocale !== state.currentLocale) {
      console.log(`🌍 Зміна локалі з ${state.currentLocale} на ${newLocale}`)
      dispatch({ type: ACTIONS.SET_LOCALE, payload: newLocale })
    }
  }, [state.currentLocale])

  const getTranslationStats = useCallback(() => {
    return {
      totalTranslations: Object.keys(state.translations).length,
      currentLocale: state.currentLocale,
      isBackendConnected: state.isBackendConnected,
      cacheSize: state.cache.size,
      loading: state.loading,
      error: state.error,
    }
  }, [state])

  const value = {
    ...state,
    t,
    reloadTranslations,
    clearCache,
    switchLocale,
    getTranslationStats,
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  )
}

// Хук для використання контексту
export function useTranslationContext() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider')
  }
  return context
}

// Спрощений хук для базового використання
export function useT() {
  const { t, currentLocale, loading, error } = useTranslationContext()
  return { t, currentLocale, loading, error }
}

// Хук для отримання статистики
export function useTranslationStats() {
  const { getTranslationStats } = useTranslationContext()
  return getTranslationStats()
}
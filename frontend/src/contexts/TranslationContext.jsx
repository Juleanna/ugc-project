'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import apiService from '@/lib/api'

// Початковий стан
const initialState = {
  translations: {},
  currentLocale: 'uk',
  loading: false,
  error: null,
  cache: new Map(),
  isBackendConnected: true,
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
  } = options

  const [state, dispatch] = useReducer(translationReducer, {
    ...initialState,
    isBackendConnected: enableBackend,
  })
  
  const pathname = usePathname()

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
    loadTranslations(state.currentLocale)
  }, [state.currentLocale])

  const loadTranslations = async (locale) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })
    dispatch({ type: ACTIONS.CLEAR_ERROR })

    try {
      // Перевіряємо кеш
      const cacheKey = `${locale}_${enableBackend ? 'backend' : 'static'}`
      const cached = state.cache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < cacheTime) {
        dispatch({ type: ACTIONS.SET_TRANSLATIONS, payload: cached.data })
        return
      }

      let translationsData = {}

      if (enableBackend && state.isBackendConnected) {
        try {
          // Завантажуємо з бекенду
          const backendResponse = await apiService.getAllTranslations(locale)
          translationsData = backendResponse.translations || {}
          
          console.log(`✅ Завантажено ${Object.keys(translationsData).length} перекладів з бекенду`)
          
        } catch (backendError) {
          console.warn('⚠️ Помилка підєднання до бекенду:', backendError.message)
          dispatch({ type: ACTIONS.SET_BACKEND_STATUS, payload: false })
          
          if (fallbackToStatic) {
            translationsData = await loadStaticTranslations(locale)
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
    }
  }

  const loadStaticTranslations = async (locale) => {
    try {
      const response = await fetch(`/locales/${locale}/common.json`)
      if (response.ok) {
        const data = await response.json()
        console.log(`📁 Завантажено ${Object.keys(data).length} статичних перекладів`)
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
  const t = (key, fallback = null, interpolation = {}) => {
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

    // Підтримка інтерполяції
    if (typeof value === 'string' && Object.keys(interpolation).length > 0) {
      return Object.keys(interpolation).reduce((result, key) => {
        return result.replace(new RegExp(`{{${key}}}`, 'g'), interpolation[key])
      }, value)
    }
    
    return value
  }

  // Додаткові функції
  const reloadTranslations = () => {
    loadTranslations(state.currentLocale)
  }

  const clearCache = () => {
    dispatch({ type: ACTIONS.CLEAR_CACHE })
  }

  const switchLocale = (newLocale) => {
    if (newLocale !== state.currentLocale) {
      dispatch({ type: ACTIONS.SET_LOCALE, payload: newLocale })
    }
  }

  const value = {
    ...state,
    t,
    reloadTranslations,
    clearCache,
    switchLocale,
    loadTranslations,
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
  const { t, currentLocale, loading } = useTranslationContext()
  return { t, currentLocale, loading }
}
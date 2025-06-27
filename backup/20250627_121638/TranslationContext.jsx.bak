// frontend/src/contexts/TranslationContext.jsx - СПРОЩЕНО БЕЗ ДУБЛЮВАНЬ
'use client'

import React, { createContext, useContext } from 'react'
import { useTranslations } from '@/hooks/useTranslations'

// ============================= КОНТЕКСТ =============================

const TranslationContext = createContext(null)

// ============================= ПРОВАЙДЕР =============================

export function TranslationProvider({ 
  children, 
  options = {},
  enableAnalytics = true,
  enableLocalStorage = true 
}) {
  // Використовуємо наш покращений хук
  const translationState = useTranslations({
    enableAnalytics,
    enableLocalStorage,
    useBackend: true,
    fallbackToStatic: true,
    ...options
  })

  return (
    <TranslationContext.Provider value={translationState}>
      {children}
    </TranslationContext.Provider>
  )
}

// ============================= ХУКИ =============================

export function useTranslationContext() {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslationContext must be used within TranslationProvider')
  }
  return context
}

// Зручний хук для компонентів які тільки перекладають
export function useT() {
  const { t } = useTranslationContext()
  return t
}

// Хук для перевірки готовності перекладів
export function useTranslationReady() {
  const { isReady, loading, error } = useTranslationContext()
  return { isReady, loading, error }
}

// ============================= КОМПОНЕНТИ =============================

// Компонент для перекладу з fallback
export function T({ 
  k, 
  fallback = null, 
  interpolation = {}, 
  as: Component = 'span',
  className = '',
  ...props 
}) {
  const { t } = useTranslationContext()
  const translated = t(k, fallback, interpolation)
  
  return (
    <Component className={className} {...props}>
      {translated}
    </Component>
  )
}

// Компонент завантаження перекладів
export function TranslationLoader({ 
  children, 
  fallback = <div>Завантаження перекладів...</div>,
  error: ErrorComponent = ({ error }) => <div>Помилка: {error}</div>
}) {
  const { isReady, loading, error } = useTranslationContext()
  
  if (error) {
    return <ErrorComponent error={error} />
  }
  
  if (loading && !isReady) {
    return fallback
  }
  
  return children
}

// HOC для компонентів що потребують переклади
export function withTranslations(WrappedComponent, options = {}) {
  return function TranslatedComponent(props) {
    return (
      <TranslationProvider options={options}>
        <WrappedComponent {...props} />
      </TranslationProvider>
    )
  }
}

// ============================= ЕКСПОРТ =============================

export default TranslationProvider

// ============================= УТИЛІТАРНІ КОМПОНЕНТИ =============================

// Компонент для перемикання мови
export function LanguageSwitcher({ 
  languages = [
    { code: 'uk', name: 'Українська', flag: '🇺🇦' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ],
  className = '',
  showFlags = true,
  style = 'dropdown' // 'dropdown' | 'buttons' | 'select'
}) {
  const { currentLocale, preloadLocale } = useTranslationContext()
  const { t } = useTranslationContext()
  
  const handleLanguageChange = async (langCode) => {
    // Попередньо завантажуємо переклади
    await preloadLocale(langCode)
    
    // Перенаправляємо на нову мову
    const currentPath = window.location.pathname
    const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${langCode}`) || `/${langCode}`
    window.location.href = newPath
  }

  if (style === 'select') {
    return (
      <select 
        value={currentLocale} 
        onChange={(e) => handleLanguageChange(e.target.value)}
        className={`language-switcher ${className}`}
      >
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {showFlags ? `${lang.flag} ${lang.name}` : lang.name}
          </option>
        ))}
      </select>
    )
  }

  if (style === 'buttons') {
    return (
      <div className={`language-switcher-buttons ${className}`}>
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`lang-btn ${currentLocale === lang.code ? 'active' : ''}`}
          >
            {showFlags && <span className="flag">{lang.flag}</span>}
            <span className="name">{lang.name}</span>
          </button>
        ))}
      </div>
    )
  }

  // Default dropdown style
  return (
    <div className={`language-switcher-dropdown ${className}`}>
      <button className="current-lang">
        {showFlags && languages.find(l => l.code === currentLocale)?.flag}
        {languages.find(l => l.code === currentLocale)?.name}
      </button>
      <div className="dropdown-menu">
        {languages.map(lang => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`dropdown-item ${currentLocale === lang.code ? 'active' : ''}`}
          >
            {showFlags && <span className="flag">{lang.flag}</span>}
            <span className="name">{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// Компонент для діагностики перекладів (тільки для розробки)
export function TranslationDebugger({ enabled = process.env.NODE_ENV === 'development' }) {
  const { 
    translationsCount, 
    source, 
    lastUpdated, 
    currentLocale, 
    getCacheStats,
    clearCache 
  } = useTranslationContext()

  if (!enabled) return null

  const stats = getCacheStats()

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div><strong>🌐 Translation Debug</strong></div>
      <div>Locale: {currentLocale}</div>
      <div>Translations: {translationsCount}</div>
      <div>Source: {source}</div>
      <div>Cache size: {stats.size}</div>
      <div>Active requests: {stats.activeRequests}</div>
      <div>Updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'Never'}</div>
      <button 
        onClick={clearCache}
        style={{
          marginTop: '5px',
          padding: '2px 5px',
          background: 'red',
          color: 'white',
          border: 'none',
          borderRadius: '3px',
          cursor: 'pointer'
        }}
      >
        Clear Cache
      </button>
    </div>
  )
}
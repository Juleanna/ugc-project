// src/components/TranslationWrapper.jsx - ВИПРАВЛЕНИЙ БЕЗ ЦИКЛІЧНИХ ЗАЛЕЖНОСТЕЙ
'use client'

import React from 'react'
import { 
  TranslationLoader, 
  TranslationErrorBoundary, 
  useTranslationReady 
} from '@/contexts/TranslationContext'

// ============================= КОМПОНЕНТИ ЗАВАНТАЖЕННЯ =============================

// Компонент для показу завантаження
function TranslationLoadingFallback({ minimal = false, message = "Завантаження..." }) {
  if (minimal) {
    return (
      <div className="flex items-center gap-2 text-neutral-600">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-400"></div>
        <span className="text-sm">{message}</span>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-950 mx-auto mb-4"></div>
        <p className="text-neutral-600 mb-2">{message}</p>
        <p className="text-sm text-neutral-400">Це може зайняти кілька секунд</p>
      </div>
    </div>
  )
}

// Компонент для показу помилок
function TranslationErrorFallback({ error, retry, minimal = false }) {
  const handleRetry = () => {
    if (retry) {
      retry()
    } else {
      window.location.reload()
    }
  }

  if (minimal) {
    return (
      <div className="text-red-600 text-sm">
        Помилка перекладу
      </div>
    )
  }

  return (
    <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
      <div className="text-red-600 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.312 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Помилка завантаження перекладів
      </h3>
      <p className="text-red-700 mb-4">
        {error || 'Не вдалося завантажити переклади'}
      </p>
      <div className="flex gap-2 justify-center">
        <button 
          onClick={handleRetry}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Спробувати знову
        </button>
        <button 
          onClick={() => window.location.reload()}
          className="bg-neutral-600 text-white px-4 py-2 rounded hover:bg-neutral-700 transition-colors"
        >
          Перезавантажити сторінку
        </button>
      </div>
    </div>
  )
}

// ============================= ОСНОВНІ ОБГОРТКИ =============================

// Основна обгортка для сторінок
export function PageTranslationWrapper({ 
  children, 
  fallbackComponent = null,
  errorComponent = null,
  showMinimalLoader = false,
  loadingMessage = "Завантаження перекладів..."
}) {
  const defaultFallback = (
    <TranslationLoadingFallback 
      minimal={showMinimalLoader}
      message={loadingMessage}
    />
  )

  const defaultError = (error) => (
    <TranslationErrorFallback 
      error={error}
      retry={() => window.location.reload()}
      minimal={showMinimalLoader}
    />
  )

  return (
    <TranslationErrorBoundary
      fallback={errorComponent || <TranslationErrorFallback minimal={showMinimalLoader} />}
    >
      <TranslationLoader
        fallback={fallbackComponent || defaultFallback}
        error={errorComponent || defaultError}
      >
        {children}
      </TranslationLoader>
    </TranslationErrorBoundary>
  )
}

// Обгортка для компонентів (менша)
export function ComponentTranslationWrapper({ 
  children, 
  fallbackText = "...",
  showLoader = true,
  className = ""
}) {
  try {
    const { isReady, loading, error } = useTranslationReady()

    if (error) {
      return <span className={`text-red-500 text-sm ${className}`}>Помилка</span>
    }

    if (loading && !isReady) {
      if (!showLoader) {
        return <span className={className}>{fallbackText}</span>
      }
      
      return (
        <span className={`inline-flex items-center gap-1 text-neutral-400 ${className}`}>
          <div className="animate-spin rounded-full h-3 w-3 border-b border-neutral-400"></div>
          {fallbackText}
        </span>
      )
    }

    return <span className={className}>{children}</span>
  } catch (error) {
    // Fallback якщо хук не працює
    console.warn('ComponentTranslationWrapper error:', error)
    return <span className={className}>{children || fallbackText}</span>
  }
}

// ============================= ЕКСПОРТ =============================

export { 
  TranslationLoadingFallback, 
  TranslationErrorFallback 
}
// src/contexts/TranslationContext.jsx - МАКСИМАЛЬНО ПРОСТИЙ
'use client'

import React, { createContext, useContext } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { NoSSR } from '@/components/NoSSR'

const TranslationContext = createContext(null)

export function TranslationProvider({ children, options = {} }) {
  return (
    <NoSSR fallback={children}>
      <TranslationProviderInner options={options}>
        {children}
      </TranslationProviderInner>
    </NoSSR>
  )
}

function TranslationProviderInner({ children, options }) {
  const translationState = useTranslations(options)

  return (
    <TranslationContext.Provider value={translationState}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslationContext() {
  const context = useContext(TranslationContext)
  if (!context) {
    // Заглушка для SSR
    return {
      t: (key, fallback) => fallback || key,
      loading: false,
      error: null,
      currentLocale: 'uk',
      isReady: true
    }
  }
  return context
}

// Безпечний компонент тексту
export function TranslatedText({ tKey, fallback, ...props }) {
  const { t } = useTranslationContext()
  
  return (
    <span {...props}>
      {t(tKey, fallback)}
    </span>
  )
}

export default TranslationProvider
import { useEffect } from 'react'

export function useTranslationAnalytics() {
  const trackMissingTranslation = (key, locale) => {
    // Відправка в аналітику (Google Analytics, Mixpanel тощо)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'missing_translation', {
        translation_key: key,
        locale: locale,
        page: window.location.pathname
      })
    }
  }
  
  const trackTranslationLoad = (source, locale, count) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'translation_loaded', {
        source: source, // 'backend' або 'static'
        locale: locale,
        translations_count: count
      })
    }
  }
  
  return { trackMissingTranslation, trackTranslationLoad }
}
import { useState, useCallback } from 'react'
import apiService from '@/lib/api'

export function useLazyTranslations() {
  const [cache, setCache] = useState(new Map())
  
  const loadNamespace = useCallback(async (namespace, locale = 'uk') => {
    const cacheKey = `${namespace}_${locale}`
    
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }
    
    try {
      // Завантажуємо тільки конкретний namespace
      const response = await apiService.get(`/translations/${locale}/`, {
        namespace
      })
      
      const translations = response.translations || {}
      setCache(prev => new Map(prev).set(cacheKey, translations))
      
      return translations
    } catch (error) {
      console.error(`Помилка завантаження namespace ${namespace}:`, error)
      return {}
    }
  }, [cache])
  
  return { loadNamespace }
}
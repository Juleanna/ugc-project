// frontend/src/hooks/useTranslations.js - ОПТИМІЗОВАНА ВЕРСІЯ БЕЗ ДУБЛЮВАННЯ
'use client'

import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';

// ==================== КОНФІГУРАЦІЯ ====================

const CACHE_CONFIG = {
  defaultTTL: 15 * 60 * 1000, // 15 хвилин
  maxSize: 50,
  storageKey: 'translations_cache_v3'
};

const DEFAULT_LOCALE = 'uk';
const SUPPORTED_LOCALES = ['uk', 'en'];
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// ==================== КЕШ МЕНЕДЖЕР ====================

class TranslationCacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.activeRequests = new Map(); // Для дедуплікації запитів
  }

  get(key) {
    const cached = this.memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.memoryCache.delete(key);
    return null;
  }

  set(key, data, ttl = CACHE_CONFIG.defaultTTL) {
    // Обмежуємо розмір кешу
    if (this.memoryCache.size >= CACHE_CONFIG.maxSize) {
      const firstKey = this.memoryCache.keys().next().value;
      this.memoryCache.delete(firstKey);
    }

    this.memoryCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(pattern = null) {
    if (pattern) {
      for (const [key] of this.memoryCache) {
        if (key.includes(pattern)) {
          this.memoryCache.delete(key);
        }
      }
    } else {
      this.memoryCache.clear();
    }
  }

  has(key) {
    return this.memoryCache.has(key) && this.get(key) !== null;
  }

  getStats() {
    return {
      cacheSize: this.memoryCache.size,
      activeRequests: this.activeRequests.size,
      keys: Array.from(this.memoryCache.keys())
    };
  }

  // Дедуплікація запитів
  async getOrFetch(key, fetchFunction) {
    // Перевіряємо кеш
    const cached = this.get(key);
    if (cached) return cached;

    // Перевіряємо активні запити
    if (this.activeRequests.has(key)) {
      return await this.activeRequests.get(key);
    }

    // Створюємо новий запит
    const requestPromise = fetchFunction();
    this.activeRequests.set(key, requestPromise);

    try {
      const result = await requestPromise;
      this.set(key, result);
      return result;
    } finally {
      this.activeRequests.delete(key);
    }
  }
}

// Глобальний екземпляр кеш менеджера
const cacheManager = new TranslationCacheManager();

// ==================== API ДЛЯ ПЕРЕКЛАДІВ ====================

class TranslationsAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 10000;
  }

  /**
   * Завантаження перекладів з сервера
   */
  async fetchTranslations(locale, options = {}) {
    const {
      source = 'all',
      namespace = null,
      refresh = false
    } = options;

    const params = new URLSearchParams();
    if (source !== 'all') params.append('source', source);
    if (namespace) params.append('namespace', namespace);
    if (refresh) params.append('refresh', 'true');

    const endpoint = `/translations/${locale}/`;
    const url = params.toString() ? `${endpoint}?${params}` : endpoint;
    const fullURL = `${this.baseURL}${url}`;

    console.log(`🌍 Завантаження перекладів: ${locale} (${source})`);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(fullURL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`✅ Завантажено ${data.count || 0} перекладів для ${locale}`);
      
      return {
        locale,
        translations: data.translations || {},
        count: data.count || 0,
        source: data.source || source,
        cached: data.cached || false,
        timestamp: Date.now()
      };

    } catch (error) {
      console.error(`❌ Помилка завантаження перекладів для ${locale}:`, error.message);
      
      // Fallback стратегія
      return await this.getFallbackTranslations(locale);
    }
  }

  /**
   * Fallback переклади при недоступності API
   */
  async getFallbackTranslations(locale) {
    console.warn(`🔄 Використання fallback перекладів для ${locale}`);
    
    try {
      // Спробуємо завантажити статичні файли
      const staticResponse = await fetch(`/locales/${locale}/common.json`);
      if (staticResponse.ok) {
        const staticData = await staticResponse.json();
        return {
          locale,
          translations: this.flattenObject(staticData),
          count: Object.keys(staticData).length,
          source: 'static_fallback',
          cached: false,
          fallback: true,
          timestamp: Date.now()
        };
      }
    } catch (staticError) {
      console.warn('⚠️ Статичні файли також недоступні:', staticError.message);
    }
    
    // Останній fallback - базові переклади
    const basicTranslations = this.getBasicTranslations(locale);
    return {
      locale,
      translations: basicTranslations,
      count: Object.keys(basicTranslations).length,
      source: 'basic_fallback',
      cached: false,
      fallback: true,
      timestamp: Date.now()
    };
  }

  /**
   * Базові переклади для критичних випадків
   */
  getBasicTranslations(locale) {
    const translations = {
      'uk': {
        'common.loading': 'Завантаження...',
        'common.error': 'Сталася помилка',
        'common.retry': 'Спробувати знову',
        'common.success': 'Успішно',
        'common.cancel': 'Скасувати',
        'common.save': 'Зберегти',
        'common.edit': 'Редагувати',
        'common.delete': 'Видалити',
        'common.search': 'Пошук',
        'common.back': 'Назад',
        'common.next': 'Далі',
        'common.close': 'Закрити',
        'header.company': 'Компанія',
        'header.services': 'Послуги',
        'header.projects': 'Проекти',
        'header.about': 'Про нас',
        'header.contact': 'Контакти',
        'nav.home': 'Головна',
        'footer.rights': '© 2024 Всі права захищені'
      },
      'en': {
        'common.loading': 'Loading...',
        'common.error': 'Error occurred',
        'common.retry': 'Try again',
        'common.success': 'Success',
        'common.cancel': 'Cancel',
        'common.save': 'Save',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.search': 'Search',
        'common.back': 'Back',
        'common.next': 'Next',
        'common.close': 'Close',
        'header.company': 'Company',
        'header.services': 'Services',
        'header.projects': 'Projects',
        'header.about': 'About',
        'header.contact': 'Contact',
        'nav.home': 'Home',
        'footer.rights': '© 2024 All rights reserved'
      }
    };
    
    return translations[locale] || translations['uk'];
  }

  /**
   * Утиліта для сплощення об'єкта
   */
  flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this.flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }

  /**
   * Очищення серверного кешу
   */
  async clearServerCache() {
    try {
      const response = await fetch(`${this.baseURL}/webhooks/translations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      
      if (response.ok) {
        console.log('✅ Серверний кеш перекладів очищено');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Помилка очищення серверного кешу:', error.message);
      return false;
    }
  }
}

// Глобальний екземпляр API
const translationsAPI = new TranslationsAPI();

// ==================== ГОЛОВНИЙ ХУК ====================

/**
 * Основний хук для роботи з перекладами
 */
export function useTranslations(options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    namespace = null,
    useBackend = true,
    fallbackToStatic = true,
    cacheTime = CACHE_CONFIG.defaultTTL
  } = options;

  // State
  const [state, setState] = useState({
    translations: {},
    currentLocale: locale,
    loading: true,
    error: null,
    source: 'none',
    lastUpdated: null
  });

  // Refs
  const mountedRef = useRef(true);

  // Очищення при unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Функція завантаження перекладів
  const loadTranslations = useCallback(async (targetLocale = locale, targetNamespace = namespace) => {
    if (!SUPPORTED_LOCALES.includes(targetLocale)) {
      console.error(`❌ Непідтримувана локаль: ${targetLocale}`);
      return {};
    }

    const cacheKey = `translations_${targetLocale}_${targetNamespace || 'all'}_${useBackend ? 'backend' : 'static'}`;

    try {
      const result = await cacheManager.getOrFetch(cacheKey, async () => {
        if (useBackend) {
          return await translationsAPI.fetchTranslations(targetLocale, {
            namespace: targetNamespace,
            source: 'all'
          });
        } else {
          return await translationsAPI.getFallbackTranslations(targetLocale);
        }
      });

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          translations: result.translations,
          currentLocale: targetLocale,
          loading: false,
          error: null,
          source: result.source,
          lastUpdated: result.timestamp
        }));
      }

      return result.translations;
    } catch (error) {
      console.error('❌ Помилка завантаження перекладів:', error.message);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
      
      return {};
    }
  }, [locale, namespace, useBackend]);

  // Функція перекладу
  const t = useCallback((key, defaultValue = key, interpolations = {}) => {
    if (!key) return defaultValue;

    // Додаємо namespace якщо потрібно
    let fullKey = key;
    if (namespace && !key.includes('.') && !key.startsWith(namespace)) {
      fullKey = `${namespace}.${key}`;
    }

    let translation = state.translations[fullKey] || defaultValue;

    // Інтерполяція змінних
    if (typeof translation === 'string' && Object.keys(interpolations).length > 0) {
      translation = translation.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
        return interpolations[varName] !== undefined ? interpolations[varName] : match;
      });
    }

    return translation;
  }, [state.translations, namespace]);

  // Перевірка наявності перекладу
  const hasTranslation = useCallback((key) => {
    if (!key) return false;
    
    let fullKey = key;
    if (namespace && !key.includes('.') && !key.startsWith(namespace)) {
      fullKey = `${namespace}.${key}`;
    }
    
    return state.translations.hasOwnProperty(fullKey);
  }, [state.translations, namespace]);

  // Функція зміни локалі
  const changeLocale = useCallback(async (newLocale) => {
    if (newLocale === state.currentLocale) return;
    
    if (!SUPPORTED_LOCALES.includes(newLocale)) {
      console.error(`❌ Непідтримувана локаль: ${newLocale}`);
      return;
    }
    
    console.log(`🌍 Зміна локалі з ${state.currentLocale} на ${newLocale}`);
    await loadTranslations(newLocale, namespace);
  }, [state.currentLocale, namespace, loadTranslations]);

  // Функція оновлення перекладів
  const refresh = useCallback(async () => {
    console.log('🔄 Примусове оновлення перекладів...');
    cacheManager.clear();
    await loadTranslations(state.currentLocale, namespace);
  }, [state.currentLocale, namespace, loadTranslations]);

  // Автоматичне завантаження при монтуванні
  useEffect(() => {
    loadTranslations(locale, namespace);
  }, [locale, namespace, loadTranslations]);

  // Повертаємо API хука
  return {
    // Дані
    translations: state.translations,
    locale: state.currentLocale,
    loading: state.loading,
    error: state.error,
    source: state.source,
    lastUpdated: state.lastUpdated,
    
    // Функції
    t,
    hasTranslation,
    changeLocale,
    refresh,
    
    // Утиліти
    isLoading: state.loading,
    hasError: !!state.error,
    isReady: !state.loading && !state.error && Object.keys(state.translations).length > 0,
    translationsCount: Object.keys(state.translations).length,
    supportedLocales: SUPPORTED_LOCALES
  };
}

// ==================== ХУК ДЛЯ NAMESPACE ====================

/**
 * Хук для роботи з перекладами з namespace
 */
export function usePageTranslations(namespace, options = {}) {
  const translationsApi = useTranslations({
    namespace,
    ...options
  });

  // Функція перекладу з автоматичним namespace
  const t = useCallback((key, defaultValue = key, interpolations = {}) => {
    let fullKey = key;
    if (namespace && !key.includes('.') && !key.startsWith(namespace)) {
      fullKey = `${namespace}.${key}`;
    }
    
    return translationsApi.t(fullKey, defaultValue, interpolations);
  }, [translationsApi.t, namespace]);

  return {
    ...translationsApi,
    t,
    namespace
  };
}

// ==================== КОНТЕКСТ ====================

const TranslationsContext = createContext(null);

/**
 * Провайдер контексту перекладів
 */
export function TranslationsProvider({ children, locale = DEFAULT_LOCALE, ...options }) {
  const translationsApi = useTranslations({ locale, ...options });
  
  return (
    <TranslationsContext.Provider value={translationsApi}>
      {children}
    </TranslationsContext.Provider>
  );
}

/**
 * Хук для використання контексту перекладів
 */
export function useTranslationsContext() {
  const context = useContext(TranslationsContext);
  if (!context) {
    throw new Error('useTranslationsContext must be used within TranslationsProvider');
  }
  return context;
}

// ==================== HOC ДЛЯ ПЕРЕКЛАДІВ ====================

/**
 * HOC для автоматичного додавання перекладів до компонента
 */
export function withTranslations(WrappedComponent, options = {}) {
  const TranslatedComponent = function(props) {
    const translationsApi = useTranslations(options);
    
    return (
      <WrappedComponent 
        {...props} 
        translations={translationsApi}
        t={translationsApi.t}
        locale={translationsApi.locale}
        changeLocale={translationsApi.changeLocale}
      />
    );
  };
  
  TranslatedComponent.displayName = `withTranslations(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return TranslatedComponent;
}

/**
 * HOC для автоматичного застосування namespace
 */
export function withPageTranslations(namespace) {
  return function(WrappedComponent) {
    const TranslatedPageComponent = function(props) {
      const translationsApi = usePageTranslations(namespace);
      
      return (
        <WrappedComponent 
          {...props} 
          translations={translationsApi}
          t={translationsApi.t}
          locale={translationsApi.locale}
        />
      );
    };
    
    TranslatedPageComponent.displayName = `withPageTranslations(${namespace})(${WrappedComponent.displayName || WrappedComponent.name})`;
    
    return TranslatedPageComponent;
  };
}

// ==================== УТИЛІТАРНІ ФУНКЦІЇ ====================

/**
 * Функція для попереднього завантаження перекладів
 */
export async function preloadTranslations(locale, options = {}) {
  try {
    console.log(`🚀 Попереднє завантаження перекладів для ${locale}`);
    
    const cacheKey = `translations_${locale}_all_backend`;
    const result = await cacheManager.getOrFetch(cacheKey, async () => {
      return await translationsAPI.fetchTranslations(locale, {
        source: 'all',
        ...options
      });
    });
    
    console.log(`✅ Попередньо завантажено ${result.count || 0} перекладів`);
    return result;
  } catch (error) {
    console.error(`❌ Помилка попереднього завантаження для ${locale}:`, error.message);
    return null;
  }
}

/**
 * Функція для синхронізації з сервером
 */
export async function syncTranslationsWithServer() {
  try {
    console.log('🔄 Синхронізація перекладів з сервером...');
    
    // Очищаємо локальний кеш
    cacheManager.clear();
    
    // Очищаємо серверний кеш
    await translationsAPI.clearServerCache();
    
    console.log('✅ Синхронізація завершена');
    return true;
  } catch (error) {
    console.error('❌ Помилка синхронізації:', error.message);
    return false;
  }
}

/**
 * Функція для отримання статистики кешу
 */
export function getTranslationsStats() {
  return cacheManager.getStats();
}

/**
 * Функція для очищення кешу перекладів
 */
export function clearTranslationsCache(pattern = null) {
  cacheManager.clear(pattern);
  console.log(`🧹 Кеш перекладів очищено${pattern ? ` (pattern: ${pattern})` : ''}`);
}

// ==================== РОЗРОБНИЦЬКІ УТИЛІТИ ====================

// Глобальний доступ для дебагу (тільки в development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.translationsAPI = translationsAPI;
  window.translationsCache = cacheManager;
  window.clearTranslationsCache = clearTranslationsCache;
  window.getTranslationsStats = getTranslationsStats;
  window.syncTranslationsWithServer = syncTranslationsWithServer;
}

// Експорт за замовчуванням
export default useTranslations;
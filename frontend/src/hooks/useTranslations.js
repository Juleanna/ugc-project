// frontend/src/hooks/useTranslations.js - ПОВНИЙ КОД З NAMESPACE
import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import apiService from '../lib/api';

// ==================== КОНФІГУРАЦІЯ ====================

const CACHE_CONFIG = {
  defaultTTL: 15 * 60 * 1000, // 15 хвилин
  maxSize: 50,
  storageKey: 'translations_cache_v2'
};

const DEFAULT_LOCALE = 'uk';
const SUPPORTED_LOCALES = ['uk', 'en'];

// ==================== КЕШ МЕНЕДЖЕР ====================

class TranslationCacheManager {
  constructor() {
    this.memoryCache = new Map();
    this.requestQueue = new Map();
    this.activeRequests = new Set();
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
      size: this.memoryCache.size,
      activeRequests: this.activeRequests.size,
      queuedRequests: Array.from(this.requestQueue.values()).reduce((sum, queue) => sum + queue.length, 0)
    };
  }
}

// Глобальний екземпляр кеш менеджера
const cacheManager = new TranslationCacheManager();

// ==================== ДОПОМІЖНІ ФУНКЦІЇ ====================

/**
 * Retry функція з exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries - 1) throw error;
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`⚠️ Спроба ${attempt + 1} невдала, повтор через ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Завантаження статичних перекладів з namespace
 */
async function loadNamespaceTranslations(locale, namespace) {
  try {
    // Спочатку пробуємо завантажити конкретний файл namespace
    const namespaceResponse = await fetch(`/locales/${locale}/${namespace}.json`);
    if (namespaceResponse.ok) {
      const namespaceData = await namespaceResponse.json();
      console.log(`✅ Завантажено namespace ${namespace} для ${locale}:`, Object.keys(namespaceData).length, 'ключів');
      return namespaceData;
    }
  } catch (error) {
    console.warn(`⚠️ Не вдалося завантажити namespace ${namespace} для ${locale}:`, error.message);
  }

  // Fallback до загальних перекладів
  try {
    const commonResponse = await fetch(`/locales/${locale}/common.json`);
    if (commonResponse.ok) {
      const commonData = await commonResponse.json();
      
      // Фільтруємо тільки ключі що відносяться до namespace
      if (namespace) {
        const filtered = {};
        for (const [key, value] of Object.entries(commonData)) {
          if (key.startsWith(`${namespace}.`)) {
            filtered[key] = value;
          }
        }
        return filtered;
      }
      return commonData;
    }
  } catch (error) {
    console.warn(`⚠️ Не вдалося завантажити common переклади для ${locale}:`, error.message);
  }

  return {};
}

/**
 * Завантаження статичних перекладів як fallback
 */
async function loadStaticTranslations(locale, namespace) {
  // Якщо є namespace, завантажуємо спеціалізовані переклади
  if (namespace) {
    return await loadNamespaceTranslations(locale, namespace);
  }

  // Інакше завантажуємо загальні переклади
  try {
    const response = await fetch(`/locales/${locale}/common.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn(`⚠️ Не вдалося завантажити статичні переклади для ${locale}:`, error.message);
    return getBasicFallbackTranslations(locale);
  }
}

/**
 * Базові fallback переклади
 */
function getBasicFallbackTranslations(locale) {
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
 * Валідатор для ключів перекладів
 */
function validateTranslationKey(key) {
  if (!key || typeof key !== 'string') {
    console.warn('⚠️ Некоректний ключ перекладу:', key);
    return false;
  }
  
  // Перевіряємо формат ключа (namespace.key)
  const keyPattern = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)*$/;
  if (!keyPattern.test(key)) {
    console.warn('⚠️ Ключ перекладу не відповідає формату:', key);
    return false;
  }
  
  return true;
}

// ==================== ГОЛОВНИЙ ХУК ====================

/**
 * Хук для роботи з перекладами
 */
export function useTranslations(options = {}) {
  const {
    locale = DEFAULT_LOCALE,
    namespace = null,
    useBackend = true,
    fallbackToStatic = true,
    enableAnalytics = false,
    cacheTime = CACHE_CONFIG.defaultTTL,
    validateKeys = true
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
  const loadingRef = useRef(false);

  // Очищення при unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Основна функція завантаження
  const loadTranslations = useCallback(async (targetLocale = locale, targetNamespace = namespace) => {
    // Валідація локалі
    if (!SUPPORTED_LOCALES.includes(targetLocale)) {
      console.error(`❌ Непідтримувана локаль: ${targetLocale}`);
      return {};
    }

    // Перевіряємо чи вже завантажуємо
    if (loadingRef.current) {
      console.log('⏳ Завантаження вже в процесі...');
      return state.translations;
    }

    const cacheKey = `${useBackend ? 'backend' : 'static'}_${targetLocale}_${targetNamespace || 'all'}`;
    
    // Перевіряємо кеш
    const cached = cacheManager.get(cacheKey);
    if (cached) {
      setState(prev => ({
        ...prev,
        translations: cached,
        currentLocale: targetLocale,
        loading: false,
        error: null,
        source: 'cache',
        lastUpdated: new Date().toISOString()
      }));
      return cached;
    }

    // Перевіряємо активні запити (deduplication)
    if (cacheManager.activeRequests.has(cacheKey)) {
      return new Promise((resolve) => {
        if (!cacheManager.requestQueue.has(cacheKey)) {
          cacheManager.requestQueue.set(cacheKey, []);
        }
        cacheManager.requestQueue.get(cacheKey).push(resolve);
      });
    }

    // Позначаємо запит як активний
    cacheManager.activeRequests.add(cacheKey);
    loadingRef.current = true;

    if (mountedRef.current) {
      setState(prev => ({ ...prev, loading: true, error: null }));
    }

    try {
      let translationsData = {};
      let source = 'static';

      if (useBackend) {
        try {
          const response = await retryWithBackoff(async () => {
            return await apiService.getTranslations(targetLocale, {
              namespace: targetNamespace,
              source: 'all',
              useCache: true,
              refresh: false
            });
          });
          
          translationsData = response.translations || {};
          source = response.source || 'backend';
          
          console.log(`✅ Завантажено ${Object.keys(translationsData).length} перекладів з backend`);
          
          // Аналітика успішного завантаження
          if (enableAnalytics) {
            console.log(`📊 Analytics: Translations loaded from ${source} for ${targetLocale}, count: ${Object.keys(translationsData).length}`);
          }
          
        } catch (error) {
          console.warn('⚠️ Помилка бекенду, використовуємо fallback:', error.message);
          
          if (fallbackToStatic) {
            translationsData = await loadStaticTranslations(targetLocale, targetNamespace);
            source = 'static_fallback';
          } else {
            throw error;
          }
        }
      } else {
        translationsData = await loadStaticTranslations(targetLocale, targetNamespace);
      }

      // Зберігаємо в кеш
      cacheManager.set(cacheKey, translationsData, cacheTime);

      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          translations: translationsData,
          currentLocale: targetLocale,
          loading: false,
          error: null,
          source,
          lastUpdated: new Date().toISOString()
        }));
      }

      // Сповіщаємо чергу
      const queue = cacheManager.requestQueue.get(cacheKey) || [];
      queue.forEach(resolve => resolve(translationsData));
      cacheManager.requestQueue.delete(cacheKey);

      return translationsData;

    } catch (error) {
      console.error(`❌ Критична помилка завантаження перекладів для ${targetLocale}:`, error.message);
      
      // Fallback до базових перекладів
      const fallbackTranslations = getBasicFallbackTranslations(targetLocale);
      
      if (mountedRef.current) {
        setState(prev => ({
          ...prev,
          translations: fallbackTranslations,
          currentLocale: targetLocale,
          loading: false,
          error: error.message,
          source: 'fallback',
          lastUpdated: new Date().toISOString()
        }));
      }

      return fallbackTranslations;

    } finally {
      loadingRef.current = false;
      cacheManager.activeRequests.delete(cacheKey);
    }
  }, [locale, namespace, useBackend, fallbackToStatic, cacheTime, enableAnalytics]);

  // Функція перекладу
  const t = useCallback((key, defaultValue = key, interpolations = {}) => {
    // Валідація ключа
    if (validateKeys && !validateTranslationKey(key)) {
      return defaultValue;
    }

    let translation = state.translations[key] || defaultValue;
    
    // Простка інтерполяція
    if (typeof translation === 'string' && Object.keys(interpolations).length > 0) {
      translation = translation.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
        return interpolations[variable] !== undefined ? interpolations[variable] : match;
      });
    }
    
    return translation;
  }, [state.translations, validateKeys]);

  // Функція для отримання перекладу з fallback
  const tWithFallback = useCallback((key, fallbacks = [], interpolations = {}) => {
    // Спочатку пробуємо основний ключ
    if (state.translations[key]) {
      return t(key, key, interpolations);
    }
    
    // Потім пробуємо fallback ключі
    for (const fallbackKey of fallbacks) {
      if (state.translations[fallbackKey]) {
        return t(fallbackKey, fallbackKey, interpolations);
      }
    }
    
    // Якщо нічого не знайдено, повертаємо перший ключ
    return key;
  }, [t, state.translations]);

  // Функція для перевірки існування перекладу
  const hasTranslation = useCallback((key) => {
    return !!state.translations[key];
  }, [state.translations]);

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

  // Функція очищення кешу
  const clearCache = useCallback((pattern = null) => {
    cacheManager.clear(pattern);
    console.log(`🧹 Кеш очищено${pattern ? ` (pattern: ${pattern})` : ''}`);
  }, []);

  // Функція для отримання статистики
  const getStats = useCallback(() => {
    return {
      ...cacheManager.getStats(),
      translationsCount: Object.keys(state.translations).length,
      currentLocale: state.currentLocale,
      source: state.source,
      lastUpdated: state.lastUpdated
    };
  }, [state]);

  // Автоматичне завантаження при монтуванні або зміні параметрів
  useEffect(() => {
    loadTranslations(locale, namespace);
  }, [locale, namespace, loadTranslations]);

  // Повертаємо API хука
  return {
    // Data
    translations: state.translations,
    locale: state.currentLocale,
    loading: state.loading,
    error: state.error,
    source: state.source,
    lastUpdated: state.lastUpdated,
    
    // Functions
    t,
    tWithFallback,
    hasTranslation,
    changeLocale,
    refresh,
    clearCache,
    loadTranslations,
    getStats,
    
    // Utils
    isLoading: state.loading,
    hasError: !!state.error,
    isReady: !state.loading && !state.error && Object.keys(state.translations).length > 0,
    translationsCount: Object.keys(state.translations).length,
    supportedLocales: SUPPORTED_LOCALES
  };
}

// ==================== ХУК ДЛЯ NAMESPACE ====================

/**
 * Хук для роботи з перекладами з підтримкою namespace
 * Використовується для завантаження перекладів з конкретних файлів
 */
export function usePageTranslations(namespace = null, options = {}) {
  const translationsApi = useTranslations({
    namespace,
    ...options
  });

  // Функція для отримання перекладу з namespace
  const t = useCallback((key, defaultValue = key, interpolations = {}) => {
    // Якщо є namespace і ключ не містить його, додаємо автоматично
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

// ==================== КОНТЕКСТ ДЛЯ ПЕРЕКЛАДІВ ====================

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
    
    const response = await apiService.getTranslations(locale, {
      source: 'all',
      useCache: true,
      ...options
    });
    
    console.log(`✅ Попередньо завантажено ${response.count || 0} перекладів`);
    return response;
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
    await apiService.clearServerTranslationsCache();
    
    console.log('✅ Синхронізація завершена');
    return true;
  } catch (error) {
    console.error('❌ Помилка синхронізації:', error.message);
    return false;
  }
}

/**
 * Функція для отримання статистики перекладів
 */
export function getTranslationsStats() {
  const stats = cacheManager.getStats();
  console.log('📊 Статистика перекладів:', stats);
  return stats;
}

/**
 * Функція для отримання статичних перекладів (для SSR)
 */
export async function getStaticTranslations(locale, namespace = null) {
  try {
    return await loadStaticTranslations(locale, namespace);
  } catch (error) {
    console.error(`❌ Помилка завантаження статичних перекладів:`, error.message);
    return getBasicFallbackTranslations(locale);
  }
}

/**
 * Функція для форматування чисел згідно локалі
 */
export function formatNumber(number, locale = DEFAULT_LOCALE, options = {}) {
  try {
    return new Intl.NumberFormat(locale, options).format(number);
  } catch (error) {
    console.warn('⚠️ Помилка форматування числа:', error.message);
    return number.toString();
  }
}

/**
 * Функція для форматування дат згідно локалі
 */
export function formatDate(date, locale = DEFAULT_LOCALE, options = {}) {
  try {
    return new Intl.DateTimeFormat(locale, options).format(new Date(date));
  } catch (error) {
    console.warn('⚠️ Помилка форматування дати:', error.message);
    return date.toString();
  }
}

/**
 * Функція для отримання напрямку тексту (RTL/LTR)
 */
export function getTextDirection(locale) {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale) ? 'rtl' : 'ltr';
}

// ==================== ЕКСПОРТ ЗА ЗАМОВЧУВАННЯМ ====================

export default useTranslations;
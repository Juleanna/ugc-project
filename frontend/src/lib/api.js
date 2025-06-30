// frontend/src/lib/api.js - ВИПРАВЛЕНИЙ
class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    this.timeout = 30000; // 30 секунд
    
    // Внутрішній кеш (без localStorage)
    this.cache = new Map();
    this.activeRequests = new Map();
  }

  // Базовий метод для запитів
  async request(endpoint, options = {}) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${this.baseURL}${endpoint}`;
      
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      };

      console.log(`🌐 API запит: ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('⚠️ Rate limit перевищено, чекаємо...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return this.request(endpoint, options); // Retry
        }
        
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log(`✅ API відповідь: ${Object.keys(data).length || 'OK'} записів`);
        return data;
      } else {
        return await response.text();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Запит перевищив час очікування');
      }
      console.error(`❌ API помилка: ${error.message}`);
      throw error;
    }
  }

  // GET запит
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST запит
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ==================== ПЕРЕКЛАДИ ====================
  
  /**
   * Универсальный метод для получения переводов
   */
  async getTranslations(locale = 'uk', options = {}) {
    const {
      source = 'all',           // all, static, po, dynamic
      namespace = null,         // фільтр за namespace
      useCache = true,         // використовувати кеш
      refresh = false          // примусове оновлення
    } = options;
    
    const cacheKey = `translations_${locale}_${source}_${namespace || 'all'}`;
    
    // Перевіряємо кеш
    if (useCache && !refresh && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      const cacheAge = Date.now() - cached.timestamp;
      const maxAge = 15 * 60 * 1000; // 15 хвилин
      
      if (cacheAge < maxAge) {
        console.log(`📦 Використання кешованих перекладів для ${locale}`);
        return cached.data;
      } else {
        this.cache.delete(cacheKey);
      }
    }
    
    // Перевіряємо активні запити (deduplication)
    if (this.activeRequests.has(cacheKey)) {
      console.log(`⏳ Очікування активного запиту перекладів для ${locale}`);
      return await this.activeRequests.get(cacheKey);
    }
    
    // Створюємо новий запит
    const requestPromise = this._fetchTranslations(locale, source, namespace, refresh);
    this.activeRequests.set(cacheKey, requestPromise);
    
    try {
      const result = await requestPromise;
      
      // Зберігаємо в кеш
      if (useCache) {
        this.cache.set(cacheKey, {
          data: result,
          timestamp: Date.now()
        });
        
        // Обмежуємо розмір кешу
        if (this.cache.size > 50) {
          const firstKey = this.cache.keys().next().value;
          this.cache.delete(firstKey);
        }
      }
      
      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }
  
  /**
   * Внутрішній метод для завантаження перекладів
   */
  async _fetchTranslations(locale, source, namespace, refresh) {
    try {
      const params = new URLSearchParams();
      if (source !== 'all') params.append('source', source);
      if (namespace) params.append('namespace', namespace);
      if (refresh) params.append('refresh', 'true');
      
      const endpoint = `/translations/${locale}/`;
      const url = params.toString() ? `${endpoint}?${params}` : endpoint;
      
      console.log(`🌍 Завантаження перекладів: ${locale} (${source})`);
      
      const response = await this.get(url);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      console.log(`✅ Завантажено ${response.count || 0} перекладів для ${locale}`);
      return response;
      
    } catch (error) {
      console.error(`❌ Помилка завантаження перекладів для ${locale}:`, error.message);
      
      // Fallback стратегія
      return await this._getFallbackTranslations(locale);
    }
  }
  
  /**
   * Fallback переклади якщо API недоступний
   */
  async _getFallbackTranslations(locale) {
    console.warn(`🔄 Використання fallback перекладів для ${locale}`);
    
    try {
      // Спробуємо завантажити статичні файли
      const staticResponse = await fetch(`/locales/${locale}/common.json`);
      if (staticResponse.ok) {
        const staticData = await staticResponse.json();
        return {
          locale,
          translations: this._flattenObject(staticData),
          count: Object.keys(staticData).length,
          source: 'static_fallback',
          cached: false,
          fallback: true
        };
      }
    } catch (staticError) {
      console.warn('⚠️ Статичні файли також недоступні:', staticError.message);
    }
    
    // Останній fallback - базові переклади
    const basicTranslations = this._getBasicTranslations(locale);
    return {
      locale,
      translations: basicTranslations,
      count: Object.keys(basicTranslations).length,
      source: 'basic_fallback',
      cached: false,
      fallback: true
    };
  }
  
  /**
   * Базові переклади для критичних випадків
   */
  _getBasicTranslations(locale) {
    if (locale === 'en') {
      return {
        'common.loading': 'Loading...',
        'common.error': 'Error occurred',
        'header.company': 'Company',
        'header.services': 'Services',
        'header.contact': 'Contact'
      };
    } else {
      return {
        'common.loading': 'Завантаження...',
        'common.error': 'Сталася помилка', 
        'header.company': 'Компанія',
        'header.services': 'Послуги',
        'header.contact': 'Контакти'
      };
    }
  }
  
  /**
   * Утиліта для сплощення об'єкта
   */
  _flattenObject(obj, prefix = '') {
    const flattened = {};
    
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, this._flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    }
    
    return flattened;
  }
  
  /**
   * Очищення кешу перекладів
   */
  clearTranslationsCache(locale = null) {
    if (locale) {
      // Очищаємо кеш для конкретної локалі
      for (const [key] of this.cache) {
        if (key.includes(`translations_${locale}_`)) {
          this.cache.delete(key);
        }
      }
    } else {
      // Очищаємо весь кеш перекладів
      for (const [key] of this.cache) {
        if (key.startsWith('translations_')) {
          this.cache.delete(key);
        }
      }
    }
    console.log(`🧹 Очищено кеш перекладів${locale ? ` для ${locale}` : ''}`);
  }
  
  /**
   * Webhook для очищення серверного кешу
   */
  async clearServerTranslationsCache() {
    try {
      await this.post('/webhooks/translations/', {});
      console.log('✅ Серверний кеш перекладів очищено');
      return true;
    } catch (error) {
      console.error('❌ Помилка очищення серверного кешу:', error.message);
      return false;
    }
  }
  
  // ==================== ІНШІ API МЕТОДИ ====================
  
  // Послуги
  async getServices() {
    return this.get('/services/');
  }
  
  // Проекти
  async getProjects() {
    return this.get('/projects/');
  }
  
  async getProjectCategories() {
    return this.get('/project-categories/');
  }
  
  // Контент сторінок
  async getHomePage() {
    return this.get('/homepage/');
  }
  
  async getAboutPage() {
    return this.get('/about/');
  }
  
  // Контакти
  async getOffices() {
    return this.get('/offices/');
  }
  
  async submitContactForm(data) {
    return this.post('/contact-inquiries/', data);
  }
  
  // Вакансії
  async getJobs() {
    return this.get('/jobs/');
  }
  
  async submitJobApplication(data) {
    return this.post('/job-applications/', data);
  }
}

// Експортуємо єдиний екземпляр
const apiService = new ApiService();
export default apiService;
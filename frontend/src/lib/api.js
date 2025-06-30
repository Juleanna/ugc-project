// frontend/src/lib/api.js - API БЕЗ ПЕРЕКЛАДІВ
'use client'

// ==================== КОНФІГУРАЦІЯ API ====================

const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
};

// ==================== API SERVICE ====================

class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.baseURL;
    this.timeout = API_CONFIG.timeout;
    this.cache = new Map();
    this.activeRequests = new Map(); // Для дедуплікації запитів
  }

  // ==================== БАЗОВІ HTTP МЕТОДИ ====================

  /**
   * Базовий запит з обробкою помилок та timeout
   */
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      timeout: this.timeout,
    };

    const requestOptions = { ...defaultOptions, ...options };
    
    // Створюємо унікальний ключ для запиту
    const requestKey = `${requestOptions.method || 'GET'}_${url}_${JSON.stringify(requestOptions.body || {})}`;
    
    // Перевіряємо чи вже виконується такий запит
    if (this.activeRequests.has(requestKey)) {
      console.log(`⏳ Очікування активного запиту: ${endpoint}`);
      return await this.activeRequests.get(requestKey);
    }

    // Створюємо promise для запиту
    const requestPromise = this._executeRequest(url, requestOptions);
    this.activeRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests.delete(requestKey);
    }
  }

  /**
   * Виконання HTTP запиту з timeout
   */
  async _executeRequest(url, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Запит перевищив час очікування (${this.timeout}ms)`);
      }
      
      throw error;
    }
  }

  // GET запит
  async get(endpoint, params = {}) {
    const url = new URL(endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`);
    
    // Додаємо параметри до URL
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });
    
    return this.request(url.toString(), { method: 'GET' });
  }

  // POST запит
  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT запит
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // PATCH запит
  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // DELETE запит
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ==================== КЕШ МЕТОДИ ====================

  /**
   * Отримати дані з кешу
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Зберегти дані в кеш
   */
  setCache(key, data, ttl = 5 * 60 * 1000) { // 5 хвилин за замовчуванням
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Очистити кеш
   */
  clearCache(pattern = null) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // ==================== API МЕТОДИ ДОДАТКУ ====================

  // ========== ПОСЛУГИ ==========
  async getServices() {
    const cacheKey = 'services';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/services/');
    this.setCache(cacheKey, data);
    return data;
  }

  async getService(id) {
    return this.get(`/services/${id}/`);
  }

  // ========== ПРОЕКТИ ==========
  async getProjects(params = {}) {
    const cacheKey = `projects_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/projects/', params);
    this.setCache(cacheKey, data);
    return data;
  }

  async getProject(id) {
    return this.get(`/projects/${id}/`);
  }

  async getProjectCategories() {
    const cacheKey = 'project_categories';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/project-categories/');
    this.setCache(cacheKey, data);
    return data;
  }

  // ========== КОНТЕНТ СТОРІНОК ==========
  async getHomePage(locale = 'uk') {
    const cacheKey = `homepage_${locale}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/homepage/', { locale });
    this.setCache(cacheKey, data);
    return data;
  }

  async getAboutPage(locale = 'uk') {
    const cacheKey = `about_${locale}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/about/', { locale });
    this.setCache(cacheKey, data);
    return data;
  }

  async getCompanyPage(locale = 'uk') {
    const cacheKey = `company_${locale}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/company/', { locale });
    this.setCache(cacheKey, data);
    return data;
  }

  // ========== КОНТАКТИ ==========
  async getOffices() {
    const cacheKey = 'offices';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/offices/');
    this.setCache(cacheKey, data);
    return data;
  }

  async submitContactForm(data) {
    return this.post('/contact-inquiries/', data);
  }

  // ========== ВАКАНСІЇ ==========
  async getJobs(params = {}) {
    const cacheKey = `jobs_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/jobs/', params);
    this.setCache(cacheKey, data, 2 * 60 * 1000); // 2 хвилини для вакансій
    return data;
  }

  async getJob(id) {
    return this.get(`/jobs/${id}/`);
  }

  async submitJobApplication(data) {
    return this.post('/job-applications/', data);
  }

  // ========== БЛОГ (якщо є) ==========
  async getBlogPosts(params = {}) {
    const cacheKey = `blog_posts_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/blog/', params);
    this.setCache(cacheKey, data);
    return data;
  }

  async getBlogPost(id) {
    return this.get(`/blog/${id}/`);
  }

  // ========== НАЛАШТУВАННЯ ==========
  async getSiteSettings() {
    const cacheKey = 'site_settings';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const data = await this.get('/settings/');
    this.setCache(cacheKey, data, 30 * 60 * 1000); // 30 хвилин для налаштувань
    return data;
  }

  // ========== ПОШУК ==========
  async search(query, params = {}) {
    if (!query.trim()) return { results: [], count: 0 };
    
    return this.get('/search/', { q: query, ...params });
  }

  // ========== СТАТИСТИКА ====================

  /**
   * Отримати статистику використання API
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      activeRequests: this.activeRequests.size,
      baseURL: this.baseURL,
      timeout: this.timeout
    };
  }

  /**
   * Очистити всі активні запити (для emergency reset)
   */
  clearActiveRequests() {
    this.activeRequests.clear();
    console.log('🧹 Очищено всі активні запити');
  }
}

// ==================== ЕКСПОРТ ====================

// Створюємо єдиний екземпляр
const apiService = new ApiService();

// Глобальний доступ для дебагу (тільки в development)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.apiService = apiService;
}

export default apiService;
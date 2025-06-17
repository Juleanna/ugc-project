// frontend/src/lib/api.js
class RateLimitedApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    this.timeout = 10000; // 10 секунд
    
    // Rate limiting
    this.requestQueue = []
    this.activeRequests = 0
    this.maxConcurrentRequests = 3
    this.requestDelay = 200 // мілісекунди між запитами
    this.lastRequestTime = 0
    
    // Request deduplication
    this.pendingRequests = new Map()
  }

  // Метод для контролю rate limiting
  async throttleRequest() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.requestDelay) {
      const delay = this.requestDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastRequestTime = Date.now()
  }

  // Базовий метод для запитів з rate limiting
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const requestKey = `${options.method || 'GET'}_${url}`
    
    // Перевіряємо чи вже є аналогічний запит
    if (this.pendingRequests.has(requestKey)) {
      console.log(`🔄 Повторне використання запиту: ${requestKey}`)
      return this.pendingRequests.get(requestKey)
    }
    
    // Створюємо promise для цього запиту
    const requestPromise = this.executeRequest(url, options)
    this.pendingRequests.set(requestKey, requestPromise)
    
    // Видаляємо з pending після завершення
    requestPromise.finally(() => {
      this.pendingRequests.delete(requestKey)
    })
    
    return requestPromise
  }

  async executeRequest(url, options = {}) {
    // Чекаємо на rate limit
    await this.throttleRequest()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Видаляємо Content-Type для FormData
    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      console.log(`📡 API запит: ${config.method || 'GET'} ${url}`)
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('⚠️ Rate limit exceeded, retrying after delay...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          return this.executeRequest(url, options) // Retry
        }
        
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json()
        console.log(`✅ API відповідь: ${Object.keys(data).length} записів`)
        return data
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Запит перевищив час очікування');
      }
      console.error(`❌ API помилка: ${error.message}`)
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

  // PUT запит
  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE запит
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // ==================== ПЕРЕКЛАДИ ====================
  
  /**
   * Отримання статичних перекладів з бекенду
   */
  async getStaticTranslations(locale = 'uk') {
    return this.get(`/translations/${locale}/`);
  }

  /**
   * Отримання динамічних перекладів з моделей
   */
  async getDynamicTranslations(locale = 'uk') {
    return this.get(`/dynamic-translations/${locale}/`);
  }

  /**
   * Отримання всіх перекладів (статичні + динамічні) з оптимізацією
   */
  async getAllTranslations(locale = 'uk') {
    try {
      // Спочатку намагаємося отримати статичні переклади
      const staticTranslations = await this.getStaticTranslations(locale)
        .catch(error => {
          console.warn(`Помилка статичних перекладів для ${locale}:`, error.message)
          return { translations: {} }
        })

      // Потім динамічні (з додатковою затримкою)
      await new Promise(resolve => setTimeout(resolve, 100))
      const dynamicTranslations = await this.getDynamicTranslations(locale)
        .catch(error => {
          console.warn(`Помилка динамічних перекладів для ${locale}:`, error.message)
          return { translations: {} }
        })

      return {
        locale,
        translations: {
          ...staticTranslations.translations,
          ...dynamicTranslations.translations
        }
      };
    } catch (error) {
      console.error('Помилка при отриманні всіх перекладів:', error);
      return { locale, translations: {} };
    }
  }

  // ==================== ІСНУЮЧІ МЕТОДИ ====================

  async getHomePage() {
    return this.get('/homepage/');
  }

  async getAboutPage() {
    return this.get('/about/');
  }

  async getServices(params = {}) {
    return this.get('/services/', params);
  }

  async getServiceById(id) {
    return this.get(`/services/${id}/`);
  }

  async getProjectCategories() {
    return this.get('/project-categories/');
  }

  async getProjects(params = {}) {
    return this.get('/projects/', params);
  }

  async getProjectById(id) {
    return this.get(`/projects/${id}/`);
  }

  async getFeaturedProjects() {
    return this.get('/projects/featured/');
  }

  async getProjectsByCategory(categorySlug) {
    return this.get('/projects/by_category/', { category: categorySlug });
  }

  async getJobs(params = {}) {
    return this.get('/jobs/', params);
  }

  async getJobById(id) {
    return this.get(`/jobs/${id}/`);
  }

  async getActiveJobs() {
    return this.get('/jobs/active/');
  }

  async submitJobApplication(data) {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'resume' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else {
        formData.append(key, data[key]);
      }
    });

    return this.request('/job-applications/', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async getOffices() {
    return this.get('/offices/');
  }

  async submitContactInquiry(data) {
    return this.post('/contact-inquiries/', data);
  }

  async getPartnershipInfo() {
    return this.get('/partnership-info/');
  }

  async submitPartnerInquiry(data) {
    return this.post('/partner-inquiries/', data);
  }

  async getWorkplacePhotos() {
    return this.get('/workplace-photos/');
  }

  // Метод для очищення pending requests
  clearPendingRequests() {
    this.pendingRequests.clear()
    console.log('🧹 Очищено pending requests')
  }
}

// Створюємо singleton instance
const apiService = new RateLimitedApiService();

export default apiService;
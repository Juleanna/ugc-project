// frontend/src/lib/api.js (спрощена версія для Context)
class SimpleApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    this.timeout = 10000; // 10 секунд
    
    // Simple rate limiting
    this.lastRequestTime = 0
    this.requestDelay = 500 // мілісекунди між запитами
    
    // Request deduplication для перекладів
    this.translationRequests = new Map()
  }

  // Простий rate limiting
  async throttleRequest() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < this.requestDelay) {
      const delay = this.requestDelay - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastRequestTime = Date.now()
  }

  // Базовий метод для запитів
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Rate limiting
    await this.throttleRequest()
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('⚠️ Rate limit exceeded, waiting...')
          await new Promise(resolve => setTimeout(resolve, 2000))
          throw new Error('Rate limit exceeded')
        }
        
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text();
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new Error('Запит перевищив час очікування');
      }
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

  // ==================== ПЕРЕКЛАДИ (оптимізовано) ====================
  
  /**
   * Отримання всіх перекладів з дедуплікацією
   */
  async getAllTranslations(locale = 'uk') {
    const requestKey = `translations_${locale}`
    
    // Перевіряємо чи вже є активний запит
    if (this.translationRequests.has(requestKey)) {
      console.log(`🔄 Повторне використання запиту для ${locale}`)
      return this.translationRequests.get(requestKey)
    }
    
    // Створюємо новий запит
    const requestPromise = this.executeTranslationRequest(locale)
    
    // Зберігаємо в мапі
    this.translationRequests.set(requestKey, requestPromise)
    
    // Видаляємо після завершення
    requestPromise.finally(() => {
      this.translationRequests.delete(requestKey)
    })
    
    return requestPromise
  }

  async executeTranslationRequest(locale) {
    try {
      console.log(`📡 Запит перекладів для ${locale}`)
      
      // Спочатку намагаємося отримати статичні переклади
      let staticTranslations = {}
      try {
        const staticResponse = await this.get(`/translations/${locale}/`)
        staticTranslations = staticResponse.translations || {}
        console.log(`📝 Статичні переклади: ${Object.keys(staticTranslations).length}`)
      } catch (error) {
        console.warn(`⚠️ Помилка статичних перекладів: ${error.message}`)
      }

      // Потім динамічні (з затримкою)
      await new Promise(resolve => setTimeout(resolve, 200))
      let dynamicTranslations = {}
      try {
        const dynamicResponse = await this.get(`/dynamic-translations/${locale}/`)
        dynamicTranslations = dynamicResponse.translations || {}
        console.log(`🔄 Динамічні переклади: ${Object.keys(dynamicTranslations).length}`)
      } catch (error) {
        console.warn(`⚠️ Помилка динамічних перекладів: ${error.message}`)
      }

      const allTranslations = {
        ...staticTranslations,
        ...dynamicTranslations
      }

      console.log(`✅ Загалом завантажено ${Object.keys(allTranslations).length} перекладів для ${locale}`)

      return {
        locale,
        translations: allTranslations
      };
    } catch (error) {
      console.error(`❌ Помилка завантаження перекладів для ${locale}:`, error);
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

  // Очистити активні запити перекладів
  clearTranslationRequests() {
    this.translationRequests.clear()
    console.log('🧹 Очищено активні запити перекладів')
  }
}

// Створюємо singleton instance
const apiService = new SimpleApiService();

export default apiService;
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

  // Додайте метод для отримання перекладів
async getTranslations(locale = 'uk') {
  const cacheKey = `translations_${locale}`;
  
  // Перевіряємо localStorage кеш
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    const cacheTime = 15 * 60 * 1000; // 15 хвилин
    
    if (Date.now() - timestamp < cacheTime) {
      console.log(`📦 Використання кешованих перекладів для ${locale}`);
      return data;
    }
  }
  
  try {
    const response = await this.get(`/translations/${locale}/`);
    
    // Зберігаємо в localStorage
    localStorage.setItem(cacheKey, JSON.stringify({
      data: response,
      timestamp: Date.now()
    }));
    
    return response;
  } catch (error) {
    console.error('Помилка завантаження перекладів:', error);
    
    // Fallback до статичних файлів
    const staticResponse = await fetch(`/locales/${locale}/common.json`);
    if (staticResponse.ok) {
      const staticData = await staticResponse.json();
      return {
        locale,
        translations: this.flattenObject(staticData),
        count: Object.keys(staticData).length,
        source: 'static'
      };
    }
    
    throw error;
  }
}

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
class ApiService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';
    this.timeout = 10000; // 10 секунд
  }

  // Базовий метод для запитів
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
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

      const response = await fetch(url, {
        ...config,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
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
   * @param {string} locale - локаль (uk, en)
   * @returns {Promise<Object>} - об'єкт з перекладами
   */
  async getStaticTranslations(locale = 'uk') {
    return this.get(`/translations/${locale}/`);
  }

  /**
   * Отримання перекладів з .po файлів
   * @param {string} locale - локаль (uk, en) 
   * @returns {Promise<Object>} - об'єкт з перекладами
   */
  async getPoTranslations(locale = 'uk') {
    return this.get(`/po-translations/${locale}/`);
  }

  /**
   * Отримання динамічних перекладів з моделей
   * @param {string} locale - локаль (uk, en)
   * @returns {Promise<Object>} - об'єкт з перекладами
   */
  async getDynamicTranslations(locale = 'uk') {
    return this.get(`/dynamic-translations/${locale}/`);
  }

  /**
   * Отримання всіх перекладів (статичні + динамічні)
   * @param {string} locale - локаль (uk, en)
   * @returns {Promise<Object>} - об'єднаний об'єкт з перекладами
   */
  async getAllTranslations(locale = 'uk') {
    try {
      const [staticTranslations, dynamicTranslations] = await Promise.all([
        this.getStaticTranslations(locale).catch(() => ({ translations: {} })),
        this.getDynamicTranslations(locale).catch(() => ({ translations: {} }))
      ]);

      return {
        locale,
        translations: {
          ...staticTranslations.translations,
          ...dynamicTranslations.translations
        }
      };
    } catch (error) {
      console.error('Помилка при отриманні перекладів:', error);
      return { locale, translations: {} };
    }
  }

  // ==================== ІСНУЮЧІ МЕТОДИ ====================

  // Головна сторінка
  async getHomePage() {
    return this.get('/homepage/');
  }

  // Про компанію
  async getAboutPage() {
    return this.get('/about/');
  }

  // Послуги
  async getServices(params = {}) {
    return this.get('/services/', params);
  }

  async getServiceById(id) {
    return this.get(`/services/${id}/`);
  }

  // Категорії проектів
  async getProjectCategories() {
    return this.get('/project-categories/');
  }

  // Проекти
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

  // Вакансії
  async getJobs(params = {}) {
    return this.get('/jobs/', params);
  }

  async getJobById(id) {
    return this.get(`/jobs/${id}/`);
  }

  async getActiveJobs() {
    return this.get('/jobs/active/');
  }

  // Подача заявки на роботу
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
      headers: {
        // Не встановлюємо Content-Type, браузер зробить це автоматично з boundary
      },
    });
  }

  // Офіси
  async getOffices() {
    return this.get('/offices/');
  }

  // Контактні запити
  async submitContactInquiry(data) {
    return this.post('/contact-inquiries/', data);
  }

  // Партнерство
  async getPartnershipInfo() {
    return this.get('/partnership-info/');
  }

  async submitPartnerInquiry(data) {
    return this.post('/partner-inquiries/', data);
  }

  // Фото робочих місць
  async getWorkplacePhotos() {
    return this.get('/workplace-photos/');
  }
}

// Створюємо singleton instance
const apiService = new ApiService();

export default apiService;
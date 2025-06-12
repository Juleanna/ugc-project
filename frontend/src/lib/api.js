const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Базовий метод для запитів
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
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

  // Методи для конкретних endpoints

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
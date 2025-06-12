import { useState, useEffect, useCallback } from 'react';
import apiService from '@/lib/api';

// Базовий хук для API запитів
export function useApi(apiMethod, params = null, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiMethod(params);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Хук для мутацій (POST, PUT, DELETE)
export function useApiMutation(apiMethod) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = async (payload) => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiMethod(payload);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  return { mutate, loading, error, data, reset };
}

// Специфічні хуки для різних сутностей

// Проекти
export function useProjects(params = {}) {
  return useApi(() => apiService.getProjects(params), params, [JSON.stringify(params)]);
}

export function useProject(id) {
  return useApi(() => apiService.getProjectById(id), id, [id]);
}

export function useFeaturedProjects() {
  return useApi(() => apiService.getFeaturedProjects());
}

export function useProjectsByCategory(categorySlug) {
  return useApi(() => apiService.getProjectsByCategory(categorySlug), categorySlug, [categorySlug]);
}

// Послуги
export function useServices(params = {}) {
  return useApi(() => apiService.getServices(params), params, [JSON.stringify(params)]);
}

export function useService(id) {
  return useApi(() => apiService.getServiceById(id), id, [id]);
}

// Вакансії
export function useJobs(params = {}) {
  return useApi(() => apiService.getJobs(params), params, [JSON.stringify(params)]);
}

export function useJob(id) {
  return useApi(() => apiService.getJobById(id), id, [id]);
}

export function useActiveJobs() {
  return useApi(() => apiService.getActiveJobs());
}

// Офіси
export function useOffices() {
  return useApi(() => apiService.getOffices());
}

// Головна сторінка
export function useHomePage() {
  return useApi(() => apiService.getHomePage());
}

// Про компанію
export function useAboutPage() {
  return useApi(() => apiService.getAboutPage());
}

// Категорії проектів
export function useProjectCategories() {
  return useApi(() => apiService.getProjectCategories());
}

// Фото робочих місць
export function useWorkplacePhotos() {
  return useApi(() => apiService.getWorkplacePhotos());
}

// Партнерство
export function usePartnershipInfo() {
  return useApi(() => apiService.getPartnershipInfo());
}

// Мутації
export function useSubmitJobApplication() {
  return useApiMutation((data) => apiService.submitJobApplication(data));
}

export function useSubmitContactInquiry() {
  return useApiMutation((data) => apiService.submitContactInquiry(data));
}

export function useSubmitPartnerInquiry() {
  return useApiMutation((data) => apiService.submitPartnerInquiry(data));
}
import { Disease } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    current: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters?: {
    language?: string;
    search?: string;
    severity?: string;
    animal?: string;
  };
}

export interface SearchParams {
  language?: string;
  search?: string;
  severity?: 'Low' | 'Medium' | 'High';
  animal?: string;
  limit?: number;
  page?: number;
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      console.log(`🌐 API Request: ${this.baseUrl}${endpoint}`);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API Response: ${endpoint}`, { 
        success: data.success, 
        dataLength: Array.isArray(data.data) ? data.data.length : 'single item'
      });
      
      return data;
    } catch (error) {
      console.error(`❌ API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // Get all diseases with optional filters
  async getDiseases(params: SearchParams = {}): Promise<Disease[]> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/cowandbuff${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest<Disease[]>(endpoint);
    return response.data;
  }

  // Get single disease by ID
  async getDiseaseById(id: string, language: string = 'en'): Promise<Disease> {
    const endpoint = `/cowandbuff/${id}?language=${language}`;
    const response = await this.makeRequest<Disease>(endpoint);
    return response.data;
  }

  // Search diseases by symptoms or disease name
  async searchDiseases(
    query: string, 
    type: 'symptoms' | 'disease' = 'symptoms',
    language: string = 'en'
  ): Promise<Disease[]> {
    const params: SearchParams = {
      search: query,
      language
    };

    return this.getDiseases(params);
  }

  // Get diseases by severity
  async getDiseasesBySeverity(
    severity: 'Low' | 'Medium' | 'High',
    language: string = 'en'
  ): Promise<Disease[]> {
    const params: SearchParams = {
      severity,
      language
    };

    return this.getDiseases(params);
  }

  // Get diseases by affected animals
  async getDiseasesByAnimal(
    animal: string,
    language: string = 'en'
  ): Promise<Disease[]> {
    const params: SearchParams = {
      animal,
      language
    };

    return this.getDiseases(params);
  }

  // Health check
  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      console.error('❌ Health check failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export individual functions for backward compatibility
export const getDiseases = (params?: SearchParams) => apiService.getDiseases(params);
export const getDiseaseById = (id: string, language?: string) => apiService.getDiseaseById(id, language);
export const searchDiseases = (query: string, type?: 'symptoms' | 'disease', language?: string) => 
  apiService.searchDiseases(query, type, language);
export const getDiseasesBySeverity = (severity: 'Low' | 'Medium' | 'High', language?: string) => 
  apiService.getDiseasesBySeverity(severity, language);
export const getDiseasesByAnimal = (animal: string, language?: string) => 
  apiService.getDiseasesByAnimal(animal, language);
// API client for making HTTP requests to our backend
// This abstracts the API calls and can be easily switched between mock and real endpoints

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Meeting endpoints
  async getMeetings() {
    return this.request('/meetings');
  }

  async getMeeting(id: string) {
    return this.request(`/meetings/${id}`);
  }

  // Event endpoints
  async getEvents() {
    return this.request('/events');
  }

  // Age group endpoints
  async getAgeGroups() {
    return this.request('/age-groups');
  }

  // Registration endpoints
  async createRegistration(registrationData: any) {
    return this.request('/registrations', {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  async getUserRegistrations(userId: string) {
    return this.request(`/registrations?userId=${userId}`);
  }
}

export const apiClient = new ApiClient();
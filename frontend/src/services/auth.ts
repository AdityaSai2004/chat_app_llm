import apiClient, { ApiResponse } from '@/lib/api';

// Types for authentication API
export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface User {
  id: number;
  username: string;
  created_at: string;
}

export interface UserProfileResponse {
  user: User;
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  
  /**
   * User signup - POST /auth/signup
   */
  async signup(credentials: SignupRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/signup', credentials);
      
      if (response.success && response.data?.access_token) {
        this.setToken(response.data.access_token);
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  /**
   * User login - POST /auth/login
   */
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      if (response.success && response.data?.access_token) {
        this.setToken(response.data.access_token);
      }
      
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Get current user info - GET /auth/me
   */
  async getCurrentUser(): Promise<ApiResponse<UserProfileResponse>> {
    try {
      if (!this.getToken()) {
        return {
          success: false,
          error: 'No authentication token found',
        };
      }

      const response = await apiClient.get<UserProfileResponse>('/auth/me');
      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get user info',
      };
    }
  }

  /**
   * Logout - clear token and user data
   */
  async logout(): Promise<void> {
    this.removeToken();
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('🔐 No token found');
      return false;
    }

    try {
      // Basic JWT token validation (check if it's not expired)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      console.log('🔐 Token validation:', { 
        exp: payload.exp, 
        currentTime, 
        isValid: payload.exp > currentTime 
      });
      
      if (payload.exp > currentTime) {
        return true;
      } else {
        console.log('🔐 Token expired, removing');
        this.removeToken();
        return false;
      }
    } catch (error) {
      // Invalid token format
      console.log('🔐 Invalid token format, removing:', error);
      this.removeToken();
      return false;
    }
  }

  /**
   * Get stored JWT token
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  /**
   * Store JWT token
   */
  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  /**
   * Remove JWT token
   */
  private removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  /**
   * Get user info from JWT token (without API call)
   */
  getUserFromToken(): Partial<User> | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('🔐 Token payload:', payload);
      return {
        id: parseInt(payload.sub), // Backend uses user ID as subject
      };
    } catch (error) {
      console.log('🔐 Error parsing token:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;
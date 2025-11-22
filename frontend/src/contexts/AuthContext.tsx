'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService, { User, LoginRequest, SignupRequest } from '@/services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  signup: (credentials: SignupRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize authentication state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      console.log('🔐 Initializing auth...');
      
      // Check if token exists and is valid
      if (authService.isAuthenticated()) {
        console.log('🔐 Token is valid, getting user info...');
        // Try to get current user info from API
        const response = await authService.getCurrentUser();
        console.log('🔐 Get current user response:', response);
        
        if (response.success && response.data?.user) {
          console.log('🔐 Setting user from initialization:', response.data.user);
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token might be invalid, clear it
          console.log('🔐 Failed to get user info, logging out');
          await authService.logout();
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // No valid token
        console.log('🔐 No valid token found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      console.log('🔐 Auth initialization complete');
      setIsLoading(false);
    }
  };

  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      console.log('🔐 Starting login process...', credentials.username);
      const response = await authService.login(credentials);
      console.log('🔐 Login response:', response);
      
      if (response.success) {
        // Get user info after successful login
        console.log('🔐 Getting user info after login...');
        const userResponse = await authService.getCurrentUser();
        console.log('🔐 User response:', userResponse);
        
        if (userResponse.success && userResponse.data?.user) {
          console.log('🔐 Setting user and authenticated state:', userResponse.data.user);
          setUser(userResponse.data.user);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          console.error('🔐 Failed to get user info:', userResponse);
          return { 
            success: false, 
            error: 'Failed to get user information after login' 
          };
        }
      } else {
        console.error('🔐 Login failed:', response.error);
        return { 
          success: false, 
          error: response.error || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('🔐 Login error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signup = useCallback(async (credentials: SignupRequest) => {
    try {
      setIsLoading(true);
      console.log('🔐 Starting signup process...', credentials.username);
      const response = await authService.signup(credentials);
      console.log('🔐 Signup response:', response);
      
      if (response.success) {
        // Get user info after successful signup
        console.log('🔐 Getting user info after signup...');
        const userResponse = await authService.getCurrentUser();
        console.log('🔐 User response after signup:', userResponse);
        
        if (userResponse.success && userResponse.data?.user) {
          console.log('🔐 Setting user and authenticated state after signup:', userResponse.data.user);
          setUser(userResponse.data.user);
          setIsAuthenticated(true);
          return { success: true };
        } else {
          console.error('🔐 Failed to get user info after signup:', userResponse);
          return { 
            success: false, 
            error: 'Failed to get user information after signup' 
          };
        }
      } else {
        console.error('🔐 Signup failed:', response.error);
        return { 
          success: false, 
          error: response.error || 'Signup failed' 
        };
      }
    } catch (error) {
      console.error('🔐 Signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Signup failed' 
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const response = await authService.getCurrentUser();
        
        if (response.success && response.data?.user) {
          setUser(response.data.user);
          setIsAuthenticated(true);
        } else {
          // Token might be invalid
          await logout();
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      await logout();
    }
  }, [logout]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
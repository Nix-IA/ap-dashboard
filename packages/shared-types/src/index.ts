// User related types
export interface User {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile extends User {
  bio?: string;
  timezone?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

// Authentication types
export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  metadata?: Record<string, any>;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard types
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

export interface Widget {
  id: string;
  type: 'chart' | 'stat' | 'table' | 'custom';
  title: string;
  data: any;
  config: Record<string, any>;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
}

// Webhook types
export interface WebhookEvent {
  id: string;
  type: string;
  payload: Record<string, any>;
  timestamp: string;
  source: string;
}

export interface WebhookResponse {
  success: boolean;
  processedAt: string;
  error?: string;
}

// Queue types
export interface QueueJob {
  id: string;
  type: string;
  payload: Record<string, any>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  attempts: number;
  maxAttempts: number;
  createdAt: string;
  processedAt?: string;
}

// Integration types
export interface Integration {
  id: string;
  name: string;
  type: string;
  config: Record<string, any>;
  enabled: boolean;
  lastSync?: string;
}

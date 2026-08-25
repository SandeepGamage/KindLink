import { Platform } from 'react-native';
import { authService } from './auth.service';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5000/api',
  ios: 'http://localhost:5000/api',
  web: 'http://localhost:5000/api',
  default: 'http://localhost:5000/api',
});

interface RequestOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

export class ApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T | null> {
    const { timeoutMs = 4000, headers = {}, ...customConfig } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Retrieve stored JWT token automatically
    let authToken: string | null = null;
    try {
      authToken = await authService.getStoredToken();
    } catch {
      authToken = null;
    }

    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(headers as Record<string, string>),
    };

    if (authToken && !authHeaders['Authorization']) {
      authHeaders['Authorization'] = `Bearer ${authToken}`;
    }

    const config: RequestInit = {
      headers: authHeaders,
      signal: controller.signal,
      ...customConfig,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return json.success !== undefined ? json.data ?? json : json;
    } catch (error) {
      console.log(`[ApiClient] ${options.method || 'GET'} ${endpoint} failed:`, (error as Error).message);
      return null;
    }
  }

  static get<T>(endpoint: string, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  static post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  static put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  static delete<T>(endpoint: string, options?: RequestOptions): Promise<T | null> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

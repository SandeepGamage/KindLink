/**
 * HTTP client for the admin services.
 *
 * Unlike the shared `ApiClient`, which returns `null` on failure, every method
 * here throws an `ApiError` carrying the backend's own message. That is what
 * lets the admin screens tell a failed request apart from an empty result and
 * show the real reason ("You cannot deactivate your own account") instead of a
 * generic message.
 *
 * NOTE: this duplicates the transport logic in `./apiClient.ts` on purpose —
 * this branch owns only the admin side, and editing the shared client would
 * conflict with teammates' work. Once the feature branches are merged, fold
 * this in as the throwing variant of `ApiClient` and delete this file.
 */
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

/**
 * Thrown by every failed request.
 *
 * `status` is the HTTP status, or 0 for transport-level failures (timeout, no
 * connectivity). `message` is the backend's own `message` field when it sent
 * one, so it is safe to surface directly in the UI.
 */
export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }

  /** True for timeouts / connectivity failures, as opposed to a server response. */
  get isNetworkError() {
    return this.status === 0;
  }
}

export class AdminApiClient {
  private static async request<T>(
    endpoint: string,
    options: RequestInit & RequestOptions = {}
  ): Promise<T> {
    // Generous by default: an admin screen surfaces failures to the user, so a
    // slow cold-start network should be waited out rather than reported as an error.
    const { timeoutMs = 15000, headers = {}, ...customConfig } = options;

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

      if (!response.ok) {
        // The backend answers every error path with { success: false, message }
        let body: any = null;
        try {
          body = await response.json();
        } catch {
          // Non-JSON error body (proxy/gateway); fall back to the status line.
        }
        throw new ApiError(
          body?.message || `Request failed (${response.status})`,
          response.status,
          body
        );
      }

      const json = await response.json();
      return (json.success !== undefined ? json.data ?? json : json) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      const err = error as Error;
      console.log(`[AdminApiClient] ${options.method || 'GET'} ${endpoint} failed:`, err.message);

      if (err.name === 'AbortError') {
        throw new ApiError('Request timed out. Check your connection.', 0, err);
      }
      throw new ApiError(err.message || 'Network request failed', 0, err);
    } finally {
      clearTimeout(timeoutId);
    }
  }

  static get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options });
  }

  static post<T>(endpoint: string, body: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      ...options,
    });
  }

  static put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      ...options,
    });
  }

  static delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', ...options });
  }
}

/**
 * KindLink Admin Portal — shared HTTP client.
 *
 * Mirrors mobile/src/services/admin-api-client.ts. In development Vite proxies
 * /api/* and /uploads/* to the backend, so the origin is empty; production
 * builds point at the backend through VITE_API_BASE_URL.
 */

/** Backend origin, without a trailing slash. Empty means same origin. */
export const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/+$/, '');
const API_BASE = `${API_ORIGIN}/api`;

export const TOKEN_KEY = 'kindlink_admin_token';

/** Fired on any 401 so AuthContext can drop the session. */
export const UNAUTHORIZED_EVENT = 'kindlink:unauthorized';

const DEFAULT_TIMEOUT_MS = 15_000;
const UPLOAD_TIMEOUT_MS = 30_000;

export class ApiError extends Error {
  /** HTTP status; 0 means the request never got a response (network / timeout). */
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

/**
 * Read at call time rather than from React state, so a request fired on the
 * first render after a reload still carries the restored session.
 */
export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Turns a stored `/uploads/...` path into something an <img> can load. */
export function resolveMediaUrl(path?: string | null): string | undefined {
  if (!path) return undefined;
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  return `${API_ORIGIN}${path.startsWith('/') ? '' : '/'}${path}`;
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const isForm = body instanceof FormData;
  // Leave Content-Type unset for FormData so the browser adds the boundary.
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    const timedOut = (err as Error).name === 'AbortError';
    throw new ApiError(
      timedOut
        ? 'The server took too long to respond.'
        : "Can't reach the server. Check your connection and try again.",
      0
    );
  } finally {
    clearTimeout(timer);
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // Non-JSON body (e.g. a proxy error page) — handled below.
  }

  if (!res.ok) {
    if (res.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(json?.message ?? `Request failed (${res.status}).`, res.status);
  }

  // Backend envelope is { success, data, message }.
  return (json && 'success' in json ? json.data ?? json : json) as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, body ?? {}),
  del: <T>(path: string) => request<T>('DELETE', path),
  postForm: <T>(path: string, form: FormData) =>
    request<T>('POST', path, form, UPLOAD_TIMEOUT_MS),
};

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'kindlink_auth_token';

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  const constantsObj = Constants as unknown as Record<string, any>;
  const hostUri =
    Constants.expoConfig?.hostUri ??
    constantsObj.manifest2?.extra?.expoGo?.developer?.extra?.hostUri ??
    constantsObj.manifest?.debuggerHost;

  if (typeof hostUri === 'string') {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:5000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'senior' | 'elderly' | 'volunteer' | 'admin';
  age?: number | null;
  mobile?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
  isVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  total: number;
  volunteers: number;
  elderly: number;
  admins: number;
}

export interface GetUsersResponse {
  users: UserRecord[];
  stats: UserStats;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export class UserServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'UserServiceError';
  }
}

// ---------------------------------------------------------------------------
// Helper for Fetch Headers
// ---------------------------------------------------------------------------

async function getHeaders(token?: string): Promise<Record<string, string>> {
  const authToken = token ?? (await getStoredToken());
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Get all users with optional search, role filter, and pagination.
 */
async function getAllUsers(
  params?: { search?: string; role?: string; page?: number; limit?: number },
  token?: string
): Promise<GetUsersResponse> {
  const headers = await getHeaders(token);

  const queryParts: string[] = [];
  if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
  if (params?.role) queryParts.push(`role=${encodeURIComponent(params.role)}`);
  if (params?.page) queryParts.push(`page=${params.page}`);
  if (params?.limit) queryParts.push(`limit=${params.limit}`);

  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

  let response: Response;
  try {
    response = await fetch(`${API_URL}/users${queryString}`, {
      method: 'GET',
      headers,
    });
  } catch {
    throw new UserServiceError('Unable to connect to server.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new UserServiceError(
      data?.message ?? 'Failed to fetch users.',
      response.status
    );
  }

  return data?.data ?? { users: [], stats: { total: 0, volunteers: 0, elderly: 0, admins: 0 }, pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 20 } };
}

/**
 * Get a single user by ID.
 */
async function getUserById(id: string, token?: string): Promise<UserRecord> {
  const headers = await getHeaders(token);

  let response: Response;
  try {
    response = await fetch(`${API_URL}/users/${id}`, {
      method: 'GET',
      headers,
    });
  } catch {
    throw new UserServiceError('Unable to connect to server.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new UserServiceError(
      data?.message ?? 'Failed to fetch user.',
      response.status
    );
  }

  return data?.data?.user;
}

export const userService = {
  getAllUsers,
  getUserById,
};

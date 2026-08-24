/**
 * review.service.ts
 *
 * Handles API calls for Ratings & Reviews.
 * Communicates with backend endpoints (/api/reviews).
 */

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

export interface ReviewUserRef {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  profileImage?: string;
}

export interface Review {
  _id: string;
  reviewer: ReviewUserRef | string;
  reviewee?: ReviewUserRef | string;
  request: string;
  rating: number;
  comment?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewPayload {
  request: string;
  rating: number;
  comment?: string;
  tags?: string[];
  reviewee?: string;
  reviewer?: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export class ReviewError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'ReviewError';
  }
}

// ---------------------------------------------------------------------------
// API Methods
// ---------------------------------------------------------------------------

/**
 * Submit or update a rating & review for an assistance request
 */
async function submitReview(payload: CreateReviewPayload, token?: string): Promise<Review> {
  const authToken = token ?? (await getStoredToken());

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err: any) {
    throw new ReviewError(
      'Unable to connect to server. Please check your network connection.',
      0
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ReviewError(
      data?.message ?? 'Failed to submit review. Please try again.',
      response.status
    );
  }

  return data.data;
}

/**
 * Get review for a specific request ID
 */
async function getReviewByRequest(requestId: string): Promise<Review | null> {
  if (!requestId) return null;

  try {
    const response = await fetch(`${API_URL}/reviews/request/${encodeURIComponent(requestId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json().catch(() => ({}));
    return data?.data ?? null;
  } catch {
    return null;
  }
}

/**
 * Get all reviews with optional filters
 */
async function getReviews(filters?: {
  request?: string;
  reviewer?: string;
  reviewee?: string;
  rating?: number;
}): Promise<Review[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.request) params.append('request', filters.request);
    if (filters?.reviewer) params.append('reviewer', filters.reviewer);
    if (filters?.reviewee) params.append('reviewee', filters.reviewee);
    if (filters?.rating) params.append('rating', filters.rating.toString());

    const url = `${API_URL}/reviews${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return [];

    const data = await response.json().catch(() => ({}));
    return data?.data ?? [];
  } catch {
    return [];
  }
}

/**
 * Get aggregated rating statistics
 */
async function getReviewStats(revieweeId?: string): Promise<ReviewStats> {
  try {
    const url = revieweeId
      ? `${API_URL}/reviews/stats?reviewee=${encodeURIComponent(revieweeId)}`
      : `${API_URL}/reviews/stats`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const data = await response.json().catch(() => ({}));
    return (
      data?.data ?? {
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      }
    );
  } catch {
    return {
      averageRating: 0,
      totalReviews: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }
}

export const reviewService = {
  submitReview,
  getReviewByRequest,
  getReviews,
  getReviewStats,
};

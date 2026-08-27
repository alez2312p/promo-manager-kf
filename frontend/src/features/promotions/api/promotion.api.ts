import {
  Promotion,
  PromotionMetrics,
  CreatePromotionInput,
  PromotionFilters,
  PromotionStatus,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    const errorMessage =
      data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMessage);
    (error as any).errorCode = data.errorCode;
    (error as any).details = data.details;
    throw error;
  }
  return data;
}

export const promotionApi = {
  getPromotions: async (filters?: PromotionFilters): Promise<{ data: Promotion[]; count: number }> => {
    const params = new URLSearchParams();
    if (filters?.status && filters.status !== 'ALL') {
      params.append('status', filters.status);
    }
    if (filters?.search) {
      params.append('search', filters.search.trim());
    }

    const url = `${API_BASE_URL}/promotions${params.toString() ? `?${params.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<{ data: Promotion[]; count: number }>(res);
  },

  getMetrics: async (): Promise<{ data: PromotionMetrics }> => {
    const res = await fetch(`${API_BASE_URL}/promotions/metrics`);
    return handleResponse<{ data: PromotionMetrics }>(res);
  },

  getById: async (id: string): Promise<{ data: Promotion }> => {
    const res = await fetch(`${API_BASE_URL}/promotions/${id}`);
    return handleResponse<{ data: Promotion }>(res);
  },

  create: async (payload: CreatePromotionInput): Promise<{ message: string; data: Promotion }> => {
    const res = await fetch(`${API_BASE_URL}/promotions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ message: string; data: Promotion }>(res);
  },

  update: async (
    id: string,
    payload: Partial<CreatePromotionInput>
  ): Promise<{ message: string; data: Promotion }> => {
    const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ message: string; data: Promotion }>(res);
  },

  updateStatus: async (
    id: string,
    status: PromotionStatus
  ): Promise<{ message: string; data: Promotion }> => {
    const res = await fetch(`${API_BASE_URL}/promotions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    return handleResponse<{ message: string; data: Promotion }>(res);
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ message: string }>(res);
  },
};

import { Agent, AgentFormData, ApiResponse, DashboardStats, PaginationMeta } from '../types/agent';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api';

export class ApiError extends Error {
  public code?: string;
  public details?: any[];
  public statusCode?: number;

  constructor(message: string, code?: string, details?: any[], statusCode?: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
    this.statusCode = statusCode;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T; pagination?: PaginationMeta; cached?: boolean }> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    const json: ApiResponse<T> = await res.json();

    if (!res.ok || !json.success) {
      throw new ApiError(
        json.error?.message || `Request failed with status ${res.status}`,
        json.error?.code,
        json.error?.details,
        res.status
      );
    }

    return {
      data: json.data,
      pagination: json.pagination,
      cached: json.cached,
    };
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Unable to connect to the backend server. Please verify backend is running.',
      'NETWORK_ERROR',
      undefined,
      0
    );
  }
}

export const agentApi = {
  async getAgents(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{ data: Agent[]; pagination: PaginationMeta; cached?: boolean }> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status && params.status !== 'ALL') query.append('status', params.status);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);

    const queryString = query.toString();
    const res = await request<Agent[]>(`/agents${queryString ? `?${queryString}` : ''}`, {
      cache: 'no-store',
    });

    return {
      data: res.data,
      pagination: res.pagination || {
        page: 1,
        limit: 10,
        total: res.data.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      cached: res.cached,
    };
  },

  async getAgentById(id: string): Promise<{ data: Agent; cached?: boolean }> {
    return request<Agent>(`/agents/${id}`);
  },

  async createAgent(data: AgentFormData): Promise<Agent> {
    const res = await request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateAgent(id: string, data: Partial<AgentFormData>): Promise<Agent> {
    const res = await request<Agent>(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res.data;
  },

  async updateStatus(id: string, status: 'ACTIVE' | 'INACTIVE'): Promise<Agent> {
    const res = await request<Agent>(`/agents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    return res.data;
  },

  async deleteAgent(id: string): Promise<void> {
    await request(`/agents/${id}`, {
      method: 'DELETE',
    });
  },

  async getStats(): Promise<{ data: DashboardStats; cached?: boolean }> {
    const res = await request<DashboardStats>('/agents/stats', { cache: 'no-store' });
    return { data: res.data, cached: res.cached };
  },

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },
};

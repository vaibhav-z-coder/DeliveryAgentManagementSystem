export type AgentStatus = 'ACTIVE' | 'INACTIVE';

export interface Agent {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
  vehicleType?: string | null;
  vehicleNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: PaginationMeta;
  cached?: boolean;
  error?: {
    message: string;
    code?: string;
    details?: any[];
  };
}

export interface DashboardStats {
  total: number;
  active: number;
  inactive: number;
  recentlyAdded: number;
  recentAgents: Agent[];
}

export interface AgentFormData {
  fullName: string;
  phone: string;
  email: string;
  serviceArea: string;
  status: AgentStatus;
  vehicleType?: string;
  vehicleNumber?: string;
}

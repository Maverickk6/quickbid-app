import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface Auction {
  id: string;
  title: string;
  description: string;
  startingPrice: number;
  currentPrice: number;
  minIncrement: number;
  endTime: string;
  status: 'ACTIVE' | 'ENDED' | 'CANCELLED';
  category: string;
  createdAt: string;
  updatedAt: string;
  creatorId?: string;
  creator?: {
    id: string;
    name: string | null;
  };
  bids: Bid[];
  _count: {
    bids: number;
  };
}

export interface Bid {
  id: string;
  amount: number;
  createdAt: string;
  isWinning: boolean;
  userId: string;
  auctionId: string;
  user: {
    id: string;
    name: string | null;
  };
  auction?: {
    id: string;
    title: string;
    status: string;
    currentPrice: number;
    endTime: string;
  };
}

export interface DashboardData {
  summary: {
    totalBids: number;
    auctionsWon: number;
    totalSpent: number;
    activeAuctions: number;
  };
  activeBids: Auction[];
  recentBids: Bid[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CategoryCount {
  name: string;
  count: number;
}

// API Functions
export const auctionApi = {
  // List auctions with filters
  list: async (params?: {
    status?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<PaginatedResponse<Auction>> => {
    const { data } = await api.get('/api/auctions', { params });
    return data;
  },

  // Get single auction
  get: async (id: string): Promise<{ data: Auction }> => {
    const { data } = await api.get(`/api/auctions/${id}`);
    return data;
  },

  // Get categories
  getCategories: async (): Promise<{ data: CategoryCount[] }> => {
    const { data } = await api.get('/api/auctions/categories/all');
    return data;
  },
};

export const bidApi = {
  // Place a bid
  place: async (auctionId: string, amount: number): Promise<{ data: Bid }> => {
    const { data } = await api.post('/api/bids', { auctionId, amount });
    return data;
  },

  // Get bid history for auction
  getHistory: async (auctionId: string): Promise<{ data: Bid[] }> => {
    const { data } = await api.get(`/api/bids/${auctionId}`);
    return data;
  },
};

export const dashboardApi = {
  // Get full dashboard
  get: async (): Promise<{ data: DashboardData }> => {
    const { data } = await api.get('/api/dashboard');
    return data;
  },

  // Get quick stats
  getStats: async (): Promise<{ data: { totalBids: number; auctionsWon: number; activeAuctions: number } }> => {
    const { data } = await api.get('/api/dashboard/stats');
    return data;
  },
};

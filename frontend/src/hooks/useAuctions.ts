'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { auctionApi, bidApi, dashboardApi } from '@/lib/api';

export const useAuctions = (filters?: {
  status?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  return useQuery({
    queryKey: ['auctions', filters],
    queryFn: () => auctionApi.list(filters),
  });
};

export const useAuction = (id: string) => {
  return useQuery({
    queryKey: ['auction', id],
    queryFn: () => auctionApi.get(id),
    enabled: !!id,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => auctionApi.getCategories(),
  });
};

export const usePlaceBid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auctionId, amount }: { auctionId: string; amount: number }) =>
      bidApi.place(auctionId, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auction', variables.auctionId] });
      queryClient.invalidateQueries({ queryKey: ['auctions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
};

export const useBidHistory = (auctionId: string) => {
  return useQuery({
    queryKey: ['bids', auctionId],
    queryFn: () => bidApi.getHistory(auctionId),
    enabled: !!auctionId,
  });
};

export const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.get(),
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => dashboardApi.getStats(),
  });
};

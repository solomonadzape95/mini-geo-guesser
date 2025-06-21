import { useQuery } from '@tanstack/react-query';
import { getUserGameHistory, getRecentGames, getUserBestScore } from '../services/history';
// import { UserHistoryEntry } from '../types';

// Query keys
export const historyKeys = {
  all: ['history'] as const,
  userHistory: (userId?: number) => [...historyKeys.all, 'userHistory', userId] as const,
  recentGames: (userId?: number, limit?: number) => [...historyKeys.all, 'recentGames', userId, limit] as const,
  bestScore: (userId?: number) => [...historyKeys.all, 'bestScore', userId] as const,
};

/**
 * Hook to fetch user's game history
 */
export function useUserHistoryQuery(userId?: number) {
  return useQuery({
    queryKey: historyKeys.userHistory(userId),
    queryFn: async () => {
      const response = await getUserGameHistory(userId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch user's recent games
 */
export function useRecentGamesQuery(userId?: number, limit: number = 10) {
  return useQuery({
    queryKey: historyKeys.recentGames(userId, limit),
    queryFn: async () => {
      const response = await getRecentGames(userId, limit);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch user's best score
 */
export function useUserBestScoreQuery(userId?: number) {
  return useQuery({
    queryKey: historyKeys.bestScore(userId),
    queryFn: async () => {
      const response = await getUserBestScore(userId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodayGame, getQuestionsForGame, playGame, saveGameResult } from '../services/games';
// import { TodayGameData, Game, Question } from '../types';

// Query keys
export const gameKeys = {
  all: ['games'] as const,
  today: () => [...gameKeys.all, 'today'] as const,
  questions: (gameId: number) => [...gameKeys.all, 'questions', gameId] as const,
  play: () => [...gameKeys.all, 'play'] as const,
};

/**
 * Hook to fetch today's game
 */
export function useTodayGameQuery() {
  return useQuery({
    queryKey: gameKeys.today(),
    queryFn: async () => {
      const response = await getTodayGame();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to fetch questions for a specific game
 */
export function useGameQuestionsQuery(gameId: number) {
  return useQuery({
    queryKey: gameKeys.questions(gameId),
    queryFn: async () => {
      const response = await getQuestionsForGame(gameId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!gameId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to play today's game (combines game and questions)
 */
export function usePlayGameQuery() {
  return useQuery({
    queryKey: gameKeys.play(),
    queryFn: async () => {
      const response = await playGame();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to save game result
 */
export function useSaveGameResultMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ gameId, score }: { gameId: number; score: number }) => {
      const response = await saveGameResult(gameId, score);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
      // You might also want to invalidate history queries here
    },
  });
} 
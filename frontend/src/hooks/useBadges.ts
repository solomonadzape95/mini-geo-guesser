import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBadgesWithCategories, getBadgesByCategory, getCategories } from '../services/badges';
import { getUserProfile, mintBadge } from "../services/auth";
// import { BadgeWithCategory } from '../types';

// Query keys
export const badgeKeys = {
  all: ['badges'] as const,
  withCategories: () => [...badgeKeys.all, 'withCategories'] as const,
  byCategory: (categoryId: number) => [...badgeKeys.all, 'byCategory', categoryId] as const,
  categories: () => [...badgeKeys.all, 'categories'] as const,
};

/**
 * Hook to fetch badges with their categories
 */
export function useBadgesQuery() {
  return useQuery({
    queryKey: badgeKeys.withCategories(),
    queryFn: async () => {
      const response = await getBadgesWithCategories();
      return response;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch badges by category
 */
export function useBadgesByCategoryQuery(categoryId: number) {
  return useQuery({
    queryKey: badgeKeys.byCategory(categoryId),
    queryFn: async () => {
      const response = await getBadgesByCategory(categoryId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

/**
 * Hook to fetch all categories
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: badgeKeys.categories(),
    queryFn: async () => {
      const response = await getCategories();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export const useMintBadge = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: mintBadge,
    onSuccess: () => {
      // Invalidate and refetch badges and profile after minting
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
  });
}; 
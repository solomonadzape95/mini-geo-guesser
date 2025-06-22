import { supabase } from "../config/supabaseClient";
import { BadgeWithCategory, BadgeWithCategoryAndClaimed, ApiResponse } from "../types";

/**
 * Fetch all badges with their categories and claimed status
 */
export async function getBadgesWithCategories(): Promise<BadgeWithCategoryAndClaimed[]> {
  try {
    // Fetch all badges with categories
    const { data: badges, error: badgesError } = await supabase
      .from('badges')
      .select(`
        *,
        category:categories(*)
      `)
      .order('id');

    if (badgesError) {
      throw new Error(badgesError.message);
    }

    // Fetch user's claimed badges
    const { data: userBadges, error: userBadgesError } = await supabase
      .from('user_badges')
      .select('badgeID')
      .order('created_at');

    if (userBadgesError) {
      throw new Error(userBadgesError.message);
    }

    // Create a set of claimed badge IDs for quick lookup
    const claimedBadgeIds = new Set(userBadges?.map(ub => ub.badgeID) || []);

    // Transform the data to match our BadgeWithCategory interface and add claimed status
    const badgesWithCategories: BadgeWithCategoryAndClaimed[] = (badges || []).map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      locked: badge.locked,
      created_at: badge.created_at,
      imageUrl: badge.imageUrl,
      category: badge.category,
      claimed: claimedBadgeIds.has(badge.id)
    }));

    return badgesWithCategories;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch badges');
  }
}

/**
 * Fetch badges by category
 */
export async function getBadgesByCategory(categoryId: number): Promise<ApiResponse<BadgeWithCategory[]>> {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('category', categoryId)
      .order('id');

    if (error) {
      return { data: null, error: error.message };
    }

    const badgesWithCategories: BadgeWithCategory[] = (data || []).map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      locked: badge.locked,
      created_at: badge.created_at,
      category: badge.category,
      imageUrl: badge.imageUrl
    }));

    return { data: badgesWithCategories, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch badges by category' 
    };
  }
}

/**
 * Fetch all categories
 */
export async function getCategories(): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('id');

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch categories' 
    };
  }
} 
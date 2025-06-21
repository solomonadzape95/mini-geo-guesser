import { supabase } from "../config/supabaseClient";
import { BadgeWithCategory, ApiResponse } from "../types";

/**
 * Fetch all badges with their categories
 */
export async function getBadgesWithCategories(): Promise<ApiResponse<BadgeWithCategory[]>> {
  try {
    const { data, error } = await supabase
      .from('badges')
      .select(`
        *,
        category:categories(*)
      `)
      .order('id');

    if (error) {
      return { data: null, error: error.message };
    }

    // Transform the data to match our BadgeWithCategory interface
    const badgesWithCategories: BadgeWithCategory[] = (data || []).map(badge => ({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      locked: badge.locked,
      created_at: badge.created_at,
      category: badge.category
    }));

    return { data: badgesWithCategories, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch badges' 
    };
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
      category: badge.category
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
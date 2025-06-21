import { supabase } from "../config/supabaseClient";
import { UserHistoryEntry, ApiResponse, Game } from "../types";

/**
 * Get user's game history
 * Note: This is a placeholder function. In a real implementation,
 * you would need to get the current user's ID from authentication context
 */
export async function getUserGameHistory(userId?: number): Promise<ApiResponse<UserHistoryEntry[]>> {
  try {
    // If no userId is provided, return empty array (placeholder behavior)
    if (!userId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('user_games')
      .select(`
        *,
        game:games(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    // Transform the data to match our UserHistoryEntry interface
    const historyEntries: UserHistoryEntry[] = (data || []).map(entry => ({
      id: entry.id,
      gameID: entry.gameID,
      score: entry.score,
      created_at: entry.created_at,
      game: entry.game as Game
    }));

    return { data: historyEntries, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch user history' 
    };
  }
}

/**
 * Get user's recent games (last 10)
 */
export async function getRecentGames(userId?: number, limit: number = 10): Promise<ApiResponse<UserHistoryEntry[]>> {
  try {
    if (!userId) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('user_games')
      .select(`
        *,
        game:games(*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      return { data: null, error: error.message };
    }

    const historyEntries: UserHistoryEntry[] = (data || []).map(entry => ({
      id: entry.id,
      gameID: entry.gameID,
      score: entry.score,
      created_at: entry.created_at,
      game: entry.game as Game
    }));

    return { data: historyEntries, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch recent games' 
    };
  }
}

/**
 * Get user's best score
 */
export async function getUserBestScore(userId?: number): Promise<ApiResponse<number | null>> {
  try {
    if (!userId) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('user_games')
      .select('score')
      .order('score', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data?.score || null, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch best score' 
    };
  }
} 
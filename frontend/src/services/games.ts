import { supabase } from "../config/supabaseClient";
import { Game, Question, TodayGameData, ApiResponse } from "../types";

/**
 * Fetch today's game from the games table
 */
export async function getTodayGame(): Promise<ApiResponse<Game>> {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('date', today)
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch today\'s game' 
    };
  }
}

/**
 * Fetch all questions for a specific game
 */
export async function getQuestionsForGame(gameId: number): Promise<ApiResponse<Question[]>> {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('gameID', gameId)
      .order('id');

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data || [], error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to fetch questions' 
    };
  }
}

/**
 * Play game function that combines today's game with its questions
 */
export async function playGame(): Promise<ApiResponse<TodayGameData>> {
  try {
    // First get today's game
    const gameResponse = await getTodayGame();
    if (gameResponse.error || !gameResponse.data) {
      return { 
        data: null, 
        error: gameResponse.error || 'No game available for today' 
      };
    }

    // Then get questions for the game
    const questionsResponse = await getQuestionsForGame(gameResponse.data.id);
    if (questionsResponse.error) {
      return { 
        data: null, 
        error: questionsResponse.error 
      };
    }

    const gameData: TodayGameData = {
      game: gameResponse.data,
      questions: questionsResponse.data || []
    };

    return { data: gameData, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to prepare game data' 
    };
  }
}

/**
 * Save a user's game result
 */
export async function saveGameResult(gameId: number, score: number): Promise<ApiResponse<{ id: number }>> {
  try {
    const { data, error } = await supabase
      .from('user_games')
      .insert({
        gameID: gameId,
        score: score,
        lastSignIn: new Date().toISOString()
      })
      .select('id')
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (error) {
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Failed to save game result' 
    };
  }
} 
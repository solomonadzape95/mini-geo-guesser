import { Database } from "../../../types";

// Extract base types from the database
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Question = Database["public"]["Tables"]["questions"]["Row"];
export type Badge = Database["public"]["Tables"]["badges"]["Row"];
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type UserGame = Database["public"]["Tables"]["user_games"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

// Composite types for enhanced data
export interface GameWithQuestions extends Game {
  questions: Question[];
}

export interface BadgeWithCategory extends Omit<Badge, 'category'> {
  category: Category | null;
}

export interface UserHistoryEntry extends UserGame {
  game: Game;
}

export interface TodayGameData {
  game: Game;
  questions: Question[];
}

// API response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

// Game state types
export interface GameState {
  currentQuestionIndex: number;
  score: number;
  answers: string[];
  isComplete: boolean;
}
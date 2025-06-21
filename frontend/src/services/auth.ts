import { sdk } from "@farcaster/frame-sdk";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://bc09-102-90-103-110.ngrok-free.app';

export interface User {
  fid: number;
  primaryAddress?: string;
  profileId?: number;
}

export interface UserProfile {
  fid: number;
  primaryAddress?: string;
  profileId?: number;
  games: any[];
  badges: any[];
}

export interface GameResult {
  gameId: number;
  score: number;
}

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/me`);
  if (!res.ok) {
    throw new Error('Failed to get current user');
  }
  return res.json();
};

// Get user profile with games and badges
export const getUserProfile = async (): Promise<UserProfile> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/profile`);
  if (!res.ok) {
    throw new Error('Failed to get user profile');
  }
  return res.json();
};

// Save game result
export const saveGameResult = async (gameResult: GameResult): Promise<any> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/games/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(gameResult),
  });
  
  if (!res.ok) {
    throw new Error('Failed to save game result');
  }
  return res.json();
};

// Get user's game history
export const getGameHistory = async (): Promise<any> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/games/history`);
  if (!res.ok) {
    throw new Error('Failed to get game history');
  }
  return res.json();
};

// Get user's badges
export const getUserBadges = async (): Promise<any> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/badges`);
  if (!res.ok) {
    throw new Error('Failed to get user badges');
  }
  return res.json();
}; 
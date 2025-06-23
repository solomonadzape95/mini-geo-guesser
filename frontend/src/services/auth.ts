import { sdk } from "@farcaster/frame-sdk";
import { supabase } from "../config/supabaseClient";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://your-backend.miniapps.farcaster.xyz';

export interface User {
  fid: number;
  primaryAddress?: string;
  profileId?: number;
}

export interface UserProfile {
  fid: number;
  primaryAddress?: string;
  profileId?: number;
  lastSignIn?: string;
  streak: number;
  games: any[];
  badges: Badge[];
}

export interface Badge {
  id: number;
  name: string | null;
  description: string | null;
  category: number | null;
  locked: boolean | null;
  claimed: boolean;
}

export interface GameResult {
  gameId: number;
  score: number;
  guessResult?: string | null;
  quizResult?: string | null;
}

export interface SaveGameResponse {
  success: boolean;
  gameResult: any;
  newStreak: number;
}

// Get current user
export const getCurrentUser = async (): Promise<User> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/me`);
  if (!res.ok) {
    throw new Error('Failed to get current user');
  }
  return res.json();
};

// Save game result
export const saveGameResult = async (gameResult: GameResult): Promise<SaveGameResponse> => {
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

// Get user's badges with claimed status
export const getUserBadges = async (): Promise<{ badges: Badge[] }> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/badges`);
  if (!res.ok) {
    throw new Error('Failed to get user badges');
  }
  return res.json();
};

// Mint a badge
export const mintBadge = async (badgeId: number): Promise<{ success: boolean; badge: any }> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/badges/mint`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ badgeId }),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to mint badge');
  }
  
  return res.json();
};

// Upsert user profile (username and pfp) in Supabase
export const upsertUserProfile = async ({ fid, username, pfpUrl }: { fid: string; username?: string | null; pfpUrl?: string | null }) => {
  if (!fid) return;
  // Only update username/pfp if provided, do not overwrite with null
  const updateObj: any = {
    fid: String(fid),
    lastSignIn: new Date().toISOString(),
  };
  if (username) updateObj.username = username;
  if (pfpUrl) updateObj.pfp = pfpUrl;
  // Only set streak: 0 on insert, not on update
  const { error } = await supabase.from('profiles').upsert(updateObj, { onConflict: 'fid', ignoreDuplicates: false });
  if (error) throw new Error(error.message);
}; 
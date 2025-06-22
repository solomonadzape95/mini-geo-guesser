import { sdk } from "@farcaster/frame-sdk";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export interface AllTimeLeaderboardEntry {
  fid: string;
  totalScore: number;
  gameCount: number;
}

export interface DailyLeaderboardEntry {
  fid: string;
  score: number;
}

export const getAllTimeLeaderboard = async (): Promise<AllTimeLeaderboardEntry[]> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/leaderboard/all-time`);
  if (!res.ok) {
    throw new Error('Failed to fetch all-time leaderboard');
  }
  return res.json();
};

export const getDailyLeaderboard = async (): Promise<DailyLeaderboardEntry[]> => {
  const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/leaderboard/daily`);
  if (!res.ok) {
    throw new Error('Failed to fetch daily leaderboard');
  }
  return res.json();
}; 
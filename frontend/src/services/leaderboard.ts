import { sdk } from "@farcaster/frame-sdk";
import { supabase } from "../config/supabaseClient";

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

// Supabase-based all-time leaderboard
export const getAllTimeLeaderboardSupabase = async () => {
  const { data, error } = await supabase
    .from('user_games')
    .select('score, userID, profiles:profiles!user_games_userID_fkey(fid, username, pfp)')
    .order('score', { ascending: false });
  if (error) throw new Error(error.message);
  const leaderboard: Record<string, { fid: string, username?: string, pfp?: string, totalScore: number, gameCount: number }> = {};
  (data || []).forEach((row: any) => {
    const fid = row.profiles?.fid || row.userID;
    if (!leaderboard[fid]) {
      leaderboard[fid] = {
        fid,
        username: row.profiles?.username,
        pfp: row.profiles?.pfp,
        totalScore: 0,
        gameCount: 0,
      };
    }
    leaderboard[fid].totalScore += row.score || 0;
    leaderboard[fid].gameCount += 1;
  });
  return Object.values(leaderboard).sort((a, b) => b.totalScore - a.totalScore).slice(0, 100);
};

// Supabase-based daily leaderboard
export const getDailyLeaderboardSupabase = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const { data, error } = await supabase
    .from('user_games')
    .select('score, userID, profiles:profiles!user_games_userID_fkey(fid, username, pfp), created_at')
    .gte('created_at', today.toISOString())
    .lt('created_at', tomorrow.toISOString())
    .order('score', { ascending: false });
  if (error) throw new Error(error.message);
  return (data || []).map((row: any) => ({
    fid: row.profiles?.fid || row.userID,
    username: row.profiles?.username,
    pfp: row.profiles?.pfp,
    score: row.score,
  }));
}; 
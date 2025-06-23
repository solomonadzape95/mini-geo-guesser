import { useQuery } from "@tanstack/react-query";
import { getAllTimeLeaderboard, getDailyLeaderboard, getAllTimeLeaderboardSupabase, getDailyLeaderboardSupabase } from "../services/leaderboard";

export const useAllTimeLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard", "all-time"],
    queryFn: getAllTimeLeaderboard,
  });
};

export const useDailyLeaderboard = () => {
  return useQuery({
    queryKey: ["leaderboard", "daily"],
    queryFn: getDailyLeaderboard,
  });
};

export const useAllTimeLeaderboardSupabase = () => {
  return useQuery({
    queryKey: ["leaderboard", "all-time", "supabase"],
    queryFn: getAllTimeLeaderboardSupabase,
  });
};

export const useDailyLeaderboardSupabase = () => {
  return useQuery({
    queryKey: ["leaderboard", "daily", "supabase"],
    queryFn: getDailyLeaderboardSupabase,
  });
}; 
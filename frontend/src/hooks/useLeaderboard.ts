import { useQuery } from "@tanstack/react-query";
import { getAllTimeLeaderboard, getDailyLeaderboard } from "../services/leaderboard";

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
import AppLayout from "../layout/AppLayout";
import { TrophyIcon } from "@heroicons/react/24/solid";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  badges: number;
  isCurrentUser?: boolean;
}

const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, username: "GeoMaster", score: 48750, badges: 12 },
  { rank: 2, username: "WorldExplorer", score: 45200, badges: 10 },
  { rank: 3, username: "TravelPro", score: 42100, badges: 9 },
  { rank: 4, username: "You", score: 38900, badges: 7, isCurrentUser: true },
  { rank: 5, username: "Adventurer", score: 35600, badges: 6 },
  { rank: 6, username: "Wanderlust", score: 32400, badges: 5 },
  { rank: 7, username: "GlobeTrotter", score: 29800, badges: 4 },
  { rank: 8, username: "MapQuester", score: 27200, badges: 4 },
  { rank: 9, username: "PathFinder", score: 25100, badges: 3 },
  { rank: 10, username: "Explorer", score: 23400, badges: 3 },
];

export default function Leaderboard() {
  return (
    <AppLayout>
      <div className="w-full min-h-screen py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-satoshi text-white mb-8 text-center">
            Global Leaderboard
          </h1>

          {/* Top 3 Players */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="order-1 md:order-1 pt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                <div className="flex justify-center mb-2">
                  <TrophyIcon className="w-8 h-8 text-gray-300" />
                </div>
                <div className="text-gray-300 font-satoshi text-lg">2nd</div>
                <div className="text-white font-satoshi truncate">
                  {leaderboardData[1].username}
                </div>
                <div className="text-blue-400 text-sm">
                  {leaderboardData[1].score.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 1st Place */}
            <div className="order-0 md:order-0">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center transform scale-110">
                <div className="flex justify-center mb-2">
                  <TrophyIcon className="w-10 h-10 text-yellow-400" />
                </div>
                <div className="text-yellow-400 font-satoshi text-xl">1st</div>
                <div className="text-white font-satoshi truncate">
                  {leaderboardData[0].username}
                </div>
                <div className="text-blue-400 text-sm">
                  {leaderboardData[0].score.toLocaleString()}
                </div>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="order-2 md:order-2 pt-8">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center">
                <div className="flex justify-center mb-2">
                  <TrophyIcon className="w-8 h-8 text-amber-700" />
                </div>
                <div className="text-amber-700 font-satoshi text-lg">3rd</div>
                <div className="text-white font-satoshi truncate">
                  {leaderboardData[2].username}
                </div>
                <div className="text-blue-400 text-sm">
                  {leaderboardData[2].score.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-6 py-3 text-left text-xs font-satoshi text-white/70">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-satoshi text-white/70">Player</th>
                    <th className="px-6 py-3 text-right text-xs font-satoshi text-white/70">Score</th>
                    <th className="px-6 py-3 text-right text-xs font-satoshi text-white/70">Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.slice(3).map((entry) => (
                    <tr
                      key={entry.rank}
                      className={`border-b border-white/5 ${
                        entry.isCurrentUser
                          ? "bg-blue-500/10"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-white/70">
                        {entry.rank}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-satoshi ${
                          entry.isCurrentUser ? "text-blue-400" : "text-white"
                        }`}>
                          {entry.username}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-white/70">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-white/70">
                        {entry.badges}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 
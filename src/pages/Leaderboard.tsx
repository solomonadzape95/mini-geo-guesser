import { useState } from "react";
import AppLayout from "../layout/AppLayout";

interface LeaderboardEntry {
  rank: number;
  username: string;
  score: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

const dailyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "Alice Johnson", score: 1550, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
  { rank: 2, username: "Bob Williams", score: 1420, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704e" },
  { rank: 3, username: "Charlie Brown", score: 1380, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704f" },
  { rank: 4, username: "You", score: 1200, isCurrentUser: true },
  { rank: 5, username: "David Miller", score: 1150 },
  { rank: 6, username: "Eva Green", score: 1100 },
  { rank: 7, username: "Frank White", score: 1050 },
  { rank: 8, username: "Grace Hall", score: 1000 },
  { rank: 9, username: "Henry King", score: 950 },
  { rank: 10, username: "Ivy Clark", score: 900 },
];

const monthlyLeaderboard: LeaderboardEntry[] = [
  { rank: 1, username: "GeoMaster", score: 48750, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704a" },
  { rank: 2, username: "WorldExplorer", score: 45200, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704b" },
  { rank: 3, username: "TravelPro", score: 42100, avatar: "https://i.pravatar.cc/150?u=a042581f4e29026704c" },
  { rank: 4, username: "You", score: 38900, isCurrentUser: true },
  { rank: 5, username: "Adventurer", score: 35600 },
  { rank: 6, username: "Wanderlust", score: 32400 },
  { rank: 7, username: "GlobeTrotter", score: 29800 },
  { rank: 8, username: "MapQuester", score: 27200 },
  { rank: 9, username: "PathFinder", score: 25100 },
  { rank: 10, username: "Explorer", score: 23400 },
];

type LeaderboardType = "daily" | "monthly";

function PodiumCard({ user, position }: { user: LeaderboardEntry; position: 'first' | 'second' | 'third' }) {
  const cardClasses = {
    first: 'bg-white/20 scale-110 z-10',
    second: 'bg-white/10 md:mt-8',
    third: 'bg-white/10 md:mt-8'
  };

  const rankCircleClasses = {
    first: 'bg-yellow-400 text-black',
    second: 'bg-gray-300 text-black',
    third: 'bg-amber-700 text-white'
  }

  return (
    <div className={`relative rounded-2xl p-4 text-center transform transition-transform duration-300 ${cardClasses[position]}`}>
      <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg ${rankCircleClasses[position]}`}>
        {user.rank}
      </div>
      <div className="mt-6">
        <div className="relative w-24 h-24 mx-auto mb-2">
          <div className="absolute inset-0 rounded-full border-4 border-blue-400/50" />
          {user.avatar ? (
            <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover p-1" />
          ) : (
            <div className="w-full h-full rounded-full bg-blue-500/20 flex items-center justify-center">
              <span className="text-3xl text-white/50">?</span>
            </div>
          )}
        </div>
        <div className="font-satoshi font-bold text-white truncate">{user.username}</div>
        <div className="text-blue-400 text-sm">{user.score.toLocaleString()} points</div>
      </div>
    </div>
  )
}

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('daily');
  const leaderboardData = activeTab === 'daily' ? dailyLeaderboard : monthlyLeaderboard;

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  return (
    <AppLayout>
      <div className="self-start w-full min-h-screen pt-8 px-4 md:px-8  pb-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-satoshi text-white mb-8 text-center">
            Global Leaderboard
          </h1>

          {/* Daily/Monthly Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-black/20 rounded-full p-1 flex items-center">
              <button
                onClick={() => setActiveTab('daily')}
                className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${activeTab === 'daily' ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10'}`}
              >
                Daily
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors ${activeTab === 'monthly' ? 'bg-blue-600 text-white' : 'text-white/70 hover:bg-white/10'}`}
              >
                Monthly
              </button>
            </div>
          </div>
          
          {/* Top 3 Players */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12 px-4">
            {topThree.length >= 2 && (
              <div className="md:order-1">
                <PodiumCard user={topThree[1]} position="second" />
              </div>
            )}
            {topThree.length >= 1 && (
              <div className="md:order-2">
                <PodiumCard user={topThree[0]} position="first" />
              </div>
            )}
            {topThree.length >= 3 && (
              <div className="md:order-3">
                <PodiumCard user={topThree[2]} position="third" />
              </div>
            )}
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {restOfLeaderboard.map((entry) => (
                    <tr
                      key={entry.rank}
                      className={`border-b border-white/5 ${
                        entry.isCurrentUser
                          ? "bg-blue-500/20"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-white/70 font-semibold w-16 text-center">{entry.rank}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-900/50 flex-shrink-0">
                            {entry.avatar && (
                               <img src={entry.avatar} alt={entry.username} className="w-full h-full rounded-full object-cover" />
                            )}
                          </div>
                          <span className={`font-satoshi ${
                            entry.isCurrentUser ? "text-blue-400" : "text-white"
                          } font-semibold`}>
                            {entry.username}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-white/90 font-semibold">
                        {entry.score.toLocaleString()}
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
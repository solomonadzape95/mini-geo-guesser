import { useState } from "react";
import AppLayout from "../layout/AppLayout";
import { useAllTimeLeaderboard, useDailyLeaderboard } from "../hooks/useLeaderboard";
import infiniteSpinner from "../assets/infinite-spinner.svg";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("daily");

  const { data: dailyData, isLoading: isLoadingDaily, error: dailyError } = useDailyLeaderboard();
  const { data: allTimeData, isLoading: isLoadingAllTime, error: allTimeError } = useAllTimeLeaderboard();

  const renderLeaderboardTable = (data: any[], isAllTime: boolean) => {
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-10 bg-white/5 rounded-lg">
          <p className="text-white/70">No entries yet. Be the first!</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10">
          <thead className="bg-white/5">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Rank</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Player (FID)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">
                {isAllTime ? "Total Score" : "Score"}
              </th>
              {isAllTime && (
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white/80 uppercase tracking-wider">Games Played</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white/10 divide-y divide-white/5">
            {data.map((entry, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">{entry.fid}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-400 font-bold">
                  {isAllTime ? entry.totalScore.toLocaleString() : entry.score.toLocaleString()}
                </td>
                {isAllTime && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white/90">{entry.gameCount}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    const isLoading = activeTab === 'daily' ? isLoadingDaily : isLoadingAllTime;
    const error = activeTab === 'daily' ? dailyError : allTimeError;
    const data = activeTab === 'daily' ? dailyData : allTimeData;

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-20">
          <img src={infiniteSpinner} alt="Loading..." className="w-16 h-16" />
        </div>
      );
    }

    if (error) {
      return <div className="text-center py-10 text-red-400">Error: {error.message}</div>;
    }

    return renderLeaderboardTable(data || [], activeTab === 'all-time');
  };

  return (
    <AppLayout>
      <div className="w-full max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-satoshi font-bold text-white">Leaderboard</h1>
          <p className="text-white/70 mt-2">See who's at the top of the game.</p>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-white/20">
            <button
              onClick={() => setActiveTab("daily")}
              className={`py-3 px-6 font-satoshi font-semibold text-lg transition-colors ${
                activeTab === "daily" ? "text-blue-400 border-b-2 border-blue-400" : "text-white/70 hover:text-white"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setActiveTab("all-time")}
              className={`py-3 px-6 font-satoshi font-semibold text-lg transition-colors ${
                activeTab === "all-time" ? "text-blue-400 border-b-2 border-blue-400" : "text-white/70 hover:text-white"
              }`}
            >
              All Time
            </button>
          </div>
        </div>

        <div className="bg-black/20 rounded-2xl overflow-hidden border border-white/10">
          {renderContent()}
        </div>
      </div>
    </AppLayout>
  );
};

export default Leaderboard; 
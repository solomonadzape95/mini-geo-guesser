import AppLayout from "../layout/AppLayout";
import { MapPinIcon, TrophyIcon, ClockIcon } from "@heroicons/react/24/outline";

interface GameHistory {
  id: string;
  date: string;
  location: string;
  score: number;
  distance: number;
  badges: string[];
}

const gameHistory: GameHistory[] = [
  {
    id: "1",
    date: "2024-03-20",
    location: "Paris, France",
    score: 4850,
    distance: 12.5,
    badges: ["European Explorer", "City Navigator"],
  },
  {
    id: "2",
    date: "2024-03-19",
    location: "Rome, Italy",
    score: 4200,
    distance: 45.8,
    badges: ["Historical Sites"],
  },
  {
    id: "3",
    date: "2024-03-18",
    location: "Barcelona, Spain",
    score: 3950,
    distance: 78.2,
    badges: ["Coastal Explorer"],
  },
];

export default function History() {
  return (
    <AppLayout>
      <div className="w-full min-h-screen py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-satoshi text-white mb-8 text-center">
            Game History
          </h1>

          <div className="space-y-4">
            {gameHistory.map((game) => (
              <div
                key={game.id}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinIcon className="w-5 h-5 text-blue-400" />
                      <h2 className="text-xl font-satoshi text-white">
                        {game.location}
                      </h2>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        {new Date(game.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrophyIcon className="w-4 h-4" />
                        {game.score.toLocaleString()} pts
                      </div>
                      <div>
                        {game.distance} km away
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {game.badges.map((badge, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {gameHistory.length === 0 && (
            <div className="text-center text-white/70 py-12">
              No games played yet. Start playing to see your history!
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
} 
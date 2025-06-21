import { Suspense } from "react";
import AppLayout from "../layout/AppLayout";
import { MapPinIcon, TrophyIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useUserHistoryQuery } from "../hooks/useHistory";
import { SkeletonGameCard } from "../components/Skeleton";

// Placeholder for user ID - in a real app this would come from auth context
const CURRENT_USER_ID = 1; // This should be replaced with actual user ID from auth

function HistoryContent() {
  const { data: history, isLoading, error } = useUserHistoryQuery(CURRENT_USER_ID);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <SkeletonGameCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-12">
        <p>Failed to load game history</p>
        <p className="text-sm text-white/70 mt-2">{error.message}</p>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="text-center text-white/70 py-12">
        <div className="max-w-md mx-auto">
          <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-satoshi text-white mb-2">
            You haven't played any games yet
          </h3>
          <p className="text-white/60">
            Start playing to see your game history and track your progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((gameEntry) => (
        <div
          key={gameEntry.id}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MapPinIcon className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-satoshi text-white">
                  {gameEntry.game.name || "Unknown Location"}
                </h2>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-white/70">
                <div className="flex items-center gap-1">
                  <ClockIcon className="w-4 h-4" />
                  {new Date(gameEntry.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <TrophyIcon className="w-4 h-4" />
                  {gameEntry.score?.toLocaleString() || 0} pts
                </div>
                {gameEntry.game.coords && (
                  <div className="text-xs">
                    Coordinates: {gameEntry.game.coords}
                  </div>
                )}
              </div>
            </div>

            {/* Badges section - placeholder for future implementation */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">
                Game Completed
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function History() {
  return (
    <AppLayout>
      <div className="w-full min-h-screen py-8 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-satoshi text-white mb-8 text-center">
            Game History
          </h1>

          <Suspense fallback={
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <SkeletonGameCard key={index} />
              ))}
            </div>
          }>
            <HistoryContent />
          </Suspense>
        </div>
      </div>
    </AppLayout>
  );
} 
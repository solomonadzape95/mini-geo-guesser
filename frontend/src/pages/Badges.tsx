import { Suspense } from "react";
import AppLayout from "../layout/AppLayout";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { CheckIcon } from "@heroicons/react/24/outline";
import { useBadgesQuery } from "../hooks/useBadges";
import { SkeletonCard } from "../components/Skeleton";
import { BadgeWithCategoryAndClaimed } from "../types";

function BadgesContent() {
  const { data: badges, isLoading, error } = useBadgesQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 py-12">
        <p>Failed to load badges</p>
        <p className="text-sm text-white/70 mt-2">{error.message}</p>
      </div>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <div className="text-center text-white/70 py-12">
        <div className="max-w-md mx-auto">
          <LockClosedIcon className="w-16 h-16 mx-auto mb-4 text-white/30" />
          <h3 className="text-xl font-satoshi text-white mb-2">
            No badges available
          </h3>
          <p className="text-white/60">
            Start playing games to unlock achievements and badges!
          </p>
        </div>
      </div>
    );
  }

  // Group badges by category
  const badgesByCategory = badges.reduce((acc, badge) => {
    const categoryId = String(badge.category?.id || 'uncategorized');
    const categoryName = badge.category?.name || 'Uncategorized';
    const categoryDescription = badge.category?.description || 'Miscellaneous achievements';
    
    if (!acc[categoryId]) {
      acc[categoryId] = {
        id: categoryId,
        name: categoryName,
        description: categoryDescription,
        badges: []
      };
    }
    
    acc[categoryId].badges.push(badge);
    return acc;
  }, {} as Record<string, { id: string; name: string; description: string; badges: BadgeWithCategoryAndClaimed[] }>);

  const categories = Object.values(badgesByCategory);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl md:text-2xl font-satoshi text-white mb-2">
                {category.name}
              </h2>
              <p className="text-sm text-white/70">{category.description}</p>
            </div>
          </div>

          <div className="space-y-4">
            {category.badges.map((badge) => (
              <div
                key={badge.id}
                className={`relative rounded-xl p-4 ${
                  !badge.locked ? "bg-white/20" : "bg-white/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <img src={badge.imageUrl} alt={badge.name || 'Badge'} className="w-16 h-16 rounded-lg" />
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-satoshi text-white">
                        {badge.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {badge.locked && (
                          <LockClosedIcon className="w-5 h-5 text-white/50" />
                        )}
                        {!badge.locked && badge.claimed && (
                          <CheckIcon className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-white/70 mb-2">
                      {badge.description || "No description available"}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/50 uppercase">
                        {badge.locked ? "Locked" : badge.claimed ? "Claimed" : "Unclaimed"}
                      </div>
                      {/* {!badge.locked && (
                        <div className="h-1 w-24 bg-white/20 rounded-full">
                          <div className={`h-full rounded-full w-full ${
                            badge.claimed ? "bg-green-500" : "bg-gray-500"
                          }`} />
                        </div>
                      )} */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Badges() {
  return (
    <AppLayout>
      <div className="self-start w-full min-h-screen py-8 px-4 md:px-8">
        <h1 className="text-3xl md:text-4xl font-satoshi text-white mb-8 text-center">
          Your Achievements
        </h1>
        
        <Suspense fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        }>
          <BadgesContent />
        </Suspense>
      </div>
    </AppLayout>
  );
} 
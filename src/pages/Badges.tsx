import AppLayout from "../layout/AppLayout";
import { LockClosedIcon } from "@heroicons/react/24/solid";

interface Badge {
  id: string;
  name: string;
  description: string;
  progress: string;
  unlocked: boolean;
}

interface BadgeCategory {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  badges: Badge[];
}

const badgeCategories: BadgeCategory[] = [
  {
    id: "europe",
    name: "European Explorer",
    description: "Master of European geography",
    unlocked: true,
    badges: [
      {
        id: "baltic-beast",
        name: "Baltic Beast",
        description: "Successfully identify 3 Baltic countries (Estonia, Latvia, Lithuania)",
        progress: "0/3",
        unlocked: true,
      },
      {
        id: "mediterranean-master",
        name: "Mediterranean Master",
        description: "Guess 5 Mediterranean coastal countries",
        progress: "0/5",
        unlocked: true,
      },
      {
        id: "alpine-ace",
        name: "Alpine Ace",
        description: "Identify 3 Alpine region countries",
        progress: "0/3",
        unlocked: true,
      },
      {
        id: "nordic-navigator",
        name: "Nordic Navigator",
        description: "Find 4 Nordic countries",
        progress: "0/4",
        unlocked: true,
      },
    ],
  },
  {
    id: "asia",
    name: "Asian Adventure",
    description: "Expert of Asian territories",
    unlocked: false,
    badges: [
      {
        id: "himalayan-hero",
        name: "Himalayan Hero",
        description: "Locate 3 countries in the Himalayan region",
        progress: "0/3",
        unlocked: false,
      },
      {
        id: "southeast-sage",
        name: "Southeast Sage",
        description: "Master 5 Southeast Asian countries",
        progress: "0/5",
        unlocked: false,
      },
      {
        id: "steppe-specialist",
        name: "Steppe Specialist",
        description: "Identify 3 Central Asian steppe countries",
        progress: "0/3",
        unlocked: false,
      },
    ],
  },
  {
    id: "africa",
    name: "African Adventurer",
    description: "Conqueror of African geography",
    unlocked: false,
    badges: [
      {
        id: "saharan-seeker",
        name: "Saharan Seeker",
        description: "Find 4 countries in the Sahara region",
        progress: "0/4",
        unlocked: false,
      },
      {
        id: "savanna-scout",
        name: "Savanna Scout",
        description: "Locate 5 countries in the African savanna",
        progress: "0/5",
        unlocked: false,
      },
      {
        id: "great-lakes-guru",
        name: "Great Lakes Guru",
        description: "Master 3 African Great Lakes countries",
        progress: "0/3",
        unlocked: false,
      },
    ],
  },
  {
    id: "americas",
    name: "Americas Authority",
    description: "Master of the New World",
    unlocked: false,
    badges: [
      {
        id: "andean-ace",
        name: "Andean Ace",
        description: "Identify 3 countries along the Andes",
        progress: "0/3",
        unlocked: false,
      },
      {
        id: "caribbean-captain",
        name: "Caribbean Captain",
        description: "Find 4 Caribbean island nations",
        progress: "0/4",
        unlocked: false,
      },
      {
        id: "amazon-expert",
        name: "Amazon Expert",
        description: "Locate 3 countries containing the Amazon rainforest",
        progress: "0/3",
        unlocked: false,
      },
    ],
  },
  {
    id: "terrain",
    name: "Terrain Tracker",
    description: "Expert of geographical features",
    unlocked: false,
    badges: [
      {
        id: "island-insider",
        name: "Island Insider",
        description: "Identify 5 island nations worldwide",
        progress: "0/5",
        unlocked: false,
      },
      {
        id: "desert-detective",
        name: "Desert Detective",
        description: "Find 4 countries with major deserts",
        progress: "0/4",
        unlocked: false,
      },
      {
        id: "mountain-master",
        name: "Mountain Master",
        description: "Locate 5 countries with major mountain ranges",
        progress: "0/5",
        unlocked: false,
      },
    ],
  },
];

export default function Badges() {
  return (
    <AppLayout>
      <div className="w-full min-h-screen py-8 px-4 md:px-8">
        <h1 className="text-3xl md:text-4xl font-satoshi text-white mb-8 text-center">
          Your Achievements
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {badgeCategories.map((category) => (
            <div
              key={category.id}
              className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border ${
                category.unlocked ? "border-white/20" : "border-white/10"
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-satoshi text-white mb-2">
                    {category.name}
                  </h2>
                  <p className="text-sm text-white/70">{category.description}</p>
                </div>
                {!category.unlocked && (
                  <LockClosedIcon className="w-6 h-6 text-white/50" />
                )}
              </div>

              <div className="space-y-4">
                {category.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`relative rounded-xl p-4 ${
                      badge.unlocked && category.unlocked
                        ? "bg-white/20"
                        : "bg-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-satoshi text-white">
                        {badge.name}
                      </h3>
                      {(!badge.unlocked || !category.unlocked) && (
                        <LockClosedIcon className="w-5 h-5 text-white/50" />
                      )}
                    </div>
                    <p className="text-sm text-white/70 mb-2">{badge.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-white/50">{badge.progress}</div>
                      {badge.unlocked && category.unlocked && (
                        <div className="h-1 w-24 bg-white/20 rounded-full">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{
                              width: `${
                                (parseInt(badge.progress.split("/")[0]) /
                                  parseInt(badge.progress.split("/")[1])) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
} 
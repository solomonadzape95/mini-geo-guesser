import { useState, useEffect, useRef } from "react";
import {  useLocation } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { useBadgesQuery, useMintBadge } from "../hooks/useBadges";
import infiniteSpinner from "../assets/infinite-spinner.svg";
import { BadgeWithCategory } from "../types";
import { getGameHistory } from "../services/auth";

const STREAK_BADGES: { [key: number]: string } = {
  1: "1-Day Streak",
  3: "3-Day Streak",
  5: "5-Day Streak",
};

function BadgeMintContent() {
  const location = useLocation();
  const { badgeId: gameBadgeId, streak: initialStreak } = location.state || {};

  const { data: badges, isLoading: isLoadingBadges, error: badgesError, refetch: refetchBadges } = useBadgesQuery();
  const mintBadgeMutation = useMintBadge();

  const [gameBadge, setGameBadge] = useState<BadgeWithCategory | null>(null);
  const [streakBadge, setStreakBadge] = useState<BadgeWithCategory | null>(null);
  const [mintStatus, setMintStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const badgeCardRef = useRef(null);
  const [txHashes, setTxHashes] = useState<{[badgeId: number]: string[]}>({});
  const [streak, setStreak] = useState<number | null>(initialStreak || null);
  const [streakBadgeAvailable, setStreakBadgeAvailable] = useState(false);

  // On load, determine game badge and streak badge availability
  useEffect(() => {
    if (badges && gameBadgeId) {
      const foundBadge = badges.find((b: BadgeWithCategory) => b.id === gameBadgeId);
      setGameBadge(foundBadge || null);
    }
  }, [badges, gameBadgeId]);

  // Calculate streak from game history if not provided
  useEffect(() => {
    if (streak === null) {
      getGameHistory().then((res) => {
        if (res && res.games) {
          // Calculate streak from games (consecutive days)
          const dateStrings = Array.from(new Set(res.games.map((g: any) => typeof g.games?.date === 'string' ? g.games.date : undefined))).filter(Boolean) as string[];
          const dates = dateStrings.sort().reverse();
          if (dates.length > 0) {
            let calculatedStreak = 1;
            let current = new Date(dates[0]);
            for (let i = 1; i < dates.length; i++) {
              const next = new Date(dates[i]);
              const diff = (current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24);
              if (diff === 1) {
                calculatedStreak++;
                current = next;
              } else {
                break;
              }
            }
            setStreak(calculatedStreak);
          }
        }
      });
    }
  }, [streak]);

  // Check if streak badge is available to mint
  useEffect(() => {
    if (!badges || !streak) return;
    if (![1, 3, 5].includes(streak)) return;
    const streakBadgeName = STREAK_BADGES[streak];
    const streakBadgeToMint = badges.find((b: BadgeWithCategory) => b.name === streakBadgeName);
    if (streakBadgeToMint && !streakBadgeToMint.claimed) {
      setStreakBadge(streakBadgeToMint);
      setStreakBadgeAvailable(true);
    } else {
      setStreakBadge(null);
      setStreakBadgeAvailable(false);
    }
  }, [badges, streak]);

  // Mint both badges (game + streak if available)
  const handleMint = async () => {
    if (!gameBadge) return;
    setMintStatus("minting");
    setErrorMessage("");
    const newTxHashes: {[badgeId: number]: string[]} = {};
    try {
      // Mint the game badge
      const result = await mintBadgeMutation.mutateAsync(gameBadge.id);
      const hashes = (result as any)?.txHashes;
      if (Array.isArray(hashes)) {
        newTxHashes[gameBadge.id] = hashes.filter((h: any) => typeof h === 'string');
      }
      await refetchBadges();
      // Mint streak badge if available
      if (streakBadge && streakBadgeAvailable) {
        const streakResult = await mintBadgeMutation.mutateAsync(streakBadge.id);
        const streakHashes = (streakResult as any)?.txHashes;
        if (Array.isArray(streakHashes)) {
          newTxHashes[streakBadge.id] = streakHashes.filter((h: any) => typeof h === 'string');
        }
        await refetchBadges();
      }
      setTxHashes(newTxHashes);
      setMintStatus("success");
    } catch (error) {
      setMintStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to mint badge");
    }
  };

  // Share to Farcaster
  const handleShare = (badge: BadgeWithCategory) => {
    const badgeName = badge.name;
    const text = `I just minted the \"${badgeName}\" badge on Geoid!`;
    const url = "https://mini-geo-guesser-a8hd.vercel.app/";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
    window.open(shareUrl, "_blank");
  };

  // Loading state
  if (isLoadingBadges) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-4xl md:text-6xl font-satoshi text-white animate-pulse mb-8">Loading Badge...</div>
        <div className="flex items-center justify-center">
          <img src={infiniteSpinner} alt="Loading" className="w-16 h-16" />
        </div>
      </div>
    );
  }

  // Error state
  if (badgesError) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-2xl md:text-4xl font-satoshi text-red-400 mb-4">Failed to Load Badge</div>
        <p className="text-white/70 mb-8">{badgesError.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-satoshi"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No badge to mint
  if (!gameBadge) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-2xl md:text-4xl font-satoshi text-white mb-4">No Badge To Mint</div>
        <p className="text-white/70 mb-8">It seems there was an issue finding the badge you earned.</p>
        <button
          onClick={() => window.location.href = "/play"}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-satoshi"
        >
          Play Another Game
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-12 px-4 self-start">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-satoshi text-white mb-4">Mint Your Badge</h1>
          <p className="text-white/70">Congratulations! You've earned a new badge.</p>
          {streakBadgeAvailable && streakBadge && (
            <div className="mt-4 text-green-400 font-satoshi text-lg">
              🎉 You also unlocked a streak badge: <span className="font-bold">{streakBadge.name}</span>!
            </div>
          )}
        </div>

        {/* Badge Cards */}
        <div className="flex flex-col gap-6 mb-6">
          <div ref={badgeCardRef} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <div className="text-center">
              <img src={gameBadge.imageUrl} alt={gameBadge.name || 'Badge'} className="w-24 h-24 rounded-full mx-auto mb-4" />
              <h2 className="text-2xl font-satoshi text-white mb-2">
                {gameBadge.name || "Achievement Badge"}
              </h2>
              <p className="text-white/70 mb-4">
                {gameBadge.description || "You've completed a challenge and earned this badge!"}
              </p>
              {gameBadge.category && (
                <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm text-white/80 mb-4">
                  {gameBadge.category.name}
                </div>
              )}
              {mintStatus === "success" && txHashes[gameBadge.id] && txHashes[gameBadge.id].length > 0 && (
                <div className="mt-4 flex flex-col gap-2">
                  {txHashes[gameBadge.id].map((hash, idx) => (
                    <a
                      key={hash}
                      href={`https://sepolia.etherscan.io/tx/${hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-satoshi transition-colors block text-center"
                    >
                      View Transaction {txHashes[gameBadge.id].length > 1 ? `#${idx + 1}` : ''} on Etherscan
                    </a>
                  ))}
                  <button
                    onClick={() => handleShare(gameBadge)}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                  >
                    Share on Farcaster
                  </button>
                </div>
              )}
            </div>
          </div>
          {streakBadgeAvailable && streakBadge && (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <img src={streakBadge.imageUrl} alt={streakBadge.name || 'Badge'} className="w-24 h-24 rounded-full mx-auto mb-4" />
                <h2 className="text-2xl font-satoshi text-white mb-2">
                  {streakBadge.name || "Streak Badge"}
                </h2>
                <p className="text-white/70 mb-4">
                  {streakBadge.description || "You've hit a streak milestone!"}
                </p>
                {streakBadge.category && (
                  <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm text-white/80 mb-4">
                    {streakBadge.category.name}
                  </div>
                )}
                {mintStatus === "success" && txHashes[streakBadge.id] && txHashes[streakBadge.id].length > 0 && (
                  <div className="mt-4 flex flex-col gap-2">
                    {txHashes[streakBadge.id].map((hash, idx) => (
                      <a
                        key={hash}
                        href={`https://explorer.celo.org/alfajores/tx/$${hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-full font-satoshi transition-colors block text-center"
                      >
                        View Transaction {txHashes[streakBadge.id].length > 1 ? `#${idx + 1}` : ''} on Celoscan
                      </a>
                    ))}
                    <button
                      onClick={() => handleShare(streakBadge)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                    >
                      Share on Farcaster
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mint Button */}
        {mintStatus !== "success" && (
          <button
            onClick={handleMint}
            disabled={mintStatus === "minting"}
            className={`w-full py-4 px-6 rounded-xl font-satoshi font-bold text-lg transition-all duration-200 ${
              mintStatus === "error"
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            }`}
          >
            {mintStatus === "minting" && "Minting..."}
            {mintStatus === "error" && "Try Again"}
            {mintStatus === "idle" && (streakBadgeAvailable && streakBadge ? "Mint Both Badges" : "Mint Badge")}
          </button>
        )}

        {/* Status Messages */}
        {mintStatus === "error" && errorMessage && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}
        {mintStatus === "success" && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-center">
            <p className="text-green-400 text-sm">Badge{streakBadgeAvailable && streakBadge ? 'es' : ''} minted successfully!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BadgeMint() {
  return (
    <AppLayout>
      <BadgeMintContent />
    </AppLayout>
  );
} 
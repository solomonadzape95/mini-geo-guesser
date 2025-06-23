import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { useBadgesQuery, useMintBadge, useUserProfile } from "../hooks/useBadges";
import infiniteSpinner from "../assets/infinite-spinner.svg";
import { BadgeWithCategory } from "../types";

const STREAK_BADGES: { [key: number]: string } = {
  1: "1-Day Streak",
  3: "3-Day Streak",
  5: "5-Day Streak",
};

interface ProfileBadge {
  id: number;
  claimed: boolean;
}

function BadgeMintContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { badgeId: gameBadgeId } = location.state || {};
  
  const { data: badges, isLoading: isLoadingBadges, error: badgesError } = useBadgesQuery();
  const { refetch: refetchProfile } = useUserProfile();
  const mintBadgeMutation = useMintBadge();
  
  const [gameBadge, setGameBadge] = useState<BadgeWithCategory | null>(null);
  const [streakBadge, setStreakBadge] = useState<BadgeWithCategory | null>(null);
  const [mintStatus, setMintStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const badgeCardRef = useRef(null);

  useEffect(() => {
    if (badges && gameBadgeId) {
      const foundBadge = badges.find((b: BadgeWithCategory) => b.id === gameBadgeId);
      setGameBadge(foundBadge || null);
    }
  }, [badges, gameBadgeId]);

  const handleMint = async () => {
    if (!gameBadge) return;
    
    setMintStatus("minting");
    setErrorMessage("");
    
    try {
      // Mint the game badge
      await mintBadgeMutation.mutateAsync(gameBadge.id);
      setMintStatus("success");

      // Check for streak badge
      await handleStreakCheck();
      
      // Navigate to badges page after a delay
      setTimeout(() => {
        navigate("/badges");
      }, 4000);
    } catch (error) {
      setMintStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to mint badge");
    }
  };

  const handleStreakCheck = async () => {
    // Refetch profile to get the latest streak
    const { data: updatedProfile } = await refetchProfile();
    const streak = updatedProfile?.streak;

    if (streak && STREAK_BADGES[streak] && badges) {
      const streakBadgeName = STREAK_BADGES[streak];
      const streakBadgeToMint = badges.find((b: BadgeWithCategory) => b.name === streakBadgeName);
      const isBadgeAlreadyClaimed = updatedProfile?.badges.some((b: ProfileBadge) => b.id === streakBadgeToMint?.id && b.claimed);

      if (streakBadgeToMint && !isBadgeAlreadyClaimed) {
        setStreakBadge(streakBadgeToMint);
        await mintBadgeMutation.mutateAsync(streakBadgeToMint.id);
      }
    }
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
          onClick={() => navigate("/play")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-satoshi"
        >
          Play Another Game
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-satoshi text-white mb-4">Mint Your Badge</h1>
          <p className="text-white/70">Congratulations! You've earned a new badge.</p>
        </div>

        {/* Badge Card */}
        <div ref={badgeCardRef} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
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
          </div>
        </div>

        {/* Mint Button */}
        <button
          onClick={handleMint}
          disabled={mintStatus === "minting" || mintStatus === "success"}
          className={`w-full py-4 px-6 rounded-xl font-satoshi font-bold text-lg transition-all duration-200 ${
            mintStatus === "success"
              ? "bg-green-600 text-white cursor-default"
              : mintStatus === "error"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          }`}
        >
          {mintStatus === "minting" && "Minting..."}
          {mintStatus === "success" && "Badge(s) Minted!"}
          {mintStatus === "error" && "Try Again"}
          {mintStatus === "idle" && "Mint Badge"}
        </button>

        {/* Status Messages */}
        {mintStatus === "error" && errorMessage && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-center">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}
        {mintStatus === "success" && (
          <div className="mt-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-center flex flex-col items-center">
            <p className="text-green-400 text-sm">Game badge minted successfully!</p>
            {streakBadge && (
              <p className="text-green-400 text-sm mt-2">
                You also unlocked the <span className="font-bold">{streakBadge.name}</span> badge!
              </p>
            )}
            <button
              onClick={() => {
                // Placeholder for dynamic image sharing logic
                const badgeName = gameBadge.name;
                const text = `I just minted the \"${badgeName}\" badge on Geoid!`;
                const url = "https://mini-geo-guesser-a8hd.vercel.app/";
                // TODO: Replace url with dynamic image URL after implementing html2canvas or OG image
                const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}&embeds[]=${encodeURIComponent(url)}`;
                window.open(shareUrl, "_blank");
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-satoshi transition-colors"
            >
              Share on Farcaster
            </button>
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
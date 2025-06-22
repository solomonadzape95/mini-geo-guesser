import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import { useBadgesQuery, useMintBadge } from "../hooks/useBadges";
import { SkeletonCard } from "../components/Skeleton";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

function BadgeMintContent() {
  const navigate = useNavigate();
  const { data: badgesData, isLoading, error } = useBadgesQuery();
  const mintBadgeMutation = useMintBadge();
  
  const [selectedBadge, setSelectedBadge] = useState<any>(null);
  const [mintStatus, setMintStatus] = useState<"idle" | "minting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Find the first unlocked badge that hasn't been claimed
  useEffect(() => {
    if (badgesData) {
      const availableBadge = badgesData.find((badge: any) => 
        !badge.locked && !badge.claimed
      );
      setSelectedBadge(availableBadge || null);
    }
  }, [badgesData]);

  const handleMint = async () => {
    if (!selectedBadge) return;
    
    setMintStatus("minting");
    setErrorMessage("");
    
    try {
      await mintBadgeMutation.mutateAsync(selectedBadge.id);
      setMintStatus("success");
      
      // Navigate to badges page after a short delay
      setTimeout(() => {
        navigate("/badges");
      }, 2000);
    } catch (error) {
      setMintStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to mint badge");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-4xl md:text-6xl font-satoshi text-white animate-pulse mb-8">Loading Badge...</div>
        <SkeletonCard className="max-w-md" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-2xl md:text-4xl font-satoshi text-red-400 mb-4">Failed to Load Badge</div>
        <p className="text-white/70 mb-8">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-satoshi"
        >
          Try Again
        </button>
      </div>
    );
  }

  // No badge available
  if (!selectedBadge) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-2xl md:text-4xl font-satoshi text-white mb-4">No Badge Available</div>
        <p className="text-white/70 mb-8">You don't have any badges to mint right now. Keep playing to earn more!</p>
        <button
          onClick={() => navigate("/play")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-satoshi"
        >
          Play Game
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
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-6">
          <div className="text-center">
            {/* Badge Icon/Image Placeholder */}
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">🏆</span>
            </div>
            
            {/* Badge Name */}
            <h2 className="text-2xl font-satoshi text-white mb-2">
              {selectedBadge.name || "Achievement Badge"}
            </h2>
            
            {/* Badge Description */}
            <p className="text-white/70 mb-4">
              {selectedBadge.description || "You've completed a challenge and earned this badge!"}
            </p>
            
            {/* Category */}
            {selectedBadge.category && (
              <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm text-white/80 mb-4">
                {selectedBadge.category.name}
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
          {mintStatus === "minting" && (
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Minting...
            </div>
          )}
          {mintStatus === "success" && (
            <div className="flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-6 h-6" />
              Badge Minted!
            </div>
          )}
          {mintStatus === "error" && (
            <div className="flex items-center justify-center gap-2">
              <XCircleIcon className="w-6 h-6" />
              Try Again
            </div>
          )}
          {mintStatus === "idle" && "Mint Badge"}
        </button>

        {/* Error Message */}
        {mintStatus === "error" && errorMessage && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Success Message */}
        {mintStatus === "success" && (
          <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
            <p className="text-green-400 text-sm">Badge successfully minted! Redirecting to badges page...</p>
          </div>
        )}

        {/* Back Button */}
        <button
          onClick={() => navigate("/badges")}
          className="w-full mt-4 py-3 px-6 bg-white/10 hover:bg-white/20 text-white rounded-xl font-satoshi transition-colors"
        >
          View All Badges
        </button>
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
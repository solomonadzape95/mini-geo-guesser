import { useState, useEffect, useCallback, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import MapModal from "../components/MapModal";
import Quiz from "../components/Quiz";
import GoogleResultMap from "../components/GoogleResultMap";
import StreetView from "../components/StreetView";
import { MapIcon, PlayIcon } from "@heroicons/react/24/outline";
import { usePlayGameQuery } from "../hooks/useGames";
import { SkeletonCard } from "../components/Skeleton";
import infiniteSpinner from "../assets/infinite-spinner.svg";
import { useAuth } from "../contexts/AuthContext";
import { saveGameResult } from "../services/auth";
import { useGoogleMaps } from "../hooks/useGoogleMaps";

interface Location {
  lat: number;
  lng: number;
}

// Calculate distance between two points using Haversine formula
const calculateDistance = (loc1: Location, loc2: Location): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate score out of 5000 based on distance
const calculateScore = (distance: number): number => {
  // Max distance on Earth is roughly 20,000km, so we scale accordingly
  const maxDistance = 20000;
  const score = 5000 * Math.exp(-10 * (distance / maxDistance));
  return Math.round(score);
};

// Parse coordinates string to Location object
const parseCoordinates = (coordsString: string): Location | null => {
  try {
    const [lat, lng] = coordsString.split(',').map(coord => parseFloat(coord.trim()));
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
};

function PlayContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: gameData, isLoading, error } = usePlayGameQuery();
  
  // Get Google Maps API key from environment
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded: mapsLoaded, calculateDistance: googleCalculateDistance } = useGoogleMaps({ apiKey });
  
  const [gameState, setGameState] = useState<
    "loading" | "ready" | "playing" | "results-map" | "quiz"
  >("loading");
  const [showMap, setShowMap] = useState(false);
  const [userGuess, setUserGuess] = useState<Location | null>(null);
  const [timeLeft, setTimeLeft] = useState(120);
  const [score, setScore] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get actual location from game data
  const actualLocation = gameData?.game.coords ? parseCoordinates(gameData.game.coords) : null;

  // Get timer color based on time left
  const getTimerColor = (time: number): string => {
    if (time > 20) return "text-green-400";
    if (time > 10) return "text-yellow-400";
    return "text-red-400";
  };

  // Format timer as MM:SS with leading zeros
  const formatTimer = (time: number): string => {
    const min = Math.floor(time / 60).toString().padStart(2, '0');
    const sec = (time % 60).toString().padStart(2, '0');
    return `${min}:${sec}`;
  };

  // Load saved game state from localStorage
  useEffect(() => {
    const savedStartTime = localStorage.getItem("challengeStartTime");
    if (savedStartTime) {
      const startTime = parseInt(savedStartTime);
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 120 - Math.floor(elapsed / 1000));

      if (remaining > 0) {
        setGameStartTime(startTime);
        setTimeLeft(remaining);
        setGameState("playing");
      } else {
        // Time already up, show results
        setGameState("results-map");
        localStorage.removeItem("challengeStartTime");
      }
    }
  }, []);

  // Handle game data loading
  useEffect(() => {
    if (gameData && gameState === "loading") {
      setGameState("ready");
    }
  }, [gameData, gameState]);

  // Start the game
  const startGame = useCallback(() => {
    const startTime = Date.now();
    setGameStartTime(startTime);
    setGameState("playing");
    setTimeLeft(120);
    localStorage.setItem("challengeStartTime", startTime.toString());
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (gameState !== "playing" || !gameStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - gameStartTime;
      const remaining = Math.max(0, 120 - Math.floor(elapsed / 1000));

      setTimeLeft(remaining);

      if (remaining === 0) {
        setGameState("results-map");
        localStorage.removeItem("challengeStartTime");

        // Calculate score if user made a guess
        if (userGuess && actualLocation) {
          const dist = mapsLoaded && googleCalculateDistance ? 
            googleCalculateDistance(userGuess, actualLocation) : 
            calculateDistance(userGuess, actualLocation);
          const finalScore = calculateScore(dist);
          setDistance(dist);
          setScore(finalScore);
        } else {
          setScore(0);
          setDistance(null);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [gameState, gameStartTime, userGuess, actualLocation, mapsLoaded, googleCalculateDistance]);

  const handleMapClick = (location: Location) => {
    setUserGuess(location);
    setShowMap(false);
  };

  const handleShowResults = () => {
    setGameState("results-map");
    localStorage.removeItem("challengeStartTime");
    if (userGuess && actualLocation) {
      const dist = mapsLoaded && googleCalculateDistance ? 
        googleCalculateDistance(userGuess, actualLocation) : 
        calculateDistance(userGuess, actualLocation);
      const finalScore = calculateScore(dist);
      setDistance(dist);
      setScore(finalScore);
    } else {
      setScore(0);
      setDistance(null);
    }
  };

  const handleQuizComplete = async () => {
    // Save game result to database
    if (gameData?.game.id && score !== null && user) {
      try {
        setIsSaving(true);
        await saveGameResult({
          gameId: gameData.game.id,
          score: score
        });
      } catch (error) {
        console.error('Failed to save game result:', error);
        // Continue to badge mint even if save fails
      } finally {
        setIsSaving(false);
      }
    }
    navigate("/badge-mint", { state: { badgeId: gameData?.game.badgeID } });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-4xl md:text-6xl font-satoshi text-white animate-pulse mb-8">Loading Game...</div>
        <div className="flex items-center justify-center">
          <img src={infiniteSpinner} alt="Loading" className="w-16 h-16" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-2xl md:text-4xl font-satoshi text-red-400 mb-4">Failed to Load Game</div>
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

  // No game available
  if (!gameData) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
        <div className="text-2xl md:text-4xl font-satoshi text-white mb-4">No Game Available</div>
        <p className="text-white/70 mb-8">There's no game available for today. Check back tomorrow!</p>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-satoshi"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start py-4 px-2 md:px-0 gap-6">
      {/* Street View Section - Only show during playing state */}
      {gameState === "playing" && actualLocation && (
        <div className="w-full flex justify-center">
          <div className="w-full max-w-4xl h-[40vh] md:h-[50vh] rounded-xl overflow-hidden">
            <StreetView location={actualLocation} />
          </div>
        </div>
      )}

      {/* Ready to Start Section */}
      {gameState === "ready" && (
        <section className="w-full flex flex-col items-center justify-center py-8 my-auto">
          <div className="text-3xl md:text-5xl font-satoshi text-white mb-6">Ready to Start?</div>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-md text-center">
            You'll have 120 seconds to explore the Street View and guess the location. Click the map to make your guess!
          </p>
          <button
            onClick={startGame}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-xl font-satoshi flex items-center gap-3 mx-auto transition-colors shadow-md"
          >
            <PlayIcon className="w-6 h-6" />
            Start Game
          </button>
        </section>
      )}

      {/* Playing Section */}
      {gameState === "playing" && (
        <section className="w-full flex flex-col items-center gap-4">
          {/* Timer */}
          <div className="flex items-center justify-center mt-2">
            <span className={`text-2xl md:text-3xl font-satoshi font-bold ${getTimerColor(timeLeft)}`}>{formatTimer(timeLeft)}</span>
          </div>
          {/* Guess Indicator */}
          {userGuess && (
            <div className="bg-green-600/80 px-4 py-2 rounded-full border border-green-400/30 text-white font-satoshi text-center">📍 Guess Made</div>
          )}
          {/* Map Button */}
          <button
            onClick={() => setShowMap(true)}
            className="mt-4 w-14 h-14 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <MapIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </button>
          <div className="text-white/70 text-center text-sm mt-2">Tap the map icon to make your guess!</div>
          {/* Lock In Answer Button */}
          <button
            onClick={() => setShowLockModal(true)}
            disabled={!userGuess}
            className="mt-6 px-8 py-3 bg-blue-700 text-white rounded-lg font-satoshi font-bold shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Lock In Answer
          </button>
        </section>
      )}

      {/* Results Map Section */}
      {gameState === "results-map" && actualLocation && (
        <section className="w-full flex flex-col items-center justify-center pb-8 md:py-8 my-auto">
          {userGuess ? (
            <div className="flex flex-col items-center justify-center w-[90vw]">
              <div className="relative w-10/12 h-[60vh] rounded-2xl overflow-hidden border-2 border-white/20">
                <GoogleResultMap
                  userGuess={userGuess}
                  actualLocation={actualLocation}
                />
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 w-11/12 max-w-md text-center border border-white/20 mt-4">
                <h2 className="text-2xl font-satoshi text-white mb-2">
                  Results
                </h2>
                <div className="text-4xl font-satoshi text-blue-400 mb-1">
                  {score || 0}
                </div>
                <div className="text-md text-white/80">
                  out of 5,000 points
                </div>
                {distance !== null && (
                  <div className="text-white/70 mt-2">
                    You were {Math.round(distance)} km away
                  </div>
                )}
                <div className="text-white/70 mt-2">
                  <div className="font-medium">
                    Location: {gameData?.game.name || "Unknown Location"}
                  </div>
                  <div className="text-xs text-white/50 mt-1">
                    {actualLocation
                      ? `${actualLocation.lat.toFixed(
                          4,
                        )}, ${actualLocation.lng.toFixed(4)}`
                      : ""}
                  </div>
                </div>
                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={() => setGameState("quiz")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-satoshi transition-colors"
                  >
                    Continue to Quiz
                  </button>
                  {score !== null && (
                    <button
                      onClick={() => {
                        const text = `I scored ${score} points in today's Geoid challenge!`;
                        const url = "https://mini-geo-guesser-a8hd.vercel.app/";
                        const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
                          text,
                        )}&embeds[]=${encodeURIComponent(url)}`;
                        window.open(shareUrl, "_blank");
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg"
                    >
                      Share Score
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="my-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md w-full text-center border border-white/20">
              <h2 className="text-3xl md:text-4xl font-satoshi text-white mb-6">
                Time's Up!
              </h2>
              <div className="text-red-400 mb-6">No guess was made</div>
              <div className="mb-6">
                <div className="text-5xl md:text-6xl font-satoshi text-blue-400 mb-2">
                  0
                </div>
                <div className="text-lg text-white/80">
                  out of 5,000 points
                </div>
              </div>
              <button
                onClick={() => setGameState("ready")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-satoshi transition-colors mt-2"
              >
                Retry Game
              </button>
            </div>
          )}
        </section>
      )}

      {/* Quiz Section */}
      {gameState === "quiz" && gameData.questions && (
        <section className="w-full flex flex-col items-center justify-center py-8">
          <div className="w-full max-w-2xl">
            <Quiz onComplete={handleQuizComplete} questions={gameData.questions} />
          </div>
        </section>
      )}

      {/* Map Modal */}
      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onLocationSelect={handleMapClick}
          initialLocation={userGuess}
        />
      )}

      {/* Lock In Confirmation Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-lg text-center">
            <h2 className="text-xl font-satoshi font-bold mb-4">Lock In Your Answer?</h2>
            <p className="mb-6 text-gray-700">Are you sure you want to lock in your guess? You won't be able to change it after this.</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLockModal(false)}
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-800 font-satoshi font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLockModal(false); handleShowResults(); }}
                className="px-6 py-2 rounded-lg bg-blue-600 text-white font-satoshi font-semibold hover:bg-blue-700"
              >
                Yes, Lock In
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for saving */}
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full shadow-lg text-center">
            <div className="flex items-center justify-center mb-4">
              <img src={infiniteSpinner} alt="Saving" className="w-12 h-12" />
            </div>
            <p className="text-gray-700">Saving your game result...</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Play() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="w-full min-h-screen flex flex-col items-center justify-center py-12">
          <div className="text-4xl md:text-6xl font-satoshi text-white animate-pulse mb-8">Loading Game...</div>
          <div className="flex items-center justify-center">
            <img src={infiniteSpinner} alt="Loading" className="w-16 h-16" />
          </div>
        </div>
      }>
        <PlayContent />
      </Suspense>
    </AppLayout>
  );
}

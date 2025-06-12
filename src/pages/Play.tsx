import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";
import MapModal from "../components/MapModal";
import Quiz from "../components/Quiz";
import { MapIcon, PlayIcon } from "@heroicons/react/24/outline";
import Viewer from "../components/Viewer";

interface Location {
  lat: number;
  lng: number;
}

// Mock actual location for scoring
const ACTUAL_LOCATION: Location = {
  lat: 40.7128,
  lng: -74.006, // New York City
};

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
  const score = Math.max(0, 5000 - (distance / maxDistance) * 5000);
  return Math.round(score);
};

export default function Play() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<
    "loading" | "ready" | "playing" | "finished" | "quiz"
  >("loading");
  const [showMap, setShowMap] = useState(false);
  const [userGuess, setUserGuess] = useState<Location | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState<number | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);

  // Get timer color based on time left
  const getTimerColor = (time: number): string => {
    if (time > 20) return "text-green-400";
    if (time > 10) return "text-yellow-400";
    return "text-red-400";
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
        setGameState("finished");
        localStorage.removeItem("challengeStartTime");
      }
    }
  }, []);

  // Handle image loading completion
  const handleImageLoaded = useCallback(() => {
    if (gameState === "loading") {
      setGameState("ready");
    }
  }, [gameState]);

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
        setGameState("finished");
        localStorage.removeItem("challengeStartTime");

        // Calculate score if user made a guess
        if (userGuess) {
          const dist = calculateDistance(userGuess, ACTUAL_LOCATION);
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
  }, [gameState, gameStartTime, userGuess]);

  const handleMapClick = (location: Location) => {
    setUserGuess(location);
    setShowMap(false);
  };

  const handleShowResults = () => {
    setGameState("finished");
    localStorage.removeItem("challengeStartTime");

    if (userGuess) {
      const dist = calculateDistance(userGuess, ACTUAL_LOCATION);
      const finalScore = calculateScore(dist);
      setDistance(dist);
      setScore(finalScore);
    } else {
      setScore(0);
      setDistance(null);
    }
  };

  const handleQuizComplete = () => {
    navigate("/badge-mint");
  };

  return (
    <AppLayout>
      <div className="relative w-full min-h-screen flex items-center justify-center overflow-auto">
        {/* Main Image Viewer */}
        <div className="w-full h-full bg-transparent">
          <Viewer imageId="498763468214164" onLoad={handleImageLoaded} />
        </div>

        {/* Loading Overlay */}
        {gameState === "loading" && (
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center">
            <div className="text-4xl md:text-6xl font-juvanze text-white animate-pulse">
              Loading...
            </div>
          </div>
        )}

        {/* Ready to Start Overlay */}
        {gameState === "ready" && (
          <div className="absolute inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center">
            <div className="text-center px-4">
              <div className="text-3xl md:text-5xl font-juvanze text-white mb-8">
                Ready to Start?
              </div>
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-md mx-auto">
                You'll have 30 seconds to guess the location. Click the map to
                make your guess!
              </p>
              <button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-xl font-juvanze flex items-center gap-3 mx-auto transition-colors"
              >
                <PlayIcon className="w-6 h-6" />
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* Game Timer */}
        {gameState === "playing" && (
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
            <span
              className={`text-xl md:text-2xl font-juvanze font-bold ${getTimerColor(timeLeft)}`}
            >
              {Math.floor(timeLeft / 60)}:{timeLeft % 60}
            </span>
          </div>
        )}

        {/* User Guess Indicator */}
        {gameState === "playing" && userGuess && (
          <div className="absolute top-4 left-4 bg-green-600/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-400/30">
            <span className="text-white font-juvanze">📍 Guess Made</span>
          </div>
        )}

        {/* Map Button */}
        {gameState === "playing" && (
          <button
            onClick={() => setShowMap(true)}
            className="absolute bottom-6 right-6 w-14 h-14 md:w-16 md:h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors"
          >
            <MapIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </button>
        )}

        {/* Results Overlay */}
        {gameState === "finished" && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 max-w-md w-full text-center border border-white/20">
              <h2 className="text-3xl md:text-4xl font-juvanze text-white mb-6">
                Time's Up!
              </h2>

              <div className="mb-6">
                <div className="text-5xl md:text-6xl font-juvanze text-blue-400 mb-2">
                  {score || 0}
                </div>
                <div className="text-lg text-white/80">out of 5,000 points</div>
              </div>

              {distance !== null && (
                <div className="text-white/70 mb-6">
                  You were {Math.round(distance)} km away from the actual
                  location
                </div>
              )}

              {!userGuess && (
                <div className="text-red-400 mb-6">No guess was made</div>
              )}

              <button
                onClick={() => setGameState("quiz")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-juvanze transition-colors"
              >
                Continue to Quiz
              </button>
            </div>
          </div>
        )}

        {/* Quiz Overlay */}
        {gameState === "quiz" && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <Quiz onComplete={handleQuizComplete} />
            </div>
          </div>
        )}

        {/* Map Modal */}
        {showMap && (
          <MapModal
            onClose={() => setShowMap(false)}
            onLocationSelect={handleMapClick}
          />
        )}
      </div>
    </AppLayout>
  );
}

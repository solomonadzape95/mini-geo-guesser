import AppLayout from "../layout/AppLayout";
import { Link } from "react-router-dom";
import worldMapImage from "../assets/globe.png";
import { useState } from "react";
import { getTodayGameResult, clearTodayGameResult } from "../hooks/useGames";

export default function LandingPage() {
  const [showResult, setShowResult] = useState(false);
  const todayResult = getTodayGameResult();

  return (
    <AppLayout>
      <div className="h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 md:pt-16 pt-8 overflow-hidden ">
        
      <div className="relative w-full max-w-md mx-auto -z-10 flex justify-center items-center">
            <img
              src={worldMapImage}
              alt="World Map"
              className="rounded-lg w-1/2 h-auto object-cover"
            />
          </div>{/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 font-satoshi">
            Test Your Geography Knowledge
          </h1>
          <p className="text-xl text-gray-300 mb-8 font-satoshi">
            Challenge yourself to identify locations around the world. Make your
            guess, answer questions, and see how well you know our planet!
          </p>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 justify-center">
            {todayResult ? (
              <button
                onClick={() => setShowResult(true)}
                className="md:col-span-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors font-satoshi cursor-pointer"
              >
                View Your Game
              </button>
            ) : (
              <Link
                to="/play"
                className="md:col-span-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors font-satoshi cursor-pointer"
              >
                Guess Today's Location
              </Link>
            )}
            <Link
              to="/history"
              className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors font-satoshi cursor-pointer"
            >
              View History
            </Link>
            <Link
              to="/how-to-play"
              className="px-8 py-3 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors font-satoshi cursor-pointer"
            >
              How to Play
            </Link>
          </div>

          {/* Result Modal/Section */}
          {showResult && todayResult && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
              <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-lg text-center">
                <h2 className="text-2xl font-satoshi font-bold mb-4 text-blue-700">Today's Game Result</h2>
                <div className="mb-4 text-lg text-gray-800">
                  <div>Score: <span className="font-bold">{todayResult.score}</span></div>
                  <div>Location: <span className="font-bold">{todayResult.locationName || 'Unknown'}</span></div>
                  <div>Date: <span className="font-bold">{todayResult.date || 'Today'}</span></div>
                </div>
                <button
                  onClick={() => setShowResult(false)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-satoshi font-semibold mr-2"
                >
                  Close
                </button>
                <button
                  onClick={() => { clearTodayGameResult(); setShowResult(false); window.location.reload(); }}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-full font-satoshi font-semibold"
                >
                  Clear Result
                </button>
              </div>
            </div>
          )}

          {/* Hero Image */}
       
        </div>
      </div>
    </AppLayout>
  );
}

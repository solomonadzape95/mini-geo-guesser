import AppLayout from "../layout/AppLayout";
import { Link } from "react-router-dom";
import worldMapImage from "../assets/globe.png";

export default function LandingPage() {
  return (
    <AppLayout>
      <div className="h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 md:pt-16 pt-8 overflow-hidden ">
        {/* Hero Section */}
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
            <Link
              to="/play"
              className="md:col-span-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors font-satoshi cursor-pointer"
            >
              Guess Today's Location
            </Link>
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

          {/* Hero Image */}
          <div className="relative w-full max-w-2xl mx-auto -z-10 flex justify-center items-center">
            <img
              src={worldMapImage}
              alt="World Map"
              className="rounded-lg w-1/2 h-auto object-cover"
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

import { Link } from "react-router-dom";
import {
  HomeIcon,
  TrophyIcon,
  CheckBadgeIcon,
  UserCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function Navigation() {
  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="text-white font-satoshi font-bold text-xl cursor-pointer"
              >
                GeoGuessr
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <Link
                to="/"
                className="text-gray-300 hover:text-white flex items-center font-satoshi"
              >
                <HomeIcon className="h-5 w-5 mr-2" />
                Home
              </Link>
              <Link
                to="/leaderboard"
                className="text-gray-300 hover:text-white flex items-center font-satoshi"
              >
                <TrophyIcon className="h-5 w-5 mr-2" />
                Leaderboard
              </Link>
              <Link
                to="/badges"
                className="text-gray-300 hover:text-white flex items-center font-satoshi"
              >
                <CheckBadgeIcon className="h-5 w-5 mr-2" />
                Badges
              </Link>
              <Link
                to="/history"
                className="text-gray-300 hover:text-white flex items-center font-satoshi"
              >
                <ClockIcon className="h-5 w-5 mr-2" />
                History
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                to="/profile"
                className="text-gray-300 hover:text-white flex items-center font-satoshi"
              >
                <div className="relative">
                  <UserCircleIcon className="h-7 w-7" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black/50"></div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm z-50">
        <div className="flex justify-around items-center h-16">
          <Link
            to="/"
            className="text-gray-300 hover:text-white flex flex-col items-center font-satoshi"
          >
            <HomeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            to="/leaderboard"
            className="text-gray-300 hover:text-white flex flex-col items-center font-satoshi"
          >
            <TrophyIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Leaderboard</span>
          </Link>
          <Link
            to="/badges"
            className="text-gray-300 hover:text-white flex flex-col items-center font-satoshi"
          >
            <CheckBadgeIcon className="h-6 w-6" />
            <span className="text-xs mt-1">Badges</span>
          </Link>
          <Link
            to="/history"
            className="text-gray-300 hover:text-white flex flex-col items-center font-satoshi"
          >
            <ClockIcon className="h-6 w-6" />
            <span className="text-xs mt-1">History</span>
          </Link>
          <Link
            to="/profile"
            className="text-gray-300 hover:text-white flex flex-col items-center font-satoshi"
          >
            <div className="relative">
              <UserCircleIcon className="h-6 w-6" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black/50"></div>
            </div>
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </>
  );
}

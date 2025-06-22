import { Link, useLocation } from "react-router-dom";
import {
  HomeIcon,
  TrophyIcon,
  CheckBadgeIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";

export default function Navigation() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const profileContent = (
    <div className="relative">
      {user?.pfpUrl ? (
        <img
          src={user.pfpUrl}
          alt={user.username || "Profile"}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="h-8 w-8 rounded-full bg-gray-600" />
      )}
      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black/50"></div>
    </div>
  );

  const mobileProfileContent = (
    <div className="relative">
       {user?.pfpUrl ? (
        <img
          src={user.pfpUrl}
          alt={user.username || "Profile"}
          className="h-7 w-7 rounded-full"
        />
      ) : (
        <div className="h-7 w-7 rounded-full bg-gray-600" />
      )}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-black/50"></div>
    </div>
  )

  const NavItem = ({ to, icon: Icon, label, isActivePage }: { 
    to: string; 
    icon: any; 
    label: string; 
    isActivePage: boolean; 
  }) => {
    const baseClasses = "flex items-center font-satoshi";
    const activeClasses = "text-white cursor-default";
    const inactiveClasses = "text-gray-300 hover:text-white cursor-pointer";

    if (isActivePage) {
      return (
        <div className={`${baseClasses} ${activeClasses}`}>
          <Icon className="h-5 w-5 mr-2" />
          {label}
        </div>
      );
    }

    return (
      <Link to={to} className={`${baseClasses} ${inactiveClasses}`}>
        <Icon className="h-5 w-5 mr-2" />
        {label}
      </Link>
    );
  };

  const MobileNavItem = ({ to, icon: Icon, label, isActivePage }: { 
    to: string; 
    icon: any; 
    label: string; 
    isActivePage: boolean; 
  }) => {
    const baseClasses = "flex flex-col items-center font-satoshi";
    const activeClasses = "text-white cursor-default";
    const inactiveClasses = "text-gray-300 hover:text-white cursor-pointer";

    if (isActivePage) {
      return (
        <div className={`${baseClasses} ${activeClasses}`}>
          <Icon className="h-6 w-6" />
          <span className="text-xs mt-1">{label}</span>
        </div>
      );
    }

    return (
      <Link to={to} className={`${baseClasses} ${inactiveClasses}`}>
        <Icon className="h-6 w-6" />
        <span className="text-xs mt-1">{label}</span>
      </Link>
    );
  };

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
                Geoid
              </Link>
            </div>
            <div className="flex items-center space-x-8">
              <NavItem 
                to="/" 
                icon={HomeIcon} 
                label="Home" 
                isActivePage={isActive("/")} 
              />
              <NavItem 
                to="/leaderboard" 
                icon={TrophyIcon} 
                label="Leaderboard" 
                isActivePage={isActive("/leaderboard")} 
              />
              <NavItem 
                to="/badges" 
                icon={CheckBadgeIcon} 
                label="Badges" 
                isActivePage={isActive("/badges")} 
              />
              <NavItem 
                to="/history" 
                icon={ClockIcon} 
                label="History" 
                isActivePage={isActive("/history")} 
              />
            </div>
            <div className="flex items-center space-x-2">
              {!isLoading && user && (
                <>
                  {profileContent}
                  <span className="text-white font-satoshi">{user.username}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/50 backdrop-blur-sm z-50">
        <div className="flex justify-around items-center h-16">
          <MobileNavItem 
            to="/" 
            icon={HomeIcon} 
            label="Home" 
            isActivePage={isActive("/")} 
          />
          <MobileNavItem 
            to="/leaderboard" 
            icon={TrophyIcon} 
            label="Leaderboard" 
            isActivePage={isActive("/leaderboard")} 
          />
          <MobileNavItem 
            to="/badges" 
            icon={CheckBadgeIcon} 
            label="Badges" 
            isActivePage={isActive("/badges")} 
          />
          <MobileNavItem 
            to="/history" 
            icon={ClockIcon} 
            label="History" 
            isActivePage={isActive("/history")} 
          />
          {!isLoading && user && (
             <div className="text-gray-300 hover:text-white flex flex-col items-center font-satoshi">
              {mobileProfileContent}
              <span className="text-xs mt-1">{user.username}</span>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}

import { sdk } from "@farcaster/frame-sdk";
import { createContext, useEffect, useState, useContext } from "react";
import { upsertUserProfile } from '../services/auth';

interface User {
  fid: number;
  primaryAddress?: string;
  profileId?: number;
  username?: string;
  pfpUrl?: string;
  displayName?: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  error: string | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  isLoading: true,
  error: null,
  logout: () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('geoid_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(user === null);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://mini-geo-guessr-auth-production.geoid.workers.dev';

  useEffect(() => {
    if (user) return; // Already loaded from localStorage
    const authenticateUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use Farcaster Mini App context if available
        let contextUser = undefined;
        if (sdk.context && (await sdk.context).user && (await sdk.context).user.fid) {
          contextUser = {
            fid: (await sdk.context).user.fid,
            username: (await sdk.context).user.username,
            displayName: (await sdk.context).user.displayName,
            pfpUrl: (await sdk.context).user.pfpUrl,
          };
        }

        if (contextUser) {
          setUser(contextUser);
          localStorage.setItem('geoid_user', JSON.stringify(contextUser));
          // Upsert user profile in Supabase
          upsertUserProfile({
            fid: String(contextUser.fid),
            username: contextUser.username || contextUser.displayName || null,
            pfpUrl: contextUser.pfpUrl || null,
          });
          sdk.actions.ready();
        } else {
          // Fallback: Use Quick Auth to get authenticated user from backend
          const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/me`);
          if (res.ok) {
            const userInfo = await res.json();
            setUser(userInfo);
            localStorage.setItem('geoid_user', JSON.stringify(userInfo));
            // Upsert user profile in Supabase
            upsertUserProfile({
              fid: String(userInfo.fid),
              username: userInfo.username || userInfo.displayName || null,
              pfpUrl: userInfo.pfpUrl || null,
            });
            sdk.actions.ready();
          } else {
            console.error('Authentication failed:', res.status, res.statusText);
            setError('Authentication failed');
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    authenticateUser();
  }, [BACKEND_URL, user]);

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('geoid_user');
    // You might want to clear any stored tokens here
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
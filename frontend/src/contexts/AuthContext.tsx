import { sdk } from "@farcaster/frame-sdk";
import { createContext, useEffect, useState, useContext } from "react";

interface User {
  fid: number;
  primaryAddress?: string;
  profileId?: number;
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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://bc09-102-90-103-110.ngrok-free.app';

  useEffect(() => {
    const authenticateUser = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Use Quick Auth to get authenticated user
        const res = await sdk.quickAuth.fetch(`${BACKEND_URL}/me`);
        
        if (res.ok) {
          const userInfo = await res.json();
          setUser(userInfo);
          sdk.actions.ready();
        } else {
          console.error('Authentication failed:', res.status, res.statusText);
          setError('Authentication failed');
        }
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    authenticateUser();
  }, [BACKEND_URL]);

  const logout = () => {
    setUser(null);
    setError(null);
    // You might want to clear any stored tokens here
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, error, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
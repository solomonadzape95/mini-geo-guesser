import { sdk } from "@farcaster/frame-sdk";
import { createContext, useEffect, useState } from "react";

const AuthContext = createContext<{
  user: any;
  setUser: (user: any) => void;
}>({
  user: null,
  setUser: () => {},
});
export default AuthContext;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{ fid: number; primaryAddress?: string }>();

  useEffect(() => {
    (async () => {
      const res = await sdk.quickAuth.fetch(`https://your-backend.miniapps.farcaster.xyz/me`);
      if (res.ok) {
        const userInfo = await res.json();
        setUser(userInfo);
        sdk.actions.ready();
      }
    })();
  }, []);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
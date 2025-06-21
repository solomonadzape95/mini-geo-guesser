import  { useState, useEffect } from "react";
import { sdk } from "@farcaster/frame-sdk";

const BACKEND_ORIGIN = "https://bc09-102-90-103-110.ngrok-free.app";

export function Authentication() {
  const [user, setUser] = useState<{ fid: number; primaryAddress?: string }>();

  useEffect(() => {
    (async () => {
      // Make authenticated request to your backend
      const res = await sdk.quickAuth.fetch(`${BACKEND_ORIGIN}/me`);
      if (res.ok) {
        const userInfo = await res.json();
        setUser(userInfo);
        sdk.actions.ready();
      }
    })();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Welcome, {user.fid}</h1>
      {/* render your GeoGuessr game here */}
    </div>
  );
}

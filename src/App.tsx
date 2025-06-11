import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HowToPlay from "./pages/HowToPlay";
import Play from "./pages/Play";

function App() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/leaderboard"
          element={
            <div className="text-white">Leaderboard Page (Coming Soon)</div>
          }
        />
        <Route
          path="/badges"
          element={<div className="text-white">Badges Page (Coming Soon)</div>}
        />
        <Route
          path="/play"
          element={<Play />}
        />
        <Route
          path="/history"
          element={<div className="text-white">History Page (Coming Soon)</div>}
        />
        <Route path="/how-to-play" element={<HowToPlay />} />
      </Routes>
    </Router>
  );
}

function ConnectMenu() {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();

  if (isConnected) {
    return (
      <>
        <div>Connected account:</div>
        <div>{address}</div>
        <SignButton />
      </>
    );
  }

  return (
    <button type="button" onClick={() => connect({ connector: connectors[0] })}>
      Connect
    </button>
  );
}

function SignButton() {
  const { signMessage, isPending, data, error } = useSignMessage();

  return (
    <>
      <button
        type="button"
        onClick={() => signMessage({ message: "hello world" })}
        disabled={isPending}
      >
        {isPending ? "Signing..." : "Sign message"}
      </button>
      {data && (
        <>
          <div>Signature</div>
          <div>{data}</div>
        </>
      )}
      {error && (
        <>
          <div>Error</div>
          <div>{error.message}</div>
        </>
      )}
    </>
  );
}

export default App;

import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import { getUserProfile, saveGameResult, getGameHistory, getUserBadges } from "../services/auth";

export default function AuthDebugger() {
  const { user, isLoading, error } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testEndpoints = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // Test profile endpoint
      try {
        const profile = await getUserProfile();
        results.profile = { success: true, data: profile };
      } catch (err) {
        results.profile = { success: false, error: err };
      }

      // Test game history endpoint
      try {
        const history = await getGameHistory();
        results.history = { success: true, data: history };
      } catch (err) {
        results.history = { success: false, error: err };
      }

      // Test badges endpoint
      try {
        const badges = await getUserBadges();
        results.badges = { success: true, data: badges };
      } catch (err) {
        results.badges = { success: false, error: err };
      }

      // Test save game endpoint
      try {
        const saveResult = await saveGameResult({ gameId: 1, score: 1000 });
        results.saveGame = { success: true, data: saveResult };
      } catch (err) {
        results.saveGame = { success: false, error: err };
      }

      setDebugInfo(results);
    } catch (err) {
      console.error('Debug test failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm">
        <h3 className="font-bold mb-2">🔒 Auth Debugger</h3>
        <p>No user authenticated</p>
        {error && <p className="text-sm mt-1">Error: {error}</p>}
        {isLoading && <p className="text-sm mt-1">Loading...</p>}
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg max-w-sm max-h-96 overflow-y-auto">
      <h3 className="font-bold mb-2">🔒 Auth Debugger</h3>
      
      <div className="mb-3">
        <p className="text-sm">FID: {user.fid}</p>
        <p className="text-sm">Profile ID: {user.profileId}</p>
        {user.primaryAddress && (
          <p className="text-sm">Address: {user.primaryAddress.slice(0, 10)}...</p>
        )}
      </div>

      <button
        onClick={testEndpoints}
        disabled={loading}
        className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-bold mb-2 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Endpoints'}
      </button>

      {debugInfo && (
        <div className="text-xs">
          <h4 className="font-bold mt-2 mb-1">API Test Results:</h4>
          {Object.entries(debugInfo).map(([endpoint, result]: [string, any]) => (
            <div key={endpoint} className="mb-1">
              <span className={result.success ? 'text-green-300' : 'text-red-300'}>
                {result.success ? '✅' : '❌'} {endpoint}
              </span>
              {!result.success && (
                <div className="text-red-200 ml-2">
                  {result.error?.message || 'Unknown error'}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
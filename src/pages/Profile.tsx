import { useNavigate } from "react-router-dom";
import AppLayout from "../layout/AppLayout";

export default function Profile() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate("/");
  };

  return (
    <AppLayout>
      <div className="w-full min-h-screen flex flex-col items-center justify-start py-8 px-4">
        <div className="w-full max-w-lg">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-white/20">
            <h1 className="text-2xl md:text-3xl font-satoshi text-white mb-8">Profile</h1>
            <div className="flex justify-center">
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-satoshi transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
} 
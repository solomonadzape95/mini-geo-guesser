import "../styles/stars.css";
import Navigation from "../components/Navigation";
import { AuthProvider } from "../contexts/AuthContext";

export default function BackgroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="h-full fixed top-0 left-0 w-full">
        <Navigation />
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
        <div className="w-full h-full overflow-auto flex items-center justify-center">
          {children}
        </div>
      </div>
    </AuthProvider>
  );
}

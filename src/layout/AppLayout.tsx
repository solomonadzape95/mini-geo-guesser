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
      <div className="max-h-screen">
        <Navigation />
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
        <div className="max-h-screen overflow-auto">{children}</div>
      </div>
    </AuthProvider>
  );
}

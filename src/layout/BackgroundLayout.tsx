import "../styles/stars.css";

export default function BackgroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div id="stars"></div>
      <div id="stars2"></div>
      <div id="stars3"></div>
      {children}
    </div>
  );
}

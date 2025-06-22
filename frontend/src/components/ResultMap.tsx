import GoogleResultMap from "./GoogleResultMap";

interface Location {
  lat: number;
  lng: number;
}

interface ResultMapProps {
  userGuess: Location;
  actualLocation: Location;
}

export default function ResultMap({ userGuess, actualLocation }: ResultMapProps) {
  return (
    <GoogleResultMap 
      userGuess={userGuess} 
      actualLocation={actualLocation} 
    />
  );
} 
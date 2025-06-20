import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Fix for default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
}

interface ResultMapProps {
  userGuess: Location;
  actualLocation: Location;
}

function FitBounds({ userGuess, actualLocation }: ResultMapProps) {
  const map = useMap();
  useEffect(() => {
    if (userGuess && actualLocation) {
      const bounds = L.latLngBounds([
        [userGuess.lat, userGuess.lng],
        [actualLocation.lat, actualLocation.lng]
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, userGuess, actualLocation]);
  return null;
}

export default function ResultMap({ userGuess, actualLocation }: ResultMapProps) {
  const polyline: [number, number][] = [
    [userGuess.lat, userGuess.lng],
    [actualLocation.lat, actualLocation.lng],
  ];

  const lineOptions = { color: '#ff4b4b', weight: 4 };

  return (
    <MapContainer center={[actualLocation.lat, actualLocation.lng]} zoom={6} scrollWheelZoom className="w-full h-full rounded-lg">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <Marker position={[userGuess.lat, userGuess.lng]}>
        <Popup>Your Guess</Popup>
      </Marker>

      <Marker position={[actualLocation.lat, actualLocation.lng]}>
        <Popup>Correct Location</Popup>
      </Marker>

      <Polyline pathOptions={lineOptions} positions={polyline} />

      <FitBounds userGuess={userGuess} actualLocation={actualLocation} />
    </MapContainer>
  );
} 
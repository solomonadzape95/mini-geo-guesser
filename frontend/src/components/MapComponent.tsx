import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default icon issue with webpack
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

interface MapComponentProps {
  selectedLocation: Location;
  setSelectedLocation: (location: Location) => void;
}

function MapEvents({ setSelectedLocation }: { setSelectedLocation: (location: Location) => void }) {
  useMapEvents({
    click(e) {
      setSelectedLocation(e.latlng);
    },
  });
  return null;
}

export default function MapComponent({ selectedLocation, setSelectedLocation }: MapComponentProps) {
  return (
    <MapContainer center={[selectedLocation.lat, selectedLocation.lng]} zoom={3} scrollWheelZoom className="w-full h-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents setSelectedLocation={setSelectedLocation} />
      <Marker position={selectedLocation}>
        <Popup>Your Guess</Popup>
      </Marker>
    </MapContainer>
  );
}
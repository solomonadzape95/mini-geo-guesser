import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Location {
  lat: number;
  lng: number;
}

interface MapModalProps {
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
}

export default function MapModal({ onClose, onLocationSelect }: MapModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert click coordinates to lat/lng
    // This is a simplified conversion - you might want to use a proper map library
    const lat = 90 - (y / rect.height) * 180;
    const lng = (x / rect.width) * 360 - 180;

    setSelectedLocation({ lat, lng });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg w-[90vw] h-[80vh] max-w-4xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <div className="p-4">
          <h2 className="text-xl font-juvanze font-bold mb-4">
            Select Location
          </h2>
          <div
            className="w-full h-[calc(80vh-8rem)] bg-gray-100 rounded-lg cursor-crosshair relative"
            onClick={handleMapClick}
          >
            {/* Map background - you can replace this with a proper map component */}
            <img
              src="/images/world-map.jpg"
              alt="World Map"
              className="w-full h-full object-cover rounded-lg"
            />

            {/* Selected location marker */}
            {selectedLocation && (
              <div
                className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-2 -translate-y-2"
                style={{
                  left: `${((selectedLocation.lng + 180) / 360) * 100}%`,
                  top: `${((90 - selectedLocation.lat) / 180) * 100}%`,
                }}
              />
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-juvanze disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

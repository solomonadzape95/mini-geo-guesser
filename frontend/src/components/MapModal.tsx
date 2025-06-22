import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import GoogleMapComponent from "./GoogleMapComponent";
import { useGoogleMaps } from "../hooks/useGoogleMaps";

interface Location {
  lat: number;
  lng: number;
}

interface MapModalProps {
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  initialLocation: Location | null;
}

const DEFAULT_MAP_LOCATION: Location = { lat: 20, lng: 0 };

export default function MapModal({ onClose, onLocationSelect, initialLocation }: MapModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<Location>(
    initialLocation ?? DEFAULT_MAP_LOCATION
  );

  // Get Google Maps API key from environment
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const { isLoaded, error } = useGoogleMaps({ apiKey });

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
  };

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative bg-white rounded-lg w-[90vw] h-[85vh] max-w-4xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-satoshi font-bold">Select Your Guess</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-500 mb-4">Failed to load Google Maps</p>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="relative bg-white rounded-lg w-[90vw] h-[85vh] max-w-4xl p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-satoshi font-bold">Select Your Guess</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading Google Maps...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-lg w-[90vw] h-[85vh] max-w-4xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-satoshi font-bold">Select Your Guess</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-grow rounded-lg overflow-hidden">
          <GoogleMapComponent
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Click on the map to select your guess location
          </div>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-satoshi hover:bg-blue-700 transition-colors"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import MapComponent from "./MapComponent";

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

  const handleConfirm = () => {
    onLocationSelect(selectedLocation);
  };

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
          <MapComponent
            selectedLocation={selectedLocation}
            setSelectedLocation={setSelectedLocation}
          />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-satoshi"
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
}

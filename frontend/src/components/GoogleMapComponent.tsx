import { useEffect, useRef } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface GoogleMapComponentProps {
  selectedLocation: Location;
  setSelectedLocation: (location: Location) => void;
  className?: string;
}

export default function GoogleMapComponent({ 
  selectedLocation, 
  setSelectedLocation, 
  className = "" 
}: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const markerRef = useRef<any | null>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !mapRef.current) {
      return;
    }

    // Create map instance
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      zoom: 3,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: true,
      scrollwheel: true,
      gestureHandling: 'greedy',
    });

    mapInstanceRef.current = map;

    // Create marker
    const marker = new window.google.maps.Marker({
      position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      map: map,
      draggable: false,
      title: 'Your Guess',
    });

    markerRef.current = marker;

    // Add click listener to map
    const clickListener = map.addListener('click', (event: any) => {
      if (event.latLng) {
        const newLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng(),
        };
        setSelectedLocation(newLocation);
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        window.google.maps.event.removeListener(clickListener);
      }
    };
  }, []);

  // Update marker position when selectedLocation changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    }
  }, [selectedLocation]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full rounded-lg ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
} 
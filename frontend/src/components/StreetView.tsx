import { useEffect, useRef } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface StreetViewProps {
  location: Location;
  className?: string;
}

export default function StreetView({ location, className = "" }: StreetViewProps) {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const panoramaRef = useRef<any>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !streetViewRef.current) {
      return;
    }

    // Create Street View panorama
    const panorama = new window.google.maps.StreetViewPanorama(
      streetViewRef.current,
      {
        position: { lat: location.lat, lng: location.lng },
        pov: {
          heading: 34,
          pitch: 10,
        },
        zoom: 1,
        addressControl: false,
        fullscreenControl: false,
        motionTracking: false,
        motionTrackingControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false,
        clickToGo: false,
        scrollwheel: false,
        disableDefaultUI: true,
      }
    );

    panoramaRef.current = panorama;

    // Handle panorama load error
    const handleError = () => {
      console.warn('Street View not available at this location');
    };

    panorama.addListener('error', handleError);

    return () => {
      if (panoramaRef.current) {
        window.google.maps.event.clearInstanceListeners(panoramaRef.current);
      }
    };
  }, [location.lat, location.lng]);

  return (
    <div 
      ref={streetViewRef} 
      className={`w-full h-full rounded-lg ${className}`}
      style={{ minHeight: '300px' }}
    />
  );
} 
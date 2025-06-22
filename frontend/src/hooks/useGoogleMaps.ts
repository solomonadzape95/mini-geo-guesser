import { useEffect, useState, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface UseGoogleMapsProps {
  apiKey: string;
}

export const useGoogleMaps = ({ apiKey }: UseGoogleMapsProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
    };

    script.onerror = () => {
      setError('Failed to load Google Maps');
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [apiKey]);

  const calculateDistance = useCallback((loc1: Location, loc2: Location): number => {
    if (!window.google || !window.google.maps) {
      return 0;
    }

    const point1 = new window.google.maps.LatLng(loc1.lat, loc1.lng);
    const point2 = new window.google.maps.LatLng(loc2.lat, loc2.lng);
    
    return window.google.maps.geometry.spherical.computeDistanceBetween(point1, point2) / 1000; // Convert to km
  }, []);

  return {
    isLoaded,
    error,
    calculateDistance,
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
} 
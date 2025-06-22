import { useEffect, useRef } from 'react';

interface Location {
  lat: number;
  lng: number;
}

interface GoogleResultMapProps {
  userGuess: Location;
  actualLocation: Location;
  className?: string;
}

export default function GoogleResultMap({ 
  userGuess, 
  actualLocation, 
  className = "" 
}: GoogleResultMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const userMarkerRef = useRef<any | null>(null);
  const actualMarkerRef = useRef<any | null>(null);
  const polylineRef = useRef<any | null>(null);

  useEffect(() => {
    if (!window.google || !window.google.maps || !mapRef.current) {
      return;
    }

    // Calculate bounds to fit both markers
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend({ lat: userGuess.lat, lng: userGuess.lng });
    bounds.extend({ lat: actualLocation.lat, lng: actualLocation.lng });

    // Create map instance
    const map = new window.google.maps.Map(mapRef.current, {
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      streetViewControl: false,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: true,
      scrollwheel: true,
      gestureHandling: 'greedy',
    });

    mapInstanceRef.current = map;

    // Fit map to bounds
    map.fitBounds(bounds);

    // Create user guess marker (red)
    const userMarker = new window.google.maps.Marker({
      position: { lat: userGuess.lat, lng: userGuess.lng },
      map: map,
      title: 'Your Guess',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#ff4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    userMarkerRef.current = userMarker;

    // Create actual location marker (green)
    const actualMarker = new window.google.maps.Marker({
      position: { lat: actualLocation.lat, lng: actualLocation.lng },
      map: map,
      title: 'Correct Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#44ff44',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });

    actualMarkerRef.current = actualMarker;

    // Create polyline connecting the two points
    const polyline = new window.google.maps.Polyline({
      path: [
        { lat: userGuess.lat, lng: userGuess.lng },
        { lat: actualLocation.lat, lng: actualLocation.lng },
      ],
      geodesic: true,
      strokeColor: '#ff4444',
      strokeOpacity: 1.0,
      strokeWeight: 3,
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    // Add info windows
    const userInfoWindow = new window.google.maps.InfoWindow({
      content: '<div class="p-2"><strong>Your Guess</strong></div>',
    });

    const actualInfoWindow = new window.google.maps.InfoWindow({
      content: '<div class="p-2"><strong>Correct Location</strong></div>',
    });

    userMarker.addListener('click', () => {
      userInfoWindow.open(map, userMarker);
    });

    actualMarker.addListener('click', () => {
      actualInfoWindow.open(map, actualMarker);
    });

    return () => {
      if (mapInstanceRef.current) {
        window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
    };
  }, [userGuess.lat, userGuess.lng, actualLocation.lat, actualLocation.lng]);

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-full rounded-lg ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
} 
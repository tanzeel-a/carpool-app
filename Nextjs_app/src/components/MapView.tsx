'use client';

/**
 * MapView Component
 *
 * Google Maps integration with:
 * - Smooth mobile navigation (pinch zoom, pan)
 * - Cartoonish/playful map styling
 * - Search radius circle visualization
 * - Custom animated label markers
 */

import { useCallback, useState, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Circle, OverlayView } from '@react-google-maps/api';
import { Ride, Location, NearbyPerson } from '@/types';
import ProfileImageMarker from './ProfileImageMarker';
import CurrentUserMarker from './CurrentUserMarker';
import BroadcastBubble from './BroadcastBubble';
import styles from './MapView.module.css';

// Libraries to load
const libraries: ("places")[] = ["places"];

interface MapViewProps {
  center: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  destination: Location | null;
  nearbyRides: Ride[];
  matchedRiderLocation?: { lat: number; lng: number } | null;
  searchRadius?: number; // in meters
  focusLocation?: { lat: number; lng: number; timestamp: number } | null; // Pan to this location when set
  // Current user info for profile marker
  currentUser?: {
    photoURL?: string;
    displayName?: string;
  } | null;
  // Nearby people feature
  nearbyPeople?: NearbyPerson[];
  selectedPersonId?: string | null;
  onPersonClick?: (person: NearbyPerson) => void;
}

// Map container style
const containerStyle = {
  width: '100%',
  height: '100%',
};

// Default center (Delhi, India)
const defaultCenter = {
  lat: 28.6139,
  lng: 77.2090,
};

// Cartoonish/playful map styling - softer colors, rounded feel
const cartoonMapStyles: google.maps.MapTypeStyle[] = [
  // Base styling - soft cream/paper background
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#faf6ef' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5c5a57' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#faf6ef' }, { weight: 3 }],
  },
  // Water - soft blue
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#b8dae5' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6a9caa' }],
  },
  // Parks - soft green
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#c8e6c9' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#5a8a5c' }],
  },
  // Other POIs - warm beige
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#f0e9df' }],
  },
  {
    featureType: 'poi.business',
    stylers: [{ visibility: 'off' }],
  },
  // Roads - clean white with soft borders
  {
    featureType: 'road',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e8e2d9' }, { weight: 1 }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.fill',
    stylers: [{ color: '#ffefc3' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e6d9a8' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.fill',
    stylers: [{ color: '#fff8e8' }],
  },
  // Transit - soft purple
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#e8e0f0' }],
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.icon',
    stylers: [{ saturation: -60 }, { lightness: 20 }],
  },
  // Buildings - warm grey
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#f5f0e8' }],
  },
  // Administrative - hide most labels for cleaner look
  {
    featureType: 'administrative.land_parcel',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative.neighborhood',
    stylers: [{ visibility: 'off' }],
  },
];

// Generate a random pastel color based on a seed string
const getRandomColor = (seed: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF8C69', '#87CEEB', '#90EE90', '#FFB6C1',
  ];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

// Custom Label Marker Component
interface LabelMarkerProps {
  position: { lat: number; lng: number };
  label: string;
  color?: string;
  isUser?: boolean;
  pulse?: boolean;
}

function LabelMarker({ position, label, color, isUser = false, pulse = false }: LabelMarkerProps) {
  const markerColor = color || getRandomColor(label);

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className={`${styles.labelMarker} ${isUser ? styles.userMarker : ''}`}>
        <div
          className={styles.markerLabel}
          style={{ backgroundColor: markerColor }}
        >
          {label}
        </div>
        <div className={styles.markerDotWrapper}>
          {pulse && (
            <>
              <div className={styles.markerPulse} style={{ borderColor: markerColor }} />
              <div className={styles.markerPulse} style={{ borderColor: markerColor, animationDelay: '0.5s' }} />
            </>
          )}
          <div
            className={styles.markerDot}
            style={{ backgroundColor: markerColor }}
          />
        </div>
      </div>
    </OverlayView>
  );
}

// Destination Marker Component
function DestinationMarker({ position, label }: { position: { lat: number; lng: number }; label: string }) {
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className={styles.destinationMarker}>
        <div className={styles.destinationPin}>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#d4af37"/>
            <circle cx="12" cy="9" r="3" fill="#ffffff"/>
          </svg>
        </div>
        <div className={styles.destinationLabel}>{label}</div>
      </div>
    </OverlayView>
  );
}

export default function MapView({
  center,
  userLocation,
  destination,
  nearbyRides,
  matchedRiderLocation,
  searchRadius = 100,
  focusLocation,
  currentUser,
  nearbyPeople = [],
  selectedPersonId,
  onPersonClick,
}: MapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Pan to focus location when it changes
  useEffect(() => {
    if (map && focusLocation) {
      map.panTo({ lat: focusLocation.lat, lng: focusLocation.lng });
      map.setZoom(18); // Zoom in for better view
    }
  }, [map, focusLocation?.timestamp]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Map options optimized for mobile touch
  const mapOptions: google.maps.MapOptions = useMemo(() => ({
    styles: cartoonMapStyles,
    disableDefaultUI: true,
    zoomControl: false, // We'll add custom controls
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    // Mobile-friendly gesture handling
    gestureHandling: 'greedy', // Allow one-finger pan
    scrollwheel: true,
    draggable: true,
    // Smooth zoom
    keyboardShortcuts: false,
    clickableIcons: false,
    // Restrict bounds to prevent scrolling too far
    minZoom: 10,
    maxZoom: 20,
  }), []);

  // Circle options for search radius
  const circleOptions: google.maps.CircleOptions = useMemo(() => ({
    strokeColor: '#d4af37',
    strokeOpacity: 0.8,
    strokeWeight: 2,
    fillColor: '#d4af37',
    fillOpacity: 0.1,
    clickable: false,
  }), []);

  // Center on user location
  const handleRecenter = useCallback(() => {
    if (map && userLocation) {
      map.panTo(userLocation);
      map.setZoom(16);
    }
  }, [map, userLocation]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (map) {
      map.setZoom((map.getZoom() || 16) + 1);
    }
  }, [map]);

  const handleZoomOut = useCallback(() => {
    if (map) {
      map.setZoom((map.getZoom() || 16) - 1);
    }
  }, [map]);

  // Error state
  if (loadError) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
          <div className={styles.mapIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          </div>
          <p>Failed to load Google Maps</p>
          <span style={{ maxWidth: 300, textAlign: 'center' }}>
            Please enable "Maps JavaScript API" in your Google Cloud Console
          </span>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
          <div className={styles.spinner} />
          <p>Loading maps...</p>
        </div>
      </div>
    );
  }

  // Show placeholder if no API key
  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className={styles.placeholder}>
        <div className={styles.placeholderContent}>
          <div className={styles.mapIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          </div>
          <p>Maps API key required</p>
          <span>Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to .env.local</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.mapWrapper}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center || defaultCenter}
        zoom={16}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Search radius circle */}
        {userLocation && (
          <Circle
            center={userLocation}
            radius={searchRadius}
            options={circleOptions}
          />
        )}

        {/* User location marker with profile photo */}
        {userLocation && (
          <CurrentUserMarker
            position={userLocation}
            photoURL={currentUser?.photoURL}
            displayName={currentUser?.displayName}
          />
        )}

        {/* Destination marker */}
        {destination && (
          <DestinationMarker
            position={{ lat: destination.lat, lng: destination.lng }}
            label={destination.address.split(',')[0]}
          />
        )}

        {/* Nearby riders markers */}
        {nearbyRides.map((ride) => (
          <LabelMarker
            key={ride.id}
            position={{
              lat: ride.origin.latitude,
              lng: ride.origin.longitude,
            }}
            label={ride.displayName.split(' ')[0]}
          />
        ))}

        {/* Matched rider location (during chat) */}
        {matchedRiderLocation && (
          <LabelMarker
            position={matchedRiderLocation}
            label="Match"
            color="#4ECDC4"
            pulse={true}
          />
        )}

        {/* Nearby people markers (profile image pins) */}
        {nearbyPeople.map((person, index) => (
          <ProfileImageMarker
            key={person.id}
            person={person}
            onClick={onPersonClick}
            isSelected={selectedPersonId === person.id}
            animationDelay={index * 100}
          />
        ))}

        {/* Broadcast bubbles for people with active broadcasts */}
        {nearbyPeople
          .filter((person) => person.broadcast)
          .map((person) => (
            <BroadcastBubble
              key={`broadcast-${person.id}`}
              person={person}
              onRequestMatch={onPersonClick}
            />
          ))}
      </GoogleMap>

      {/* Custom map controls */}
      <div className={styles.mapControls}>
        <button
          className={styles.controlBtn}
          onClick={handleZoomIn}
          aria-label="Zoom in"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          className={styles.controlBtn}
          onClick={handleZoomOut}
          aria-label="Zoom out"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          className={styles.controlBtn}
          onClick={handleRecenter}
          aria-label="Recenter on location"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

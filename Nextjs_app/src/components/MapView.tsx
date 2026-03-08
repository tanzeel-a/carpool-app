'use client';

/**
 * MapView Component
 *
 * Google Maps integration with:
 * - User location marker (custom gold icon)
 * - Destination marker (custom pin icon)
 * - Nearby riders markers (green person icon)
 * - Custom styling matching app theme
 */

import { useCallback, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

// Libraries to load
const libraries: ("places")[] = ["places"];
import { Ride, Location } from '@/types';
import styles from './MapView.module.css';

interface MapViewProps {
  center: { lat: number; lng: number } | null;
  userLocation: { lat: number; lng: number } | null;
  destination: Location | null;
  nearbyRides: Ride[];
  matchedRiderLocation?: { lat: number; lng: number } | null;
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

// Custom map styling for a muted, elegant look
const mapStyles = [
  {
    featureType: 'all',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#6e6660' }],
  },
  {
    featureType: 'all',
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#ebe8e4' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#e5ebe7' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#ffffff' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e8e4df' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#f8f4ef' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#e5e5e5' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9e4f0' }],
  },
];

const mapOptions: google.maps.MapOptions = {
  styles: mapStyles,
  disableDefaultUI: true,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
};

export default function MapView({
  center,
  userLocation,
  destination,
  nearbyRides,
  matchedRiderLocation,
}: MapViewProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);

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
          <code style={{
            marginTop: 8,
            padding: '8px 12px',
            background: 'rgba(0,0,0,0.05)',
            borderRadius: 6,
            fontSize: 11
          }}>
            {loadError.message}
          </code>
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
          {userLocation && (
            <div className={styles.coords}>
              Your location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </div>
          )}
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
        {/* User location marker with fun avatar icon */}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: '/assets/user-marker.svg',
              scaledSize: new google.maps.Size(64, 64),
              anchor: new google.maps.Point(32, 58),
            }}
            title="You are here"
            zIndex={100}
          />
        )}

        {/* Destination marker with custom icon */}
        {destination && (
          <Marker
            position={{ lat: destination.lat, lng: destination.lng }}
            icon={{
              url: '/assets/destination-marker.svg',
              scaledSize: new google.maps.Size(40, 52),
              anchor: new google.maps.Point(20, 52),
            }}
            title={destination.address}
            zIndex={90}
          />
        )}

        {/* Nearby riders with custom icon */}
        {nearbyRides.map((ride) => (
          <Marker
            key={ride.id}
            position={{
              lat: ride.origin.latitude,
              lng: ride.origin.longitude,
            }}
            icon={{
              url: '/assets/rider-marker.svg',
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 20),
            }}
            title={ride.displayName}
            zIndex={80}
          />
        ))}

        {/* Matched rider location (during chat) */}
        {matchedRiderLocation && (
          <Marker
            position={matchedRiderLocation}
            icon={{
              url: '/assets/rider-marker.svg',
              scaledSize: new google.maps.Size(48, 48),
              anchor: new google.maps.Point(24, 24),
            }}
            title="Your match"
            zIndex={95}
          />
        )}
      </GoogleMap>
    </div>
  );
}

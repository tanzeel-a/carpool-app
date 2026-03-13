'use client';

/**
 * ProfileImageMarker Component
 *
 * Google Maps-style teardrop pin with circular profile photo:
 * - OverlayView wrapper for map positioning
 * - Teardrop SVG container with profile photo
 * - Optional broadcast indicator (speech bubble icon)
 * - Click handler to open MatchRequestModal
 */

import { useMemo } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { NearbyPerson } from '@/types';
import styles from './ProfileImageMarker.module.css';

interface ProfileImageMarkerProps {
  person: NearbyPerson;
  onClick?: (person: NearbyPerson) => void;
  isSelected?: boolean;
  animationDelay?: number;
}

export default function ProfileImageMarker({
  person,
  onClick,
  isSelected = false,
  animationDelay = 0,
}: ProfileImageMarkerProps) {
  const position = useMemo(
    () => ({
      lat: person.location.lat,
      lng: person.location.lng,
    }),
    [person.location]
  );

  const handleClick = () => {
    onClick?.(person);
  };

  const firstName = person.displayName.split(' ')[0];
  const distanceText =
    person.distance < 1000
      ? `${Math.round(person.distance)}m`
      : `${(person.distance / 1000).toFixed(1)}km`;

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className={`${styles.markerContainer} ${isSelected ? styles.selected : ''}`}
        onClick={handleClick}
        style={{ animationDelay: `${animationDelay}ms` }}
      >
        {/* Pulse ring when selected */}
        {isSelected && (
          <>
            <div className={styles.pulseRing} />
            <div className={styles.pulseRing} style={{ animationDelay: '0.5s' }} />
          </>
        )}

        {/* Teardrop pin */}
        <div className={styles.teardropPin}>
          <svg
            viewBox="0 0 40 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.teardropSvg}
          >
            {/* Shadow */}
            <ellipse
              cx="20"
              cy="50"
              rx="8"
              ry="2"
              fill="rgba(0,0,0,0.2)"
            />
            {/* Teardrop shape */}
            <path
              d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z"
              fill="#ffffff"
              stroke="#d4af37"
              strokeWidth="2"
            />
            {/* Inner circle for photo clipping */}
            <clipPath id={`photo-clip-${person.id}`}>
              <circle cx="20" cy="18" r="14" />
            </clipPath>
          </svg>

          {/* Profile photo */}
          <div className={styles.photoWrapper}>
            {person.photoURL ? (
              <img
                src={person.photoURL}
                alt={person.displayName}
                className={styles.photo}
                onError={(e) => {
                  // Fallback to initial if image fails
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove(styles.hidden);
                }}
              />
            ) : null}
            <div className={`${styles.photoFallback} ${person.photoURL ? styles.hidden : ''}`}>
              {person.displayName.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Online indicator */}
          {person.isOnline && <div className={styles.onlineIndicator} />}

          {/* Broadcast indicator */}
          {person.broadcast && (
            <div className={styles.broadcastIndicator}>
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
              </svg>
            </div>
          )}
        </div>

        {/* Name label */}
        <div className={styles.nameLabel}>
          <span className={styles.name}>{firstName}</span>
          <span className={styles.distance}>{distanceText}</span>
        </div>
      </div>
    </OverlayView>
  );
}

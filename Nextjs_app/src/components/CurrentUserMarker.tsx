'use client';

/**
 * CurrentUserMarker Component
 *
 * Google Maps-style teardrop pin with the current user's profile photo:
 * - Teardrop SVG with profile photo from Google auth
 * - Pulsing animation to indicate "You are here"
 * - Golden accent to match app theme
 */

import { useMemo } from 'react';
import { OverlayView } from '@react-google-maps/api';
import styles from './CurrentUserMarker.module.css';

interface CurrentUserMarkerProps {
  position: { lat: number; lng: number };
  photoURL?: string;
  displayName?: string;
}

export default function CurrentUserMarker({
  position,
  photoURL,
  displayName = 'You',
}: CurrentUserMarkerProps) {
  const memoizedPosition = useMemo(() => position, [position.lat, position.lng]);

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <OverlayView
      position={memoizedPosition}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className={styles.markerContainer}>
        {/* Pulse rings */}
        <div className={styles.pulseRing} />
        <div className={styles.pulseRing} style={{ animationDelay: '0.5s' }} />
        <div className={styles.pulseRing} style={{ animationDelay: '1s' }} />

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
            {/* Teardrop shape - golden border for current user */}
            <path
              d="M20 0C8.954 0 0 8.954 0 20c0 15 20 30 20 30s20-15 20-30C40 8.954 31.046 0 20 0z"
              fill="#ffffff"
              stroke="#d4af37"
              strokeWidth="3"
            />
          </svg>

          {/* Profile photo */}
          <div className={styles.photoWrapper}>
            {photoURL ? (
              <img
                src={photoURL}
                alt={displayName}
                className={styles.photo}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove(styles.hidden);
                }}
              />
            ) : null}
            <div className={`${styles.photoFallback} ${photoURL ? styles.hidden : ''}`}>
              {initial}
            </div>
          </div>

          {/* Golden glow indicator */}
          <div className={styles.glowIndicator} />
        </div>

        {/* "You" label */}
        <div className={styles.nameLabel}>
          <span className={styles.name}>You</span>
        </div>
      </div>
    </OverlayView>
  );
}

'use client';

/**
 * CurrentUserMarker Component
 *
 * Circle marker with the current user's profile photo:
 * - Circle PNG marker with profile photo from Google auth
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

        {/* Circle marker */}
        <div className={styles.circleMarker}>
          {/* Marker image */}
          <img
            src="/assets/map_marker_circle.png"
            alt="Your location"
            className={styles.markerImage}
            draggable={false}
          />

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
        </div>

        {/* "You" label */}
        <div className={styles.nameLabel}>
          <span className={styles.name}>You</span>
        </div>
      </div>
    </OverlayView>
  );
}

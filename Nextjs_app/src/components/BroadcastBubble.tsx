'use client';

/**
 * BroadcastBubble Component
 *
 * Speech bubble above user's marker showing "Going from X → Y"
 * - Positioned via OverlayView (offset above marker)
 * - White bubble with shadow + arrow pointing down
 * - Truncated text (tap to expand)
 * - "Request Match" button when expanded
 */

import { useState } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { NearbyPerson } from '@/types';
import styles from './BroadcastBubble.module.css';

interface BroadcastBubbleProps {
  person: NearbyPerson;
  onRequestMatch?: (person: NearbyPerson) => void;
}

export default function BroadcastBubble({
  person,
  onRequestMatch,
}: BroadcastBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!person.broadcast) return null;

  const { originAddress, destinationAddress } = person.broadcast;

  // Truncate addresses for display
  const truncate = (str: string, maxLen: number) => {
    if (str.length <= maxLen) return str;
    return str.substring(0, maxLen - 3) + '...';
  };

  const position = {
    lat: person.location.lat,
    lng: person.location.lng,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleRequestMatch = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRequestMatch?.(person);
  };

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className={`${styles.bubbleContainer} ${isExpanded ? styles.expanded : ''}`}
        onClick={handleClick}
      >
        <div className={styles.bubble}>
          {/* Collapsed view */}
          {!isExpanded && (
            <div className={styles.collapsedContent}>
              <svg viewBox="0 0 24 24" fill="currentColor" className={styles.icon}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className={styles.truncatedText}>
                → {truncate(destinationAddress.split(',')[0], 15)}
              </span>
            </div>
          )}

          {/* Expanded view */}
          {isExpanded && (
            <div className={styles.expandedContent}>
              <div className={styles.routeInfo}>
                <div className={styles.location}>
                  <div className={styles.locationDot} />
                  <span>{truncate(originAddress.split(',')[0], 25)}</span>
                </div>
                <div className={styles.routeLine}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
                <div className={styles.location}>
                  <div className={`${styles.locationDot} ${styles.destination}`} />
                  <span>{truncate(destinationAddress.split(',')[0], 25)}</span>
                </div>
              </div>

              <button
                className={styles.matchBtn}
                onClick={handleRequestMatch}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
                Request Match
              </button>
            </div>
          )}

          {/* Arrow pointing down */}
          <div className={styles.arrow} />
        </div>
      </div>
    </OverlayView>
  );
}

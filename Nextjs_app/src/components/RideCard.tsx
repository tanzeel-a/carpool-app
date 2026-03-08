'use client';

/**
 * RideCard Component
 *
 * Displays a nearby rider match with:
 * - Profile photo and name
 * - Destination info
 * - Accept button
 */

import { Ride } from '@/types';
import styles from './RideCard.module.css';

interface RideCardProps {
  ride: Ride;
  onAccept: () => void;
}

export default function RideCard({ ride, onAccept }: RideCardProps) {
  // Calculate time since ride was created
  const getTimeAgo = () => {
    const now = new Date();
    const created = ride.createdAt.toDate();
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    return `${diffMins} mins ago`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.profile}>
        {ride.photoURL ? (
          <img
            src={ride.photoURL}
            alt={ride.displayName}
            className={styles.avatar}
          />
        ) : (
          <div className={styles.avatarPlaceholder}>
            {ride.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className={styles.info}>
          <h4 className={styles.name}>{ride.displayName}</h4>
          <p className={styles.time}>{getTimeAgo()}</p>
        </div>
      </div>

      <div className={styles.destination}>
        <span className={styles.label}>Heading to</span>
        <span className={styles.address}>{ride.destination.address}</span>
      </div>

      <button className={styles.acceptBtn} onClick={onAccept}>
        Accept Match
      </button>
    </div>
  );
}

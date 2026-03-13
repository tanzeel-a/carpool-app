'use client';

/**
 * useNearbyPeople Hook
 *
 * Queries nearby users from userPresence collection:
 * - Uses geohash bounds for efficient queries
 * - Filters: online, within radius, not blocked, not self
 * - Returns array of NearbyPerson with location + profile info
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { geohashQueryBounds } from 'geofire-common';
import { useAuth } from '@/components/AuthProvider';
import { NearbyPerson, UserPresence } from '@/types';

interface UseNearbyPeopleOptions {
  userLocation: { lat: number; lng: number } | null;
  radius?: number; // in meters
  enabled?: boolean;
}

// Calculate distance between two points in meters using Haversine formula
function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useNearbyPeople(options: UseNearbyPeopleOptions) {
  const { userLocation, radius = 500, enabled = true } = options;
  const { user } = useAuth();
  const [nearbyPeople, setNearbyPeople] = useState<NearbyPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get blocked users list
  const blockedUsers = useMemo(() => user?.blockedUsers || [], [user?.blockedUsers]);

  useEffect(() => {
    if (!enabled || !userLocation || !user || !db) {
      setNearbyPeople([]);
      return;
    }

    const firestore = db; // TypeScript narrowing helper

    setLoading(true);
    setError(null);

    // Get geohash bounds for the radius
    const bounds = geohashQueryBounds(
      [userLocation.lat, userLocation.lng],
      radius
    );

    const unsubscribes: (() => void)[] = [];
    const peopleMap = new Map<string, NearbyPerson>();

    bounds.forEach(([start, end]) => {
      const presenceRef = collection(firestore, 'userPresence');
      const q = query(
        presenceRef,
        where('geohash', '>=', start),
        where('geohash', '<=', end),
        where('isOnline', '==', true)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            const docData = change.doc.data() as UserPresence;
            const personId = change.doc.id;

            if (change.type === 'removed') {
              peopleMap.delete(personId);
            } else {
              // Filter out self and blocked users
              if (docData.uid === user.uid) return;
              if (blockedUsers.includes(docData.uid)) return;

              // Check if user is within actual radius (geohash is approximate)
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                docData.location.latitude,
                docData.location.longitude
              );

              if (distance <= radius) {
                // Check if presence is stale (more than 10 minutes old)
                let lastUpdatedTime = Date.now();
                if (docData.lastUpdated) {
                  // Handle both Timestamp objects and already-converted dates
                  if (typeof docData.lastUpdated.toDate === 'function') {
                    lastUpdatedTime = docData.lastUpdated.toDate().getTime();
                  } else if (docData.lastUpdated instanceof Date) {
                    lastUpdatedTime = docData.lastUpdated.getTime();
                  }
                }
                const staleThreshold = 10 * 60 * 1000; // 10 minutes
                const isStale = Date.now() - lastUpdatedTime > staleThreshold;

                if (!isStale) {
                  const person: NearbyPerson = {
                    id: personId,
                    uid: docData.uid,
                    displayName: docData.displayName,
                    photoURL: docData.photoURL,
                    location: {
                      lat: docData.location.latitude,
                      lng: docData.location.longitude,
                    },
                    distance,
                    isOnline: docData.isOnline,
                    broadcast: docData.broadcast,
                  };
                  peopleMap.set(personId, person);
                }
              } else {
                // Outside radius, remove
                peopleMap.delete(personId);
              }
            }
          });

          // Sort by distance and update state
          const sortedPeople = Array.from(peopleMap.values()).sort(
            (a, b) => a.distance - b.distance
          );
          setNearbyPeople(sortedPeople);
          setLoading(false);
        },
        (err) => {
          console.error('Error fetching nearby people:', err);
          setError('Failed to fetch nearby people');
          setLoading(false);
        }
      );

      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [enabled, userLocation?.lat, userLocation?.lng, radius, user?.uid, blockedUsers]);

  // Refresh function to force re-query
  const refresh = useCallback(() => {
    // The effect will re-run when dependencies change
    // For manual refresh, we can just clear and let it rebuild
    setNearbyPeople([]);
  }, []);

  return {
    nearbyPeople,
    loading,
    error,
    refresh,
  };
}

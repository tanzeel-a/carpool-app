'use client';

/**
 * useNearbyPeople Hook
 *
 * Queries nearby users from userPresence collection:
 * - Uses geohash bounds for efficient queries
 * - Filters: online, within radius, SAME DESTINATION, not blocked, not self
 * - Returns array of NearbyPerson with location + profile info
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
import { NearbyPerson, UserPresence, Location } from '@/types';

interface UseNearbyPeopleOptions {
  userLocation: { lat: number; lng: number } | null;
  destination: Location | null;
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

// Check if two destinations are similar (within 500m of each other)
function isSameDestination(
  dest1: Location | undefined,
  dest2: Location | null
): boolean {
  if (!dest1 || !dest2) return false;

  const distance = calculateDistance(dest1.lat, dest1.lng, dest2.lat, dest2.lng);
  return distance < 500; // Within 500m is considered same destination
}

export function useNearbyPeople(options: UseNearbyPeopleOptions) {
  const { userLocation, destination, radius = 500, enabled = true } = options;
  const { user } = useAuth();
  const [nearbyPeople, setNearbyPeople] = useState<NearbyPerson[]>([]);
  const [newlyFoundPeople, setNewlyFoundPeople] = useState<string[]>([]); // IDs of people just found (for animations)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track previously seen people for detecting new arrivals
  const previousPeopleRef = useRef<Set<string>>(new Set());

  // Get blocked users list
  const blockedUsers = useMemo(() => user?.blockedUsers || [], [user?.blockedUsers]);

  useEffect(() => {
    if (!enabled || !userLocation || !user || !db || !destination) {
      setNearbyPeople([]);
      return;
    }

    const firestore = db;

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

              // Check if user has a destination that matches ours
              const theirDestination = docData.broadcast?.destination;
              if (!isSameDestination(theirDestination, destination)) {
                peopleMap.delete(personId);
                return;
              }

              // Check if user is within actual radius
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
                peopleMap.delete(personId);
              }
            }
          });

          // Sort by distance
          const sortedPeople = Array.from(peopleMap.values()).sort(
            (a, b) => a.distance - b.distance
          );

          // Detect newly found people (for pop-in animations)
          const currentIds = new Set(sortedPeople.map(p => p.id));
          const newPeople = sortedPeople
            .filter(p => !previousPeopleRef.current.has(p.id))
            .map(p => p.id);

          if (newPeople.length > 0) {
            setNewlyFoundPeople(newPeople);
            // Clear the "new" status after animation completes
            setTimeout(() => setNewlyFoundPeople([]), 1000);
          }

          previousPeopleRef.current = currentIds;
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
  }, [enabled, userLocation?.lat, userLocation?.lng, destination?.lat, destination?.lng, radius, user?.uid, blockedUsers]);

  // Refresh function
  const refresh = useCallback(() => {
    setNearbyPeople([]);
    previousPeopleRef.current = new Set();
  }, []);

  return {
    nearbyPeople,
    newlyFoundPeople,
    loading,
    error,
    refresh,
  };
}

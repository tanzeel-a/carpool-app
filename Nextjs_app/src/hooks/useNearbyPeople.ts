'use client';

/**
 * useNearbyPeople Hook
 *
 * Queries nearby users from userPresence collection:
 * - Uses geohash bounds for efficient queries
 * - Filters: online, within radius, not blocked, not self
 * - Returns array of NearbyPerson with location + profile info
 * - Real-time updates via Firestore onSnapshot
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
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
  const { userLocation, radius = 5000, enabled = true } = options; // Default 5km radius
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
    if (!enabled || !userLocation || !user || !db) {
      console.log('[NearbyPeople] Query disabled:', {
        enabled,
        hasLocation: !!userLocation,
        hasUser: !!user,
        hasDb: !!db,
      });
      setNearbyPeople([]);
      return;
    }

    console.log('[NearbyPeople] Starting real-time query for nearby users...');

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
          console.log('[NearbyPeople] Real-time update:', {
            changes: snapshot.docChanges().length,
            total: snapshot.docs.length,
          });

          snapshot.docChanges().forEach((change) => {
            const docData = change.doc.data() as UserPresence;
            const personId = change.doc.id;

            if (change.type === 'removed') {
              console.log('[NearbyPeople] User went offline:', docData.displayName);
              peopleMap.delete(personId);
            } else {
              // Filter out self and blocked users
              if (docData.uid === user.uid) return;
              if (blockedUsers.includes(docData.uid)) return;

              // Calculate distance
              const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                docData.location.latitude,
                docData.location.longitude
              );

              // Check if within radius
              if (distance <= radius) {
                // Check if presence is stale (more than 5 minutes old)
                let lastUpdatedTime = Date.now();
                if (docData.lastUpdated) {
                  if (typeof docData.lastUpdated.toDate === 'function') {
                    lastUpdatedTime = docData.lastUpdated.toDate().getTime();
                  } else if (docData.lastUpdated instanceof Date) {
                    lastUpdatedTime = docData.lastUpdated.getTime();
                  }
                }
                const staleThreshold = 5 * 60 * 1000; // 5 minutes
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
                  console.log('[NearbyPeople] User found:', {
                    name: docData.displayName,
                    distance: Math.round(distance) + 'm',
                    hasDestination: !!docData.broadcast?.destination,
                  });
                } else {
                  peopleMap.delete(personId);
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
  }, [enabled, userLocation?.lat, userLocation?.lng, radius, user?.uid, blockedUsers]);

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

'use client';

/**
 * useUserPresence Hook
 *
 * Manages user presence for nearby people discovery:
 * - Updates user location every 5 seconds (debounced)
 * - Sets online/offline status
 * - Manages broadcast message
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  GeoPoint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { geohashForLocation } from 'geofire-common';
import { useAuth } from '@/components/AuthProvider';
import { Location, UserPresence } from '@/types';

interface UseUserPresenceOptions {
  updateInterval?: number; // in milliseconds
  enabled?: boolean;
}

interface BroadcastData {
  message: string;
  originAddress: string;
  destinationAddress: string;
  destination?: Location;
}

export function useUserPresence(options: UseUserPresenceOptions = {}) {
  const { updateInterval = 5000, enabled = true } = options;
  const { user } = useAuth();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [broadcast, setBroadcast] = useState<BroadcastData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lastUpdateRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);
  const presenceDocId = user?.uid;

  // Update presence in Firestore
  const updatePresence = useCallback(async (
    newLocation: { lat: number; lng: number },
    forceUpdate = false
  ) => {
    if (!user || !db || !presenceDocId) return;

    const now = Date.now();
    // Debounce updates to every updateInterval milliseconds
    if (!forceUpdate && now - lastUpdateRef.current < updateInterval) {
      return;
    }
    lastUpdateRef.current = now;

    try {
      const geohash = geohashForLocation([newLocation.lat, newLocation.lng]);
      const presenceRef = doc(db, 'userPresence', presenceDocId);

      const presenceData: Omit<UserPresence, 'id'> = {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        location: new GeoPoint(newLocation.lat, newLocation.lng),
        geohash,
        lastUpdated: Timestamp.now(),
        isOnline: true,
        isSearching,
        ...(broadcast && { broadcast }),
      };

      await setDoc(presenceRef, presenceData, { merge: true });
      setIsOnline(true);
      setError(null);
    } catch (err) {
      console.error('Error updating presence:', err);
      setError('Failed to update presence');
    }
  }, [user, presenceDocId, updateInterval, isSearching, broadcast]);

  // Set user as searching
  const startSearching = useCallback(async () => {
    setIsSearching(true);
    if (location) {
      await updatePresence(location, true);
    }
  }, [location, updatePresence]);

  // Stop searching
  const stopSearching = useCallback(async () => {
    setIsSearching(false);
    if (location) {
      await updatePresence(location, true);
    }
  }, [location, updatePresence]);

  // Set broadcast message
  const setBroadcastMessage = useCallback(async (data: BroadcastData | null) => {
    setBroadcast(data);
    if (location) {
      // Force update to reflect broadcast change immediately
      setTimeout(async () => {
        if (location && user && db && presenceDocId) {
          try {
            const presenceRef = doc(db, 'userPresence', presenceDocId);
            if (data) {
              await updateDoc(presenceRef, { broadcast: data });
            } else {
              // Remove broadcast field
              await updateDoc(presenceRef, { broadcast: null });
            }
          } catch (err) {
            console.error('Error updating broadcast:', err);
          }
        }
      }, 0);
    }
  }, [location, user, presenceDocId]);

  // Go offline
  const goOffline = useCallback(async () => {
    if (!user || !db || !presenceDocId) return;

    try {
      const presenceRef = doc(db, 'userPresence', presenceDocId);
      await updateDoc(presenceRef, {
        isOnline: false,
        lastUpdated: serverTimestamp(),
      });
      setIsOnline(false);
    } catch (err) {
      console.error('Error going offline:', err);
    }
  }, [user, presenceDocId]);

  // Delete presence completely
  const deletePresence = useCallback(async () => {
    if (!user || !db || !presenceDocId) return;

    try {
      const presenceRef = doc(db, 'userPresence', presenceDocId);
      await deleteDoc(presenceRef);
      setIsOnline(false);
    } catch (err) {
      console.error('Error deleting presence:', err);
    }
  }, [user, presenceDocId]);

  // Watch user location
  useEffect(() => {
    if (!enabled || !user || typeof window === 'undefined' || !navigator.geolocation) {
      return;
    }

    let isFirstUpdate = true;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(newLocation);
        // Force update on first location to ensure presence is created
        updatePresence(newLocation, isFirstUpdate);
        isFirstUpdate = false;
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to get location');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [enabled, user, updatePresence]);

  // Go offline when component unmounts or window closes
  useEffect(() => {
    if (!user) return;

    const handleBeforeUnload = () => {
      goOffline();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        goOffline();
      } else if (document.visibilityState === 'visible' && location) {
        updatePresence(location, true);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      goOffline();
    };
  }, [user, goOffline, updatePresence, location]);

  return {
    location,
    isOnline,
    isSearching,
    broadcast,
    error,
    startSearching,
    stopSearching,
    setBroadcastMessage,
    goOffline,
    deletePresence,
    updatePresence,
  };
}

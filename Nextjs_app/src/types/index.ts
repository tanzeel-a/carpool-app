/**
 * TypeScript interfaces for the Carpool app
 */

import { Timestamp, GeoPoint } from 'firebase/firestore';

/**
 * User profile stored in Firestore /users collection
 */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
}

/**
 * Location with coordinates and address
 */
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

/**
 * Ride request stored in Firestore /rides collection
 */
export interface Ride {
  id?: string;
  uid: string;
  displayName: string;
  photoURL: string;
  origin: GeoPoint;
  originAddress: string;
  destination: Location;
  geohash: string;
  status: 'searching' | 'matched' | 'completed' | 'expired' | 'cancelled';
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

/**
 * Match between two riders
 */
export interface Match {
  id?: string;
  riderA: {
    uid: string;
    displayName: string;
    photoURL: string;
  };
  riderB: {
    uid: string;
    displayName: string;
    photoURL: string;
  };
  origin: GeoPoint;
  destination: Location;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fare: number;
  createdAt: Timestamp;
}

/**
 * Auth context value
 */
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

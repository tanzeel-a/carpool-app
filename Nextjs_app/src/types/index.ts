/**
 * TypeScript interfaces for the Carpool app
 */

import { Timestamp, GeoPoint } from 'firebase/firestore';

/**
 * Gender options
 */
export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

/**
 * Gender preference for ride matching
 */
export type GenderPreference = 'any' | 'same_gender' | 'women_only';

/**
 * User profile stored in Firestore /users collection
 */
export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  createdAt: Timestamp;
  // New fields
  phoneNumber?: string;
  phoneVerified: boolean;
  gender?: Gender;
  genderPreference: GenderPreference;
  emergencyContact?: {
    name: string;
    phone: string;
  };
  rating: number;
  totalRatings: number;
  blockedUsers: string[];
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
  // New fields
  gender?: Gender;
  genderPreference?: GenderPreference;
  phoneVerified?: boolean;
  rating?: number;
}

/**
 * Rider info for matches
 */
export interface RiderInfo {
  uid: string;
  displayName: string;
  photoURL: string;
  phoneNumber?: string;
  rating?: number;
}

/**
 * Group match between multiple riders (up to 4)
 */
export interface GroupMatch {
  id?: string;
  riders: RiderInfo[];
  origin: GeoPoint;
  destination: Location;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp;
  createdBy: string;
}

/**
 * Match between two riders (legacy, keeping for compatibility)
 */
export interface Match {
  id?: string;
  riderA: RiderInfo;
  riderB: RiderInfo;
  origin: GeoPoint;
  destination: Location;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  fare: number;
  createdAt: Timestamp;
}

/**
 * Rating given after a ride
 */
export interface Rating {
  id?: string;
  fromUserId: string;
  toUserId: string;
  matchId: string;
  rating: number; // 1-5 stars
  comment?: string;
  createdAt: Timestamp;
}

/**
 * SOS Alert
 */
export interface SOSAlert {
  id?: string;
  userId: string;
  location: GeoPoint;
  timestamp: Timestamp;
  emergencyContact: {
    name: string;
    phone: string;
  };
  matchId?: string;
  resolved: boolean;
}

/**
 * Chat message for group chat
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text?: string;
  location?: { lat: number; lng: number };
  timestamp: Date;
  type: 'text' | 'location' | 'system';
}

/**
 * Auth context value
 */
export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

/**
 * Match Request for nearby people feature
 */
export interface MatchRequest {
  id: string;
  fromUserId: string;
  fromUser: { displayName: string; photoURL: string; location: GeoPoint };
  toUserId: string;
  toUser: { displayName: string; photoURL: string };
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  message?: string;
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

/**
 * Persistent Chat between users
 */
export interface Chat {
  id: string;
  participants: string[];
  participantDetails: Record<string, { displayName: string; photoURL: string }>;
  lastMessage?: { text: string; senderId: string; timestamp: Timestamp };
  createdAt: Timestamp;
  encryptionKeys?: Record<string, string>; // userId -> base64 public key for E2EE
}

/**
 * Persistent Chat Message
 */
export interface PersistentChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text?: string;
  location?: { lat: number; lng: number };
  timestamp: Timestamp;
  type: 'text' | 'location' | 'system';
  read: boolean;
}

/**
 * User Presence for nearby people discovery
 */
export interface UserPresence {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  location: GeoPoint;
  geohash: string;
  lastUpdated: Timestamp;
  isOnline: boolean;
  isSearching: boolean;
  broadcast?: {
    message: string;
    originAddress: string;
    destinationAddress: string;
    destination?: Location;
  };
}

/**
 * Broadcast Message for map annotations
 */
export interface Broadcast {
  id: string;
  userId: string;
  user: { displayName: string; photoURL: string };
  location: GeoPoint;
  geohash: string;
  origin: Location;
  destination: Location;
  createdAt: Timestamp;
  expiresAt: Timestamp;
  status: 'active' | 'expired' | 'cancelled';
}

/**
 * Nearby Person for map display
 */
export interface NearbyPerson {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  location: { lat: number; lng: number };
  distance: number;
  isOnline: boolean;
  broadcast?: {
    message: string;
    originAddress: string;
    destinationAddress: string;
    destination?: Location;
  };
}

/**
 * Group Ride with multiple participants
 */
export interface GroupRide {
  id: string;
  hostId: string;
  participants: {
    uid: string;
    displayName: string;
    photoURL: string;
    status: 'pending' | 'confirmed' | 'declined';
  }[];
  origin: Location;
  destination: Location;
  status: 'forming' | 'ready' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Timestamp;
}

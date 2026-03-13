'use client';

/**
 * Dashboard Page
 *
 * Main app view with:
 * - Google Maps showing user location
 * - Find Ride button to create ride request
 * - Destination search
 * - Match display when riders found
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import MapView from '@/components/MapView';
import RideCard from '@/components/RideCard';
import PlacesAutocomplete from '@/components/PlacesAutocomplete';
import ChatPopup from '@/components/ChatPopup';
import MatchRequestModal from '@/components/MatchRequestModal';
import MinimizableChat, { ChatBubbles } from '@/components/MinimizableChat';
import GroupRidePanel from '@/components/GroupRidePanel';
import NotificationBell from '@/components/NotificationBell';
import NotificationToast from '@/components/NotificationToast';
import { useUserPresence } from '@/hooks/useUserPresence';
import { useNearbyPeople } from '@/hooks/useNearbyPeople';
import { useMatchRequests } from '@/hooks/useMatchRequests';
import { useChats } from '@/hooks/useChat';
import { Ride, Location, NearbyPerson, GroupRide, MatchRequest } from '@/types';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  GeoPoint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { geohashForLocation, geohashQueryBounds } from 'geofire-common';
import styles from './page.module.css';

// Constants
const RIDE_EXPIRY_MINUTES = 10;

// Demo rider data
const DEMO_RIDERS = [
  { name: 'Priya Sharma', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya' },
  { name: 'Rahul Verma', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul' },
  { name: 'Ananya Singh', photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya' },
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [nearbyRides, setNearbyRides] = useState<Ride[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoRideId, setDemoRideId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [searchRadius, setSearchRadius] = useState(500); // in meters (500m default for nearby people)

  // Chat and matched rider state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [matchedRider, setMatchedRider] = useState<{
    displayName: string;
    photoURL: string;
    location: { lat: number; lng: number };
  } | null>(null);
  const matchedRiderLocationRef = useRef<{ lat: number; lng: number } | null>(null);

  // Focus location for map panning
  const [focusLocation, setFocusLocation] = useState<{
    lat: number;
    lng: number;
    timestamp: number;
  } | null>(null);

  // ============================================
  // Nearby People Feature State
  // ============================================
  const [selectedPerson, setSelectedPerson] = useState<NearbyPerson | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeChatParticipant, setActiveChatParticipant] = useState<{
    uid: string;
    displayName: string;
    photoURL: string;
  } | null>(null);
  const [groupRide, setGroupRide] = useState<GroupRide | null>(null);
  const [matchRequestLoading, setMatchRequestLoading] = useState(false);

  // ============================================
  // Nearby People Hooks
  // ============================================

  // User presence - updates location and online status
  const {
    location: presenceLocation,
    isOnline,
    setBroadcastMessage,
  } = useUserPresence({ enabled: !!user });

  // Use presence location if available, otherwise fall back to local state
  useEffect(() => {
    if (presenceLocation) {
      setUserLocation(presenceLocation);
    }
  }, [presenceLocation]);

  // Nearby people - query nearby users
  const { nearbyPeople } = useNearbyPeople({
    userLocation,
    radius: searchRadius,
    enabled: !!user && !!userLocation,
  });

  // Match requests - handle incoming/outgoing requests
  const {
    incomingRequests,
    outgoingRequests,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
  } = useMatchRequests();

  // All user chats
  const { chats } = useChats();

  // Get the first incoming request for modal display
  const currentIncomingRequest = incomingRequests[0] || null;

  // ============================================
  // Nearby People & Group Ride Handlers
  // ============================================

  // Handle clicking on a nearby person marker - adds them to group ride
  const handlePersonClick = useCallback((person: NearbyPerson) => {
    if (!user || !destination) return;

    // Check if person is already in the group
    if (groupRide?.participants.some(p => p.uid === person.uid)) {
      return; // Already in group
    }

    if (!groupRide) {
      // Create new group ride with user as host and add the clicked person
      const newGroupRide: GroupRide = {
        id: `group-${Date.now()}`,
        hostId: user.uid,
        participants: [
          {
            uid: user.uid,
            displayName: user.displayName,
            photoURL: user.photoURL,
            status: 'confirmed',
          },
          {
            uid: person.uid,
            displayName: person.displayName,
            photoURL: person.photoURL,
            status: 'confirmed', // Auto-confirm for demo
          },
        ],
        origin: {
          lat: userLocation?.lat || 0,
          lng: userLocation?.lng || 0,
          address: 'Current Location',
        },
        destination,
        status: 'forming',
        createdAt: Timestamp.now(),
      };
      setGroupRide(newGroupRide);
    } else {
      // Add to existing group (max 4 people)
      if (groupRide.participants.length >= 4) {
        setError('Group is full (max 4 people)');
        return;
      }
      setGroupRide({
        ...groupRide,
        participants: [
          ...groupRide.participants,
          {
            uid: person.uid,
            displayName: person.displayName,
            photoURL: person.photoURL,
            status: 'confirmed', // Auto-confirm for demo
          },
        ],
      });
    }

    // Clear any selected person
    setSelectedPerson(null);
  }, [user, destination, groupRide, userLocation]);

  // Accept incoming match request (when someone requests to join)
  const handleAcceptMatchRequest = useCallback(async () => {
    if (!currentIncomingRequest) return;

    setMatchRequestLoading(true);
    const chatId = await acceptRequest(currentIncomingRequest.id);
    setMatchRequestLoading(false);

    if (chatId) {
      // Open chat with the person
      setActiveChatId(chatId);
      setActiveChatParticipant({
        uid: currentIncomingRequest.fromUserId,
        displayName: currentIncomingRequest.fromUser.displayName,
        photoURL: currentIncomingRequest.fromUser.photoURL,
      });
    }
  }, [currentIncomingRequest, acceptRequest]);

  // Decline incoming match request
  const handleDeclineMatchRequest = useCallback(async () => {
    if (!currentIncomingRequest) return;
    await rejectRequest(currentIncomingRequest.id);
  }, [currentIncomingRequest, rejectRequest]);

  // Handle notification bell click - open modal for specific request
  const handleNotificationClick = useCallback((request: MatchRequest) => {
    // The request is already in incomingRequests, modal will show it
    console.log('Notification clicked:', request.fromUser.displayName);
  }, []);

  // Handle toast accept/decline
  const handleToastAccept = useCallback(async (request: MatchRequest) => {
    setMatchRequestLoading(true);
    const chatId = await acceptRequest(request.id);
    setMatchRequestLoading(false);

    if (chatId) {
      setActiveChatId(chatId);
      setActiveChatParticipant({
        uid: request.fromUserId,
        displayName: request.fromUser.displayName,
        photoURL: request.fromUser.photoURL,
      });
    }
  }, [acceptRequest]);

  const handleToastDecline = useCallback(async (request: MatchRequest) => {
    await rejectRequest(request.id);
  }, [rejectRequest]);

  // Open a chat from the bubbles
  const handleChatBubbleClick = useCallback((chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat && user) {
      const otherParticipantId = chat.participants.find(p => p !== user.uid);
      if (otherParticipantId) {
        const otherParticipant = chat.participantDetails[otherParticipantId];
        setActiveChatId(chatId);
        setActiveChatParticipant({
          uid: otherParticipantId,
          displayName: otherParticipant.displayName,
          photoURL: otherParticipant.photoURL,
        });
      }
    }
  }, [chats, user]);

  // Close active chat
  const handleClosePersistentChat = useCallback(() => {
    setActiveChatId(null);
    setActiveChatParticipant(null);
  }, []);

  // Handle view location from persistent chat
  const handleViewLocationFromChat = useCallback((location: { lat: number; lng: number }) => {
    setFocusLocation({
      lat: location.lat,
      lng: location.lng,
      timestamp: Date.now(),
    });
  }, []);

  // Set broadcast when destination is selected
  useEffect(() => {
    if (destination && userLocation) {
      setBroadcastMessage({
        message: `Heading to ${destination.address.split(',')[0]}`,
        originAddress: 'Current Location',
        destinationAddress: destination.address,
        destination,
      });
    } else {
      setBroadcastMessage(null);
    }
  }, [destination, userLocation, setBroadcastMessage]);

  // Group ride handlers (placeholder implementations)
  const handleInviteToGroupRide = useCallback((person: NearbyPerson) => {
    // TODO: Implement group ride invite
    console.log('Invite to group ride:', person);
  }, []);

  const handleStartGroupRide = useCallback(() => {
    // TODO: Implement start group ride
    console.log('Start group ride');
  }, []);

  const handleCancelGroupRide = useCallback(() => {
    setGroupRide(null);
  }, []);

  const handleLeaveGroupRide = useCallback(() => {
    setGroupRide(null);
  }, []);

  // Get user location on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setError(null);
      },
      (err) => {
        console.error('Geolocation error:', err);
        setError('Unable to get your location. Please enable location services.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Listen for nearby rides when searching
  useEffect(() => {
    if (!userLocation || !currentRide || !db) return;

    const firestore = db; // Non-null after check above

    const bounds = geohashQueryBounds(
      [userLocation.lat, userLocation.lng],
      searchRadius // Already in meters
    );

    const unsubscribes: (() => void)[] = [];

    bounds.forEach(([start, end]) => {
      const ridesRef = collection(firestore, 'rides');
      const q = query(
        ridesRef,
        where('geohash', '>=', start),
        where('geohash', '<=', end),
        where('status', '==', 'searching')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const rides: Ride[] = [];
        snapshot.forEach((docSnap) => {
          const ride = { id: docSnap.id, ...docSnap.data() } as Ride;
          // Filter out own ride and expired rides
          if (
            ride.uid !== user?.uid &&
            ride.expiresAt.toDate() > new Date()
          ) {
            rides.push(ride);
          }
        });
        setNearbyRides(rides);
      });

      unsubscribes.push(unsubscribe);
    });

    return () => unsubscribes.forEach((unsub) => unsub());
  }, [userLocation, currentRide, user?.uid, searchRadius]);

  // Create ride request
  const handleFindRide = useCallback(async () => {
    if (!userLocation || !user || !destination || !db) {
      setError('Please set a destination first');
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const geohash = geohashForLocation([userLocation.lat, userLocation.lng]);
      const now = new Date();
      const expiresAt = new Date(now.getTime() + RIDE_EXPIRY_MINUTES * 60 * 1000);

      const rideData = {
        uid: user.uid,
        displayName: user.displayName,
        photoURL: user.photoURL,
        origin: new GeoPoint(userLocation.lat, userLocation.lng),
        originAddress: 'Current Location',
        destination,
        geohash,
        status: 'searching',
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      const docRef = await addDoc(collection(db, 'rides'), rideData);
      setCurrentRide({ id: docRef.id, ...rideData } as Ride);
    } catch (err) {
      console.error('Error creating ride:', err);
      setError('Failed to create ride request. Please try again.');
      setIsSearching(false);
    }
  }, [userLocation, user, destination]);

  // Cancel ride request
  const handleCancelRide = useCallback(async () => {
    if (!currentRide?.id || !db) return;

    try {
      await updateDoc(doc(db, 'rides', currentRide.id), {
        status: 'cancelled',
      });
      setCurrentRide(null);
      setNearbyRides([]);
      setIsSearching(false);
    } catch (err) {
      console.error('Error cancelling ride:', err);
    }
  }, [currentRide]);

  // Handle destination selection from Places Autocomplete
  const handlePlaceSelect = useCallback((location: Location) => {
    setDestination(location);
  }, []);

  // Create a demo rider nearby for testing
  const createDemoRider = useCallback(async () => {
    if (!userLocation || !destination || !db) return;

    const demoRider = DEMO_RIDERS[Math.floor(Math.random() * DEMO_RIDERS.length)];

    // Create a position ~50m away (within 100m radius)
    const offsetLat = (Math.random() - 0.5) * 0.0008; // ~50m
    const offsetLng = (Math.random() - 0.5) * 0.0008;
    const demoLocation = {
      lat: userLocation.lat + offsetLat,
      lng: userLocation.lng + offsetLng,
    };

    const geohash = geohashForLocation([demoLocation.lat, demoLocation.lng]);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + RIDE_EXPIRY_MINUTES * 60 * 1000);

    try {
      const demoRideData = {
        uid: 'demo-user-' + Date.now(),
        displayName: demoRider.name,
        photoURL: demoRider.photo,
        origin: new GeoPoint(demoLocation.lat, demoLocation.lng),
        originAddress: 'Nearby Location',
        destination: {
          lat: destination.lat + 0.001,
          lng: destination.lng + 0.001,
          address: destination.address,
        },
        geohash,
        status: 'searching',
        createdAt: Timestamp.fromDate(now),
        expiresAt: Timestamp.fromDate(expiresAt),
      };

      const docRef = await addDoc(collection(db, 'rides'), demoRideData);
      setDemoRideId(docRef.id);
      setIsDemoMode(true);
    } catch (err) {
      console.error('Error creating demo rider:', err);
    }
  }, [userLocation, destination]);

  // Clean up demo rider
  const cleanupDemoRider = useCallback(async () => {
    if (!demoRideId || !db) return;

    try {
      await deleteDoc(doc(db, 'rides', demoRideId));
      setDemoRideId(null);
      setIsDemoMode(false);
    } catch (err) {
      console.error('Error cleaning up demo rider:', err);
    }
  }, [demoRideId]);

  // Handle match acceptance
  const handleAcceptMatch = async (ride: Ride) => {
    if (!currentRide?.id || !ride.id || !db) return;

    try {
      // Update both rides to matched status
      await updateDoc(doc(db, 'rides', currentRide.id), { status: 'matched' });
      await updateDoc(doc(db, 'rides', ride.id), { status: 'matched' });

      // Create match document
      await addDoc(collection(db, 'matches'), {
        riderA: {
          uid: user?.uid,
          displayName: user?.displayName,
          photoURL: user?.photoURL,
        },
        riderB: {
          uid: ride.uid,
          displayName: ride.displayName,
          photoURL: ride.photoURL,
        },
        origin: currentRide.origin,
        destination: currentRide.destination,
        status: 'confirmed',
        fare: 0,
        createdAt: Timestamp.now(),
      });

      // Store matched rider info for chat
      const riderLocation = {
        lat: ride.origin.latitude,
        lng: ride.origin.longitude,
      };
      setMatchedRider({
        displayName: ride.displayName,
        photoURL: ride.photoURL,
        location: riderLocation,
      });
      matchedRiderLocationRef.current = riderLocation;

      // Clean up demo rider if it was a demo match
      if (demoRideId) {
        setDemoRideId(null);
        setIsDemoMode(false);
      }

      setCurrentRide(null);
      setNearbyRides([]);
      setIsSearching(false);

      // Open chat popup
      setIsChatOpen(true);
    } catch (err) {
      console.error('Error accepting match:', err);
      setError('Failed to confirm match. Please try again.');
    }
  };

  // Simulate matched rider moving closer (for demo)
  useEffect(() => {
    if (!matchedRider || !userLocation || !isChatOpen) return;

    const interval = setInterval(() => {
      if (matchedRiderLocationRef.current && userLocation) {
        const current = matchedRiderLocationRef.current;
        // Move 10% closer to user each tick
        const newLat = current.lat + (userLocation.lat - current.lat) * 0.1;
        const newLng = current.lng + (userLocation.lng - current.lng) * 0.1;

        matchedRiderLocationRef.current = { lat: newLat, lng: newLng };
        setMatchedRider(prev => prev ? {
          ...prev,
          location: { lat: newLat, lng: newLng },
        } : null);
      }
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [matchedRider, userLocation, isChatOpen]);

  // Close chat and reset
  const handleCloseChat = () => {
    setIsChatOpen(false);
    setMatchedRider(null);
    matchedRiderLocationRef.current = null;
    setDestination(null);
  };

  // Handle location share in chat
  const handleLocationShare = () => {
    // Location is already being tracked, this just triggers visual feedback
  };

  // Handle view location from chat - minimize chat and pan map to location
  const handleViewLocation = useCallback((location: { lat: number; lng: number }, isMe: boolean) => {
    // Close/minimize chat to show map
    setIsChatOpen(false);

    // Pan map to the location
    setFocusLocation({
      lat: location.lat,
      lng: location.lng,
      timestamp: Date.now(),
    });

    // Reopen chat after a short delay so user can see the map
    setTimeout(() => {
      setIsChatOpen(true);
    }, 2000);
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={styles.dashboard}>
      {/* Header with centered search */}
      <header className={styles.header}>
        {/* Mobile menu button */}
        <button
          className={styles.menuBtn}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Home
            </Link>
            {user ? (
              <button className={styles.menuItem} onClick={() => { signOut(); setMenuOpen(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            ) : (
              <Link href="/login" className={styles.menuItem} onClick={() => setMenuOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Sign In
              </Link>
            )}
          </div>
        )}

        {/* Mobile notification bell */}
        <div className={styles.mobileNotificationBell}>
          <NotificationBell
            incomingRequests={incomingRequests}
            onRequestClick={handleNotificationClick}
          />
        </div>

        {/* Brand - hidden on mobile, shown on desktop */}
        <Link href="/" className={styles.brand}>Carpool</Link>

        {/* Centered Search Bar */}
        {!isSearching && (
          <div className={styles.headerSearch}>
            <PlacesAutocomplete
              placeholder="Where are you heading?"
              onPlaceSelect={handlePlaceSelect}
              disabled={isSearching}
              radius={searchRadius}
              onRadiusChange={setSearchRadius}
            />
          </div>
        )}

        {/* Desktop user info with notification bell */}
        <div className={styles.userInfo}>
          <NotificationBell
            incomingRequests={incomingRequests}
            onRequestClick={handleNotificationClick}
          />
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName || 'User'}
              className={styles.avatar}
            />
          )}
          <button onClick={signOut} className={styles.signOutBtn}>
            Sign out
          </button>
        </div>
      </header>

      {/* Overlay for mobile menu */}
      {menuOpen && <div className={styles.menuOverlay} onClick={() => setMenuOpen(false)} />}

      {/* Map */}
      <div className={styles.mapContainer}>
        <MapView
          center={userLocation}
          userLocation={userLocation}
          destination={destination}
          nearbyRides={nearbyRides}
          matchedRiderLocation={matchedRider?.location}
          searchRadius={searchRadius}
          focusLocation={focusLocation}
          currentUser={user ? { photoURL: user.photoURL, displayName: user.displayName } : null}
          nearbyPeople={nearbyPeople}
          selectedPersonId={selectedPerson?.id}
          onPersonClick={handlePersonClick}
        />

        {/* Status Banner */}
        {error && (
          <div className={styles.errorBanner}>
            {error}
          </div>
        )}

        {/* Nearby People Indicator */}
        {nearbyPeople.length > 0 && !groupRide && (
          <div className={styles.nearbyIndicator}>
            <span className={styles.nearbyDot} />
            {nearbyPeople.length} {nearbyPeople.length === 1 ? 'person' : 'people'} nearby
            <span className={styles.nearbyHint}>Tap markers to add to group</span>
          </div>
        )}

        {/* Find Ride Button */}
        {!isSearching && destination && (
          <button
            className={styles.findRideBtn}
            onClick={handleFindRide}
            disabled={!userLocation}
          >
            Find Ride to {destination.address}
          </button>
        )}

        {/* Searching State */}
        {isSearching && (
          <div className={styles.searchingBanner}>
            <div className={styles.pulseRing} />
            <p>Looking for riders nearby...</p>
            <div className={styles.searchingActions}>
              {!isDemoMode && nearbyRides.length === 0 && (
                <button onClick={createDemoRider} className={styles.demoBtn}>
                  Simulate Nearby Rider
                </button>
              )}
              <button onClick={async () => {
                await cleanupDemoRider();
                handleCancelRide();
              }} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Nearby Rides */}
        {nearbyRides.length > 0 && (
          <div className={styles.matchesPanel}>
            <h3>Riders Found!</h3>
            <div className={styles.matchesList}>
              {nearbyRides.map((ride) => (
                <RideCard
                  key={ride.id}
                  ride={ride}
                  onAccept={() => handleAcceptMatch(ride)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Chat Popup (legacy - for ride matches) */}
      {matchedRider && (
        <ChatPopup
          isOpen={isChatOpen}
          onClose={handleCloseChat}
          matchedRider={{
            displayName: matchedRider.displayName,
            photoURL: matchedRider.photoURL,
          }}
          myLocation={userLocation}
          theirLocation={matchedRider.location}
          onLocationShare={handleLocationShare}
          onViewLocation={handleViewLocation}
        />
      )}

      {/* ============================================
          Nearby People Feature Components
          ============================================ */}

      {/* Match Request Modal - Receive mode (incoming request) */}
      <MatchRequestModal
        incomingRequest={currentIncomingRequest}
        onAcceptRequest={handleAcceptMatchRequest}
        onDeclineRequest={handleDeclineMatchRequest}
        loading={matchRequestLoading}
      />

      {/* Slide-in Toast Notifications from the right */}
      <NotificationToast
        incomingRequests={incomingRequests}
        onAccept={handleToastAccept}
        onDecline={handleToastDecline}
      />

      {/* Minimizable Persistent Chat */}
      {activeChatId && activeChatParticipant && (
        <MinimizableChat
          chatId={activeChatId}
          otherParticipant={activeChatParticipant}
          isInitiallyExpanded={true}
          onClose={handleClosePersistentChat}
          onViewLocation={handleViewLocationFromChat}
          myLocation={userLocation}
        />
      )}

      {/* Chat Bubbles for other chats */}
      {user && (
        <ChatBubbles
          chats={chats}
          activeChatId={activeChatId}
          onChatClick={handleChatBubbleClick}
          currentUserId={user.uid}
        />
      )}

      {/* Group Ride Panel */}
      {groupRide && (
        <GroupRidePanel
          groupRide={groupRide}
          isHost={groupRide.hostId === user?.uid}
          nearbyPeople={nearbyPeople}
          onInvitePerson={handleInviteToGroupRide}
          onStartRide={handleStartGroupRide}
          onCancelRide={handleCancelGroupRide}
          onLeaveRide={handleLeaveGroupRide}
        />
      )}
    </div>
  );
}

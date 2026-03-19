'use client';

/**
 * useMatchRequests Hook
 *
 * Manages match requests between users:
 * - Subscribe to incoming requests (toUserId == uid)
 * - Subscribe to outgoing requests (fromUserId == uid)
 * - Methods: sendRequest, acceptRequest, rejectRequest
 * - Auto-expire requests after 5 minutes
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  GeoPoint,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { MatchRequest, Chat, NearbyPerson } from '@/types';
import {
  generateKeyPair,
  exportPublicKey,
  storePrivateKey,
  isEncryptionSupported,
} from '@/lib/crypto';

const REQUEST_EXPIRY_MINUTES = 5;

interface UseMatchRequestsResult {
  incomingRequests: MatchRequest[];
  outgoingRequests: MatchRequest[];
  loading: boolean;
  error: string | null;
  sendRequest: (toPerson: NearbyPerson, message?: string) => Promise<string | null>;
  acceptRequest: (requestId: string) => Promise<string | null>;
  rejectRequest: (requestId: string) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
}

export function useMatchRequests(): UseMatchRequestsResult {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<MatchRequest[]>([]);
  const [outgoingRequests, setOutgoingRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to incoming requests
  useEffect(() => {
    if (!user || !db) {
      setIncomingRequests([]);
      return;
    }

    const firestore = db; // TypeScript narrowing helper

    const requestsRef = collection(firestore, 'matchRequests');
    const q = query(
      requestsRef,
      where('toUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    console.log('[MatchRequests] Subscribing to incoming requests for:', user.uid);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log('[MatchRequests] Incoming snapshot:', {
          size: snapshot.size,
          changes: snapshot.docChanges().length,
        });

        const requests: MatchRequest[] = [];
        const now = new Date();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          console.log('[MatchRequests] Incoming request data:', {
            id: docSnap.id,
            from: data.fromUser?.displayName,
            status: data.status,
          });

          const request = {
            id: docSnap.id,
            ...data,
          } as MatchRequest;

          // Check if expired
          const expiresAt = request.expiresAt?.toDate?.() || new Date();
          if (expiresAt > now) {
            requests.push(request);
          } else {
            // Auto-expire in Firestore
            updateDoc(doc(firestore, 'matchRequests', docSnap.id), {
              status: 'expired',
            }).catch(console.error);
          }
        });

        console.log('[MatchRequests] Total incoming requests:', requests.length);
        setIncomingRequests(requests);
      },
      (err) => {
        console.error('Error fetching incoming requests:', err);
        setError('Failed to fetch requests');
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to outgoing requests
  useEffect(() => {
    if (!user || !db) {
      setOutgoingRequests([]);
      return;
    }

    const requestsRef = collection(db, 'matchRequests');
    const q = query(
      requestsRef,
      where('fromUserId', '==', user.uid),
      where('status', '==', 'pending')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const requests: MatchRequest[] = [];
        const now = new Date();

        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const request = {
            id: docSnap.id,
            ...data,
          } as MatchRequest;

          // Check if expired
          const expiresAt = request.expiresAt?.toDate?.() || new Date();
          if (expiresAt > now) {
            requests.push(request);
          }
        });

        setOutgoingRequests(requests);
      },
      (err) => {
        console.error('Error fetching outgoing requests:', err);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Send a match request
  const sendRequest = useCallback(
    async (toPerson: NearbyPerson, message?: string): Promise<string | null> => {
      if (!user || !db) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + REQUEST_EXPIRY_MINUTES * 60 * 1000);

        const requestData = {
          fromUserId: user.uid,
          fromUser: {
            displayName: user.displayName,
            photoURL: user.photoURL,
            location: new GeoPoint(
              toPerson.location.lat,
              toPerson.location.lng
            ),
          },
          toUserId: toPerson.uid,
          toUser: {
            displayName: toPerson.displayName,
            photoURL: toPerson.photoURL,
          },
          status: 'pending',
          message: message || '',
          createdAt: Timestamp.fromDate(now),
          expiresAt: Timestamp.fromDate(expiresAt),
        };

        console.log('[MatchRequests] Sending request:', {
          to: toPerson.displayName,
          toUserId: toPerson.uid,
        });

        const docRef = await addDoc(collection(db, 'matchRequests'), requestData);
        console.log('[MatchRequests] Request sent successfully:', docRef.id);
        setLoading(false);
        return docRef.id;
      } catch (err) {
        console.error('Error sending match request:', err);
        setError('Failed to send request');
        setLoading(false);
        return null;
      }
    },
    [user]
  );

  // Accept a match request and create a chat
  const acceptRequest = useCallback(
    async (requestId: string): Promise<string | null> => {
      if (!user || !db) {
        setError('Not authenticated');
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        // Update request status
        const requestRef = doc(db, 'matchRequests', requestId);
        await updateDoc(requestRef, {
          status: 'accepted',
        });

        // Find the request to get participant info
        const request = incomingRequests.find((r) => r.id === requestId);
        if (!request) {
          setError('Request not found');
          setLoading(false);
          return null;
        }

        // Create a chat between the two users
        const chatId = [user.uid, request.fromUserId].sort().join('_');
        const chatRef = doc(db, 'chats', chatId);

        // Generate encryption keys for E2EE (non-blocking)
        let encryptionKeys: Record<string, string> = {};
        if (typeof window !== 'undefined' && isEncryptionSupported()) {
          try {
            // Generate key pair for the accepting user
            const myKeyPair = await generateKeyPair();
            const myPublicKeyBase64 = await exportPublicKey(myKeyPair.publicKey);

            // Store private key in IndexedDB
            await storePrivateKey(chatId, user.uid, myKeyPair.privateKey);

            // Store public key in chat document
            encryptionKeys = {
              [user.uid]: myPublicKeyBase64,
            };

            console.log('[MatchRequests] Generated encryption keys for user:', user.uid);
          } catch (cryptoErr) {
            console.warn('[MatchRequests] Encryption setup skipped:', cryptoErr);
            // Continue without encryption if it fails - chat will still work
            encryptionKeys = {};
          }
        }

        const chatData: Omit<Chat, 'id'> & { encryptionKeys?: Record<string, string> } = {
          participants: [user.uid, request.fromUserId],
          participantDetails: {
            [user.uid]: {
              displayName: user.displayName,
              photoURL: user.photoURL,
            },
            [request.fromUserId]: {
              displayName: request.fromUser.displayName,
              photoURL: request.fromUser.photoURL,
            },
          },
          createdAt: Timestamp.now(),
          lastMessage: {
            text: 'Match accepted! Start chatting.',
            senderId: 'system',
            timestamp: Timestamp.now(),
          },
          ...(Object.keys(encryptionKeys).length > 0 && { encryptionKeys }),
        };

        await setDoc(chatRef, chatData, { merge: true });

        // Add system message to chat (not encrypted since it's from system)
        await addDoc(collection(db, 'chats', chatId, 'messages'), {
          senderId: 'system',
          senderName: 'System',
          text: `${user.displayName} accepted the match request. You can now chat!`,
          timestamp: serverTimestamp(),
          type: 'system',
          read: false,
          encrypted: false,
        });

        setLoading(false);
        return chatId;
      } catch (err) {
        console.error('Error accepting request:', err);
        setError('Failed to accept request');
        setLoading(false);
        return null;
      }
    },
    [user, incomingRequests]
  );

  // Reject a match request
  const rejectRequest = useCallback(
    async (requestId: string): Promise<void> => {
      if (!db) return;

      setLoading(true);
      try {
        const requestRef = doc(db, 'matchRequests', requestId);
        await updateDoc(requestRef, {
          status: 'rejected',
        });
        setLoading(false);
      } catch (err) {
        console.error('Error rejecting request:', err);
        setError('Failed to reject request');
        setLoading(false);
      }
    },
    []
  );

  // Cancel an outgoing request
  const cancelRequest = useCallback(
    async (requestId: string): Promise<void> => {
      if (!db) return;

      setLoading(true);
      try {
        const requestRef = doc(db, 'matchRequests', requestId);
        await deleteDoc(requestRef);
        setLoading(false);
      } catch (err) {
        console.error('Error cancelling request:', err);
        setError('Failed to cancel request');
        setLoading(false);
      }
    },
    []
  );

  return {
    incomingRequests,
    outgoingRequests,
    loading,
    error,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
  };
}

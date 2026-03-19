'use client';

/**
 * useChat Hook
 *
 * Manages persistent chat messages:
 * - Subscribe to chat messages (chats/{chatId}/messages)
 * - Methods: sendMessage, sendLocation, markAsRead
 * - Order by timestamp, limit to 50 (paginate on scroll)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  startAfter,
  Timestamp,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { PersistentChatMessage, Chat } from '@/types';
import {
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
  storePrivateKey,
  getPrivateKey,
  encryptMessage,
  decryptMessage,
  encryptLocation,
  decryptLocation,
  isEncryptionSupported,
  EncryptedMessage,
} from '@/lib/crypto';

const MESSAGES_PER_PAGE = 50;

interface UseChatOptions {
  chatId: string | null;
  enabled?: boolean;
}

interface UseChatResult {
  messages: PersistentChatMessage[];
  chat: Chat | null;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  error: string | null;
  unreadCount: number;
  isEncrypted: boolean;
  sendMessage: (text: string) => Promise<void>;
  sendLocation: (location: { lat: number; lng: number }) => Promise<void>;
  markAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
  endChat: () => Promise<void>;
}

export function useChat(options: UseChatOptions): UseChatResult {
  const { chatId, enabled = true } = options;
  const { user } = useAuth();
  const [messages, setMessages] = useState<PersistentChatMessage[]>([]);
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEncrypted, setIsEncrypted] = useState(false);

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const myPrivateKeyRef = useRef<CryptoKey | null>(null);
  const myPublicKeyRef = useRef<CryptoKey | null>(null);
  const theirPublicKeyRef = useRef<CryptoKey | null>(null);

  // Initialize encryption keys
  const initializeEncryption = useCallback(async () => {
    if (!chatId || !user || !db || !isEncryptionSupported()) {
      return false;
    }

    try {
      // Try to get existing private key from IndexedDB
      let myPrivateKey = await getPrivateKey(chatId, user.uid);

      if (!myPrivateKey) {
        // Generate new key pair
        const keyPair = await generateKeyPair();
        myPrivateKey = keyPair.privateKey;
        myPrivateKeyRef.current = keyPair.privateKey;
        myPublicKeyRef.current = keyPair.publicKey;

        // Store private key locally
        await storePrivateKey(chatId, user.uid, keyPair.privateKey);

        // Store public key in chat document
        const publicKeyBase64 = await exportPublicKey(keyPair.publicKey);
        const chatRef = doc(db, 'chats', chatId);
        await updateDoc(chatRef, {
          [`encryptionKeys.${user.uid}`]: publicKeyBase64,
        });

        console.log('[useChat] Generated new encryption keys');
      } else {
        myPrivateKeyRef.current = myPrivateKey;
        // We need to regenerate public key from private (not possible with ECDH)
        // So we need to read it from the chat document
      }

      // Get other participant's public key from chat document
      const chatDoc = await getDoc(doc(db, 'chats', chatId));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        const otherUserId = chatData.participants?.find((p: string) => p !== user.uid);

        if (otherUserId && chatData.encryptionKeys?.[otherUserId]) {
          theirPublicKeyRef.current = await importPublicKey(chatData.encryptionKeys[otherUserId]);
          console.log('[useChat] Loaded other user public key');
        }

        // Also get our own public key if we don't have it
        if (chatData.encryptionKeys?.[user.uid] && !myPublicKeyRef.current) {
          myPublicKeyRef.current = await importPublicKey(chatData.encryptionKeys[user.uid]);
        }
      }

      const canEncrypt = myPrivateKeyRef.current !== null &&
                         myPublicKeyRef.current !== null &&
                         theirPublicKeyRef.current !== null;
      setIsEncrypted(canEncrypt);
      return canEncrypt;
    } catch (err) {
      console.error('[useChat] Encryption initialization failed:', err);
      return false;
    }
  }, [chatId, user]);

  // Decrypt a message
  const decryptMessageData = useCallback(async (data: DocumentData): Promise<{ text?: string; location?: { lat: number; lng: number } }> => {
    if (!data.encrypted || !myPrivateKeyRef.current) {
      return { text: data.text, location: data.location };
    }

    try {
      if (data.encryptedText) {
        const encryptedMsg: EncryptedMessage = {
          ciphertext: data.encryptedText.ciphertext,
          iv: data.encryptedText.iv,
          senderPublicKey: data.encryptedText.senderPublicKey,
        };
        const text = await decryptMessage(encryptedMsg, myPrivateKeyRef.current);
        return { text };
      }

      if (data.encryptedLocation) {
        const encryptedLoc: EncryptedMessage = {
          ciphertext: data.encryptedLocation.ciphertext,
          iv: data.encryptedLocation.iv,
          senderPublicKey: data.encryptedLocation.senderPublicKey,
        };
        const location = await decryptLocation(encryptedLoc, myPrivateKeyRef.current);
        return { location };
      }

      return { text: data.text, location: data.location };
    } catch (err) {
      console.error('[useChat] Decryption failed:', err);
      return { text: '[Encrypted message - unable to decrypt]' };
    }
  }, []);

  // Subscribe to chat metadata and initialize encryption
  useEffect(() => {
    if (!chatId || !enabled || !db) {
      setChat(null);
      return;
    }

    const chatRef = doc(db, 'chats', chatId);
    const unsubscribe = onSnapshot(
      chatRef,
      async (snapshot) => {
        if (snapshot.exists()) {
          const chatData = {
            id: snapshot.id,
            ...snapshot.data(),
          } as Chat;
          setChat(chatData);

          // Initialize encryption when chat is loaded
          if (user && isEncryptionSupported()) {
            await initializeEncryption();
          }
        } else {
          setChat(null);
        }
      },
      (err) => {
        console.error('Error fetching chat:', err);
      }
    );

    return () => unsubscribe();
  }, [chatId, enabled, user, initializeEncryption]);

  // Subscribe to messages with decryption
  useEffect(() => {
    if (!chatId || !enabled || !db) {
      setMessages([]);
      return;
    }

    setLoading(true);

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(
      messagesRef,
      orderBy('timestamp', 'desc'),
      limit(MESSAGES_PER_PAGE)
    );

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        const rawMessages: { docSnap: QueryDocumentSnapshot<DocumentData>; data: DocumentData }[] = [];
        let unread = 0;

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          rawMessages.push({ docSnap, data });

          // Count unread messages from others
          if (!data.read && data.senderId !== user?.uid) {
            unread++;
          }
        });

        // Store last doc for pagination
        if (snapshot.docs.length > 0) {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        // Decrypt messages in parallel
        const decryptedMessages = await Promise.all(
          rawMessages.map(async ({ docSnap, data }) => {
            const decrypted = await decryptMessageData(data);
            const message: PersistentChatMessage = {
              id: docSnap.id,
              chatId: chatId,
              senderId: data.senderId,
              senderName: data.senderName,
              senderPhoto: data.senderPhoto,
              text: decrypted.text,
              location: decrypted.location,
              timestamp: data.timestamp,
              type: data.type || 'text',
              read: data.read || false,
            };
            return message;
          })
        );

        // Messages are in desc order, reverse for display
        setMessages(decryptedMessages.reverse());
        setUnreadCount(unread);
        setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [chatId, enabled, user?.uid, decryptMessageData]);

  // Send a text message
  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (!chatId || !user || !db || !text.trim()) return;

      try {
        // Ensure encryption is initialized
        await initializeEncryption();

        let messageData: Record<string, unknown>;

        // Encrypt if we have all the keys
        if (myPrivateKeyRef.current && myPublicKeyRef.current && theirPublicKeyRef.current) {
          const encrypted = await encryptMessage(
            text.trim(),
            myPrivateKeyRef.current,
            myPublicKeyRef.current,
            theirPublicKeyRef.current
          );

          messageData = {
            senderId: user.uid,
            senderName: user.displayName,
            senderPhoto: user.photoURL,
            encryptedText: encrypted,
            encrypted: true,
            timestamp: serverTimestamp(),
            type: 'text',
            read: false,
          };

          console.log('[useChat] Sending encrypted message');
        } else {
          // Fallback to unencrypted if keys not available
          messageData = {
            senderId: user.uid,
            senderName: user.displayName,
            senderPhoto: user.photoURL,
            text: text.trim(),
            encrypted: false,
            timestamp: serverTimestamp(),
            type: 'text',
            read: false,
          };

          console.log('[useChat] Sending unencrypted message (keys not ready)');
        }

        await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

        // Update last message in chat metadata (use generic text for encrypted)
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: {
            text: messageData.encrypted ? 'New message' : text.trim(),
            senderId: user.uid,
            timestamp: serverTimestamp(),
          },
        });
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
      }
    },
    [chatId, user, initializeEncryption]
  );

  // Send a location message
  const sendLocation = useCallback(
    async (location: { lat: number; lng: number }): Promise<void> => {
      if (!chatId || !user || !db) return;

      try {
        // Ensure encryption is initialized
        await initializeEncryption();

        let messageData: Record<string, unknown>;

        // Encrypt if we have all the keys
        if (myPrivateKeyRef.current && myPublicKeyRef.current && theirPublicKeyRef.current) {
          const encrypted = await encryptLocation(
            location,
            myPrivateKeyRef.current,
            myPublicKeyRef.current,
            theirPublicKeyRef.current
          );

          messageData = {
            senderId: user.uid,
            senderName: user.displayName,
            senderPhoto: user.photoURL,
            encryptedLocation: encrypted,
            encrypted: true,
            timestamp: serverTimestamp(),
            type: 'location',
            read: false,
          };

          console.log('[useChat] Sending encrypted location');
        } else {
          // Fallback to unencrypted if keys not available
          messageData = {
            senderId: user.uid,
            senderName: user.displayName,
            senderPhoto: user.photoURL,
            location,
            encrypted: false,
            timestamp: serverTimestamp(),
            type: 'location',
            read: false,
          };

          console.log('[useChat] Sending unencrypted location (keys not ready)');
        }

        await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

        // Update last message in chat metadata
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: {
            text: '📍 Shared location',
            senderId: user.uid,
            timestamp: serverTimestamp(),
          },
        });
      } catch (err) {
        console.error('Error sending location:', err);
        setError('Failed to send location');
      }
    },
    [chatId, user, initializeEncryption]
  );

  // Mark all messages as read
  const markAsRead = useCallback(async (): Promise<void> => {
    if (!chatId || !user || !db) return;

    const firestore = db; // TypeScript narrowing helper
    const cId = chatId; // Capture for closure

    try {
      const messagesRef = collection(firestore, 'chats', cId, 'messages');
      const q = query(
        messagesRef,
        where('read', '==', false),
        where('senderId', '!=', user.uid)
      );

      const snapshot = await getDocs(q);
      const updatePromises = snapshot.docs.map((docSnap) =>
        updateDoc(doc(firestore, 'chats', cId, 'messages', docSnap.id), {
          read: true,
        })
      );

      await Promise.all(updatePromises);
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  }, [chatId, user]);

  // Load more messages (pagination)
  const loadMore = useCallback(async (): Promise<void> => {
    if (!chatId || !db || !lastDocRef.current || loadingMore || !hasMore) return;

    setLoadingMore(true);

    try {
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(
        messagesRef,
        orderBy('timestamp', 'desc'),
        startAfter(lastDocRef.current),
        limit(MESSAGES_PER_PAGE)
      );

      const snapshot = await getDocs(q);
      const olderMessages: PersistentChatMessage[] = [];

      snapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const message: PersistentChatMessage = {
          id: docSnap.id,
          chatId: chatId,
          senderId: data.senderId,
          senderName: data.senderName,
          senderPhoto: data.senderPhoto,
          text: data.text,
          location: data.location,
          timestamp: data.timestamp,
          type: data.type || 'text',
          read: data.read || false,
        };
        olderMessages.push(message);
      });

      if (snapshot.docs.length > 0) {
        lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
      }

      // Prepend older messages (they're in desc order, so reverse)
      setMessages((prev) => [...olderMessages.reverse(), ...prev]);
      setHasMore(snapshot.docs.length === MESSAGES_PER_PAGE);
    } catch (err) {
      console.error('Error loading more messages:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [chatId, loadingMore, hasMore]);

  // End chat - delete chat and all messages (no history)
  const endChat = useCallback(async (): Promise<void> => {
    if (!chatId || !db) return;

    const firestore = db;
    const cId = chatId;

    try {
      // Delete all messages in the chat
      const messagesRef = collection(firestore, 'chats', cId, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      const deletePromises = messagesSnapshot.docs.map((docSnap) =>
        import('firebase/firestore').then(({ deleteDoc }) =>
          deleteDoc(doc(firestore, 'chats', cId, 'messages', docSnap.id))
        )
      );
      await Promise.all(deletePromises);

      // Delete the chat document
      const { deleteDoc: delDoc } = await import('firebase/firestore');
      await delDoc(doc(firestore, 'chats', cId));
    } catch (err) {
      console.error('Error ending chat:', err);
      setError('Failed to end chat');
    }
  }, [chatId]);

  return {
    messages,
    chat,
    loading,
    loadingMore,
    hasMore,
    error,
    unreadCount,
    isEncrypted,
    sendMessage,
    sendLocation,
    markAsRead,
    loadMore,
    endChat,
  };
}

/**
 * useChats Hook
 *
 * Subscribe to all chats for the current user
 */
export function useChats() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !db) {
      setChats([]);
      return;
    }

    setLoading(true);

    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userChats: Chat[] = [];
        snapshot.forEach((docSnap) => {
          userChats.push({
            id: docSnap.id,
            ...docSnap.data(),
          } as Chat);
        });

        // Sort by last message timestamp
        userChats.sort((a, b) => {
          const aTime = a.lastMessage?.timestamp?.toDate?.()?.getTime() || 0;
          const bTime = b.lastMessage?.timestamp?.toDate?.()?.getTime() || 0;
          return bTime - aTime;
        });

        setChats(userChats);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching chats:', err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  return { chats, loading };
}

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
  startAfter,
  Timestamp,
  serverTimestamp,
  QueryDocumentSnapshot,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';
import { PersistentChatMessage, Chat } from '@/types';

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
  sendMessage: (text: string) => Promise<void>;
  sendLocation: (location: { lat: number; lng: number }) => Promise<void>;
  markAsRead: () => Promise<void>;
  loadMore: () => Promise<void>;
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

  const lastDocRef = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Subscribe to chat metadata
  useEffect(() => {
    if (!chatId || !enabled || !db) {
      setChat(null);
      return;
    }

    const chatRef = doc(db, 'chats', chatId);
    const unsubscribe = onSnapshot(
      chatRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setChat({
            id: snapshot.id,
            ...snapshot.data(),
          } as Chat);
        } else {
          setChat(null);
        }
      },
      (err) => {
        console.error('Error fetching chat:', err);
      }
    );

    return () => unsubscribe();
  }, [chatId, enabled]);

  // Subscribe to messages
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
      (snapshot) => {
        const newMessages: PersistentChatMessage[] = [];
        let unread = 0;

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
          newMessages.push(message);

          // Count unread messages from others
          if (!message.read && message.senderId !== user?.uid) {
            unread++;
          }
        });

        // Store last doc for pagination
        if (snapshot.docs.length > 0) {
          lastDocRef.current = snapshot.docs[snapshot.docs.length - 1];
        }

        // Messages are in desc order, reverse for display
        setMessages(newMessages.reverse());
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
  }, [chatId, enabled, user?.uid]);

  // Send a text message
  const sendMessage = useCallback(
    async (text: string): Promise<void> => {
      if (!chatId || !user || !db || !text.trim()) return;

      try {
        const messageData = {
          senderId: user.uid,
          senderName: user.displayName,
          senderPhoto: user.photoURL,
          text: text.trim(),
          timestamp: serverTimestamp(),
          type: 'text',
          read: false,
        };

        await addDoc(collection(db, 'chats', chatId, 'messages'), messageData);

        // Update last message in chat metadata
        await updateDoc(doc(db, 'chats', chatId), {
          lastMessage: {
            text: text.trim(),
            senderId: user.uid,
            timestamp: serverTimestamp(),
          },
        });
      } catch (err) {
        console.error('Error sending message:', err);
        setError('Failed to send message');
      }
    },
    [chatId, user]
  );

  // Send a location message
  const sendLocation = useCallback(
    async (location: { lat: number; lng: number }): Promise<void> => {
      if (!chatId || !user || !db) return;

      try {
        const messageData = {
          senderId: user.uid,
          senderName: user.displayName,
          senderPhoto: user.photoURL,
          location,
          timestamp: serverTimestamp(),
          type: 'location',
          read: false,
        };

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
    [chatId, user]
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

  return {
    messages,
    chat,
    loading,
    loadingMore,
    hasMore,
    error,
    unreadCount,
    sendMessage,
    sendLocation,
    markAsRead,
    loadMore,
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
